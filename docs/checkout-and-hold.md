# Checkout and Hold

A signed-in Shopper begins checkout with her delivery address. Under the stock lock the shop re-checks her Bag, snapshots what she agreed to pay for into a Checkout, holds her Pieces for her (a Hold with kernel reservations), and writes the snapshot as a recovery file. The Bag is locked while the Hold lasts; it ends when she cancels or when the every-minute job finds it expired. No payment starts here: Story 1.10 adds it (Story 1.9, FR-19, FR-16; AD-4, AD-6, AD-13, AD-22, AD-30).

## Where things live

| Part | Location |
| --- | --- |
| Schemas and codes: `CheckoutAddress`, `BeginCheckoutInput`, `CheckoutSnapshotLine`, `CheckoutSnapshot`, `CheckoutView`, `CheckoutRecoveryFile`, `ChangedLine`, `CartChangedDetails`, `CheckoutStatus`, `HoldStatus`, `INDIAN_STATES`; `Availability` gains `held`; `BagView.hold`; setting `checkout.hold_minutes`; codes `cart.changed`, `cart.locked`, `stock.unavailable`, `checkout.not_found` | `packages/contracts/src/checkout.ts`, `catalogue.ts`, `settings.ts`, `errors.ts` |
| Modules (tables `checkout`, `hold`; keys `shopCheckout`, `shopHold`) | `apps/commerce/src/modules/checkout/`, `modules/hold/` |
| Hold and Checkout reads, Hold reservations, the Shopper's view | `apps/commerce/src/lib/holds.ts` |
| The `documents` bucket (S3 client) | `apps/commerce/src/lib/documents.ts` |
| Workflows and steps | `apps/commerce/src/workflows/begin-checkout.ts`, `release-hold.ts`, `steps/checkout-steps.ts`; `recordStockMovementsStep` in `steps/stock-steps.ts` |
| Scheduled job | `apps/commerce/src/jobs/release-expired-holds.ts` |
| Store routes | `apps/commerce/src/api/store/shop/checkouts/route.ts`, `[id]/route.ts`, `[id]/cancel/route.ts` |
| Cart lock | `lineWriteCartId` and `bagCartGuard` in `apps/commerce/src/lib/bag-guard.ts` |
| Availability `held`; the Bag's `hold` | `apps/commerce/src/lib/store-catalogue.ts` (`availabilityOf`, `stockByVariant`); `src/lib/bag.ts` |
| Hold length seed | `apps/commerce/src/settings-data/seed.ts` (`holdMinutes`), `src/migration-scripts/checkout-hold-setting.ts` |
| Bucket | `infra/init/create-buckets.mjs`, `infra/compose.yaml`, `.github/workflows/ci.yml`; `S3_DOCUMENTS_BUCKET` in `apps/commerce/src/env.ts` and as a build placeholder in `apps/commerce/Dockerfile` (checked by `src/__tests__/dockerfile-env.test.ts`) |
| api-client | `beginCheckout`, `getCheckout`, `cancelCheckout` in `packages/api-client/src/checkout.ts`; Bag writes map `cart.locked` |
| Website | `apps/web/src/app/checkout/page.tsx`, `components/checkout-form.tsx`, `components/changed-lines.tsx`, Bag "Checkout" button and locked Bag in `app/bag/page.tsx` and `components/bag-line.tsx`, "Unavailable for now" on the Design page and card, `?next=` return path (`src/lib/return-path.ts`) on sign-in, sign-up and sign-out, text in `messages/en.json` |
| Tests | `packages/contracts/src/checkout.test.ts`, `packages/api-client/src/checkout.test.ts`, `apps/commerce/src/lib/__tests__/bag-guard.test.ts`, `apps/commerce/integration-tests/http/checkout.spec.ts`, `apps/web/test/return-path.test.ts`, `apps/web/e2e/checkout.spec.ts` |

## The address

Every field is required: name (1–100 characters), mobile number (10 digits starting 6–9; spaces and hyphens are dropped, no country code), address line (1–200), city (1–100), pincode (6 digits, not starting 0) and state (one of India's 36 states and union territories). Anything else is 400 `input.invalid`. The delivery check by pincode is Epic 3; here the address is only recorded. The address is personal data: it is kept in the Checkout's snapshot, in its recovery file and on the kernel cart's shipping address, and is never written to a log (the integration test captures the process output and the kernel logger during a checkout and a failed one).

## `begin-checkout`

Input: the cart id, the Shopper (customer id from her bearer token), the checked address and the publishable key's sales channels.

1. Read the cart (`bag.not_found` for an unknown, completed or foreign cart, as the Bag route, and for a cart that already belongs to another Shopper; `input.invalid` for an empty one) and the inventory items of its lines.
2. Take the stock lock (`shop-stock:<inventoryItemId>`, sorted; `docs/stock.md`) on every one of them.
3. Under the lock:
   - A live Hold on the cart: the same Shopper's, not expired, answers its Checkout and nothing else happens (200); one past its expiry is `cart.locked` (another Shopper never gets this far: the held cart is hers, so it is `bag.not_found` to him).
   - The cart is read again; a line added, removed or changed (Variant, quantity, price, inventory item) since step 1, or one whose inventory item is not locked, is 409 `cart.changed` with reason `line_changed`.
   - Each line against its Design now. Not on sale (unpublished, gone, not that Variant) is `unavailable`; a unit price that is not the Design's price now is `price_changed`; more Pieces than are left **not counting other Shoppers' Holds** is `short_of_stock`. Any of these: 409 `cart.changed` with `details.lines` (`ChangedLine`: line, Variant, name, reason, quantity, the Bag's price, the price now or null, Pieces left) and nothing is created.
   - Pieces the line needs that other Shoppers hold: 409 `stock.unavailable` ("Someone is paying for the last piece"). This is how the second of two Shoppers racing for the last Piece is told, before any payment.
   - The snapshot: per line the unit price, and the tax from the money functions (`taxForShelfPrice` per Piece × quantity) with the bands of the Design's tax code in effect at this moment (`tax.no_band` when none fits); the standard shipping charge; the total; the address; the Shopper id; the time. The Hold length is the dated setting `checkout.hold_minutes` in effect now (seeded 15).
4. Put the Shopper (`transferCartCustomerWorkflow`), the address (`updateCartWorkflow`, country `in`) and the standard shipping method (`addShippingMethodToCartWorkflow`) on the cart and refresh its tax lines (`updateTaxLinesWorkflow`, forced), so the shop's tax provider re-checks the bands on the kernel cart too and the cart is ready for completion in Story 1.10. The prices were checked first, so the kernel's re-pricing should change nothing; the cart is then read back and compared with the snapshot: a line added, removed or of another quantity, or a unit price that changed, is `cart.changed`; a line's tax, the shipping charge or the total that differs to the paisa is 400 `tax.kernel_mismatch`. So the cart Story 1.10 completes and the Checkout agree.
5. Create the Checkout (status `held`, the snapshot as jsonb, checked against `CheckoutSnapshot` on write and read).
6. Create the Hold: `live`, `expires_at` = now + the Hold length. A partial unique index (`cart_id` where `status = 'live'`) refuses a second live Hold on a cart (`cart.locked`).
7. Reserve each line's Pieces in the kernel, one line at a time, each reservation tagged with the Hold id (`external_id`, plus `metadata.hold_id`, `checkout_id`, `line_id`, `variant_id`). Each reservation id is noted as soon as it exists; if anything fails, every one made is removed first, and a refusal (not enough available) fails with `stock.unavailable` (`details.variantIds`).
8. Write the recovery file (below).
9. Last, one `checkout_hold` stock-movement row per reservation, all in one write.
10. Release the lock.

A failure at any step undoes the earlier ones in reverse: the recovery file version, the reservations, the Hold, the Checkout (the cart's address and shipping method may stay; they are harmless). The route answers 500 `internal` for a failure that is not one of the codes above, and logs the error by key and S3 error name, never the body.

Routes, scheduled jobs and the website never reserve stock themselves; only `begin-checkout` and `release-hold` do (and later `confirm-payment`).

## The recovery file

`checkouts/<checkoutId>.json` in the private, versioned `documents` bucket (`S3_DOCUMENTS_BUCKET`), written through the S3 client: `CheckoutRecoveryFile` = `{ version: 1, checkoutId, holdId, holdExpiresAt, createdAt, snapshot }`, where the snapshot holds the lines, quantities, unit prices, tax per line, shipping, total, address and Shopper id. It lets a restore rebuild an Order with its original numbers (AD-30): Story 1.10 adds the Order id, Story 1.13 the invoice number, Stories 1.12 and 1.25 read it. The write is step 8, before the workflow finishes; if it fails, the reservations, the Hold and the Checkout are removed and no payment can start. Its compensation deletes exactly the version it wrote, so an earlier version stays. Its contents never appear in a log.

The S3 client bounds each request (5 s to connect, 15 s per request, at most 2 attempts), well inside the 120 s stock lock.

The bucket is private: `create-buckets.mjs` gives it no bucket policy (and fails if it finds one), blocks public access, and turns versioning on; `S3_DOCUMENTS_BUCKET` must differ from the public `S3_BUCKET` (the kernel refuses to start otherwise); Caddy serves only `/catalog`; the shop never builds a public URL for it. The emulator does not enforce bucket policies (`docs/local-environment.md`), so the integration test checks privacy by the absence of a policy.

## `release-hold`

Input: the Hold id and the reason, `cancelled` (the Shopper cancelled) or `expired` (the job).

1. Read the Hold and the inventory items of its reservations; take the stock lock on them and on the Hold itself (key `shop-stock:hold:<holdId>`, through the same helper), so two releases of one Hold (a cancel racing the job) run one after the other even when the second finds no reservations left.
2. Under the lock, if the Hold is still live (and, for `expired`, past its expiry): soft-delete its reservations (compensation restores them) and read the level after each. Otherwise change nothing (`released: false`), so a second run, or a cancel racing the job, does nothing.
3. End the Hold (`released` or `expired`, with `ended_at`) and its Checkout (`cancelled` or `expired`).
4. Last, one `hold_released` row per reservation.

## Stock-movement rows

`checkout_hold` and `hold_released` rows (actor `system:begin-checkout` / `system:release-hold`, no actor id) record the change in **reserved** Pieces (`change` +n on a Hold, −n on its release), with the stocked and reserved counts after it; stocked does not change. Their request ids are `<holdId>:hold:<reservationId>` and `<holdId>:release:<reservationId>`, so the unique index keeps either from being written twice. The Admin's history shows them with "held for shoppers after". The ledger's `recordMany` writes them in one insert.

## Availability and the locked Bag

- **`held`**: available = stocked − reserved. A Design with a Piece available is `available`. With none available, it is `held` when some would be without the Holds (stocked − reservations other than Holds > 0), else `sold_out`. A raw reservation that is not a Hold's (none should exist outside the stock workflows) counts as sold. The website shows `held` as "Unavailable for now" (lavender chip, "Someone is paying for the last piece. Check again in a few minutes.") with Add to bag disabled; the kernel refuses the add anyway (`insufficient_inventory`, `bag.stock_exceeded` in api-client). No timer is shown for another Shopper's Hold.
- **Bag totals**: once checkout has put tax lines on the cart, the kernel's line and item totals come in unrounded decimals (within a hundredth of a paisa); the Bag rounds them to the paisa (`kernelTotalToPaise`).
- **Locked Bag**: while the cart has a live Hold that has not expired, the cart guard refuses every line write (add, change, remove) with 409 `cart.locked`, before the kernel sees it. `BagView.hold` is `{ checkoutId, expiresAt }`; the Shopper's own held Pieces count towards her lines' `stock` while the Hold locks the Bag (not after it has expired). An expired Hold no longer locks the Bag, even before the job releases it, and `POST /store/shop/checkouts` releases it first (reason `expired`) so she can begin again.

## Expiry

`release-expired-holds` (`* * * * *`, the kernel's scheduled jobs) lists up to 100 live Holds whose `expires_at` has passed, oldest first, and runs `release-hold` with `expired` for each. One failing is logged by Hold id and retried next minute.

## Routes

All under `/store/shop/checkouts`, so they need the publishable key, and accept only a signed-in Shopper's bearer token (`authenticate('customer', ['bearer'])`: no cookie, no admin). Answers are `Cache-Control: private, no-store`.

| Route | Body | Answer |
| --- | --- | --- |
| `POST /store/shop/checkouts` | `BeginCheckoutInput`: `{ cartId, address }` | 201 `{ checkout: CheckoutView }`; 200 with the existing one for her live Hold; 400 `input.invalid`, `tax.no_band`, `tax.kernel_mismatch`; 401; 404 `bag.not_found` (also another Shopper's cart); 409 `cart.changed`, `cart.locked`, `stock.unavailable`, `stock.lock_timeout`; 500 `internal` |
| `GET /store/shop/checkouts/:id` | | `{ checkout }`; 404 `checkout.not_found` for another Shopper's or none |
| `POST /store/shop/checkouts/:id/cancel` | | `{ checkout }` after `release-hold` (`cancelled`, or `expired` if its time had run out); a Checkout no longer held is answered as it is; 404 `checkout.not_found` |

`CheckoutView`: id, status (`held`, `cancelled`, `expired`; Story 1.10 adds payment states), the snapshot's lines, shipping and total, `holdExpiresAt` (the true end of the Hold), the address and when it was created.

## The website

- The Bag has a "Checkout" button under the price details. Signed out, it goes to `/sign-in?next=%2Fcheckout`; sign-in and sign-up keep `next` (a path on this site only, never `/sign-out` or `/api`: `safeReturnPath`) and return there; the Bag stays in its cookie. A Bag with a line that is not buyable or holds more than are available shows the button disabled until it is resolved.
- `/checkout` (signed in only): the address form ("Hold my items") beside the Bag's totals. A refused try shows what to fix and keeps what she typed (only the fields the server's issues name, `address.<field>`, are marked; a refusal that names none, such as an empty Bag, says the items could not be held); `cart.changed` lists each changed line with "Accept new price" (sets the same quantity again, which takes the price now), "Change to N" or "Remove", then she holds her items again; `stock.unavailable` says someone is paying for the last piece.
- With a live Hold, `/checkout` shows the snapshot's lines, delivery and total, the address, and "We hold your items until 4:11 am while you pay." with the server's end time in the business time zone, as plain text (no countdown, no warning colour; NFR-13), and "Cancel checkout", which releases the Hold and returns to the Bag (a failed cancel says why and stays, the Bag still held).
- The locked Bag says until when it is held, disables its steppers and Remove, and offers "Continue to checkout".
- The app (mobile) shows a `held` Design as "Unavailable for now" too.
- Screenshots: `docs/screenshots/web-checkout-390.png`, `web-checkout-1440.png` (from `e2e/checkout.spec.ts`).

## Running it locally

- `S3_DOCUMENTS_BUCKET=documents` in `apps/commerce/.env` (see `.env.template`), and the bucket: `docker compose -f infra/compose.yaml up -d floci bucket-init`, or with the emulator already running, from `apps/commerce`: `S3_ENDPOINT=http://localhost:4566 S3_REGION=us-east-1 S3_ACCESS_KEY_ID=… S3_SECRET_ACCESS_KEY=… node ../../infra/init/create-buckets.mjs`.
- `pnpm --filter @shop/commerce exec medusa db:migrate` creates `checkout` and `hold` and seeds `checkout.hold_minutes`.
- Integration tests: `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration`. `checkout.spec.ts` needs the emulator with the `documents` bucket. It also checks a foreign cart, an unpublished Design, a tax mismatch on the refreshed cart (by stubbing the tax module's lines), a failure after the file is written (no version left), a cancel after expiry, and a cancel racing the job. It makes the file write fail by stubbing the S3 client's `PutObjectCommand`, the second reservation fail by stubbing the inventory module, races two Shoppers with `Promise.all`, and expires a Hold by moving its `expires_at` into the past and calling the job's handler.
- Website end-to-end: `E2E_BASE_URL=<web> E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/web exec playwright test --trace off` (needs the admin smoke's admin and the emulator, like `bag.spec.ts`).
