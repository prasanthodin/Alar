import type { MedusaNextFunction, MedusaRequest, MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BagQuantity, matchesPattern, normalisePath, type ApiError } from "@shop/contracts"
import { z } from "zod"
import { findLockingHold } from "./holds"
import { findIndiaRegionId } from "./region"
import { shopError, shopErrorOf } from "./shop-errors"
import { storeDesignsByProduct } from "./store-catalogue"

/**
 * The Bag's kernel cart writes (Story 1.8) accept only what the Bag sends.
 * The kernel's own cart routes take much more (a region, a currency, a sales
 * channel, promotion codes, an email, addresses, metadata), which would let a
 * caller step around the allow-list; here every other field is refused with
 * 400 `input.invalid`, a new cart is always made in the India region and the
 * publishable key's sales channel, and every Variant must be the Variant of a
 * published Design on sale through the key (404 `design.not_found` otherwise).
 * Runs as a global middleware after the route allow-list, before the kernel's
 * own body validation. A cart with a live Hold (Story 1.9) refuses every
 * line write (add, change, remove) with 409 `cart.locked`.
 */

const Item = z.strictObject({ variant_id: z.string().min(1), quantity: BagQuantity })

/** The body each allowed cart write may carry. */
const CART_WRITES = [
  { method: "POST", pattern: "/store/carts", body: z.strictObject({ items: z.array(Item).min(1).max(20) }) },
  { method: "POST", pattern: "/store/carts/:id/line-items", body: Item },
  { method: "POST", pattern: "/store/carts/:id/line-items/:line_id", body: z.strictObject({ quantity: BagQuantity }) },
] as const

/** The schema for this cart write, or null when the request is not one of them. */
export function cartWriteSchema(method: string, path: string): z.ZodType | null {
  const p = normalisePath(path)
  return CART_WRITES.find((w) => w.method === method.toUpperCase() && matchesPattern(w.pattern, p))?.body ?? null
}

/** The writes to an existing cart's lines: add, change and remove. */
const LINE_WRITES = [
  { method: "POST", pattern: "/store/carts/:id/line-items" },
  { method: "POST", pattern: "/store/carts/:id/line-items/:line_id" },
  { method: "DELETE", pattern: "/store/carts/:id/line-items/:line_id" },
] as const

/**
 * The cart whose lines this request adds, changes or removes, or null when it
 * is not such a write. Throws URIError for a cart id that is not valid
 * percent-encoding.
 */
export function lineWriteCartId(method: string, path: string): string | null {
  const p = normalisePath(path)
  if (!LINE_WRITES.some((w) => w.method === method.toUpperCase() && matchesPattern(w.pattern, p))) return null
  const id = p.split("/")[3]
  return id ? decodeURIComponent(id) : null
}

/** The fields of a refused body, for `details.fields`. */
function refusedFields(error: z.ZodError): string[] {
  return [
    ...new Set(
      error.issues.flatMap((i) =>
        i.code === "unrecognized_keys" ? i.keys.map((k) => [...i.path, k].join(".")) : [i.path.join(".") || "(body)"]
      )
    ),
  ]
}

/** The Variants that are not the Variant of a published Design in one of these sales channels. */
export async function variantsNotOnSale(
  container: MedusaContainer,
  variantIds: string[],
  salesChannelIds: readonly string[]
): Promise<string[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "product_variant", fields: ["id", "product_id"], filters: { id: variantIds } })
  const productOf = new Map(
    (data as unknown as { id: string; product_id?: string | null }[]).map((v) => [v.id, v.product_id ?? null])
  )
  const designs = await storeDesignsByProduct(container, [...new Set([...productOf.values()].filter((id): id is string => Boolean(id)))])
  return variantIds.filter((variantId) => {
    const productId = productOf.get(variantId)
    const design = productId ? designs.get(productId) : undefined
    return !(
      design &&
      design.view.status === "published" &&
      design.view.variantId === variantId &&
      design.record.salesChannelIds.some((id) => salesChannelIds.includes(id))
    )
  })
}

function refuse(res: MedusaResponse, status: number, error: ApiError) {
  res.status(status).json(error)
}

export async function bagCartGuard(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  // `originalUrl` keeps the full path; the mount point strips it from `req.path`.
  let lockedCart: string | null
  try {
    lockedCart = lineWriteCartId(req.method, req.originalUrl)
  } catch {
    // A cart id that is not valid percent-encoding names no Bag.
    return refuse(res, 404, { code: "bag.not_found", message: "No such Bag" })
  }
  if (lockedCart) {
    // While a checkout holds the Bag's Pieces (Story 1.9), its lines cannot change.
    try {
      if (await findLockingHold(req.scope, lockedCart)) {
        return refuse(res, 409, {
          code: "cart.locked",
          message: "This Bag is held for a checkout; cancel it to change the Bag",
          details: { cartId: lockedCart },
        })
      }
    } catch (e) {
      req.scope
        .resolve(ContainerRegistrationKeys.LOGGER)
        .error(`bag: cart lock check failed: ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`)
      return refuse(res, 500, { code: "internal", message: "Something went wrong" })
    }
  }
  const schema = cartWriteSchema(req.method, req.originalUrl)
  if (!schema) return next()
  const parsed = schema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return refuse(res, 400, {
      code: "input.invalid",
      message: "A Bag change takes only the Variant and the quantity",
      details: { fields: refusedFields(parsed.error) },
    })
  }
  try {
    const salesChannelIds = (req as MedusaStoreRequest).publishable_key_context?.sales_channel_ids ?? []
    const body = parsed.data as { items?: z.infer<typeof Item>[]; variant_id?: string; quantity: number }
    const variantIds = body.items ? body.items.map((i) => i.variant_id) : body.variant_id ? [body.variant_id] : []
    if (variantIds.length) {
      const missing = await variantsNotOnSale(req.scope, variantIds, salesChannelIds)
      if (missing.length) {
        return refuse(res, 404, {
          code: "design.not_found",
          message: "No Design on sale has this Variant",
          details: { variantIds: missing },
        })
      }
    }
    if (body.items) {
      const regionId = await findIndiaRegionId(req.scope)
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
      const { data: stores } = await query.graph({ entity: "store", fields: ["id", "default_sales_channel_id"] })
      const preferred = stores[0]?.default_sales_channel_id
      const salesChannelId = preferred && salesChannelIds.includes(preferred) ? preferred : salesChannelIds[0]
      if (!regionId || !salesChannelId) {
        throw shopError("internal", "The India region or the key's sales channel is missing")
      }
      req.body = { items: body.items, region_id: regionId, sales_channel_id: salesChannelId }
    } else {
      req.body = parsed.data
    }
    return next()
  } catch (e) {
    const envelope = shopErrorOf(e)
    if (envelope) return refuse(res, 400, envelope)
    req.scope
      .resolve(ContainerRegistrationKeys.LOGGER)
      .error(`bag: cart write check failed: ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`)
    return refuse(res, 500, { code: "internal", message: "Something went wrong" })
  }
}
