# Shop settings and tax

The shop's name, business time zone and tax rates are data, not code (AD-13, AD-20), and every tax amount comes from one set of money functions (AD-5). Story 1.5.

## Where things live

| Part | Location |
| --- | --- |
| Setting keys and their zod schemas, business-day helpers, `ShopPublicView` | `packages/contracts/src/settings.ts` |
| Money functions (`splitInclusivePrice`, `findBand`, `taxForShelfPrice`), `RateBp`, `TaxBand`, `TaxBands` | `packages/contracts/src/money.ts` |
| Settings module (table `setting_value`, `getValue`, `setValue`) | `apps/commerce/src/modules/settings/` (module key `shopSettings`) |
| The shop's tax provider (`tp_shop_shop`) | `apps/commerce/src/providers/tax/` |
| Seed data (the only place the product name may appear) | `apps/commerce/src/settings-data/seed.ts` |
| Seeding, run once by `medusa db:migrate` | `apps/commerce/src/migration-scripts/shop-settings-seed.ts` |
| Public shop route | `GET /store/shop/settings` → `ShopPublicView` (`{ name }`), `Cache-Control: public, max-age=60` |
| Client call | `getShopPublic()` in `packages/api-client`; the website caches the name for 60 seconds (`apps/web/src/lib/shop.ts`) |

The module key is `shopSettings`, not `settings`: `settings` is the kernel's own module for admin layouts and preferences.

## Keys

| Key | Value | Seeded |
| --- | --- | --- |
| `shop.name` | string, 1–80 characters (trimmed) | `STORE_NAME` if set, else the default in `settings-data/seed.ts` |
| `shop.time_zone` | IANA time zone name | `Asia/Kolkata` |
| `tax.bands.<taxCode>` | `TaxBands` (see below); `<taxCode>` is lower-case letters, digits, `_`, `-`, at most 40 characters | `tax.bands.saree` = `[{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 }]` |

Every value is checked against its key's schema when written (`setValue`) and again when read (`getValue`). A refused write stores nothing and fails with `settings.invalid_value`; so does an unknown key. A read with no value in effect fails with `settings.not_found`. A stored value that fails its schema on read is a fault on the shop's side: it is logged with its key and fails as an unexpected state (HTTP 500, code `internal`). Later stories add their own keys (Hold length, return period, seller details) to `SETTING_SCHEMAS` when they first need them. Editing settings in the Admin is Epic 3 (FR-56); changing a tax rate there is Epic 2 (FR-37).

## How dates work

- Each value has an `effective_from` instant (stored as `timestamptz`, unique per key). Times are a `Date` or a full UTC ISO 8601 string (`2026-11-28T18:30:00.000Z`); a date-only or offset string is refused (`settings.invalid_value`), so a date is never silently read as UTC midnight.
- A read at time T returns the value whose `effective_from` is the latest not after T. With values dated D1 < D2 ≤ T < D3, a read at T returns D2's value; D3's takes over at D3 with no release.
- A change takes effect now or later: `effective_from` earlier than now is refused with `settings.past_effective_from`, so a value that already applied is never rewritten (AD-13). Only the initial seed passes `allowPast` for its fixed seed instant.
- A second write for the same key and the same (future) instant replaces that row's value; two such writes racing on the unique index end with the later value, not a database error.
- Day boundaries are midnights in the business time zone (`shop.time_zone`). "From tomorrow" means `startOfNextBusinessDay(now, timeZone)`: for Asia/Kolkata, 18:30 UTC. `startOfBusinessDay("2026-11-28", "Asia/Kolkata")` is `2026-11-27T18:30:00.000Z`. The settings service's `startOfBusinessDay(date)` uses the time zone in effect.
- The seeded values are in effect from 1 April 2026, 00:00 Asia/Kolkata (the start of the 2026–27 financial year).
- The seed only writes a key that has no value at all, so `STORE_NAME` only names the shop on the first migration; a later rename is a dated `shop.name` value.

## What the seed does to the kernel

Each step changes only what differs, so the seed is idempotent:

- The kernel store is named from `shop.name` (at seed time), and rupees are its default currency, with tax-inclusive prices. Other currencies stay, not default.
- India is the one region: rupees, tax-inclusive prices, automatic taxes, and the starter's store-policy metadata (`DEFAULT_REGION_STORE_POLICIES`, added where missing). Every other region (the starter's Europe) is deleted, with the tax regions of its countries.
- India's tax region uses the shop's provider, with a default tax rate of code `saree` and an empty `rate`.
- The starter's demo products are left as they are.

## Tax bands

A band is `{ minTaxablePaise, maxTaxablePaise | null, rateBp }`: a range of **per-piece taxable value, after discount and before tax**, both ends inclusive (`null` = no upper limit), and its rate in basis points (500 = 5%). The bands of a tax code are in ascending order and do not overlap; gaps are allowed.

The shape can hold the value-threshold bands of stitched items (Epic 2), but a threshold pair leaves a gap in tax-inclusive prices. With 5% up to Rs 2,500 taxable and 18% above (`[{0, 250000, 500}, {250001, null, 1800}]`), shelf prices from about Rs 2,626 to Rs 2,950 fit neither band: at 5% their taxable value is above Rs 2,500, at 18% it is at or below Rs 2,500. For those prices `taxForShelfPrice` returns `tax.no_band` and no total. Under AD-5, `publish-design` refuses such prices (Epic 2), so no Design is sold at a price without a band.

`taxForShelfPrice(price, bands)` tries each band in order: it works out the taxable value at that band's rate and uses the first band whose range contains it. If none does (no bands, or a price whose taxable value falls in a gap at every rate) it fails with `tax.no_band` and returns no total. Discounts are not applied yet (Epic 2).

## The rounding rule

All amounts are integer paise, rates integer basis points; no floats in the money arithmetic.

- A shelf price is tax-inclusive and a whole number of rupees (a multiple of 100 paise); anything else fails with `money.invalid_shelf_price`.
- taxable = floor(price × 10000 / (10000 + rateBp)); tax = price − taxable.
- So taxable + tax = price exactly, and the rounding remainder is in the tax line.
- Examples at 5%: Rs 2,100 → 200000 + 10000; Rs 1,650 → 157142 + 7858. At 12%: Rs 1,650 → 147321 + 17679.

## The kernel's tax provider

The India tax region uses the shop's provider `tp_shop_shop`; it is the only tax code in the kernel. The region's prices are tax-inclusive (a price preference on the region and on rupees).

For each cart line the provider:

1. takes the tax code from the kernel tax rate on the line (`code`; the seeded default rate of the India tax region has code `saree` and an empty `rate`, because the bands are the rate),
2. reads `tax.bands.<code>` in effect now (one time for the whole calculation),
3. converts the unit price from rupees to paise exactly and calls `taxForShelfPrice`,
4. returns a tax line with the exact per-piece amounts in `data` (`taxCode`, `rateBp`, `pricePaise`, `taxablePaise`, `taxPaise`, `quantity`, `at`).

The cart operation fails, and nothing is written, when the provider cannot tax a line exactly:

| Code | When |
| --- | --- |
| `tax.no_band` | the line has no single tax code, its code has no bands in effect, or no band fits the price |
| `money.invalid_shelf_price` | the unit price is not a whole number of rupees |
| `tax.discount_unsupported` | the cart or order line has a discount (a promotion adjustment); discounted tax arrives in Epic 2 |
| `tax.shipping_unsupported` | a shipping method has a price; free shipping (Rs 0 at launch) gets no tax line |
| `tax.kernel_mismatch` | no rate the kernel can store reproduces the line's split to the paisa (see below) |

The kernel does not pass line adjustments to tax providers, so the provider reads them from the cart and order modules (`dependencies` in medusa-config).

### Why the rate on the kernel's tax line is not exactly 5

The kernel computes a line's amounts itself from the rate the provider returns: subtotal = price / (1 + rate/100), tax = subtotal × rate/100, in unrounded decimals. At the nominal 5% that gives Rs 1,650 → 1571.428571… / 78.571428…, which is 157143 / 7857 paise to the paisa, not the money functions' 157142 / 7858. So the provider returns, per line, the rate at which the kernel's own arithmetic lands on the money functions' split (tax / taxable × 100, e.g. 5.0005727 for Rs 1,650). The kernel's totals then equal the money functions to the paisa (its raw decimals are within a hundredth of a paisa).

The cart stores a tax line's rate as a PostgreSQL `real` (single precision). The provider searches the single-precision values near the ideal rate and keeps one that still reproduces the split after storage. That covers one piece at 5% and 12% at every whole-rupee price up to Rs 10,00,000 (unit-tested in steps of Rs 50) and everyday prices at several pieces. For a very large line (for example 10 pieces at Rs 9,99,950 at 18%) no storable rate is precise enough, and the provider refuses the line with `tax.kernel_mismatch` rather than let the kernel's split drift. The exact per-piece amounts are always in the tax line's `data`; invoices (Story 1.13) take tax from the money functions or that `data`, never from the kernel's rate.
