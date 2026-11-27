import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MathBN } from "@medusajs/framework/utils"
import { BagView, ShelfPrice, type BagLine } from "@shop/contracts"
import { kernelAmountToPaise, kernelTotalToPaise } from "./designs"
import { findLiveHold, holdExpired, reservedByHold } from "./holds"
import { findIndiaRegionId, SHOP_REGION } from "./region"
import { standardDeliveryPaise } from "./shipping"
import { shopError } from "./shop-errors"
import { orderedPhotos, storeDesignsByProduct } from "./store-catalogue"

/**
 * The Shopper's Bag (Story 1.8): a kernel cart read as `BagView`. Every
 * amount comes from the kernel's cart totals, converted from rupees to paise;
 * the delivery charge is the standard shipping option's price. Clients only
 * format these amounts.
 */

export type ItemRow = {
  id: string
  product_id?: string | null
  product_handle?: string | null
  product_title?: string | null
  variant_id?: string | null
  variant_title?: string | null
  thumbnail?: string | null
  title?: string | null
  quantity: unknown
  unit_price: unknown
  total?: unknown
  created_at?: Date | string | null
}

export type CartRow = {
  id: string
  currency_code: string
  region_id?: string | null
  sales_channel_id?: string | null
  customer_id?: string | null
  completed_at?: Date | string | null
  item_total?: unknown
  items?: (ItemRow | null)[] | null
}

const CART_FIELDS = [
  "id",
  "currency_code",
  "region_id",
  "sales_channel_id",
  "customer_id",
  "completed_at",
  "item_total",
  "items.id",
  "items.product_id",
  "items.product_handle",
  "items.product_title",
  "items.variant_id",
  "items.variant_title",
  "items.thumbnail",
  "items.title",
  "items.quantity",
  "items.unit_price",
  "items.total",
  "items.created_at",
]

/**
 * The cart, or `bag.not_found` when there is none, it has been bought
 * (completed), or it is not a Bag this shop can show: not in rupees, not in
 * the India region, or not in one of the publishable key's sales channels.
 */
export async function loadCart(container: MedusaContainer, cartId: string, salesChannelIds: readonly string[]): Promise<CartRow> {
  const notFound = () => shopError("bag.not_found", `No Bag ${cartId}`, { cartId })
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "cart", fields: CART_FIELDS, filters: { id: cartId } })
  const cart = data[0] as unknown as CartRow | undefined
  if (!cart || cart.completed_at) throw notFound()
  if (cart.currency_code !== SHOP_REGION.currencyCode || !cart.sales_channel_id || !salesChannelIds.includes(cart.sales_channel_id)) {
    throw notFound()
  }
  const indiaId = await findIndiaRegionId(container)
  if (!indiaId || cart.region_id !== indiaId) throw notFound()
  return cart
}

/**
 * The Bag of a cart, with the server's line totals, the four price lines and
 * the delivery charge. A line whose Design is no longer on sale (gone,
 * unpublished, or not this Variant) is shown as not buyable, with no stock,
 * so the Shopper can remove it.
 */
export async function loadBag(
  container: MedusaContainer,
  cartId: string,
  salesChannelIds: readonly string[]
): Promise<BagView> {
  const cart = await loadCart(container, cartId, salesChannelIds)
  // Lines in the order they were added.
  const items = (cart.items ?? [])
    .filter((i): i is ItemRow => Boolean(i))
    .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime() || a.id.localeCompare(b.id))

  const productIds = [...new Set(items.flatMap((i) => (i.product_id ? [i.product_id] : [])))]
  const designs = await storeDesignsByProduct(container, productIds)
  // While a checkout holds this Bag's Pieces (Story 1.9), they are hers: count
  // them as available to her lines, though no other Shopper can have them.
  // Only while the Hold locks the Bag: once it has expired the Bag can change, and the kernel no longer counts them as hers.
  const liveHold = await findLiveHold(container, cart.id)
  const locking = liveHold && !holdExpired(liveHold) ? liveHold : null
  const ownHeld = locking ? await reservedByHold(container, locking.id) : new Map<string, number>()

  const lines: BagLine[] = items.map((item) => {
    if (!item.product_id || !item.variant_id) throw shopError("internal", `Bag line ${item.id} names no product or variant`)
    const price = kernelAmountToPaise(item.unit_price)
    if (price === null || !ShelfPrice.safeParse(price).success) {
      throw shopError("internal", `Bag line ${item.id} has a price that is not a shelf price`)
    }
    const quantity = MathBN.convert(item.quantity as never).toNumber()
    const found = designs.get(item.product_id)
    const design =
      found && found.view.status === "published" && found.view.variantId === item.variant_id ? found : undefined
    const photo = design ? orderedPhotos(design.view.photos)[0] : undefined
    const name = design?.view.name || item.product_title || item.title || item.variant_title || item.id
    const imageUrl = photo?.url ?? item.thumbnail ?? null
    return {
      id: item.id,
      designId: item.product_id,
      handle: design ? design.record.handle : (item.product_handle ?? null),
      variantId: item.variant_id,
      name,
      colourName: (design ? design.variantName : item.variant_title?.trim()) || "Standard",
      image: imageUrl ? { url: imageUrl, alt: name, isSample: false } : null,
      buyable: Boolean(design),
      price,
      // No MRP in Epic 1: the MRP is the price.
      mrp: price,
      quantity,
      lineTotal: kernelTotalToPaise(item.total, `Bag line ${item.id} total`),
      stock: design ? design.available + (design.inventoryItemId ? (ownHeld.get(design.inventoryItemId) ?? 0) : 0) : 0,
    }
  })

  const itemTotal = kernelTotalToPaise(cart.item_total, "The Bag's item total")
  const totalMrp = lines.reduce((sum, l) => sum + l.mrp * l.quantity, 0)
  const discount = totalMrp - itemTotal
  if (discount < 0) {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .error(`bag: cart ${cart.id} has an item total (${itemTotal} paise) above its MRP total (${totalMrp} paise)`)
    throw shopError("internal", `The Bag ${cart.id} has a negative discount`)
  }
  const delivery = await standardDeliveryPaise(container, cart.currency_code)
  return BagView.parse({
    lines,
    totalMrp,
    discount,
    delivery,
    total: itemTotal + delivery,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    hold: locking ? { checkoutId: locking.checkout_id, expiresAt: new Date(locking.expires_at).toISOString() } : null,
  })
}
