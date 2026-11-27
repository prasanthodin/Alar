---
title: 'Story 1.6: Owner creates and publishes one Design'
type: 'feature'
created: '2026-11-27'
status: 'in-progress'
baseline_commit: '6080993140e6d0d81edc2c8537f5d88bb53e5114'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-parts/epic-1.md'
  - '{project-root}/docs/kernel-routes.md'
  - '{project-root}/docs/settings-and-tax.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no way to put a saree into the shop: the kernel's own product writes are refused (Story 1.4), and a Design's attributes, price history and publish rules do not exist.

**Approach:** Add a `design-attributes` module (typed fields linked to the kernel product, schema in `packages/contracts`), a `price-history` module, shop admin routes under `/admin/shop/designs` and `/admin/shop/uploads` that only validate and start named workflows (`create-design`, `update-design`, `set-design-price`, `publish-design`), and an Admin "Designs" page (admin UI route in the kernel dashboard) where the Owner creates a Design, uploads photos to the `catalog` bucket, marks the fabric close-up, sets one Variant's whole-rupee price, and publishes after confirming the photos show the true colour.

## Boundaries & Constraints

**Always:** every state change is a workflow with compensation (AD-4); a Design has exactly one Variant and one INR price in this epic; prices enter as whole rupees and are stored in the kernel in major units, validated through the contract money functions (`ShelfPrice`, multiple of 100 paise); every price set or change writes one price-history row `{ variantId, oldPricePaise | null, newPricePaise, changedAt, changedBy }`; attributes are typed columns, never kernel `metadata`; attribute names stay category-neutral (`fibre`, `weave`, `lengthM`, `widthM`, `blousePieceIncluded`, `care`, `countryOfOrigin`, `taxCode`, `stitched`) so later categories can reuse them (NFR-17); `taxCode` must exist in settings as `tax.bands.<code>`; a new Design is saved unpublished (kernel status `draft`); `publish-design` is the only way to publish and refuses unless fibre, length and width, a tax code with a band now, a valid shelf price, a fabric close-up photo, at least one other photo, and the Owner's true-colour confirmation are present — it names every missing item; the confirmation is stored with time and admin user id; photos go through the kernel file module into `catalog` and are referenced by the Design in order; shop admin routes accept only an admin session.

**Never:** a kernel route added to the allow-list (the shop routes replace product writes); kernel product status changed outside `publish-design`; weaver fields (Epic 2); stock (Story 1.7); the Shopper's Design page (Story 1.8).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Create | complete form, price Rs 3,150 | Design saved unpublished; one price-history row (old null, new 315000) | N/A |
| Bad price | Rs 3,150.50 or 0 | refused, nothing created | `money.invalid_shelf_price` |
| Unknown tax code | `taxCode: "shirt"` with no bands | refused on save | `design.unknown_tax_code` |
| Price change | 3,150 → 2,950 | one new history row (315000 → 295000) | N/A |
| Publish complete | all required items + confirmation | kernel status `published`; confirmation stored with time and user | N/A |
| Publish incomplete | e.g. no close-up and no confirmation | refused; stays draft; response lists `missing: ["fabricCloseUpPhoto","trueColourConfirmation"]`; page shows each | `design.not_publishable` |
| Kernel status route | `POST /admin/products/:id` with `status: published` | 403 `route.not_allowed` | Story 1.4 guard |
| Upload | JPEG/PNG/WebP ≤ 10 MB | stored in `catalog`, returns file id and public URL | other types or larger → `upload.invalid_file` |
| Shopper token | on `/admin/shop/designs` | refused | 401 |

</frozen-after-approval>

## Code Map

- `packages/contracts/src/design.ts` (new) -- `DesignAttributesInput`, `DesignPhoto` (`fileId`, `url`, `role: "close_up" | "other"`, `position`), `CreateDesignInput` (name, description, attributes, photos, priceRupees integer), `UpdateDesignInput`, `PublishDesignResult` (`missing: PublishRequirement[]`), `AdminDesignView`; error codes `design.unknown_tax_code`, `design.not_publishable`, `design.not_found`(exists), `upload.invalid_file` with text in both message files.
- `apps/commerce/src/modules/design-attributes/` (new) -- model `design_attributes` with the typed fields, `photos` (ordered rows or jsonb validated by the contract), `true_colour_confirmed_at`, `true_colour_confirmed_by`; module link to the kernel product (`src/links/`).
- `apps/commerce/src/modules/price-history/` (new) -- model `price_history` per the Always rule; service only called from workflow steps.
- `apps/commerce/src/workflows/{create-design,update-design,set-design-price,publish-design}.ts` (new) -- use core flows (`createProductsWorkflow`, `updateProductVariantsWorkflow` / price-set steps, `updateProductsWorkflow` for status) inside shop workflows; publish checks requirements with a pure function `publishRequirements(view, bands, now)` in `src/lib/` (unit-tested).
- `apps/commerce/src/api/admin/shop/designs/**` and `admin/shop/uploads/route.ts` (new) -- validate with contract schemas, start workflows, return `AdminDesignView`; uploads use the file module (multer per the kernel's upload pattern) with type and size limits.
- `apps/commerce/src/admin/routes/designs/` (new) -- dashboard UI route "Designs" in the sidebar: list (name, price, status), create/edit form with every field, photo upload with close-up toggle and order, price in rupees, publish button showing missing items and a confirmation checkbox. Uses `@medusajs/ui` and calls only `/admin/shop/*`.
- Seed: the product needs the default sales channel and shipping profile from the starter seed; the India region price uses `currency_code: "inr"`.
- `docs/designs.md` (new) -- fields, publish rules, price history.

## Tasks & Acceptance

**Execution:**
- [ ] contracts schemas and codes, with vitest tests
- [ ] modules, link, migrations
- [ ] workflows and the pure requirements function with unit tests
- [ ] shop admin routes and integration tests for every matrix row (including DB checks that nothing is created on refusal and exactly one history row per price change)
- [ ] admin UI route; a Playwright admin smoke (`apps/commerce/e2e/designs.spec.ts`, skipped unless `ADMIN_E2E_BASE_URL` is set) that signs in, creates a Design with two photos, sees the refusal list, confirms, and publishes
- [ ] docs

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build` and the commerce integration tests run, then all pass and the name check passes.
- Given a running kernel and an admin user, when the admin smoke runs, then it passes, and a screenshot of the Designs page is saved to `docs/screenshots/admin-designs.png`.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Admin users exist only through `medusa user` (Story 1.4 doc). Kernel product writes stay refused for clients; shop workflows call core flows on the server, which the allow-list does not touch. Use the sample saree photos in `apps/mobile/public/mock/` as test uploads. Session: Node 24 at `/opt/node24/bin`; host PostgreSQL 5432 (`commerce` database freshly seeded: India only, INR default), Redis 6379; a kernel runs on :9000 (`medusa develop`, reloads itself) and the website on :8000. Do not rebuild apps/web while :8000 serves. Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed (skip rebuilding apps/web if :8000 is serving; build `@shop/commerce...` instead)
- `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration` -- expected: all pass
- `ADMIN_E2E_BASE_URL=http://localhost:9000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/commerce exec playwright test --trace off` -- expected: pass
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
