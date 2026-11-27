import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { findStandardShippingOptionId, SHIPPING_OPTION_SETTING } from "../lib/shipping"
import { shopError } from "../lib/shop-errors"
import { shopStockLocationId } from "../lib/stock"
import { SETTINGS_MODULE } from "../modules/settings"
import type SettingsModuleService from "../modules/settings/service"
import { SHOP_SETTINGS_SEED } from "../settings-data/seed"

/** The kernel's manual fulfilment provider, which every starter database has. */
export const MANUAL_FULFILLMENT_PROVIDER = "manual_manual"

type LocationRow = {
  id: string
  fulfillment_providers?: ({ id: string } | null)[] | null
  fulfillment_sets?:
    | ({
        id: string
        name: string
        type?: string | null
        service_zones?: ({ id: string; name: string; geo_zones?: ({ country_code?: string | null; type?: string | null } | null)[] | null } | null)[] | null
      } | null)[]
    | null
}

/**
 * Seeds the shop's one shipping option for India (Story 1.8), so a Bag shows
 * its delivery charge before checkout: a fulfilment set "India delivery" on
 * the India stock location, a service zone covering India, and the option
 * "Standard delivery" at Rs 0 in rupees (store-wide and for the India
 * region), on the default shipping profile and the manual fulfilment
 * provider. The option's id is stored in the dated setting
 * `shipping.standard_option_id`. Idempotent: each part is reused when it
 * exists, and nothing is done once the setting names an existing option.
 * Runs after the stock seed (file order), which it needs.
 */
export async function seedShopShipping(container: MedusaContainer): Promise<string> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
  const seed = SHOP_SETTINGS_SEED.shipping
  const india = SHOP_SETTINGS_SEED.region

  const existingId = await findStandardShippingOptionId(container)
  if (existingId) {
    const { data } = await query.graph({ entity: "shipping_option", fields: ["id"], filters: { id: existingId } })
    if (data.length) return existingId
    logger.warn(`shipping seed: the option in ${SHIPPING_OPTION_SETTING} (${existingId}) no longer exists; seeding again`)
  }

  const locationId = await shopStockLocationId(container)
  const readLocation = async () => {
    const { data } = await query.graph({
      entity: "stock_location",
      fields: [
        "id",
        "fulfillment_providers.id",
        "fulfillment_sets.id",
        "fulfillment_sets.name",
        "fulfillment_sets.type",
        "fulfillment_sets.service_zones.id",
        "fulfillment_sets.service_zones.name",
        "fulfillment_sets.service_zones.geo_zones.country_code",
        "fulfillment_sets.service_zones.geo_zones.type",
      ],
      filters: { id: locationId },
    })
    return data[0] as unknown as LocationRow
  }
  let location = await readLocation()

  // The location ships through the manual provider.
  if (!(location.fulfillment_providers ?? []).some((p) => p?.id === MANUAL_FULFILLMENT_PROVIDER)) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: MANUAL_FULFILLMENT_PROVIDER },
    })
    logger.info("Linked the India stock location to the manual fulfilment provider")
  }

  // The fulfilment set and its India service zone.
  let set = (location.fulfillment_sets ?? []).find((s) => s?.name === seed.fulfillmentSetName && s.type === "shipping")
  if (!set) {
    await createLocationFulfillmentSetWorkflow(container).run({
      input: { location_id: locationId, fulfillment_set_data: { name: seed.fulfillmentSetName, type: "shipping" } },
    })
    location = await readLocation()
    set = (location.fulfillment_sets ?? []).find((s) => s?.name === seed.fulfillmentSetName && s.type === "shipping")
    if (!set) throw shopError("internal", "shipping seed: the India fulfilment set was not created")
    logger.info(`Created the fulfilment set "${seed.fulfillmentSetName}" on the India stock location`)
  }
  const coversIndia = (z: NonNullable<NonNullable<NonNullable<LocationRow["fulfillment_sets"]>[number]>["service_zones"]>[number]) =>
    (z?.geo_zones ?? []).some((g) => g?.type === "country" && g.country_code?.toLowerCase() === india.countryCode)
  let zoneId = (set.service_zones ?? []).find((z) => z && coversIndia(z))?.id
  if (!zoneId) {
    const { result } = await createServiceZonesWorkflow(container).run({
      input: {
        data: [
          {
            fulfillment_set_id: set.id,
            name: seed.serviceZoneName,
            geo_zones: [{ type: "country", country_code: india.countryCode }],
          },
        ],
      },
    })
    zoneId = result[0]!.id
    logger.info(`Created the service zone "${seed.serviceZoneName}"`)
  }

  // The default shipping profile, which every Design uses.
  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id", "type"] })
  let profileId = profiles.find((p) => p.type === "default")?.id
  if (!profileId) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    })
    profileId = result[0]!.id
    logger.info("Created the default shipping profile")
  }

  // The option itself, reused when an earlier run created it.
  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "service_zone_id"],
    filters: { service_zone_id: zoneId, name: seed.optionName },
  })
  let optionId = options[0]?.id
  if (!optionId) {
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "countries.iso_2"],
    })
    const region = regions.find((r) => (r.countries ?? []).some((c) => c?.iso_2 === india.countryCode))
    const amount = seed.amountPaise / 100
    const { result } = await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: seed.optionName,
          price_type: "flat",
          provider_id: MANUAL_FULFILLMENT_PROVIDER,
          service_zone_id: zoneId,
          shipping_profile_id: profileId,
          type: { label: seed.optionTypeLabel, description: seed.optionName, code: seed.optionTypeCode },
          prices: [
            { currency_code: india.currencyCode, amount },
            ...(region ? [{ region_id: region.id, amount }] : []),
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })
    optionId = result[0]!.id
    logger.info(`Created the shipping option "${seed.optionName}" at Rs ${amount}`)
  }

  await settings.setValue(SHIPPING_OPTION_SETTING, optionId, new Date())
  logger.info(`Stored the standard shipping option in the setting ${SHIPPING_OPTION_SETTING}`)
  return optionId
}

export default async function stockLocationShipping({ container }: { container: MedusaContainer }) {
  await seedShopShipping(container)
}
