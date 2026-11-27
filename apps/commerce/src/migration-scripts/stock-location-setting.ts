import type { MedusaContainer } from "@medusajs/framework"
import { seedShopStockLocation } from "./stock-location-seed"

/**
 * Runs the stock seed again on databases seeded before the setting
 * `stock.location_id` existed, so the shop's stock location is read from
 * the setting rather than found by its address. A no-op where the setting
 * is already stored (the seed is idempotent).
 */
export default async function stockLocationSetting({ container }: { container: MedusaContainer }) {
  await seedShopStockLocation(container)
}
