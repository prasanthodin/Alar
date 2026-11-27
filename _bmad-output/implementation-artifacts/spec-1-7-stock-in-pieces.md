---
title: 'Story 1.7: Owner sets and adjusts stock in Pieces'
type: 'feature'
created: '2026-11-27'
status: 'in-progress'
baseline_commit: 'f27a0ba1f9d324991c2f3666d6068cd35bc06fde'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-parts/epic-1.md'
  - '{project-root}/docs/kernel-routes.md'
  - '{project-root}/docs/designs.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A published Design has no stock, the kernel's stock routes are refused (Story 1.4), and there is no record of why a count changed, so the shop could show a saree it does not have.

**Approach:** Add a `stock-ledger` module (append-only stock-movement rows), a shared stock-lock helper on the Redis locking module, and the `adjust-stock` workflow that takes the lock on the inventory item, checks that the new stocked quantity is not below what is reserved, sets it, and writes one movement row (with compensation that restores the quantity if the row fails). Seed the single India stock location; expose shop admin routes and a stock section on the Admin Design page with the movement history.

## Boundaries & Constraints

**Always:** available = stocked − reserved (AD-6); quantities are whole Pieces ≥ 0; `adjust-stock` accepts either an absolute target ("set to 10") or a signed delta ("+1"), both resolved inside the lock against the current stocked quantity; it refuses a result below reserved with `stock.below_reserved` and a negative result with `stock.invalid_quantity`; a movement row is `{ id, inventoryItemId, variantId, cause, change, stockedAfter, reservedAfter, actor (admin email), reason, occurredAt }` with cause `manual_adjustment` here (enum ready for the other six workflows); rows are only inserted — no route or service method updates or deletes them; the lock helper is reusable by later stock workflows (named key per inventory item, time limit, stable error `stock.lock_timeout` when it cannot be taken); concurrent +1 and +1 both apply; every Design's Variant is linked to one inventory item at the India stock location (created on Design creation if missing — extend Story 1.6's `create-design`); routes accept only an admin session and pass Story 1.6's origin check; a reason is required (1–200 chars).

**Never:** a kernel stock route added to the allow-list; reservations created here (Story 1.9); a second stock location; stock edited outside `adjust-stock`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Set | stocked 0, set 10, reason "first delivery" | stocked 10; one row (+10, stockedAfter 10, actor email, reason) | N/A |
| Concurrent | two +1 at once | stocked +2; two rows | N/A |
| Below reserved | stocked 3, reserved 2, set 1 | refused; nothing changes | `stock.below_reserved` |
| Negative | stocked 2, delta −3 | refused | `stock.invalid_quantity` |
| Lock timeout | lock held by another owner past the limit | refused; quantity unchanged; no row | `stock.lock_timeout` |
| Row write fails | ledger write throws | compensation restores the earlier quantity; error returned | `internal` |
| History | Variant with movements | rows newest first with time, cause, change, actor, reason | N/A |
| Kernel route | `POST /admin/inventory-items/:id/location-levels/:loc` | 403 `route.not_allowed` | Story 1.4 |
| Missing reason | no reason | refused | `input.invalid` |

</frozen-after-approval>

## Code Map

- `packages/contracts/src/stock.ts` (new) -- `StockMovementCause` enum (`manual_adjustment`, `checkout_hold`, `payment_confirmed`, `hold_released`, `fulfilled`, `order_cancelled`, `return_restocked`), `AdjustStockInput` (`set` xor `delta`, `reason`), `StockMovementView`, `VariantStockView` (`stocked`, `reserved`, `available`); codes `stock.below_reserved`, `stock.invalid_quantity`, `stock.lock_timeout` with text in both message files and the admin text file.
- `apps/commerce/src/modules/stock-ledger/` (new) -- model `stock_movement` with an index on `(variant_id, occurred_at)`; service exposes `record` and `listForVariant` only.
- `apps/commerce/src/lib/stock-lock.ts` (new) -- `withStockLocks(container, inventoryItemIds, fn, { timeoutMs })` or workflow steps around the kernel locking module (`acquireLockStep`/`releaseLockStep` as used in Story 1.6), keys `shop-stock:<inventoryItemId>`, sorted to avoid deadlocks.
- `apps/commerce/src/workflows/adjust-stock.ts` (new) -- lock → read stocked/reserved for the India location → validate → update inventory level (core step) → record row (compensation restores) → release.
- `apps/commerce/src/workflows/create-design.ts` (Story 1.6) -- ensure the Variant has `manage_inventory: true` and an inventory item with a level at the India location.
- `apps/commerce/src/migration-scripts/` -- seed the India stock location (idempotent), linked to the default sales channel and the India fulfilment set if the kernel needs it; backfill inventory items for existing Designs.
- `apps/commerce/src/api/admin/shop/designs/[id]/stock/route.ts` (GET `VariantStockView` + history, POST adjust) (new).
- `apps/commerce/src/admin/components/design-editor.tsx` -- a Stock section: stocked / reserved / available, set-to and +/- with a required reason, and the history table.
- `docs/stock.md` (new).

## Tasks & Acceptance

**Execution:**
- [ ] contracts and codes with tests
- [ ] ledger module, lock helper, workflow, stock location seed and backfill
- [ ] routes and admin UI section
- [ ] integration tests for every matrix row (the lock timeout by holding the lock from the test; the row failure by injecting a failing ledger step through a test-only container override or a workflow hook; concurrency with `Promise.all`), and that no route updates or deletes a row
- [ ] extend the admin smoke: set stock to 10 with a reason and see the row
- [ ] docs

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, the commerce integration tests and the admin smoke run, then all pass and the name check passes.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Reserved quantity is the kernel inventory level's `reserved_quantity` (0 until Story 1.9). Story 1.4's never-allowed list already blocks the kernel's level routes; the shop route calls core steps on the server. Session: Node 24 at `/opt/node24/bin`; host PostgreSQL 5432, Redis 6379; kernel on :9000 (`medusa develop`), website on :8000; admin `owner-e2e@example.test` exists. Do not rebuild apps/web while :8000 serves. Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm lint && pnpm typecheck && pnpm test && pnpm --filter "@shop/commerce..." build` -- expected: all succeed
- `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration` -- expected: all pass
- `ADMIN_E2E_BASE_URL=http://localhost:9000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/commerce exec playwright test --trace off` -- expected: pass
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
