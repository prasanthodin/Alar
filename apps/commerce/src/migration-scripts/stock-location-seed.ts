import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ensureVariantStock,
  findIndiaLocationByAddress,
  findShopStockLocationId,
  otherStockLocations,
  quantity,
  SHOP_STOCK_LOCATION,
  STOCK_LOCATION_SETTING,
} from "../lib/stock"
import { withStockLocks } from "../lib/stock-lock"
import { SETTINGS_MODULE } from "../modules/settings"
import type SettingsModuleService from "../modules/settings/service"
import { STOCK_LEDGER_MODULE, type StockLedgerModuleService } from "../modules/stock-ledger"

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

/** The actor of the rows the seed writes. */
export const STOCK_SEED_ACTOR = "system:stock-location-seed"

/**
 * Writes one `opening_balance` row for each non-zero level at an adopted
 * location, under the stock lock, so the ledger adds up from its first row.
 * The row's request id is derived from the location and inventory item, so a
 * rerun never writes a second one. A level whose inventory item is linked to
 * no Variant is logged and skipped.
 */
async function writeOpeningBalances(container: MedusaContainer, locationId: string): Promise<number> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const inventory = container.resolve(Modules.INVENTORY)
  const ledger = container.resolve<StockLedgerModuleService>(STOCK_LEDGER_MODULE)
  const levels = await inventory.listInventoryLevels({ location_id: locationId })
  let written = 0
  for (const level of levels) {
    const itemId = level.inventory_item_id
    const requestId = `opening-balance:${locationId}:${itemId}`
    try {
      await withStockLocks(container, [itemId], async () => {
        const [now] = await inventory.listInventoryLevels({ inventory_item_id: itemId, location_id: locationId })
        const stocked = quantity(now?.stocked_quantity)
        const reserved = quantity(now?.reserved_quantity)
        if (stocked === 0 && reserved === 0) return
        if (await ledger.findByRequestId(requestId)) return
        const { data: links } = await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["variant_id", "inventory_item_id"],
          filters: { inventory_item_id: itemId },
        })
        const variantId = (links[0] as { variant_id?: string } | undefined)?.variant_id
        if (!variantId) {
          logger.warn(`stock seed: inventory item ${itemId} has stock at ${locationId} but no Variant; no opening balance`)
          return
        }
        await ledger.record({
          inventoryItemId: itemId,
          variantId,
          cause: "opening_balance",
          change: stocked,
          stockedAfter: stocked,
          reservedAfter: reserved,
          actor: STOCK_SEED_ACTOR,
          actorId: null,
          reason: "Opening balance of the stock location taken over as India",
          requestId,
        })
        written++
      })
    } catch (e) {
      logger.warn(`stock seed: no opening balance for inventory item ${itemId}: ${(e as Error).message}`)
    }
  }
  return written
}

/**
 * Seeds the shop's one stock location, India (Story 1.7), and gives every
 * existing Design's Variant an inventory item with a level there. Idempotent.
 *
 * - The location in the setting `stock.location_id` is kept; without the
 *   setting, a location with an IN address is taken.
 * - Otherwise the oldest existing location (the starter's "European
 *   Warehouse") becomes India, so no second location is added; it keeps its
 *   links and levels, and each non-zero level gets an `opening_balance` row.
 *   With no location at all, India is created.
 * - The id is stored in the dated setting `stock.location_id`.
 * - The location is linked to the store's default sales channel (a warning
 *   when there is none).
 * - Each Design's Variant gets `manage_inventory`, one inventory item and a
 *   level at India with 0 stocked, where any of them is missing. A Variant
 *   that cannot be given them is logged and skipped, with its partial writes
 *   undone; the others go on.
 */
export async function seedShopStockLocation(container: MedusaContainer): Promise<string> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)

  let locationId = (await settings.hasValue(STOCK_LOCATION_SETTING))
    ? await findShopStockLocationId(container)
    : await findIndiaLocationByAddress(container)
  if (!locationId) {
    const [oldest] = await otherStockLocations(container)
    if (oldest) {
      await updateStockLocationsWorkflow(container).run({
        input: { selector: { id: oldest.id }, update: { name: SHOP_STOCK_LOCATION.name, address: INDIA_ADDRESS } },
      })
      locationId = oldest.id
      logger.info(`Made the stock location "${oldest.name ?? oldest.id}" the shop's India stock location`)
      const written = await writeOpeningBalances(container, locationId)
      if (written) logger.info(`Wrote ${written} opening-balance stock movement(s) for the adopted location`)
    } else {
      const { result } = await createStockLocationsWorkflow(container).run({
        input: { locations: [{ name: SHOP_STOCK_LOCATION.name, address: INDIA_ADDRESS }] },
      })
      locationId = result[0]!.id
      logger.info("Created the shop's India stock location")
    }
  }
  if (!(await settings.hasValue(STOCK_LOCATION_SETTING))) {
    await settings.setValue(STOCK_LOCATION_SETTING, locationId, new Date())
    logger.info(`Stored the India stock location in the setting ${STOCK_LOCATION_SETTING}`)
  }
  const others = await otherStockLocations(container, locationId)
  if (others.length) {
    logger.warn(`Stock locations other than India exist and are not used by the shop: ${others.map((l) => l.id).join(", ")}`)
  }

  // Linked to the store's default sales channel, so the kernel can sell from it.
  const { data: stores } = await query.graph({ entity: "store", fields: ["id", "default_sales_channel_id"] })
  const salesChannelId = stores[0]?.default_sales_channel_id
  if (!salesChannelId) {
    logger.warn("The store has no default sales channel; the India stock location is linked to none")
  } else {
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
  let skipped = 0
  for (const design of designs) {
    const variants = ((design as { product?: { variants?: ({ id: string } | null)[] | null } | null }).product?.variants ??
      []) as ({ id: string } | null)[]
    for (const variant of variants) {
      if (!variant) continue
      try {
        const done = await ensureVariantStock(container, variant.id, locationId)
        if (done.turnedOnInventory || done.createdInventoryItem || done.createdLevelId) backfilled++
      } catch (e) {
        skipped++
        logger.warn(`stock seed: skipped Variant ${variant.id}, which could not be given a stock record: ${(e as Error).message}`)
      }
    }
  }
  if (backfilled) logger.info(`Gave ${backfilled} Design Variant(s) a stock level at the India stock location`)
  if (skipped) logger.warn(`stock seed: ${skipped} Design Variant(s) were skipped; fix them and run the seed again`)
  return locationId
}

export default async function stockLocationSeed({ container }: { container: MedusaContainer }) {
  await seedShopStockLocation(container)
}
