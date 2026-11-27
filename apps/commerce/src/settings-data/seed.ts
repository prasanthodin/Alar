/**
 * Seeded shop settings (Story 1.5). This directory is settings data and the
 * only place under apps/ and packages/ where the product name may appear
 * (the name check's allow-list). Code reads the name from the `shop.name`
 * setting, never from here.
 *
 * Applied once by `src/migration-scripts/shop-settings-seed.ts` during
 * `medusa db:migrate`. A key that already has a value is left alone, so later
 * changes are dated settings, not edits here.
 */
export const SHOP_SETTINGS_SEED = {
  /** Seeded values are in effect from the start of the 2026–27 financial year: 1 April 2026, 00:00 in Asia/Kolkata. */
  effectiveFrom: "2026-03-31T18:30:00.000Z",
  /** `shop.name` when the STORE_NAME environment variable is not set. */
  defaultShopName: "Alar",
  /** `shop.time_zone`: the business time zone for day boundaries. */
  timeZone: "Asia/Kolkata",
  /**
   * `tax.bands.<taxCode>`: the PRD's working assumption, 5% for sarees at any
   * per-piece taxable value.
   */
  taxBands: {
    saree: [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 }],
  },
  /** The kernel's region for India: rupees, tax-inclusive prices, the shop's tax provider. */
  region: {
    name: "India",
    currencyCode: "inr",
    countryCode: "in",
    /** The kernel tax rate that carries the tax code. Its `rate` stays empty: the bands above are the rate. */
    defaultTaxRate: { name: "Saree", code: "saree" },
  },
} as const
