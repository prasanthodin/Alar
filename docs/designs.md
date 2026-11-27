# Designs: create, price and publish

The Owner lists a saree as a Design: a kernel product with one Variant, typed attributes, ordered photos and one rupee price. Only the shop's workflows change a Design, and only `publish-design` publishes one (Story 1.6, FR-34 first version; AD-4, AD-5, AD-21).

## Where things live

| Part | Location |
| --- | --- |
| Schemas, error codes, `shelfPriceFromRupees`, `AdminDesignView`, `PublishRequirement` | `packages/contracts/src/design.ts` |
| Attributes module (table `design_attributes`, module key `designAttributes`) | `apps/commerce/src/modules/design-attributes/` |
| Link to the kernel product (`product.design_attributes`) | `apps/commerce/src/links/product-design-attributes.ts` |
| Price history module (table `price_history`, module key `priceHistory`) | `apps/commerce/src/modules/price-history/` |
| Workflows | `apps/commerce/src/workflows/{create-design,update-design,set-design-price,publish-design}.ts`, steps in `workflows/steps/design-steps.ts` |
| Publish rules (pure, unit-tested) | `publishRequirements(view, bands, now)` in `apps/commerce/src/lib/publish-requirements.ts` |
| Reading a Design | `apps/commerce/src/lib/designs.ts` |
| Admin routes | `apps/commerce/src/api/admin/shop/designs/**`, `apps/commerce/src/api/admin/shop/uploads/route.ts` |
| Admin page "Designs" | `apps/commerce/src/admin/routes/designs/page.tsx`, editor in `src/admin/components/design-editor.tsx`, text in `src/admin/i18n/json/en.json` |
| Tests | `packages/contracts/src/design.test.ts`, `apps/commerce/src/lib/__tests__/*.test.ts`, `apps/commerce/integration-tests/http/designs.spec.ts`, admin smoke `apps/commerce/e2e/designs.spec.ts` |

## Fields

Attributes are typed columns linked to the product, never kernel `metadata`. Their names are category-neutral (NFR-17), so later categories (Epic 2) reuse them.

| Field (contract) | Column | Value |
| --- | --- | --- |
| `fibre` | `fibre` | text, 1–80 characters, or empty |
| `weave` | `weave` | text, 1–80, or empty |
| `lengthM`, `widthM` | `length_cm`, `width_cm` | metres with at most two decimals (whole centimetres), above 0 and at most 100; stored as integer centimetres, never as a float |
| `blousePieceIncluded` | `blouse_piece_included` | yes/no, default no |
| `care` | `care` | text, 1–500, or empty |
| `countryOfOrigin` | `country_of_origin` | text, 1–56, or empty |
| `taxCode` | `tax_code` | a tax code (`TaxCode`) that has bands in settings (`tax.bands.<code>`), or empty; an unknown code is refused on save with `design.unknown_tax_code` |
| `stitched` | `stitched` | yes/no, default no |
| photos | `photos` (jsonb) | `DesignPhoto[]`: `{ fileId, url, role: "close_up" \| "other", position }`, at most 12, positions 0, 1, 2, ... in order, each file once, at most one close-up; checked against the contract on write and on read |
| confirmation | `true_colour_confirmed_at`, `true_colour_confirmed_by` | when and by which admin user the Owner confirmed that the photos show the true colour |

The product's name and description are the kernel product's `title` and `description`. A new Design gets one option (`Design`: `Standard`) and one Variant, the store's default sales channel and the default shipping profile (from the starter seed; left out when the database has none), and a handle made from the name plus a random suffix, so two Designs may share a name. Weavers (Epic 2) and stock (Story 1.7) are not part of a Design yet.

## Price

- The Owner types whole rupees. `shelfPriceFromRupees` turns them into a shelf price in paise and refuses anything but a whole number from Rs 1 to Rs 1,00,00,000 with `money.invalid_shelf_price` (so Rs 3,150.50 and Rs 0 are refused, and nothing is created or changed).
- The kernel stores the price in major units (Rs 3,150 is `amount: 3150`, `currency_code: "inr"`). Reads convert back to paise and check `ShelfPrice`; a kernel amount that is not a whole number of rupees reads as no price (`pricePaise: null`), which publishing refuses.
- Every price set or change writes one `price_history` row `{ variant_id, old_price_paise | null, new_price_paise, changed_at, changed_by }` in the same workflow as the kernel change: `create-design` writes the first (old null), `set-design-price` one per change. Setting the same price again changes nothing and writes no row. Rows are never edited; the only delete is a workflow's compensation.
- A published Design only takes a price that a tax band in effect now fits (`tax.no_band` otherwise), so nothing is on sale at a price without a band (AD-5).

## Publishing

`publish-design` is the only way to publish (kernel status `draft` to `published`). The kernel's own product write (`POST /admin/products/:id`) is not on the route allow-list, so it is refused with 403 `route.not_allowed` (Story 1.4). Publishing refuses with 400 `design.not_publishable` and `details.missing` naming every missing item, in this order:

| Item | Missing when |
| --- | --- |
| `fibre`, `lengthM`, `widthM` | the attribute is empty |
| `taxCode` | no tax code is set |
| `taxBand` | the code has no bands in effect now, or the price is a valid shelf price that fits none of them |
| `shelfPrice` | the Variant has no positive whole-rupee price |
| `fabricCloseUpPhoto` | no photo is marked as the fabric close-up |
| `otherPhoto` | no photo besides the close-up |
| `trueColourConfirmation` | the request does not carry `trueColourConfirmed: true` |

A refusal changes nothing (the Design stays a draft and no confirmation is stored). On success the confirmation is stored with the time and the admin user id, then the status changes; if the status change fails, the confirmation is restored. Every publish needs the confirmation again.

Editing (`update-design`) never changes the status or the price. New photos (different files, roles or order) clear the confirmation unless the same request confirms again (`trueColourConfirmed: true`). A published Design must stay publishable: an edit that would leave anything missing is refused with `design.not_publishable` and changes nothing. There is no unpublish yet.

## Routes

All under `/admin/shop`, which the route guard leaves to the shop. They accept only a signed-in admin's session cookie (the dashboard's): a Shopper token, an admin bearer token, a secret API key or no identity gets 401. Errors use the envelope `{ code, message, details? }`.

| Route | Body | Answer |
| --- | --- | --- |
| `GET /admin/shop/designs` | | `AdminDesignList`, newest first |
| `POST /admin/shop/designs` | `CreateDesignInput` | 201 `{ design }` (unpublished); 400 `money.invalid_shelf_price`, `design.unknown_tax_code`, `input.invalid` |
| `GET /admin/shop/designs/:id` | | `{ design }`; 404 `design.not_found` |
| `POST /admin/shop/designs/:id` | `UpdateDesignInput` | `{ design }`; 400 `design.unknown_tax_code`, `design.not_publishable`, `input.invalid` |
| `POST /admin/shop/designs/:id/price` | `{ priceRupees }` | `{ design }`; 400 `money.invalid_shelf_price`, `tax.no_band` |
| `POST /admin/shop/designs/:id/publish` | `{ trueColourConfirmed }` | `PublishDesignResult` (`missing: []`); 400 `design.not_publishable` with `details.missing` |
| `POST /admin/shop/uploads` | multipart, field `files` | 201 `UploadResult` (`files: [{ id, url }]`); 400 `upload.invalid_file` |

Request bodies are strict: an unknown field (such as `status` or `metadata`) is `input.invalid`.

## Photos

`POST /admin/shop/uploads` reads at most 12 files of at most 10 MB each into memory (multer, the kernel's own upload pattern) and stores them through the kernel's file module (`uploadFilesWorkflow`) as public files in the `catalog` bucket (`S3_BUCKET`). A file is accepted only when it is JPEG, PNG or WebP by its first bytes and the type the browser sent agrees; anything else, an oversized file or too many files refuses the whole upload with `upload.invalid_file` and stores nothing. The answer gives each file's id and public address; the Design references them, in order, in its `photos`.

## The Admin page

"Designs" appears in the dashboard sidebar (`/app/designs`). It lists Designs with name, price (₹, whole rupees) and status. "Create design" and a click on a row open a right-hand panel with every field, photo upload with a close-up box and order buttons, and the price in rupees. "Save" creates the Design unpublished, or saves the edits (and the price, through its own route). The Publish section shows the true-colour checkbox and the Publish button; a refusal lists each missing item. The page calls only `/admin/shop/*`.

## Running it locally

- `pnpm --filter @shop/commerce exec medusa db:migrate` creates the two tables and the product link.
- Admins exist only through `medusa user` (Story 1.4): `pnpm --filter @shop/commerce exec medusa user -e owner-e2e@example.test -p <password>`.
- Integration tests: `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration` (the upload test stores and then deletes two files in the `catalog` bucket, so the AWS emulator must be running).
- Admin smoke (skipped unless `ADMIN_E2E_BASE_URL` is set): `ADMIN_E2E_BASE_URL=http://localhost:9000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/commerce exec playwright test --trace off`. It signs in as `ADMIN_E2E_EMAIL` / `ADMIN_E2E_PASSWORD` (defaults `owner-e2e@example.test` / `owner-e2e-pass-1`), creates and publishes a Design with a unique name (left in the database), and saves `docs/screenshots/admin-designs.png`. Its output goes to the system temp directory, because `medusa develop` restarts the kernel when files in the app change.
