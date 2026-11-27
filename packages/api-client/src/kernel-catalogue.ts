import { BagQuantity, BagView, DesignCard, DesignView, fail, ok, type Result } from "@shop/contracts"
import { z } from "zod"
import type { Catalogue } from "./catalogue"
import { mapFailure, type KernelFailure, type TokenStore, type Transport } from "./client"

// Kernel shapes. Private to api-client: only the cart id is read from a kernel
// cart answer; every amount the client shows comes from the shop's Bag route.
const KernelCartRef = z.object({ cart: z.object({ id: z.string().min(1) }) })
const DesignListResponse = z.object({ designs: z.array(DesignCard) })
const DesignResponse = z.object({ design: DesignView })
const BagResponse = z.object({ bag: BagView })

/** The Bag before anything is in it: no lines and nothing to pay. */
const EMPTY_BAG: BagView = { lines: [], totalMrp: 0, discount: 0, delivery: 0, total: 0, count: 0 }

/** The kernel's error code when a Variant has fewer Pieces available than asked (its inventory check). */
const KERNEL_INSUFFICIENT_INVENTORY = "insufficient_inventory"

/** Fails `input.invalid` for a quantity that is not a whole number of Pieces from 1. */
export function checkQuantity(quantity: number): Result<number> {
  const parsed = BagQuantity.safeParse(quantity)
  return parsed.success
    ? ok(parsed.data)
    : fail("input.invalid", "A Bag quantity is a whole number of Pieces from 1", { fields: ["quantity"] })
}

/** In memory: one Bag per client, for clients that pass no store. */
function memoryStore(): TokenStore {
  let value: string | null = null
  return {
    get: () => value,
    set: (v) => {
      value = v
    },
    clear: () => {
      value = null
    },
  }
}

/**
 * Maps a failed Bag write: too many Pieces is `bag.stock_exceeded` (the
 * kernel refuses before changing the line, so it keeps its quantity); a
 * Variant that is not the Variant of a published Design is `design.not_found`
 * (the shop's cart guard decides this from the catalogue); an unknown cart or
 * line is `bag.not_found`; anything else follows `mapFailure`.
 */
function bagFailure<T>(failure: KernelFailure): Result<T> {
  if (failure.kind === "http") {
    if (failure.code === KERNEL_INSUFFICIENT_INVENTORY || failure.code === "bag.stock_exceeded") {
      return fail("bag.stock_exceeded", failure.message)
    }
    if (failure.code === "design.not_found") return fail("design.not_found", failure.message)
    if (failure.code === "input.invalid") return fail("input.invalid", failure.message)
    if (failure.status === 404) return fail("bag.not_found", failure.message)
  }
  return mapFailure(failure, "internal", [])
}

/** True when the kernel says the cart does not exist (so a new one may be made). */
const cartGone = (failure: KernelFailure) =>
  failure.kind === "http" && failure.status === 404 && failure.code !== "design.not_found"

/**
 * The catalogue and Bag on the real kernel (Story 1.8). Designs come from the
 * shop's catalogue routes (`/store/shop/designs`); the Bag is a kernel cart,
 * written through the kernel cart routes on the allow-list and read through
 * `GET /store/shop/bag/:cartId`, which returns the `BagView` with the
 * server's totals. Cart requests are anonymous: the cart id, kept in
 * `bagStore`, is what ties a Shopper to her Bag.
 */
export function createKernelCatalogue(transport: Transport, bagStore: TokenStore = memoryStore()): Catalogue {
  /** The Bag of a cart; an unknown cart clears the stored id and reads as `bag.not_found`. */
  async function readBag(cartId: string): Promise<Result<BagView>> {
    const res = await transport.request({
      method: "GET",
      path: `/store/shop/bag/${encodeURIComponent(cartId)}`,
      schema: BagResponse,
    })
    if (res.ok) return ok(res.data.bag)
    if (res.failure.kind === "http" && res.failure.code === "bag.not_found") {
      await bagStore.clear()
      return fail("bag.not_found", res.failure.message)
    }
    return mapFailure(res.failure, "internal", [])
  }

  async function storedCartId(): Promise<string | null> {
    return (await bagStore.get()) || null
  }

  return {
    async listCategories() {
      // Categories arrive with the catalogue in Epic 2; the kernel list has none yet.
      return ok([])
    },

    async listDesigns() {
      const res = await transport.request({ method: "GET", path: "/store/shop/designs", schema: DesignListResponse })
      if (!res.ok) return mapFailure(res.failure, "internal", [])
      return ok(res.data.designs)
    },

    async getDesign(handle, options = {}) {
      const query = options.preview ? `?preview=${encodeURIComponent(options.preview)}` : ""
      const res = await transport.request({
        method: "GET",
        path: `/store/shop/designs/${encodeURIComponent(handle)}${query}`,
        schema: DesignResponse,
      })
      if (res.ok) return ok(res.data.design)
      if (res.failure.kind === "http" && res.failure.status === 404) {
        return fail("design.not_found", res.failure.message, { handle })
      }
      return mapFailure(res.failure, "internal", [])
    },

    async getBag() {
      const cartId = await storedCartId()
      if (!cartId) return ok(EMPTY_BAG)
      const bag = await readBag(cartId)
      // A Bag that no longer exists (or was bought) starts again empty.
      if (!bag.ok && bag.error.code === "bag.not_found") return ok(EMPTY_BAG)
      return bag
    },

    async addToBag(variantId, quantity = 1) {
      const qty = checkQuantity(quantity)
      if (!qty.ok) return qty
      const item = { variant_id: variantId, quantity: qty.data }

      const addTo = (cartId: string) =>
        transport.request({
          method: "POST",
          path: `/store/carts/${encodeURIComponent(cartId)}/line-items`,
          body: item,
          schema: KernelCartRef,
        })

      const existing = await storedCartId()
      if (existing) {
        // A stored Bag that is gone or was bought (completed) reads as bag.not_found
        // and is forgotten; a new cart is started below.
        const current = await readBag(existing)
        if (current.ok) {
          const added = await addTo(existing)
          if (added.ok) return readBag(existing)
          if (!cartGone(added.failure)) return bagFailure(added.failure)
          await bagStore.clear()
        } else if (current.error.code !== "bag.not_found") {
          return current
        }
      }

      // No Bag yet (or it is gone): a new cart with this line. The shop's cart
      // guard puts it in the India region and the publishable key's sales channel.
      const created = await transport.request({
        method: "POST",
        path: "/store/carts",
        body: { items: [item] },
        schema: KernelCartRef,
      })
      if (!created.ok) return bagFailure(created.failure)

      // Another add may have stored a Bag meanwhile (two first adds at once):
      // keep that one, add the line to it, and leave the new cart unused.
      const meanwhile = await storedCartId()
      if (meanwhile && meanwhile !== created.data.cart.id) {
        const added = await addTo(meanwhile)
        if (added.ok) return readBag(meanwhile)
        if (!cartGone(added.failure)) return bagFailure(added.failure)
      }
      await bagStore.set(created.data.cart.id)
      return readBag(created.data.cart.id)
    },

    async setBagQuantity(lineId, quantity) {
      const qty = checkQuantity(quantity)
      if (!qty.ok) return qty
      const cartId = await storedCartId()
      if (!cartId) return fail("bag.not_found", "There is no Bag")
      const res = await transport.request({
        method: "POST",
        path: `/store/carts/${encodeURIComponent(cartId)}/line-items/${encodeURIComponent(lineId)}`,
        body: { quantity: qty.data },
        schema: KernelCartRef,
      })
      if (!res.ok) return bagFailure(res.failure)
      return readBag(cartId)
    },

    async removeFromBag(lineId) {
      const cartId = await storedCartId()
      if (!cartId) return fail("bag.not_found", "There is no Bag")
      const res = await transport.request({
        method: "DELETE",
        path: `/store/carts/${encodeURIComponent(cartId)}/line-items/${encodeURIComponent(lineId)}`,
        schema: z.unknown(),
      })
      if (!res.ok) return bagFailure(res.failure)
      return readBag(cartId)
    },
  }
}
