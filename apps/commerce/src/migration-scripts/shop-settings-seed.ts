import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
  updateTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ShopName, taxBandsKey, type SettingKey } from "@shop/contracts"
import { SETTINGS_MODULE } from "../modules/settings"
import type SettingsModuleService from "../modules/settings/service"
import { SHOP_TAX_PROVIDER_ID } from "../providers/tax"
import { SHOP_SETTINGS_SEED } from "../settings-data/seed"

/** The shop name to seed: STORE_NAME when set, else the settings-data default. Names the variable when invalid. */
export function seedShopName(env: Record<string, string | undefined> = process.env): string {
  const raw = env.STORE_NAME
  if (raw === undefined || raw.trim() === "") return SHOP_SETTINGS_SEED.defaultShopName
  const parsed = ShopName.safeParse(raw)
  if (!parsed.success) {
    throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, "Missing or invalid environment variable: STORE_NAME")
  }
  return parsed.data
}

/**
 * Seeds the shop settings, the India region (rupees, tax-inclusive prices) and
 * its tax region on the shop's tax provider. Idempotent: a setting key that has
 * any value, and a region or tax region that exists, is not created again.
 */
export async function seedShopSettings(
  container: MedusaContainer,
  env: Record<string, string | undefined> = process.env
): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
  const seed = SHOP_SETTINGS_SEED

  const values: [SettingKey, unknown][] = [
    ["shop.name", seedShopName(env)],
    ["shop.time_zone", seed.timeZone],
    ...Object.entries(seed.taxBands).map(([code, bands]): [SettingKey, unknown] => [taxBandsKey(code), bands]),
  ]
  for (const [key, value] of values) {
    if (await settings.hasValue(key)) continue
    await settings.setValue(key, value, seed.effectiveFrom)
    logger.info(`Seeded setting ${key}`)
  }

  // Rupees in the store, with tax-inclusive prices (a currency-level price preference).
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code", "supported_currencies.is_default", "supported_currencies.is_tax_inclusive"],
  })
  const store = stores[0]
  if (store) {
    const currencies = (store.supported_currencies ?? []).filter(Boolean) as {
      currency_code: string
      is_default?: boolean
      is_tax_inclusive?: boolean
    }[]
    if (!currencies.some((c) => c.currency_code === seed.region.currencyCode)) {
      await updateStoresWorkflow(container).run({
        input: {
          selector: { id: store.id },
          update: {
            supported_currencies: [
              ...currencies.map((c) => ({
                currency_code: c.currency_code,
                is_default: c.is_default ?? false,
                is_tax_inclusive: c.is_tax_inclusive ?? false,
              })),
              { currency_code: seed.region.currencyCode, is_default: false, is_tax_inclusive: true },
            ],
          },
        },
      })
      logger.info("Added rupees to the store's currencies")
    }
  }

  // The India region. A country belongs to one region only, so an existing region with India is kept.
  const { data: regions } = await query.graph({ entity: "region", fields: ["id", "countries.iso_2"] })
  const hasIndia = regions.some((r) => (r.countries ?? []).some((c) => c?.iso_2 === seed.region.countryCode))
  if (!hasIndia) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: seed.region.name,
            currency_code: seed.region.currencyCode,
            countries: [seed.region.countryCode],
            automatic_taxes: true,
            is_tax_inclusive: true,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    logger.info("Created the India region")
  }

  // Its tax region, on the shop's tax provider, with the tax rate that carries the saree tax code.
  const taxModule = container.resolve(Modules.TAX)
  const [taxRegion] = (
    await taxModule.listTaxRegions({ country_code: seed.region.countryCode })
  ).filter((r) => !r.province_code)
  if (!taxRegion) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: seed.region.countryCode,
          provider_id: SHOP_TAX_PROVIDER_ID,
          default_tax_rate: { ...seed.region.defaultTaxRate, rate: null },
        },
      ],
    })
    logger.info("Created the India tax region on the shop's tax provider")
  } else if (taxRegion.provider_id !== SHOP_TAX_PROVIDER_ID) {
    await updateTaxRegionsWorkflow(container).run({
      input: [{ id: taxRegion.id, provider_id: SHOP_TAX_PROVIDER_ID }],
    })
    logger.info("Moved the India tax region to the shop's tax provider")
  }
}

export default async function shopSettingsSeed({ container }: { container: MedusaContainer }) {
  await seedShopSettings(container)
}
