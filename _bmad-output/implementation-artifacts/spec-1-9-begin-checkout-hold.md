---
title: 'Story 1.9: Begin checkout: snapshot and Hold'
type: 'feature'
created: '2026-11-27'
status: 'in-progress'
route: 'dispatch'
baseline_commit: 'e9eef3e'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-parts/epic-1.md'
  - '{project-root}/docs/kernel-routes.md'
  - '{project-root}/docs/stock.md'
  - '{project-root}/docs/settings-and-tax.md'
  - '{project-root}/docs/catalogue-and-bag.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nothing holds a Shopper's Pieces while she pays, so two Shoppers could pay for the last saree; nothing records what she agreed to pay for if the system must be rebuilt.

**Approach:** Add `checkout` and `hold` shop modules and the `begin-checkout` and `release-hold` workflows: under the stock lock on every inventory item in the Bag, re-check prices and availability (refusing with `cart.changed` or `stock.unavailable`), snapshot lines, unit prices, tax per line (money functions), shipping, total, address and Shopper id into a Checkout, create a Hold (length from a dated setting, 15 minutes) and kernel reservations tagged with the Hold id, write one stock-movement row per change, and write the snapshot as a recovery file to a new private, versioned `documents` bucket. Lock the Bag while a Hold is live; release on cancel or by a once-a-minute scheduled job when it expires. Add the checkout screen on the website.

## Boundaries & Constraints

**Always:** only signed-in Shoppers begin checkout (a signed-out Shopper is sent to sign in/up and keeps her Bag); required fields are name, mobile number (10 digits, Indian), address line, city, pincode (6 digits) and state; `begin-checkout` and `release-hold` take the Story 1.7 stock lock (`shop-stock:<inventoryItemId>`, sorted) on every inventory item in the cart before reading or reserving, and write one stock-movement row per reservation change (causes `checkout_hold`, `hold_released`); tax per line comes from the money functions and re-checks Story 1.5's bands at that moment (refreshing the cart's tax lines first); a changed price or a line now short of stock returns `cart.changed` with each changed line and creates nothing; the last Piece contended by two Shoppers gives exactly one Hold and `stock.unavailable` to the other; a Design whose available Pieces are all on Hold shows "unavailable for now" (new availability value `held`) and cannot be added; a cart with a live Hold refuses add, change and remove with `cart.locked`, and a second `begin-checkout` returns the existing Checkout; the recovery file `checkouts/<checkoutId>.json` in `documents` is written before the workflow finishes and its failure compensates everything (reservations, Hold, Checkout); the file's contents and the address never appear in logs; the Hold length is the dated setting `checkout.hold_minutes` (seed 15); the expiry job runs every minute through the kernel's scheduled jobs and starts `release-hold`, marking the Checkout `expired`; the checkout screen shows the snapshot total and the Hold's end time from the server, styled plainly (not as pressure, NFR-13); the `documents` bucket is private (no public policy), versioned, created by the bucket init in `infra/` and in CI.

**Never:** starting a payment (Story 1.10); a pincode delivery check (Epic 3); a second live Hold per cart; reservations made outside these workflows.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Signed out | Bag, tap Checkout | sent to sign-in, returns to checkout, Bag intact | N/A |
| Begin | signed in, valid address, 1 line in stock | Checkout (snapshot), Hold expiring in 15 min, reservation tagged with Hold id, one `checkout_hold` row, recovery file in `documents` | N/A |
| File write fails | storage error | no Checkout, no Hold, no reservation, no row | `internal` |
| Last Piece race | two Shoppers, 1 Piece | one Hold; other refused | `stock.unavailable` |
| Held Design page | last Piece on Hold | "Unavailable for now", Add disabled | N/A |
| Changed price | price changed since added | nothing created; changed lines listed | `cart.changed` |
| Locked Bag | live Hold; add/change/remove | refused | `cart.locked` |
| Repeat begin | live Hold | same Checkout; no second Hold | N/A |
| Cancel | live Hold, Shopper cancels | reservations removed, `hold_released` rows, Bag editable | N/A |
| Expiry | Hold past expiry, job runs | released, Checkout `expired` | N/A |
| Partial reserve | 2 lines, second fails | first reservation removed; no Hold/Checkout | `stock.unavailable` |
| Bad address | 5-digit pincode | refused | `input.invalid` |

</frozen-after-approval>

## Code Map

- `packages/contracts/src/checkout.ts` (new) -- `CheckoutAddress`, `BeginCheckoutInput`, `CheckoutSnapshotLine` (variantId, name, quantity, unitPricePaise, taxableTotalPaise, taxTotalPaise, lineTotalPaise, rateBp), `CheckoutView` (id, status `held|cancelled|expired` + later states, lines, shippingPaise, totalPaise, holdExpiresAt, address), `ChangedLine`; `DesignCard.availability` gains `held`; codes `cart.changed`, `cart.locked`, `stock.unavailable`, `checkout.not_found` with text in both message files.
- `apps/commerce/src/modules/checkout/` and `modules/hold/` (new) -- models per AD-6 (Hold: checkoutId, cartId, expiresAt, status; Checkout: cartId, customerId, snapshot jsonb validated by contract, status); unique live Hold per cart (partial index).
- `apps/commerce/src/workflows/begin-checkout.ts`, `release-hold.ts` (new) -- reuse `acquireStockLocksStep`/`releaseStockLocksStep` and the ledger's `record`; kernel reservation steps tagged with the Hold id (`description`/`external_id` or metadata on the reservation per 2.23.1 capabilities); recovery-file step via the S3 client to the `documents` bucket (compensation deletes the version written).
- `apps/commerce/src/jobs/release-expired-holds.ts` (new) -- every minute, finds expired live Holds, runs `release-hold` per Hold (idempotent).
- `apps/commerce/src/api/store/shop/checkouts/**` (new) -- POST begin (customer session only), GET one (owner only), POST `:id/cancel`; middleware making the Story 1.8 cart-write guard refuse writes to carts with a live Hold (`cart.locked`).
- `lib/store-catalogue.ts` / `lib/bag.ts` -- availability `held` when stocked > 0 and available = 0 because of Holds.
- settings -- `checkout.hold_minutes` (dated) seeded at 15.
- `infra/init/create-buckets.mjs`, `infra/compose.yaml`, CI -- add the private versioned `documents` bucket; env `S3_DOCUMENTS_BUCKET` (zod-checked).
- `packages/api-client` -- `beginCheckout`, `getCheckout`, `cancelCheckout`; website `checkout/page.tsx` (address form, snapshot, Hold end time, Cancel), Bag "Checkout" button, sign-in redirect with return path.
- `docs/checkout-and-hold.md` (new).

## Tasks & Acceptance

**Execution:**
- [ ] contracts and codes with tests
- [ ] modules, migrations, workflows, job, routes, cart-lock guard
- [ ] documents bucket in infra and CI; recovery file step
- [ ] integration tests for every matrix row (file failure by a failing S3 step; race with `Promise.all`; expiry by moving a Hold's `expiresAt` into the past and invoking the job handler), checking reservations, movement rows and that the recovery file exists with the snapshot and no address appears in captured logs
- [ ] api-client tests; website checkout page; web e2e: sign in, begin checkout, see total and end time, Bag locked, cancel unlocks; screenshot of the checkout page at 390 and 1440
- [ ] docs

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, the commerce integration tests, the admin smoke and the web e2e run, then all pass and the name check passes.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Story 1.10 adds the payment step and the Order id to the recovery file; keep the snapshot shape extensible. Story 1.5's deferred note: refresh tax lines when the snapshot is taken. Floci does not enforce bucket policies (Story 1.3 note): test privacy by the absence of a public policy and by never building public URLs for `documents`. Session: Node 24 at `/opt/node24/bin`; host PostgreSQL 5432, Redis 6379; Floci on 4566 (compose stack); kernel on :9000; website on :8000 (restart it after building, or use your own port if not permitted). Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration` -- expected: all pass
- `ADMIN_E2E_BASE_URL=http://localhost:9000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/commerce exec playwright test --trace off` -- expected: pass
- with kernel and web running: `E2E_BASE_URL=<web> E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/web exec playwright test --trace off` -- expected: all pass
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
