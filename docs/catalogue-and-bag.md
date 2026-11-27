# Catalogue and Bag

A Shopper who is not signed in opens the website, sees the published Designs, opens one, and puts it in her Bag. The Bag is the kernel's cart; Shoppers only ever see the word "Bag" (Story 1.8, FR-3 and FR-16 first versions; AD-2, AD-5, AD-21, AD-28).

## Where things live

| Part | Location |
| --- | --- |
| View models: `DesignCard` (with `handle`, `availability`), `DesignView` (with `description`, `details`, `preview`), `BagLine` (with `handle`, `lineTotal`), `BagView`, `BagQuantity`, `DesignPreviewLink` | `packages/contracts/src/catalogue.ts`, `src/design.ts` |
| Error codes `bag.stock_exceeded`, `bag.not_found`; setting `shipping.standard_option_id` | `packages/contracts/src/errors.ts`, `src/settings.ts` |
| The Bag's kernel cart routes on the allow-list | `packages/contracts/src/kernel-routes.ts` (`docs/kernel-routes.md`) |
| api-client kernel source (the default): `listDesigns`, `getDesign(handle, { preview })`, `getBag`, `addToBag`, `setBagQuantity`, `removeFromBag` | `packages/api-client/src/kernel-catalogue.ts`; the mock the app shell uses stays in `src/catalogue.ts` |
| Catalogue reads and availability | `apps/commerce/src/lib/store-catalogue.ts` |
| Bag read | `apps/commerce/src/lib/bag.ts` |
| Preview tokens | `apps/commerce/src/lib/preview-token.ts` |
| Shipping option read; seed | `apps/commerce/src/lib/shipping.ts`; `src/migration-scripts/stock-location-shipping.ts` (`seedShopShipping`) |
| Store routes | `apps/commerce/src/api/store/shop/designs/route.ts`, `designs/[handle]/route.ts`, `bag/[cartId]/route.ts` |
| Admin route and button | `apps/commerce/src/api/admin/shop/designs/[id]/preview/route.ts`; Preview in `src/admin/components/design-editor.tsx` |
| Website | `apps/web/src/app/page.tsx` (home), `designs/[handle]/page.tsx`, `bag/page.tsx`, Bag actions in `src/app/actions.ts`, components `design-card`, `add-to-bag`, `bag-line`, `header-actions`, `photo`; text in `messages/en.json` |
| Tests | `packages/api-client/src/kernel-catalogue.test.ts`, `apps/commerce/src/lib/__tests__/preview-token.test.ts`, `apps/commerce/integration-tests/http/catalogue-and-bag.spec.ts`, `apps/web/e2e/bag.spec.ts` |

## The catalogue

`GET /store/shop/designs` answers `{ designs: DesignCard[] }`: the published Designs in the publishable key's sales channels, newest first. No filters and no search in Epic 1. `GET /store/shop/designs/:handle` answers `{ design: DesignView }`. Both are shop routes (not on the allow-list) and anonymous; the kernel still requires the publishable key.

- **Shown:** a Design that is published, in one of the key's sales channels, with a price and at least one photo. Anything else is 404 `design.not_found`, so an unpublished Design cannot be told from a missing one.
- **Availability** is computed on the server: available = stocked − reserved at the India stock location (`docs/stock.md`), never below 0. More than 0 is `available`, otherwise `sold_out`. A sold-out Design stays in the list and its page stays open, with Add to bag disabled. `DesignView.variants[0].stock` carries the count (FR-3's "Only N left" arrives in Epic 2).
- **Price:** the shelf price in paise, tax-inclusive. There is no MRP in Epic 1, so `mrp` equals `price` and no discount is shown. The website shows whole rupees (`formatRupees`, "₹3,150") with "Price includes all taxes".
- **Photos:** the main photo is the first one (by position) that is not the fabric close-up; the others follow in order. Photos sit on the neutral photo ground (DESIGN.md).
- **Details** (`DesignView.details`): fibre, weave, length and width in metres, blouse piece, care and country of origin, as typed values. The website takes the labels and the wording ("6.3 m", "Included") from `messages/en.json` and leaves out empty ones. Never a Weaver, a tax code or the stitched flag. `attributes` stays for the mock and is empty from the kernel.

## Preview links

The Owner opens an unpublished Design as a Shopper would see it with the Admin's Preview button (in the Publish section; disabled until the Design is saved with a price and a photo). It calls `POST /admin/shop/designs/:id/preview` (admin session cookie and admin origin, like every `/admin/shop` write), which answers `{ url, expiresAt }`: `<STOREFRONT_URL>/designs/<handle>?preview=<token>`.

- The token is `<expiry>.<signature>`: the expiry in seconds since the epoch, and HMAC-SHA256 of `<designId>.<expiry>` under `PREVIEW_TOKEN_SECRET` (base64url). It works for one hour (`PREVIEW_TOKEN_TTL_SECONDS`).
- The website passes the token through `getDesign(handle, { preview })`; the kernel checks it on every read (constant-time compare). An expired, tampered, malformed or other Design's token is 404 `design.not_found`. A published Design opened with a token is shown as usual (the token is ignored).
- A preview answer carries `preview.expiresAt` and `Cache-Control: private, no-store`. The page says it is a preview and until when, is not indexed, and keeps Add to bag disabled (the kernel refuses unpublished Variants anyway).
- `PREVIEW_TOKEN_SECRET` (at least 32 characters, its own value) is required at start-up (`apps/commerce/src/env.ts`); `STOREFRONT_URL` is optional and defaults to the first exact origin in `STORE_CORS`. Both are in `apps/commerce/.env.template`, `infra/.env.template` and `infra/compose.yaml`; CI sets a throwaway secret.

## The Bag

The Bag is a kernel cart. api-client writes it through the four kernel cart routes on the allow-list and reads it through the shop route `GET /store/shop/bag/:cartId`, which answers `{ bag: BagView }` with every amount computed on the server.

| api-client | Kernel call | Then |
| --- | --- | --- |
| `getBag()` | none without a stored cart id (an empty Bag); else `GET /store/shop/bag/:cartId` | a cart that is gone or completed (`bag.not_found`) is forgotten and reads as an empty Bag |
| `addToBag(variantId, quantity = 1)` | `POST /store/carts/:id/line-items`, or `POST /store/carts` with the first line when there is no Bag (or the stored cart is gone) | stores the new cart id; reads the Bag |
| `setBagQuantity(lineId, quantity)` | `POST /store/carts/:id/line-items/:line_id` | reads the Bag |
| `removeFromBag(lineId)` | `DELETE /store/carts/:id/line-items/:line_id` | reads the Bag |

- **Cart id:** kept in the client's `bagStore` (a `TokenStore`). The website keeps it in the httpOnly, `SameSite=Lax` cookie `shop_bag` for 30 days, so the Bag survives a closed browser on the same device. Cart calls are anonymous (no Shopper token): sign-in is not needed, and the same Bag on other devices is Epic 3.
- **Too many:** the kernel checks the Pieces available (stocked − reserved at the locations of the key's sales channel) before it changes a line, and refuses with its `insufficient_inventory` code; api-client maps that to `bag.stock_exceeded` and the line keeps its earlier quantity. A quantity that is not a whole number from 1 is `input.invalid` without a call. An unpublished or unknown Variant is `design.not_found`; an unknown cart or line on a change is `bag.not_found`.
- **Amounts:** each line's `price` is its unit price and `lineTotal` the kernel's line total, both converted from rupees to paise; `totalMrp` is the lines' MRP times quantity, `discount` is `totalMrp` minus the kernel's item total, `delivery` is the standard shipping option's price, and `total` is the item total plus delivery. Clients only format these. The four price lines always appear in this order: Total MRP, Discount, Delivery, Total.
- **Delivery before checkout:** the Bag shows the charge of the standard shipping option (Rs 0 in Epic 1) without adding a shipping method to the cart; checkout (Story 1.9) adds it.
- **Completion** stays never-allowed (403 `route.not_allowed`); only `confirm-payment` completes a cart (Story 1.10).

The website's Bag page lists the lines with a quantity stepper that stops at the Pieces available and says why ("Only 2 available, so you cannot add more."), Remove, and the price details. Every change is a server action that calls api-client and then refreshes the page and the header's Bag count.

## Shipping option

`db:migrate` runs `stock-location-shipping.ts` after the stock seed (file order). It creates, where missing: the fulfilment set "India delivery" on the India stock location, its service zone "India" (country `in`), the link to the manual fulfilment provider, the default shipping profile, and the option "Standard delivery" (flat, manual provider) at Rs 0 in rupees, store-wide and for the India region, enabled in the store. Its id is stored in the dated setting `shipping.standard_option_id`; a rerun changes nothing. The names and the amount come from `apps/commerce/src/settings-data/seed.ts`. The starter's European fulfilment set stays linked to the adopted location (`docs/stock.md`) and is not used.

## Running it locally

- `pnpm --filter @shop/commerce exec medusa db:migrate` seeds the shipping option. Set `PREVIEW_TOKEN_SECRET` in `apps/commerce/.env` first (`openssl rand -hex 32`).
- Integration tests: `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration`. `catalogue-and-bag.spec.ts` needs no file storage: it writes its Designs' photos straight to the attributes row.
- Website end-to-end test, with the kernel and the website running: `E2E_BASE_URL=http://localhost:8000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/web exec playwright test --trace off`. `e2e/bag.spec.ts` signs in to the kernel as the admin smoke's admin (`ADMIN_E2E_EMAIL` / `ADMIN_E2E_PASSWORD`, defaults `owner-e2e@example.test` / `owner-e2e-pass-1`), creates three Designs with the sample photos in `apps/mobile/public/mock` (published with 2 Pieces, published sold out, unpublished; left in the database) and saves `docs/screenshots/web-{home,design,bag}-{390,1440}.png`. It needs the file storage emulator for the photos.
