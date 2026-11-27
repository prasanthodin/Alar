import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  deleteRegionsWorkflow,
  deleteTaxRegionsWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
  updateTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ShopName, taxBandsKey, type SettingKey, type SettingValueOf } from "@shop/contracts"
import { DEFAULT_REGION_STORE_POLICIES } from "../lib/region-store-policies"
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
 * Seeds the shop settings and makes the kernel match them: the store is named
 * from `shop.name` with rupees as its default currency (tax-inclusive), India
 * is the one region (with the store-policy metadata), other regions and their
 * tax regions are deleted, and India's tax region uses the shop's tax
 * provider. Demo products are left alone. Idempotent: a setting key that has
 * any value is not written again, and each kernel step only changes what
 * differs.
 */
export async function seedShopSettings(
  container: MedusaContainer,
  env: Record<string, string | undefined> = process.env
): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
  const seed = SHOP_SETTINGS_SEED

  const values: [SettingKey, SettingValueOf<SettingKey>][] = [
    ["shop.name", seedShopName(env)],
    ["shop.time_zone", seed.timeZone],
    ...Object.entries(seed.taxBands).map(
      ([code, bands]): [SettingKey, SettingValueOf<SettingKey>] => [taxBandsKey(code), [...bands]]
    ),
  ]
  for (const [key, value] of values) {
    if (await settings.hasValue(key)) continue
    // The seed's fixed instant is in the past; only the initial seed may write there.
    await settings.setValue(key, value, seed.effectiveFrom, { allowPast: true })
    logger.info(`Seeded setting ${key}`)
  }
  const shopName = await settings.getValue("shop.name")

  // The store: named from shop.name, rupees the default currency with tax-inclusive prices.
  // Tax-inclusiveness of a currency is its price preference, not a store column.
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "supported_currencies.currency_code", "supported_currencies.is_default"],
  })
  const store = stores[0]
  if (store) {
    const currencies = (store.supported_currencies ?? []).filter(Boolean) as {
      currency_code: string
      is_default?: boolean
    }[]
    const preferences = await container.resolve(Modules.PRICING).listPricePreferences({ attribute: "currency_code" })
    const inclusive = (code: string) => preferences.find((p) => p.value === code)?.is_tax_inclusive === true
    const inr = currencies.find((c) => c.currency_code === seed.region.currencyCode)
    const currenciesRight =
      inr?.is_default === true &&
      inclusive(seed.region.currencyCode) &&
      currencies.every((c) => c === inr || !c.is_default)
    if (!currenciesRight || store.name !== shopName) {
      await updateStoresWorkflow(container).run({
        input: {
          selector: { id: store.id },
          update: {
            name: shopName,
            supported_currencies: [
              ...currencies
                .filter((c) => c.currency_code !== seed.region.currencyCode)
                .map((c) => ({
                  currency_code: c.currency_code,
                  is_default: false,
                  is_tax_inclusive: inclusive(c.currency_code),
                })),
              { currency_code: seed.region.currencyCode, is_default: true, is_tax_inclusive: true },
            ],
          },
        },
      })
      logger.info("Named the store from shop.name, with rupees as its default currency")
    }
  }

  // The India region, the only one. A country belongs to one region only, so an existing region with India is kept.
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "metadata", "countries.iso_2"],
  })
  const isIndia = (r: (typeof regions)[number]) =>
    (r.countries ?? []).some((c) => c?.iso_2 === seed.region.countryCode)
  const india = regions.find(isIndia)
  if (!india) {
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
            metadata: { ...DEFAULT_REGION_STORE_POLICIES },
          },
        ],
      },
    })
    logger.info("Created the India region")
  } else {
    const metadata = (india.metadata ?? {}) as Record<string, unknown>
    const missing = Object.entries(DEFAULT_REGION_STORE_POLICIES).filter(([k]) => metadata[k] === undefined)
    if (missing.length) {
      await updateRegionsWorkflow(container).run({
        input: { selector: { id: india.id }, update: { metadata: { ...metadata, ...Object.fromEntries(missing) } } },
      })
      logger.info("Added store policy defaults to the India region")
    }
  }

  const taxModule = container.resolve(Modules.TAX)
  const others = regions.filter((r) => !isIndia(r))
  if (others.length) {
    const countries = others.flatMap((r) => (r.countries ?? []).map((c) => c?.iso_2).filter(Boolean)) as string[]
    const otherTaxRegions = countries.length ? await taxModule.listTaxRegions({ country_code: countries }) : []
    if (otherTaxRegions.length) {
      await deleteTaxRegionsWorkflow(container).run({ input: { ids: otherTaxRegions.map((t) => t.id) } })
    }
    await deleteRegionsWorkflow(container).run({ input: { ids: others.map((r) => r.id) } })
    logger.info(`Deleted the regions other than India: ${others.map((r) => r.name).join(", ")}`)
  }

  // Its tax region, on the shop's tax provider, with the tax rate that carries the saree tax code.
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
