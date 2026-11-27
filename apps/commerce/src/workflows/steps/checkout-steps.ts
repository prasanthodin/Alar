import { ContainerRegistrationKeys, MathBN, MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  availablePieces,
  CHECKOUT_SNAPSHOT_VERSION,
  CheckoutRecoveryFile,
  checkoutRecoveryKey,
  CheckoutSnapshot,
  HOLD_MINUTES_SETTING,
  holdExpiry,
  ShelfPrice,
  taxBandsKey,
  taxForShelfPrice,
  type ChangedLine,
  type CheckoutAddress,
  type CheckoutSnapshotLine,
  type TaxBands,
} from "@shop/contracts"
import { loadCart } from "../../lib/bag"
import { kernelAmountToPaise } from "../../lib/designs"
import { deleteDocumentVersion, putJsonDocument, type StoredDocument } from "../../lib/documents"
import {
  checkouts,
  findLiveHold,
  heldByInventoryItem,
  holdExpired,
  holds,
  listHoldReservations,
  reservationsOfHold,
  type CheckoutRow,
  type HoldRow,
} from "../../lib/holds"
import { findStandardShippingOptionId, standardDeliveryPaise } from "../../lib/shipping"
import { shopError } from "../../lib/shop-errors"
import { readStockLevel, shopStockLocationId } from "../../lib/stock"
import { storeDesignsByProduct, type StoreDesign } from "../../lib/store-catalogue"
import { SETTINGS_MODULE } from "../../modules/settings"
import type SettingsModuleService from "../../modules/settings/service"

/** One Bag line as checkout reads it from the kernel cart. */
export type CheckoutCartLine = {
  lineId: string
  variantId: string
  productId: string
  quantity: number
  /** The line's unit price in the cart, in paise. */
  unitPricePaise: number
  /** The name the cart has for it, when its Design cannot be read. */
  title: string
}

export type CheckoutCart = {
  cartId: string
  lines: CheckoutCartLine[]
  /** The inventory items of the lines whose Design is on sale: the stock locks to take. */
  inventoryItemIds: string[]
}

/**
 * Reads the Bag (the kernel cart) that checkout begins from: its lines and
 * the inventory items to lock. `bag.not_found` for an unknown, completed or
 * foreign cart (as the Bag route), `input.invalid` for an empty one. Reads only.
 */
export const loadCheckoutCartStep = createStep(
  "load-checkout-cart",
  async (input: { cartId: string; salesChannelIds: string[] }, { container }) => {
    const cart = await loadCart(container, input.cartId, input.salesChannelIds)
    const items = (cart.items ?? []).filter((i): i is NonNullable<typeof i> => Boolean(i))
    if (items.length === 0) {
      throw shopError("input.invalid", "The Bag is empty", { issues: ["cartId: the Bag has no lines"] })
    }
    const lines: CheckoutCartLine[] = items
      .slice()
      .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime() || a.id.localeCompare(b.id))
      .map((item) => {
        const unitPricePaise = kernelAmountToPaise(item.unit_price)
        if (!item.product_id || !item.variant_id || unitPricePaise === null) {
          throw shopError("internal", `Bag line ${item.id} has no product, variant or shelf price`)
        }
        return {
          lineId: item.id,
          variantId: item.variant_id,
          productId: item.product_id,
          quantity: MathBN.convert(item.quantity as never).toNumber(),
          unitPricePaise,
          title: item.product_title || item.title || item.variant_title || item.id,
        }
      })
    const designs = await storeDesignsByProduct(container, [...new Set(lines.map((l) => l.productId))])
    const inventoryItemIds = [
      ...new Set(
        lines.flatMap((l) => {
          const design = designs.get(l.productId)
          return design?.inventoryItemId && design.view.variantId === l.variantId ? [design.inventoryItemId] : []
        })
      ),
    ]
    return new StepResponse<CheckoutCart>({ cartId: cart.id, lines, inventoryItemIds })
  }
)

/** One reservation a new Hold makes: a line's Pieces of one inventory item at the India location. */
export type PlannedReservation = {
  lineId: string
  variantId: string
  inventoryItemId: string
  locationId: string
  quantity: number
}

export type CheckedCheckout =
  | { existingCheckoutId: string; snapshot: null; holdMinutes: 0; reservations: []; shippingOptionId: null }
  | {
      existingCheckoutId: null
      snapshot: CheckoutSnapshot
      holdMinutes: number
      reservations: PlannedReservation[]
      /** The standard shipping option checkout puts on the cart. */
      shippingOptionId: string
    }

export type CheckCheckoutInput = {
  cart: CheckoutCart
  customerId: string
  address: CheckoutAddress
  salesChannelIds: string[]
}

/** True when the Design is on sale through the key and this is its Variant. */
function onSale(design: StoreDesign | undefined, variantId: string, salesChannelIds: readonly string[]): design is StoreDesign {
  return Boolean(
    design &&
      design.view.status === "published" &&
      design.view.variantId === variantId &&
      design.inventoryItemId &&
      design.record.salesChannelIds.some((id) => salesChannelIds.includes(id))
  )
}

/**
 * The checks of `begin-checkout`, run under the stock lock (Story 1.9). Reads only.
 *
 * - A live Hold on the cart: the same Shopper's, not expired, is answered
 *   with its Checkout (`existingCheckoutId`) and nothing else is done;
 *   anyone else's, or one whose time has run out, is `cart.locked`.
 * - Each line against the Design now: not on sale (`unavailable`), a price
 *   that is not the Design's price now (`price_changed`), or more Pieces
 *   than are left not counting other Shoppers' Holds (`short_of_stock`):
 *   `cart.changed` with each changed line.
 * - Pieces held by other Shoppers' Holds: `stock.unavailable`.
 * - Otherwise the snapshot: unit prices, tax per line from the money
 *   functions and the bands in effect now, the standard shipping charge, the
 *   total, the address and the Shopper id; the Hold length (dated setting);
 *   and the reservations to make.
 */
export const checkCheckoutStep = createStep("check-checkout", async (input: CheckCheckoutInput, { container }) => {
  const { cart, customerId } = input
  const live = await findLiveHold(container, cart.cartId)
  if (live) {
    const [owner] = await checkouts(container).listCheckouts({ id: live.checkout_id }, { take: 1 })
    if (!owner || (owner as unknown as CheckoutRow).customer_id !== customerId || holdExpired(live)) {
      throw shopError("cart.locked", "This Bag is held for a checkout", { cartId: cart.cartId })
    }
    return new StepResponse<CheckedCheckout>({
      existingCheckoutId: live.checkout_id,
      snapshot: null,
      holdMinutes: 0,
      reservations: [],
      shippingOptionId: null,
    })
  }

  const now = new Date()
  const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
  const locationId = await shopStockLocationId(container)
  const designs = await storeDesignsByProduct(container, [...new Set(cart.lines.map((l) => l.productId))])

  // The stock of each inventory item now (read under the lock), and the Pieces the Bag asks of it.
  const itemIds = [
    ...new Set(
      cart.lines.flatMap((l) => {
        const d = designs.get(l.productId)
        return onSale(d, l.variantId, input.salesChannelIds) ? [d.inventoryItemId!] : []
      })
    ),
  ]
  const held = await heldByInventoryItem(container, itemIds, locationId)
  const stock = new Map<string, { stocked: number; reserved: number; held: number; asked: number }>()
  for (const itemId of itemIds) {
    const level = await readStockLevel(container, { inventoryItemId: itemId, locationId })
    stock.set(itemId, { ...level, held: Math.min(held.get(itemId) ?? 0, level.reserved), asked: 0 })
  }
  for (const line of cart.lines) {
    const d = designs.get(line.productId)
    if (onSale(d, line.variantId, input.salesChannelIds)) stock.get(d.inventoryItemId!)!.asked += line.quantity
  }

  const changed: ChangedLine[] = []
  let heldElsewhere: string[] = []
  for (const line of cart.lines) {
    const d = designs.get(line.productId)
    const base = {
      lineId: line.lineId,
      variantId: line.variantId,
      name: d?.view.name || line.title,
      quantity: line.quantity,
      unitPricePaise: line.unitPricePaise,
    }
    if (!onSale(d, line.variantId, input.salesChannelIds)) {
      changed.push({ ...base, reason: "unavailable", currentPricePaise: null, available: 0 })
      continue
    }
    const s = stock.get(d.inventoryItemId!)!
    // Pieces left if no Shopper were paying: what the Bag may ask for at all.
    const unheld = availablePieces(s.stocked, s.reserved - s.held)
    if (d.view.pricePaise !== line.unitPricePaise) {
      changed.push({ ...base, reason: "price_changed", currentPricePaise: d.view.pricePaise, available: unheld })
    } else if (s.asked > unheld) {
      changed.push({ ...base, reason: "short_of_stock", currentPricePaise: d.view.pricePaise, available: unheld })
    } else if (s.asked > availablePieces(s.stocked, s.reserved)) {
      heldElsewhere.push(line.variantId)
    }
  }
  if (changed.length) {
    throw shopError("cart.changed", "The Bag has changed since it was last seen", { lines: changed })
  }
  heldElsewhere = [...new Set(heldElsewhere)]
  if (heldElsewhere.length) {
    throw shopError("stock.unavailable", "Another Shopper is paying for these Pieces", { variantIds: heldElsewhere })
  }

  // The snapshot: tax per line from the money functions, with the bands in effect now.
  const lines: CheckoutSnapshotLine[] = []
  for (const line of cart.lines) {
    const d = designs.get(line.productId)!
    const taxCode = d.view.attributes.taxCode
    if (!taxCode) throw shopError("tax.no_band", `Design ${d.view.id} has no tax code`, { lineId: line.lineId })
    let bands: TaxBands
    try {
      bands = await settings.getValue(taxBandsKey(taxCode), now)
    } catch (e) {
      if (MedusaError.isMedusaError(e) && (e as MedusaError).code === "settings.not_found") {
        throw shopError("tax.no_band", `No bands for tax code ${taxCode}`, { lineId: line.lineId, taxCode })
      }
      throw e
    }
    const tax = taxForShelfPrice(ShelfPrice.parse(line.unitPricePaise), bands)
    if (!tax.ok) throw shopError(tax.error.code, tax.error.message, { lineId: line.lineId })
    lines.push({
      lineId: line.lineId,
      variantId: line.variantId,
      designId: d.view.id,
      name: d.view.name,
      quantity: line.quantity,
      unitPricePaise: line.unitPricePaise,
      taxableTotalPaise: tax.data.taxablePaise * line.quantity,
      taxTotalPaise: tax.data.taxPaise * line.quantity,
      lineTotalPaise: line.unitPricePaise * line.quantity,
      rateBp: tax.data.rateBp,
      taxCode,
    })
  }
  const shippingOptionId = await findStandardShippingOptionId(container)
  if (!shippingOptionId) throw shopError("internal", "The standard shipping option is missing; run db:migrate to seed it")
  const shippingPaise = await standardDeliveryPaise(container, "inr")
  const snapshot = CheckoutSnapshot.parse({
    version: CHECKOUT_SNAPSHOT_VERSION,
    cartId: cart.cartId,
    customerId,
    currencyCode: "inr",
    lines,
    shippingPaise,
    totalPaise: lines.reduce((sum, l) => sum + l.lineTotalPaise, 0) + shippingPaise,
    address: input.address,
    takenAt: now.toISOString(),
  })
  const holdMinutes = await settings.getValue(HOLD_MINUTES_SETTING, now)
  const reservations: PlannedReservation[] = cart.lines.map((line) => ({
    lineId: line.lineId,
    variantId: line.variantId,
    inventoryItemId: designs.get(line.productId)!.inventoryItemId!,
    locationId,
    quantity: line.quantity,
  }))
  return new StepResponse<CheckedCheckout>({ existingCheckoutId: null, snapshot, holdMinutes, reservations, shippingOptionId })
})

/** Creates the Checkout with its snapshot (status `held`); undone by deleting it. */
export const createCheckoutStep = createStep(
  "create-checkout",
  async (input: { snapshot: CheckoutSnapshot }, { container }) => {
    const snapshot = CheckoutSnapshot.parse(input.snapshot)
    const created = (await checkouts(container).createCheckouts({
      cart_id: snapshot.cartId,
      customer_id: snapshot.customerId,
      status: "held",
      snapshot: snapshot as unknown as Record<string, unknown>,
    })) as unknown as CheckoutRow
    return new StepResponse(
      { id: created.id, createdAt: new Date(created.created_at).toISOString() },
      created.id
    )
  },
  async (checkoutId, { container }) => {
    if (!checkoutId) return
    await checkouts(container).deleteCheckouts(checkoutId)
  }
)

/** True for the database's refusal of a second live Hold on a cart (the partial unique index). */
function isUniqueViolation(e: unknown): boolean {
  const text = `${(e as { message?: unknown })?.message ?? ""} ${(e as { code?: unknown })?.code ?? ""}`
  return /unique|duplicate|23505|already exists/i.test(text)
}

/**
 * Creates the Hold of a Checkout, live until `holdMinutes` from now. A second
 * live Hold on the cart is refused by the database and answered
 * `cart.locked`. Undone by deleting it.
 */
export const createHoldStep = createStep(
  "create-hold",
  async (input: { checkoutId: string; cartId: string; holdMinutes: number }, { container }) => {
    const expiresAt = holdExpiry(new Date(), input.holdMinutes)
    let created: HoldRow
    try {
      created = (await holds(container).createHolds({
        checkout_id: input.checkoutId,
        cart_id: input.cartId,
        expires_at: expiresAt,
        status: "live",
      })) as unknown as HoldRow
    } catch (e) {
      if (isUniqueViolation(e)) throw shopError("cart.locked", "This Bag is held for a checkout", { cartId: input.cartId })
      throw e
    }
    return new StepResponse({ id: created.id, expiresAt: expiresAt.toISOString() }, created.id)
  },
  async (holdId, { container }) => {
    if (!holdId) return
    await holds(container).deleteHolds(holdId)
  }
)

/** A reservation made for a Hold, with the level after it (for its stock-movement row). */
export type MadeReservation = PlannedReservation & { reservationId: string; stockedAfter: number; reservedAfter: number }

/** True for the inventory module's refusal of a reservation: not enough available, or no level. */
function isStockRefusal(e: unknown): boolean {
  const type = (e as { type?: unknown })?.type
  return type === MedusaError.Types.NOT_ALLOWED || type === MedusaError.Types.NOT_FOUND
}

/**
 * Makes the Hold's kernel reservations, one line at a time, each tagged with
 * the Hold id (`external_id`) and its Checkout and line (`metadata`), and
 * reads the level after each. If one cannot be made, the ones already made
 * are removed before it fails: `stock.unavailable` when the inventory module
 * refuses (not enough available). Undone by removing them all.
 */
export const reserveHoldStep = createStep(
  "reserve-hold",
  async (input: { holdId: string; checkoutId: string; reservations: PlannedReservation[] }, { container }) => {
    const inventory = container.resolve(Modules.INVENTORY)
    const made: MadeReservation[] = []
    try {
      for (const planned of input.reservations) {
        const [reservation] = await inventory.createReservationItems([
          {
            inventory_item_id: planned.inventoryItemId,
            location_id: planned.locationId,
            quantity: planned.quantity,
            external_id: input.holdId,
            description: `Hold ${input.holdId}`,
            metadata: {
              hold_id: input.holdId,
              checkout_id: input.checkoutId,
              line_id: planned.lineId,
              variant_id: planned.variantId,
            },
          },
        ])
        const level = await readStockLevel(container, planned)
        made.push({ ...planned, reservationId: reservation!.id, stockedAfter: level.stocked, reservedAfter: level.reserved })
      }
    } catch (e) {
      if (made.length) {
        await inventory.deleteReservationItems(made.map((m) => m.reservationId)).catch((undo: unknown) => {
          container
            .resolve(ContainerRegistrationKeys.LOGGER)
            .error(`checkout: could not remove the reservations of Hold ${input.holdId}: ${(undo as Error).message}`)
        })
      }
      if (isStockRefusal(e)) {
        throw shopError("stock.unavailable", "Another Shopper is paying for these Pieces", { holdId: input.holdId })
      }
      throw e
    }
    return new StepResponse(made, made.map((m) => m.reservationId))
  },
  async (reservationIds, { container }) => {
    if (!reservationIds?.length) return
    await container.resolve(Modules.INVENTORY).deleteReservationItems(reservationIds)
  }
)

/**
 * Writes the Checkout's recovery file `checkouts/<checkoutId>.json` to the
 * private `documents` bucket (AD-30). Undone by deleting the version it
 * wrote. Its contents are never logged.
 */
export const writeRecoveryFileStep = createStep(
  "write-recovery-file",
  async (input: { checkoutId: string; holdId: string; holdExpiresAt: string; createdAt: string; snapshot: CheckoutSnapshot }) => {
    const file = CheckoutRecoveryFile.parse({ version: CHECKOUT_SNAPSHOT_VERSION, ...input })
    const stored = await putJsonDocument(checkoutRecoveryKey(input.checkoutId), file)
    return new StepResponse(stored, stored)
  },
  async (stored: StoredDocument | undefined) => {
    if (!stored) return
    await deleteDocumentVersion(stored)
  }
)

// ---------------------------------------------------------------------------
// release-hold
// ---------------------------------------------------------------------------

export type HoldToRelease = { holdId: string; checkoutId: string | null; inventoryItemIds: string[] }

/** Reads a Hold and the inventory items of its reservations (the stock locks to take). Reads only. */
export const loadHoldStep = createStep("load-hold", async (input: { holdId: string }, { container }) => {
  const [hold] = await holds(container).listHolds({ id: input.holdId }, { take: 1 })
  const row = hold as unknown as HoldRow | undefined
  const reservations = row ? await listHoldReservations(container, row.id) : []
  return new StepResponse<HoldToRelease>({
    holdId: input.holdId,
    checkoutId: row?.checkout_id ?? null,
    inventoryItemIds: [...new Set(reservations.map((r) => r.inventory_item_id))],
  })
})

/** A removed Hold reservation, with the level after it (for its stock-movement row). */
export type RemovedReservation = {
  reservationId: string
  inventoryItemId: string
  variantId: string
  quantity: number
  stockedAfter: number
  reservedAfter: number
}

export type ReleasedReservations = { released: boolean; checkoutId: string | null; removed: RemovedReservation[] }

/**
 * Removes a live Hold's reservations (run it under the stock lock) and reads
 * the level after each. A Hold that is no longer live (already released or
 * expired), or not yet expired when the reason is `expired`, is left alone
 * (`released: false`), so running it twice changes nothing. Undone by
 * restoring the reservations.
 */
export const removeHoldReservationsStep = createStep(
  "remove-hold-reservations",
  async (input: { holdId: string; reason: "cancelled" | "expired" }, { container }) => {
    const [hold] = await holds(container).listHolds({ id: input.holdId }, { take: 1 })
    const row = hold as unknown as HoldRow | undefined
    if (!row || row.status !== "live" || (input.reason === "expired" && !holdExpired(row))) {
      return new StepResponse<ReleasedReservations, string[]>({ released: false, checkoutId: row?.checkout_id ?? null, removed: [] }, [])
    }
    const inventory = container.resolve(Modules.INVENTORY)
    const reservations = await reservationsOfHold(container, input.holdId)
    const removed: RemovedReservation[] = []
    if (reservations.length) {
      await inventory.softDeleteReservationItems(reservations.map((r) => r.id))
      for (const r of reservations) {
        const level = await readStockLevel(container, { inventoryItemId: r.inventory_item_id, locationId: r.location_id })
        const variantId = (r.metadata as { variant_id?: unknown } | null)?.variant_id
        removed.push({
          reservationId: r.id,
          inventoryItemId: r.inventory_item_id,
          // Every Hold reservation names its Variant; the item id stands in should one ever not.
          variantId: typeof variantId === "string" ? variantId : r.inventory_item_id,
          quantity: MathBN.convert(r.quantity as never).toNumber(),
          stockedAfter: level.stocked,
          reservedAfter: level.reserved,
        })
      }
    }
    return new StepResponse<ReleasedReservations, string[]>(
      { released: true, checkoutId: row.checkout_id, removed },
      removed.map((r) => r.reservationId)
    )
  },
  async (reservationIds, { container }) => {
    if (!reservationIds?.length) return
    await container.resolve(Modules.INVENTORY).restoreReservationItems(reservationIds)
  }
)

/**
 * Ends a Hold and its Checkout: `released` and `cancelled` when the Shopper
 * cancelled, `expired` and `expired` when its time ran out. Undone by making
 * them live and held again.
 */
export const endHoldStep = createStep(
  "end-hold",
  async (input: { holdId: string; checkoutId: string; reason: "cancelled" | "expired" }, { container }) => {
    const endedAt = new Date()
    await holds(container).updateHolds({
      id: input.holdId,
      status: input.reason === "cancelled" ? "released" : "expired",
      ended_at: endedAt,
    })
    await checkouts(container).updateCheckouts({
      id: input.checkoutId,
      status: input.reason === "cancelled" ? "cancelled" : "expired",
    })
    return new StepResponse({ endedAt: endedAt.toISOString() }, { holdId: input.holdId, checkoutId: input.checkoutId })
  },
  async (undo, { container }) => {
    if (!undo) return
    await holds(container).updateHolds({ id: undo.holdId, status: "live", ended_at: null })
    await checkouts(container).updateCheckouts({ id: undo.checkoutId, status: "held" })
  }
)
