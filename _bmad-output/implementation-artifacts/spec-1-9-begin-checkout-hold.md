---
title: 'Story 1.9: Begin checkout: snapshot and Hold'
type: 'feature'
created: '2026-11-27'
status: 'in-review'
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
- [x] contracts and codes with tests
- [x] modules, migrations, workflows, job, routes, cart-lock guard
- [x] documents bucket in infra and CI; recovery file step
- [x] integration tests for every matrix row (file failure by a failing S3 step; race with `Promise.all`; expiry by moving a Hold's `expiresAt` into the past and invoking the job handler), checking reservations, movement rows and that the recovery file exists with the snapshot and no address appears in captured logs
- [x] api-client tests; website checkout page; web e2e: sign in, begin checkout, see total and end time, Bag locked, cancel unlocks; screenshot of the checkout page at 390 and 1440
- [x] docs

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, the commerce integration tests, the admin smoke and the web e2e run, then all pass and the name check passes.

## Implementation Notes

- `cart.changed` vs `stock.unavailable`: a line short of stock *not counting other Shoppers' Holds* (or unpublished, or repriced) is `cart.changed`; a shortage caused only by other Holds is `stock.unavailable`. `held` availability uses the same rule (Hold reservations are those whose `external_id` starts `hold_`).
- Hold stock-movement rows record the change in reserved Pieces (+n/−n); the Admin history shows "held for shoppers after" for them. The ledger gained `recordMany` (one insert).
- `begin-checkout` also transfers the cart to the Shopper, sets its shipping address and the standard shipping method, then forces a tax-line refresh (after the price check, so re-pricing is a no-op). These cart changes are not undone on failure (harmless).
- An expired-but-unreleased Hold no longer locks the Bag; `POST /store/shop/checkouts` releases it (reason `expired`) before beginning again.
- Module keys are `shopCheckout`/`shopHold` (tables `checkout`/`hold`). Routes accept a customer bearer token only.
- Website: `?next=` return path on sign-in/sign-up/sign-out; checkout page lists changed lines with Accept/Change/Remove.

## Spec Change Log

## Review Triage Log

Iteration 0 (blind, edge-case, verification-gap layers). Verdicts after reading the code at each location.

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Cart lines read before the stock lock; check reuses the stale read (blind, edge x2) | high | patch | `loadCheckoutCartStep` runs before `acquireStockLocksStep`; `checkCheckoutStep` uses that `cart`; the cart guard only refuses once a Hold row exists. |
| 2 | Snapshot taken before the cart is refreshed (customer transfer re-prices, shipping, tax lines); nothing compares (blind, edge) | medium | patch | Order in `begin-checkout.ts`: check → transfer/update/shipping/tax → create; no read-back; `tax.kernel_mismatch` never raised. |
| 3 | Cart owned by another registered Shopper is silently transferred (blind) | medium | patch | `loadCart` checks region/currency/channel only; `transferCartCustomerWorkflow` reassigns. |
| 4 | Reservation made just before `readStockLevel` throws is orphaned (edge) | low | patch | id pushed to `made` only after the level read; catch removes `made` only. |
| 5 | Inline undo failure only logged; no sweeper for orphaned Hold reservations (blind, edge) | medium (unverified frequency) | defer | Needs failure of a delete after a failure; sweeper is new surface. |
| 6 | Release race: second release after soft-delete takes no lock and ends the Hold again (edge x3) | medium | patch | `loadHoldStep` derives lock keys from reservations read before the lock; zero reservations → no lock; status check not atomic. |
| 7 | Documents S3 client has no timeout/retry bound under the 120 s lock (blind) | medium | patch | `documentsClient()` builds `S3Client` with defaults. |
| 8 | Recovery file PII retention, encryption at rest, final status (blind) | medium | defer | Retention policy is a product decision; Floci has no SSE/lifecycle; status versioning belongs with Story 1.10's order write. |
| 9 | No per-customer cap or cooldown on Holds (blind) | medium | defer | Rate limiting is not in this story's intent; abuse policy needed. |
| 10 | Failed cancel silently redirects to /bag (blind, edge) | medium | patch | `cancelCheckoutAction` handles only `auth.unauthenticated`. |
| 11 | `stock.unavailable` details differ (`holdId` vs `variantIds`) (blind) | low | patch | Two raise sites, two shapes. |
| 12 | Repeat begin with a different address returns the old Checkout silently (blind) | false | reject | The frozen intent says a second begin returns the existing Checkout. |
| 13 | Dockerfile build placeholders lack required `S3_DOCUMENTS_BUCKET` (verification-gap, other) | high | patch | `env.ts` requires it; `Dockerfile` build stage sets the other S3 placeholders only; no CI image build. |
| 14 | Cancel of an expired-unreleased Hold: `expired` end state untested (verification-gap) | medium | patch | gap pre-verified; no cancel-after-expiry case. |
| 15 | Job's per-Hold try/catch untested; a batch of 100 persistent failures starves others (verification-gap, edge) | medium | defer | Needs failure injection; pair with the orphan sweeper. |
| 16 | `cart.changed` reason `unavailable` untested (verification-gap) | medium | patch | gap pre-verified. |
| 17 | Tax refusals through the route untested (verification-gap) | medium | patch | gap pre-verified; nested-workflow unwrapping not observed. |
| 18 | Admin "held for shoppers after" label untested (verification-gap) | low | defer | Admin smoke has no checkout fixture yet. |
| 19 | Website `cart.changed` flow untested (verification-gap) | medium | patch | gap pre-verified. |
| 20 | Missing tests: failure after the file write; release-hold compensation; hold_released after re-begin; logs on every row (blind) | medium | patch (file-write failure, hold_released assertion); defer (release compensation); reject (logs on every row: two paths cover the logging code) | |
| 21 | Hold end time hard-codes Asia/Kolkata and shows no date (blind) | low | reject | India-only shop; a 15-minute Hold; fix adds a setting read and a branch. |
| 22 | `shop-errors.ts` stray blank lines; STATUS tax entries without KERNEL_TYPE (blind) | low | patch (blank lines); reject (entries are what lets tax codes reach the Shopper) | |
| 23 | `isUniqueViolation` matches any "unique/duplicate" message (blind) | low | patch | Direct correction to the index name. |
| 24 | Own expired Hold between route release and check → `cart.locked` (edge) | low | reject | Window of milliseconds; route releases expired Holds first. |
| 25 | `bag.ts` adds own held Pieces after the Hold expired (edge) | low | patch | Direct condition. |
| 26 | `decodeURIComponent` URIError → bare 500 in the cart guard (edge) | low | patch | Introduced in this diff. |
| 27 | Server `input.invalid` has `issues`, not `fields`; every field marked (edge) | low | patch | `invalid()` marks all when `fields` is empty. |
| 28 | `cart.changed` with unparseable details shows nothing (edge) | low | patch | Note hidden for `cart.changed`. |
| 29 | `next=/sign-out` accepted as a return path (edge) | low | patch | `safeReturnPath` allows any local path. |
| 30 | Mobile shows a held Design as sold out (edge) | low | patch | Mobile branches on stock only. |
| 31 | Bag unlocks when the Hold has expired but is not yet released (edge claim) | false | reject | An expired Hold is over; its reservations go within a minute and begin releases it first; finding 25 covers the stock count. |

## Design Notes

Story 1.10 adds the payment step and the Order id to the recovery file; keep the snapshot shape extensible. Story 1.5's deferred note: refresh tax lines when the snapshot is taken. Floci does not enforce bucket policies (Story 1.3 note): test privacy by the absence of a public policy and by never building public URLs for `documents`. Session: Node 24 at `/opt/node24/bin`; host PostgreSQL 5432, Redis 6379; Floci on 4566 (compose stack); kernel on :9000; website on :8000 (restart it after building, or use your own port if not permitted). Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration` -- expected: all pass
- `ADMIN_E2E_BASE_URL=http://localhost:9000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/commerce exec playwright test --trace off` -- expected: pass
- with kernel and web running: `E2E_BASE_URL=<web> E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/web exec playwright test --trace off` -- expected: all pass
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
