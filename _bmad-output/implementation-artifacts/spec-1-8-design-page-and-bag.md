---
title: 'Story 1.8: Shopper opens the Design and puts it in her Bag'
type: 'feature'
created: '2026-11-27'
status: 'in-review'
baseline_commit: '4f26e4ab33497689f2cc11111e3fdc2190c0ef8b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-parts/epic-1.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-saree-commerce-2026-11-27/DESIGN.md'
  - '{project-root}/docs/kernel-routes.md'
  - '{project-root}/docs/designs.md'
  - '{project-root}/docs/stock.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A published Design with stock exists only in the Admin; a Shopper cannot see it, learn what it is and what it costs, or put it in a Bag.

**Approach:** Add the one catalogue read `/store/shop/designs` (list of `DesignCard`, and one `DesignView`, with server-computed availability), signed preview links for unpublished Designs, the kernel cart routes the Bag needs on the allow-list (never completion), a `BagView` built on the server from kernel totals, `api-client` functions backed by the real kernel (alongside the existing mock used by the mobile shell), a seeded Rs 0 shipping option for India, and three website pages styled from DESIGN.md: home list, Design page, Bag.

## Boundaries & Constraints

**Always:** clients get data only through `api-client` view models (AD-2); amounts come from the server in paise and the client only formats them (`formatRupees`), never computes; shelf prices are shown as whole rupees with "Price includes all taxes"; availability (available / sold out) is computed on the server from stocked − reserved at the India location; a sold-out Design is shown with Add to bag disabled, not hidden; an unpublished Design is absent from the list and its page is not found, unless opened with a valid signed preview token, which expires (default 1 hour) and is checked on the server; attributes shown are fibre, weave, length and width in metres, blouse piece, care, country of origin — never a Weaver; the Shopper sees "Bag", never "cart"; quantity above available is refused with `bag.stock_exceeded` and the Bag keeps its earlier quantity; the Bag survives closing the browser (cart id in an httpOnly cookie); the Bag shows the shipping charge (Rs 0 from the seeded option) before checkout; each kernel cart route used is added to the allow-list in this story and cart completion stays never-allowed; the existing contract shapes in `packages/contracts/src/catalogue.ts` (`DesignCard`, `DesignView`, `BagView`) are reused and extended, not duplicated (Stories 1.28 and 2.15 extend `DesignCard` later).

**Never:** filters, search, delivery estimate, Full saree view or Try-on entry (Epic 2); checkout (Story 1.9); sign-in required to browse or use the Bag; the same Bag across devices (Epic 3).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Home | anonymous | published Designs as cards: photo, name, price "₹3,150" | N/A |
| Unpublished | open its page | not found | 404 `design.not_found` |
| Design page | published, stocked | photos, price + tax note, description, attributes, "In stock", Add to bag enabled | N/A |
| Sold out | stocked 0 (or all reserved) | shown, "Sold out", Add to bag disabled | N/A |
| Preview | Admin asks for preview of a draft | signed link opens the same page; after expiry → not found | invalid/expired token → 404 |
| Add / change / remove | available Design | Bag lines, line prices, total from the server; each via `api-client` | N/A |
| Too many | available 2, ask 3 | refused; quantity unchanged | `bag.stock_exceeded` |
| Return later | close browser, reopen | same Bag | N/A |
| Shipping | Bag page | "Delivery ₹0" shown before checkout | N/A |
| Completion | `POST /store/carts/:id/complete` | 403 | `route.not_allowed` |

</frozen-after-approval>

## Code Map

- `packages/contracts/src/catalogue.ts` -- extend: `DesignCard.handle`, `availability: "available" | "sold_out"`, make `mrp` optional (no MRP in this epic) or equal to price; `DesignView` adds `description`, `taxNote` handled by the client text; `BagView` lines carry server totals (`lineTotal`), and the four price lines (`totalMrp`, `discount`, `delivery`, `total`) plus `count`. Keep the mobile shell's mock compiling (update its fixtures).
- `apps/commerce/src/api/store/shop/designs/route.ts` (GET list) and `[handle]/route.ts` (GET one, `?preview=<token>`) (new) -- read published products linked to `design_attributes`, prices in INR, availability from inventory levels; return view models parsed by the contracts.
- `apps/commerce/src/api/admin/shop/designs/[id]/preview/route.ts` (new) -- POST returns `{ url, expiresAt }`; token = HMAC-SHA256 over `designId.expiry` with a dedicated secret from env (`PREVIEW_TOKEN_SECRET`, zod-checked, ≥ 32 chars) — add it to env schema and templates.
- `apps/commerce/src/api/store/shop/bag/**` (new shop routes) or kernel cart routes behind `api-client` -- choose the simpler: kernel store cart routes (`POST /store/carts`, `GET /store/carts/:id`, `POST /store/carts/:id/line-items`, `POST /store/carts/:id/line-items/:line_id`, `DELETE /store/carts/:id/line-items/:line_id`) on the allow-list, plus a shop route `GET /store/shop/bag/:cartId` that returns `BagView` with server totals; enforce the quantity cap against availability (the kernel checks inventory; map its error to `bag.stock_exceeded`).
- seed (migration script) -- India fulfilment set / service zone / one shipping option "Standard delivery" at Rs 0 in INR, linked to the India stock location and default shipping profile (idempotent). Add needed shipping-option route `GET /store/shipping-options` to the allow-list only if the Bag reads it.
- `packages/api-client/src/catalogue.ts` -- add a kernel-backed source (`catalogueSource: "kernel"` default for web) implementing `listDesigns`, `getDesign(handle, { preview })`, and Bag functions (`getBag`, `addToBag(variantId, qty)`, `setBagQuantity(lineId, qty)`, `removeFromBag(lineId)`) with a cart-id store like the token store; the `kernel-paths` test must still pass.
- `apps/web/src/app/page.tsx` (home list), `designs/[handle]/page.tsx`, `bag/page.tsx`, server actions for Bag changes, cart-id cookie; DESIGN.md styling (lavender, compact sizes, no shadows; product photos on `photo-ground`); translation keys in `messages/en.json`.
- Admin Design editor -- a "Preview" button that opens the signed link.
- `docs/catalogue-and-bag.md` (new).

## Tasks & Acceptance

**Execution:**
- [x] contracts and fixtures; api-client kernel source with mocked-fetch tests for every Bag call and error mapping
- [x] store routes, preview route and token helper (unit-tested: valid, expired, tampered), shipping seed
- [x] allow-list additions (only the cart routes used) with contract tests still guarding completion
- [x] website pages and actions
- [x] integration tests for the store routes (published only, availability incl. reserved, preview valid/expired, quantity cap, Bag totals equal the money functions)
- [x] web e2e `e2e/bag.spec.ts`: home shows a published Design, page shows price and attributes, add → change → remove, too-many refused, reopen keeps the Bag, sold-out disabled; screenshots of home, Design page and Bag at 390 and 1440 wide into `docs/screenshots/`
- [x] docs

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, the commerce integration tests, the admin smoke and the web e2e run, then all pass and the name check passes.

## Implementation Notes

- `mrp` stays required on `DesignCard`/`BagLine`; the kernel sends it equal to `price` (no MRP in Epic 1), so the mobile shell needed no change beyond one translation key.
- `DesignView` gained `description` (default ""), typed `details` (labels and wording come from the client's translation file) and `preview.expiresAt`; the kernel sends `attributes: []`. `DesignCard` gained `handle` and `availability`; `BagLine` gained `handle` and `lineTotal`. New error code `bag.not_found`; new setting `shipping.standard_option_id`.
- The kernel source lives in `packages/api-client/src/kernel-catalogue.ts` (imported by `catalogue.ts`); `catalogueSource` defaults to `kernel`, the app shell keeps `mock`. Cart calls are anonymous; the cart id is in `bagStore` (web: httpOnly cookie `shop_bag`, 30 days).
- The Bag's delivery is read from the seeded option's price (id in the setting), not by adding a shipping method; no shipping address is set on the cart (taxes are computed at checkout, Story 1.9).
- `STOREFRONT_URL` (optional, defaults to the first exact `STORE_CORS` origin) was added next to `PREVIEW_TOKEN_SECRET` so the preview link can name the website.
- A Design without a price or photo is never shown, also not in preview; the Admin's Preview button is disabled until it has both.
- Verification ran the website from a copy of `apps/web` built with `next build` on port 8002 (and `next dev` on 8001), because stopping the old server on :8000 was not permitted in this session; :8000 still serves the old build.

## Spec Change Log

## Review Triage Log

## Design Notes

The e2e needs a published, stocked Design: create it in a Playwright setup through the admin shop routes (session + Origin header), using the sample photos in `apps/mobile/public/mock/`. Session: Node 24 at `/opt/node24/bin`; host PostgreSQL 5432, Redis 6379, Floci on 4566 (compose stack) for photos; kernel on :9000 (`medusa develop`); website on :8000 serves the old build — stop it (`fuser -k 8000/tcp`) before building apps/web and start it again after. Admin `owner-e2e@example.test` exists. Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration` -- expected: all pass
- `ADMIN_E2E_BASE_URL=http://localhost:9000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/commerce exec playwright test --trace off` -- expected: pass
- with kernel and web running: `E2E_BASE_URL=http://localhost:8000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/web exec playwright test --trace off` -- expected: all pass
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
