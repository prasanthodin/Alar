# Shop settings and tax

The shop's name, business time zone and tax rates are data, not code (AD-13, AD-20), and every tax amount comes from one set of money functions (AD-5). Story 1.5.

## Where things live

| Part | Location |
| --- | --- |
| Setting keys and their zod schemas, `pickEffective`, business-day helpers, `ShopPublicView` | `packages/contracts/src/settings.ts` |
| Money functions (`splitInclusivePrice`, `findBand`, `taxForShelfPrice`), `RateBp`, `TaxBand`, `TaxBands` | `packages/contracts/src/money.ts` |
| Settings module (table `setting_value`, `getValue`, `setValue`) | `apps/commerce/src/modules/settings/` (module key `shopSettings`) |
| The shop's tax provider (`tp_shop_shop`) | `apps/commerce/src/providers/tax/` |
| Seed data (the only place the product name may appear) | `apps/commerce/src/settings-data/seed.ts` |
| Seeding, run once by `medusa db:migrate` | `apps/commerce/src/migration-scripts/shop-settings-seed.ts` |
| Public shop route | `GET /store/shop/settings` → `ShopPublicView` (`{ name }`) |
| Client call | `getShopPublic()` in `packages/api-client` |

The module key is `shopSettings`, not `settings`: `settings` is the kernel's own module for admin layouts and preferences.

## Keys

| Key | Value | Seeded |
| --- | --- | --- |
| `shop.name` | string, 1–80 characters (trimmed) | `STORE_NAME` if set, else the default in `settings-data/seed.ts` |
| `shop.time_zone` | IANA time zone name | `Asia/Kolkata` |
| `tax.bands.<taxCode>` | `TaxBands` (see below); `<taxCode>` is lower-case letters, digits, `_`, `-`, at most 40 characters | `tax.bands.saree` = `[{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 }]` |

Every value is checked against its key's schema when written (`setValue`) and again when read (`getValue`). A refused write stores nothing and fails with `settings.invalid_value`; so does an unknown key. A read with no value in effect fails with `settings.not_found`. Later stories add their own keys (Hold length, return period, seller details) to `SETTING_SCHEMAS` when they first need them. Editing settings in the Admin is Epic 3 (FR-56); changing a tax rate there is Epic 2 (FR-37).

## How dates work

- Each value has an `effective_from` instant (stored as `timestamptz`, unique per key).
- A read at time T returns the value whose `effective_from` is the latest not after T. With values dated D1 < D2 ≤ now < D3, a read now returns D2's value; D3's takes over at D3 with no release.
- A second write for the same key and the same instant replaces that row's value.
- Day boundaries are midnights in the business time zone (`shop.time_zone`). "From tomorrow" means `startOfNextBusinessDay(now, timeZone)`: for Asia/Kolkata, 18:30 UTC. `startOfBusinessDay("2026-11-28", "Asia/Kolkata")` is `2026-11-27T18:30:00.000Z`. The settings service's `startOfBusinessDay(date)` uses the time zone in effect.
- The seeded values are in effect from 1 April 2026, 00:00 Asia/Kolkata (the start of the 2026–27 financial year).
- The seed only writes a key that has no value at all, and only creates the India region and tax region when they do not exist, so it is idempotent. `STORE_NAME` therefore only names the shop on the first migration; a later rename is a dated `shop.name` value.

## Tax bands

A band is `{ minTaxablePaise, maxTaxablePaise | null, rateBp }`: a range of **per-piece taxable value, after discount and before tax**, both ends inclusive (`null` = no upper limit), and its rate in basis points (500 = 5%). The bands of a tax code are in ascending order and do not overlap; gaps are allowed. This shape already allows the value-threshold bands of stitched items (Epic 2), for example `[{0, 250000, 500}, {250001, null, 1800}]`.

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
4. returns a tax line with the exact per-piece amounts in `data` (`taxCode`, `rateBp`, `pricePaise`, `taxablePaise`, `taxPaise`, `quantity`, `kernelRateExact`, `at`).

A missing tax code, missing bands or no fitting band fails the cart operation with `tax.no_band`; nothing is written. Shipping lines get no tax line (delivery is Rs 0 at launch).

### Why the rate on the kernel's tax line is not exactly 5

The kernel computes a line's amounts itself from the rate the provider returns: subtotal = price / (1 + rate/100), tax = subtotal × rate/100, in unrounded decimals. At the nominal 5% that gives Rs 1,650 → 1571.428571… / 78.571428…, which is 157143 / 7857 paise to the paisa, not the money functions' 157142 / 7858. So the provider returns, per line, the rate at which the kernel's own arithmetic lands on the money functions' split (tax / taxable × 100, e.g. 5.0005727 for Rs 1,650). The kernel's totals then equal the money functions to the paisa (its raw decimals are within a hundredth of a paisa).

The cart stores a tax line's rate as a PostgreSQL `real` (single precision). The provider searches the single-precision values near the ideal rate and keeps one that still reproduces the split after storage. That covers one piece at 5% and 12% at every whole-rupee price up to Rs 10,00,000 (unit-tested in steps of Rs 50) and everyday prices at several pieces. For a very large line (for example 10 pieces at Rs 9,99,950 at 18%) no storable rate is precise enough: the provider then logs a warning, sets `kernelRateExact: false`, and the kernel's subtotal/tax split may be off by a paisa or more. The line total is unaffected, and the exact amounts are always in the tax line's `data`. Invoices (Story 1.13) should take tax from the money functions or that `data`, not from the kernel's rate.
