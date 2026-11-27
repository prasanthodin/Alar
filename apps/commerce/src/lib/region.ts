import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SHOP_SETTINGS_SEED } from "../settings-data/seed"

/** The shop's one region, India, and its currency (rupees), seeded by the shop settings seed. */
export const SHOP_REGION = {
  countryCode: SHOP_SETTINGS_SEED.region.countryCode,
  currencyCode: SHOP_SETTINGS_SEED.region.currencyCode,
} as const

/** The id of the region that holds India, or null before the settings seed has run. */
export async function findIndiaRegionId(container: MedusaContainer): Promise<string | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "region", fields: ["id", "countries.iso_2"] })
  const india = data.find((r) => (r.countries ?? []).some((c) => c?.iso_2 === SHOP_REGION.countryCode))
  return india?.id ?? null
}
