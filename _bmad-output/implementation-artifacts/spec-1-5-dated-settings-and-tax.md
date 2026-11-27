---
title: 'Story 1.5: Shop settings with dates, and one tax calculation'
type: 'feature'
created: '2026-11-27'
status: 'in-progress'
baseline_commit: '24dc4153f91abaeef283057d13ae1107b7dfaa64'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-parts/epic-1.md'
  - '{project-root}/docs/kernel-routes.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The shop's name, time zone and tax rates do not exist as data, so a rename or a change in a tax answer would need code changes, and nothing guarantees every total is computed the same way to the paisa (AD-5, AD-13, AD-20).

**Approach:** Add a `settings` module in commerce holding dated values per key (validated by zod schemas in `packages/contracts`), integer-paise money functions in `packages/contracts` that derive tax backwards from a tax-inclusive price using dated value bands, the shop's own kernel tax provider that calls those functions, a seed (shop name, business time zone `Asia/Kolkata`, saree tax bands at 5%, one India region in rupees), and a public shop route read through `packages/api-client` so the website header shows the name from settings.

## Boundaries & Constraints

**Always:** a setting read returns the value whose effective date is the latest not after the time asked for; every key has a zod schema in contracts and values are validated on write and read; amounts are integer paise and rates are integer basis points (no floats in money code); a shelf price must be a multiple of 100 paise; taxable value = floor(price × 10000 / (10000 + rateBp)) and tax = price − taxable, so taxable + tax = price exactly and the remainder sits in the tax line; a band is `{ minTaxablePaise, maxTaxablePaise | null, rateBp }` over per-piece taxable value after discount and before tax, and band lookup handles the gap case (no band) by failing with a stable error code `tax.no_band` and returning no total; day boundaries use the business time zone; the shop name reaches the website only through `api-client`; the product name appears only in the allow-listed settings-data path.

**Never:** tax computed anywhere but the money functions (the kernel provider calls them); discounts or stitched-item threshold logic (Epic 2) beyond the band shape allowing them; an admin page to edit settings (Epic 3); a kernel route added to the allow-list that this story does not call.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Exact split | price 210000 paise, 500 bp | taxable 200000, tax 10000 | N/A |
| Remainder | price 165000, 500 bp | taxable 157142, tax 7858, sum 165000 | N/A |
| Bad shelf price | 165050 paise | rejected | `money.invalid_shelf_price` |
| Dated rate | band 5% today, 12% effective from tomorrow 00:00 Asia/Kolkata | before midnight 5%, after midnight 12% (same call, two times) | N/A |
| No band | tax code with no band at that time | no total | `tax.no_band` |
| Setting read | key with values dated D1 < D2 ≤ now < D3 | value of D2 | N/A |
| Invalid value | write that fails the key's schema | refused, nothing stored | `settings.invalid_value` |
| Kernel totals | cart with one line in the India region | kernel tax lines equal the money functions for that price | if the kernel's own arithmetic cannot match to the paisa, stop and report with examples |
| Website header | any page | name from settings via api-client | falls back to translation text if the call fails |

</frozen-after-approval>

## Code Map

- `packages/contracts/src/money.ts` (exists, from the mobile shell: `Paise`, `ShelfPrice`, `formatRupees`, `percentOff`) -- add `RateBp`, `TaxBand`, `TaxBands`, `splitInclusivePrice(pricePaise, rateBp)`, `findBand(bands, taxablePaise)`, `taxForShelfPrice(pricePaise, bands)` (iterate bands: for each candidate rate compute taxable and accept the band whose range contains that taxable value; none → `tax.no_band`). Error codes `money.invalid_shelf_price`, `tax.no_band`, `settings.invalid_value`, `settings.not_found` into `ErrorCode` with text in `apps/web/messages/en.json` and `apps/mobile/messages/en.json` (Story 1.2's completeness check).
- `packages/contracts/src/settings.ts` (new) -- key registry: `shop.name` (string 1–80), `shop.time_zone` (IANA string), `tax.bands.<taxCode>` (`TaxBands`); `SettingValue` = `{ key, value, effectiveFrom: IsoDateTime }`; `ShopPublicView` = `{ name }`.
- `apps/commerce/src/modules/settings/` (new) -- data model `setting_value(id, key, value jsonb, effective_from timestamptz, created_at)`, unique `(key, effective_from)`; service `getValue(key, at = now)`, `setValue(key, value, effectiveFrom)` validating through the contract registry; migration generated with the kernel's tooling. Register in `medusa-config.ts`.
- `apps/commerce/src/providers/tax/` (new) -- kernel tax provider module (read the installed 2.23.1 tax module AGENTS.md / `ITaxProvider`); reads the bands for the line's tax code at the cart's time from the settings module and returns lines from the money functions. Register as the provider for the India tax region.
- `apps/commerce/src/settings-data/seed.ts` (allow-listed path) + a migration script that seeds `shop.name` from `STORE_NAME` env with the product name only in this file as the default, `shop.time_zone = Asia/Kolkata`, `tax.bands.saree = [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 }]`, and the India region (INR, tax-inclusive prices, the shop tax provider). Seeding is idempotent.
- `apps/commerce/src/api/store/shop/settings/route.ts` (new shop route, outside the allow-list) -- `GET` returns `ShopPublicView`.
- `packages/api-client` -- `getShopPublic()` returning `Result<ShopPublicView>`; tests with mocked fetch.
- `apps/web` -- header and metadata read the name via `getShopPublic()` (server side), falling back to the configured/translation name; `NEXT_PUBLIC_STORE_NAME` remains only as that fallback.

## Tasks & Acceptance

**Execution:**
- [ ] contracts money + settings with vitest tests for every money and band row (including property-style checks that taxable + tax = price for every price 100..1,000,000 rupees step 50 at 500 bp and 1200 bp)
- [ ] settings module, migration, service tests (vitest for pure parts; integration test for read-by-date and invalid write)
- [ ] tax provider and India region seed; integration test: create a cart with one variant priced at 2100, 3150 and 1650 rupees, compare kernel tax lines/totals with the money functions; dated-rate test using a band effective tomorrow
- [ ] shop route, api-client function, website header
- [ ] `docs/settings-and-tax.md` -- keys, how dates work, the rounding rule

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, the commerce integration tests and the web e2e run, then all pass and the name check passes.
- Given the seeded local database, when the website loads, then the header shows the name from settings.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

The kernel stores amounts in major units (rupees) as decimals while contracts use paise; convert at the provider boundary and never let floats into the money functions. Medusa may compute line tax amounts itself from a returned rate; check whether a tax-inclusive line's amount can be made to equal the money functions (for example by returning the exact rate and verifying the kernel's rounding, or by the provider's own line amounts if the interface allows). That is the "stop and report" row. The settings-data path is already on the name-check allow-list (`apps/commerce/src/settings-data/`). Session: Node 24 at `/opt/node24/bin`; host PostgreSQL 5432, Redis 6379; a kernel runs on :9000 and the website on :8000 (restart them yourself after your changes; do not run `pnpm build` in apps/web while it serves). Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration` -- expected: all pass
- with kernel and web running: `E2E_BASE_URL=http://localhost:8000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/web exec playwright test --trace off` -- expected: all pass
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
