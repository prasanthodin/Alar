import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ensureVariantStock, findShopStockLocationId, otherStockLocations, SHOP_STOCK_LOCATION } from "../lib/stock"

/** The India address; the rest is cleared when the starter's location is taken over. */
const INDIA_ADDRESS = {
  address_1: "",
  address_2: null,
  city: null,
  province: null,
  postal_code: null,
  phone: null,
  country_code: SHOP_STOCK_LOCATION.countryCode,
}

/**
 * Seeds the shop's one stock location, India (Story 1.7), and gives every
 * existing Design's Variant an inventory item with a level there. Idempotent.
 *
 * - An India location (address country IN) is kept as it is.
 * - Otherwise the oldest existing location (the starter's "European
 *   Warehouse") becomes India, so its links and levels stay and no second
 *   location is added; with no location at all, India is created.
 * - The location is linked to the store's default sales channel.
 * - Each Design's Variant gets `manage_inventory`, one inventory item and a
 *   level at India with 0 stocked, where any of them is missing.
 */
export async function seedShopStockLocation(container: MedusaContainer): Promise<string> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let locationId = await findShopStockLocationId(container)
  if (!locationId) {
    const [oldest] = await otherStockLocations(container)
    if (oldest) {
      await updateStockLocationsWorkflow(container).run({
        input: { selector: { id: oldest.id }, update: { name: SHOP_STOCK_LOCATION.name, address: INDIA_ADDRESS } },
      })
      locationId = oldest.id
      logger.info(`Made the stock location "${oldest.name ?? oldest.id}" the shop's India stock location`)
    } else {
      const { result } = await createStockLocationsWorkflow(container).run({
        input: { locations: [{ name: SHOP_STOCK_LOCATION.name, address: INDIA_ADDRESS }] },
      })
      locationId = result[0]!.id
      logger.info("Created the shop's India stock location")
    }
  }
  const others = await otherStockLocations(container)
  if (others.length) {
    logger.warn(`Stock locations other than India exist and are not used by the shop: ${others.map((l) => l.id).join(", ")}`)
  }

  // Linked to the store's default sales channel, so the kernel can sell from it.
  const { data: stores } = await query.graph({ entity: "store", fields: ["id", "default_sales_channel_id"] })
  const salesChannelId = stores[0]?.default_sales_channel_id
  if (salesChannelId) {
    const { data: locations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "sales_channels.id"],
      filters: { id: locationId },
    })
    const linked = (locations[0]?.sales_channels ?? []).some((c) => c?.id === salesChannelId)
    if (!linked) {
      await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: locationId, add: [salesChannelId] } })
      logger.info("Linked the India stock location to the default sales channel")
    }
  }

  // Backfill: every Design's Variant keeps its stock at India.
  const { data: designs } = await query.graph({
    entity: "design_attributes",
    fields: ["id", "product.id", "product.variants.id"],
  })
  let backfilled = 0
  for (const design of designs) {
    const variants = ((design as { product?: { variants?: ({ id: string } | null)[] | null } | null }).product?.variants ??
      []) as ({ id: string } | null)[]
    for (const variant of variants) {
      if (!variant) continue
      const done = await ensureVariantStock(container, variant.id, locationId)
      if (done.turnedOnInventory || done.createdInventoryItem || done.createdLevelId) backfilled++
    }
  }
  if (backfilled) logger.info(`Gave ${backfilled} Design Variant(s) a stock level at the India stock location`)
  return locationId
}

export default async function stockLocationSeed({ container }: { container: MedusaContainer }) {
  await seedShopStockLocation(container)
}
