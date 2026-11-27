import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MathBN } from "@medusajs/framework/utils"
import { BagView, Paise, ShelfPrice, type BagLine } from "@shop/contracts"
import { kernelAmountToPaise } from "./designs"
import { standardDeliveryPaise } from "./shipping"
import { shopError } from "./shop-errors"
import { availableByVariant, orderedPhotos, storeDesignsByProduct } from "./store-catalogue"

/**
 * The Shopper's Bag (Story 1.8): a kernel cart read as `BagView`. Every
 * amount comes from the kernel's cart totals, converted from rupees to paise;
 * the delivery charge is the standard shipping option's price. Clients only
 * format these amounts.
 */

type ItemRow = {
  id: string
  product_id?: string | null
  product_handle?: string | null
  product_title?: string | null
  variant_id?: string | null
  variant_title?: string | null
  thumbnail?: string | null
  quantity: unknown
  unit_price: unknown
  total?: unknown
  created_at?: Date | string | null
}

type CartRow = {
  id: string
  currency_code: string
  completed_at?: Date | string | null
  item_total?: unknown
  items?: (ItemRow | null)[] | null
}

const CART_FIELDS = [
  "id",
  "currency_code",
  "completed_at",
  "item_total",
  "items.id",
  "items.product_id",
  "items.product_handle",
  "items.product_title",
  "items.variant_id",
  "items.variant_title",
  "items.thumbnail",
  "items.quantity",
  "items.unit_price",
  "items.total",
  "items.created_at",
]

/** A kernel amount in rupees as paise; anything that is not whole non-negative paise is a fault (`internal`). */
export function kernelAmountToExactPaise(amount: unknown, what: string): number {
  const paise = MathBN.mult(MathBN.convert((amount ?? 0) as never), 100)
  const parsed = Paise.safeParse(paise.toNumber())
  if (!paise.isInteger() || !parsed.success) throw shopError("internal", `${what} is not a whole number of paise`)
  return parsed.data
}

/** The cart, or `bag.not_found` when there is none or it has been bought (completed). */
async function loadCart(container: MedusaContainer, cartId: string): Promise<CartRow> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "cart", fields: CART_FIELDS, filters: { id: cartId } })
  const cart = data[0] as unknown as CartRow | undefined
  if (!cart || cart.completed_at) throw shopError("bag.not_found", `No Bag ${cartId}`, { cartId })
  return cart
}

/** The Bag of a cart, with the server's line totals, the four price lines and the delivery charge. */
export async function loadBag(container: MedusaContainer, cartId: string): Promise<BagView> {
  const cart = await loadCart(container, cartId)
  // Lines in the order they were added.
  const items = (cart.items ?? [])
    .filter((i): i is ItemRow => Boolean(i))
    .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime() || a.id.localeCompare(b.id))

  const productIds = [...new Set(items.flatMap((i) => (i.product_id ? [i.product_id] : [])))]
  const designs = await storeDesignsByProduct(container, productIds)

  // Pieces available now for any line that is not one of the Designs read above.
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const otherVariantIds = items
    .filter((i) => i.variant_id && !(i.product_id && designs.get(i.product_id)?.view.variantId === i.variant_id))
    .map((i) => i.variant_id!)
  const otherAvailable = new Map<string, number>()
  if (otherVariantIds.length) {
    const { data } = await query.graph({
      entity: "product_variant",
      fields: ["id", "manage_inventory", "inventory_items.inventory_item_id"],
      filters: { id: otherVariantIds },
    })
    const counted = await availableByVariant(
      container,
      (data as unknown as { id: string; manage_inventory?: boolean | null; inventory_items?: ({ inventory_item_id?: string | null } | null)[] | null }[]).map(
        (v) => ({
          id: v.id,
          manageInventory: v.manage_inventory === true,
          inventoryItemIds: (v.inventory_items ?? []).flatMap((l) => (l?.inventory_item_id ? [l.inventory_item_id] : [])),
        })
      )
    )
    for (const [id, n] of counted) otherAvailable.set(id, n)
  }

  const lines: BagLine[] = items.map((item) => {
    const design = item.product_id ? designs.get(item.product_id) : undefined
    const price = kernelAmountToPaise(item.unit_price)
    if (price === null || !ShelfPrice.safeParse(price).success) {
      throw shopError("internal", `Bag line ${item.id} has a price that is not a shelf price`)
    }
    const quantity = MathBN.convert(item.quantity as never).toNumber()
    const photo = design ? orderedPhotos(design.view.photos)[0] : undefined
    const name = design?.view.name ?? item.product_title ?? ""
    const imageUrl = photo?.url ?? item.thumbnail ?? ""
    if (!name || !imageUrl || !item.variant_id || !item.product_id) {
      throw shopError("internal", `Bag line ${item.id} cannot be shown`)
    }
    const sameVariant = design && design.view.variantId === item.variant_id
    return {
      id: item.id,
      designId: item.product_id,
      handle: design?.record.handle ?? item.product_handle ?? item.product_id,
      variantId: item.variant_id,
      name,
      colourName: (sameVariant ? design.variantName : item.variant_title?.trim()) || "Standard",
      image: { url: imageUrl, alt: name, isSample: false },
      price,
      // No MRP in Epic 1: the MRP is the price.
      mrp: price,
      quantity,
      lineTotal: kernelAmountToExactPaise(item.total, `Bag line ${item.id} total`),
      stock: sameVariant ? design.available : (otherAvailable.get(item.variant_id) ?? 0),
    }
  })

  const itemTotal = kernelAmountToExactPaise(cart.item_total, "The Bag's item total")
  const totalMrp = lines.reduce((sum, l) => sum + l.mrp * l.quantity, 0)
  const delivery = await standardDeliveryPaise(container, cart.currency_code)
  return BagView.parse({
    lines,
    totalMrp,
    discount: totalMrp - itemTotal,
    delivery,
    total: itemTotal + delivery,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
  })
}
