---
title: 'Early mobile app shell on mocked catalogue data'
type: 'feature'
created: '2026-11-27'
status: 'in-progress'
baseline_commit: '19581d77bbdbadce98ec71a25df82b2eb4844107'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-saree-commerce-2026-11-27/DESIGN.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-saree-commerce-2026-11-27/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The founder has no phone build yet and wants to see the Android app running now, with mocked data, before the real catalogue and a test phone exist (2026-11-27).

**Approach:** Create `apps/mobile` (Expo 58.1.0, React Native 0.88.1, expo-router) with the approved screens — Home, Categories, Category listing, Product page, Bag, and a Try-on tab placeholder — reading only through `@shop/api-client`, which gains catalogue and bag functions backed by an in-package mock that returns contract view models. Run it on the web target in the cloud and save phone-size screenshots.

## Boundaries & Constraints

**Always:** visuals from DESIGN.md through `@shop/tokens` (lavender, Plus Jakarta Sans + Inter, compact sizes, no shadows, glass only on the floating bottom navigation and bottom action bar, product photos on `photo-ground`); layout follows the boards named in EXPERIENCE.md (`Main`, `Categories`, `Listing`, `Product`, `Bag`); money is integer paise, shown as whole rupees with Indian grouping; the store name is configuration (`EXPO_PUBLIC_STORE_NAME`, fallback from the app's translation file); shopper text lives in a translation file; "Bag" never "Cart"; weavers never shown; Home tabs show All, Silk, Cotton, Wedding; the AD-2 import rule applies to `apps/mobile`.

**Never:** call the kernel from `apps/mobile` or import `@medusajs/*` there; present mock product photos as real (a small "Sample" note in the Product page footer); add checkout, payment, sign-in or real try-on; change Story 1.2 behaviour of existing api-client functions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Home loads | app opens | address bar, search with wordmark, tabs, two rows of category thumbnails, one banner, service strip, 2-column product grid, floating glass nav with Home active | N/A |
| Open category | tap "Silk" | listing of silk designs, floating Sort/Filter bar | N/A |
| Open product | tap a card | gallery, price with struck MRP and % off, colour thumbnails, Full saree / Try it on / Share tiles, Buy now / Add to bag bar | N/A |
| Unknown design | `getDesign('nope')` | `{ ok:false, error.code:'design.not_found' }` | screen shows not-found state |
| Add to bag | tap Add to bag | mock bag count increases, Bag tab shows the item and four price lines | N/A |
| Low stock | variant with stock ≤ 3 | "Only N left" | N/A |

</frozen-after-approval>

## Code Map

- `packages/contracts/src/money.ts` (new) -- `Paise` (non-negative integer, multiple of 100 for shelf prices), `formatRupees(paise)` → "₹3,150" / "₹1,12,300" (en-IN grouping, no decimals), `percentOff(mrp, price)` (floor).
- `packages/contracts/src/catalogue.ts` (new) -- `ImageRef` (`url`, `alt`, `isSample: boolean`), `CategoryView` (`id`, `name`, `thumbnail`), `DesignCard` (`id`, `name`, `subtitle`, `price`, `mrp`, `image`, `badge?`, `rating?` {value, count}), `DesignView` (card fields + `images[]`, `variants[]` {id, colourName, swatch: ImageRef, stock}, `attributes[]` {label, value}, `fullView?` ImageRef), `BagView` (`lines[]`, `totalMrp`, `discount`, `delivery`, `total`, `count`); add `design.not_found` to `ErrorCode` and its text to `apps/web/messages/en.json` (Story 1.2's completeness check requires it).
- `packages/api-client/src/catalogue.ts` + `src/mock/catalogue-data.ts` (new) -- `listCategories`, `listDesigns({ categoryId? })`, `getDesign(id)`, `getBag`, `addToBag(variantId)`; selected by a new optional config field `catalogueSource: 'mock'` (only value for now; the real kernel source arrives with Epic 2). Mock image URLs are `${mockAssetBaseUrl}/<file>.jpg`, `isSample: true`. Eight sarees and categories from the boards; prices from the boards (Arani ₹3,150, MRP ₹3,600 …). The bag lives in memory per client.
- `_bmad-output/planning-artifacts/ux-designs/ux-saree-commerce-2026-11-27/.working/design-canvas/assets/*.jpg` -- copy the jpgs (not the mp4) to `apps/mobile/public/mock/`; they are AI-made placeholders.
- `apps/web` -- untouched apart from the one en.json line.

## Tasks & Acceptance

**Execution:**
- [ ] `packages/contracts` -- money and catalogue schemas plus vitest tests (grouping, zero, lakh values, non-integer rejected, percentOff floor)
- [ ] `packages/api-client` -- catalogue functions and mock; vitest tests for every matrix row that is data-level (unknown design, add to bag totals, low stock value)
- [ ] `apps/mobile` -- Expo app (`@shop/mobile`): `app.config.ts` (name and slug from env with neutral defaults, Android package id from env), expo-router tabs `(tabs)/{index,categories,try-on,bag}` plus `category/[id]` and `design/[id]`, components for top bar, search, category rail, banner, product card, glass nav (`expo-blur`), action bar; fonts via `@expo-google-fonts/plus-jakarta-sans` and `@expo-google-fonts/inter`; `messages/en.json`; scripts `dev`, `web`, `export:web`, `lint`, `typecheck`, `test`
- [ ] `apps/mobile/eslint.config.mjs` -- the AD-2 `no-restricted-imports` rule for `@medusajs/*`
- [ ] `scripts/mobile-screenshots.mjs` -- serve `apps/mobile/dist` and capture Home, Categories, Listing (Silk), Product, Bag (after one add) with Playwright at 390×844, deviceScaleFactor 2, into `docs/screenshots/mobile-*.png`
- [ ] `docs/mobile.md` -- how to run on the web target and on an Android phone with Expo Go, and that photos are samples

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test` run, then all pass including `@shop/mobile`, and `pnpm build` still passes.
- Given `pnpm --filter @shop/mobile export:web` and the screenshot script, when run, then five screenshots exist and match the matrix rows when viewed.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Plain React Native `StyleSheet` with values from `@shop/tokens` (no extra styling library yet). Pin every Expo package to the versions `npx expo install` chooses for SDK 58. pnpm and Metro: set `node-linker=hoisted` only for this app if Metro cannot resolve workspace packages; prefer Expo's documented monorepo setup. Playwright's own browser cannot be downloaded here: use `/usr/bin/google-chrome` or `chromium.launch()` as the environment allows. Run the export with `EXPO_PUBLIC_STORE_NAME=alar` for screenshots only (the name check forbids it in code). Session: Node 24 at `/opt/node24/bin`. Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- `EXPO_PUBLIC_STORE_NAME=alar pnpm --filter @shop/mobile export:web && node scripts/mobile-screenshots.mjs` -- expected: five PNGs in `docs/screenshots/`
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
