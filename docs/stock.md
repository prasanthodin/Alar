# Stock in Pieces

A Design's Variant has a stock count in whole Pieces at the shop's one stock location, India. The Owner sets and adjusts it on the Design page, always with a reason, and every change is one stock-movement row that is never edited (Story 1.7, FR-36; AD-4, AD-6, AD-21).

## The rules

- **available = stocked − reserved** (AD-6). Stocked is the kernel inventory level's `stocked_quantity` at India; reserved is its `reserved_quantity`: the Pieces held by checkout Holds (kernel reservations tagged with the Hold id, Story 1.9, `docs/checkout-and-hold.md`).
- Quantities are whole Pieces, 0 or more (at most `MAX_STOCK_PIECES`, 100,000).
- Only the seven stock workflows change a quantity: `adjust-stock` (here), and later `begin-checkout`, `confirm-payment`, `release-hold`, `fulfil-order`, `cancel-order` and `restock-return`. Each takes the stock lock and writes stock-movement rows. The kernel's own stock, inventory-item, reservation and stock-location write routes are on the never-allowed list (`docs/kernel-routes.md`), so `POST /admin/inventory-items/:id/location-levels/:location_id`, `POST /admin/stock-locations` (and the location's update, delete, sales-channel and fulfilment routes) and the rest answer 403 `route.not_allowed`.
- Reserved above stocked should never happen. When it is seen, a warning is logged (reading the stock, or checking an adjustment), available shows 0, and only a change that raises stocked is allowed.

## Where things live

| Part | Location |
| --- | --- |
| Schemas, causes, `resolveStockTarget`, error codes | `packages/contracts/src/stock.ts` (`AdjustStockInput`, `VariantStockView`, `StockMovementView`, `AdminDesignStockResponse`, `StockMovementCause`) |
| Ledger module (table `stock_movement`, module key `stockLedger`) | `apps/commerce/src/modules/stock-ledger/` |
| Stock lock | `apps/commerce/src/lib/stock-lock.ts` |
| Stock location, reading a Variant's stock, creating its stock record | `apps/commerce/src/lib/stock.ts` |
| Workflow and steps | `apps/commerce/src/workflows/adjust-stock.ts`, `workflows/steps/stock-steps.ts` |
| Seed and backfill | `apps/commerce/src/migration-scripts/stock-location-seed.ts` (`seedShopStockLocation`); `stock-location-setting.ts` runs it again on databases seeded before the setting existed |
| Admin route | `apps/commerce/src/api/admin/shop/designs/[id]/stock/route.ts` |
| Admin Stock section | `apps/commerce/src/admin/components/design-stock.tsx`, shown in the Design panel; text under `shopStock` in `src/admin/i18n/json/en.json` |
| Tests | `packages/contracts/src/stock.test.ts`, `apps/commerce/src/lib/__tests__/stock-lock.test.ts`, `apps/commerce/integration-tests/http/stock.spec.ts`, admin smoke `apps/commerce/e2e/designs.spec.ts` |

## The stock location

There is one stock location, India, and never a second. Its id is held in the dated setting `stock.location_id`, and the shop reads it from there; a database without the setting falls back to the location with an IN address, with a warning, so a second IN location is never picked over the stored one. `db:migrate` runs the seed, which is idempotent:

1. The location in `stock.location_id` (or, without the setting, one with an IN address) is kept as it is.
2. Otherwise the oldest existing location is taken over: renamed India, address set to country `IN`, other address fields cleared. On a database seeded from the starter this is "European Warehouse", so the demo products' levels stay and no location is added. Each of its non-zero levels gets one `opening_balance` stock-movement row (actor `system:stock-location-seed`, written under the stock lock, with a request id derived from the location and inventory item so a rerun writes none twice), so the ledger adds up from its first row. With no location at all, India is created.
3. The id is stored in `stock.location_id` (effective from the time of the seed).
4. India is linked to the store's default sales channel; with no default sales channel, a warning is logged.
5. Backfill: every existing Design's Variant gets `manage_inventory: true`, one inventory item (created and linked if it has none) and a level at India with 0 stocked, where any of these is missing. A Variant that cannot be given them (for example one with two inventory items) is logged and skipped, and what was written for it is undone; the others go on, and a later run picks it up once fixed.

**An adopted location keeps its earlier links.** Taking over the starter's location keeps its link to the starter's "European Warehouse delivery" fulfilment set and its Europe service zone, and to the manual fulfilment provider. A cart in the India region cannot use those European service zones, so the shipping seed of Story 1.8 adds the India fulfilment set, its service zone and the "Standard delivery" option (`docs/catalogue-and-bag.md`). The seed does not remove the old links.

`create-design` (Story 1.6) does the same for each new Design: its Variant is created with `manage_inventory: true`, the kernel creates and links its inventory item, and the step `ensure-variant-stock` adds the level at India with 0 stocked. If that step fails part-way it undoes what it wrote before failing, and if a later step fails its compensation removes what it created. Creating a Design fails with `internal` if the India location has not been seeded.

## The stock lock

`acquireStockLocksStep({ inventoryItemIds, timeoutMs? })` and `releaseStockLocksStep(locks)` (or `withStockLocks(container, ids, fn, options)` outside a workflow) wrap the kernel's locking module on Redis:

- One key per inventory item, `shop-stock:<inventoryItemId>`, without repeats and sorted, so two workflows locking several items never wait on each other in a circle.
- Each acquisition has its own owner id, so only it can release its keys. A key held by another owner is retried every 50 ms until the time limit (`STOCK_LOCK_TIMEOUT_MS`, 5 s); then the keys already taken are released and the step fails with `stock.lock_timeout`. Each attempt is raced against the time left, so a locking call that hangs does not hold the request past the limit either (a key it takes late is given back).
- A lock lives 120 s (`STOCK_LOCK_TTL_SECONDS`) and is **not renewed**. A stock workflow must finish (read, write, record, release) well within that; one that could run longer must not hold the stock lock. A holder that dies without releasing frees the keys after 120 s.
- If a later step fails, the acquire step's compensation releases the keys after the later steps are undone. The release step never fails: a lock that cannot be released expires by itself, and a failed release must not undo a change already recorded.

## `adjust-stock`

Input: the Variant, either `set` (an absolute target, "set to 10") or `delta` (a signed change, "+1"), the reason, the admin's email and user id, and an optional `requestId` (a UUID; the Admin sends a new one per click).

1. Find the Variant's inventory item and its level at India (`internal` if either is missing).
2. Take the stock lock on the inventory item.
3. If `requestId` is already on a row of this Variant, change nothing and answer with the stock as it is (a resent request: a timeout, a proxy retry, a second tab); a request id used for another Variant is `input.invalid`. The row's unique index on `request_id` backs this up.
4. Read stocked and reserved, and resolve the target against them: `set` as given, or stocked + `delta`. A result below 0 (or above the limit) is refused with `stock.invalid_quantity`, one below reserved with `stock.below_reserved`. Nothing has changed yet.
5. Set the stocked quantity (the kernel's `updateInventoryLevelsStep`, whose compensation restores the earlier quantity).
6. Write one stock-movement row with cause `manual_adjustment`. If the row cannot be written, step 5's compensation restores the quantity and the route answers 500 `internal`.
7. Release the lock.

A target equal to the current quantity changes nothing and writes no row. Two adjustments at the same moment run one after the other under the lock, so two "+1" raise the count by 2 and write two rows.

## Stock-movement rows

`stock_movement`: `{ id, inventory_item_id, variant_id, cause, change, stocked_after, reserved_after, actor, actor_id, reason, request_id, occurred_at }`, indexed on `(variant_id, occurred_at)` and unique on `request_id`. `change` is signed: the change in stocked Pieces, except for `checkout_hold` and `hold_released` rows, where it is the change in reserved Pieces (+n, −n; `docs/checkout-and-hold.md`); `actor` is the admin's email and `actor_id` their user id for a manual adjustment (a system name and null for a seed row); `cause` is one of `opening_balance`, `manual_adjustment`, `checkout_hold`, `payment_confirmed`, `hold_released`, `fulfilled`, `order_cancelled`, `return_restocked` (one per stock workflow, plus the seed's opening balance).

Rows are only inserted, and the database enforces it: the trigger `stock_movement_append_only` (function `stock_movement_refuse_change`, migration `apps/commerce/src/modules/stock-ledger/migrations/Migration20261127204437.ts`) raises on any `UPDATE` or `DELETE` of a row, whatever code asks. The kernel's `deleted_at` column exists on every module table but is never set (a soft delete is an update, so it is refused too). The module's service is deliberately not a `MedusaService` (which would generate update and delete methods): it has `record`, `recordMany` (several rows in one insert, for a workflow that changes several items), `findByRequestId` and `listForVariant` only, and no route updates or deletes a row. A stock workflow writes its row as its last write and gives it no compensation, so a failure before or at the row restores the quantities instead.

History is read a page at a time: `listForVariant(variantId, { limit, before })` returns at most `limit` rows (default 50, at most 200), newest first by `(occurred_at, id)`, after the row at `before`.

## Routes

Under `/admin/shop`, so they accept only a signed-in admin's session cookie, and a write must come from an admin origin (`request.cross_origin` otherwise), as in `docs/designs.md`.

| Route | Body | Answer |
| --- | --- | --- |
| `GET /admin/shop/designs/:id/stock?limit=&before=` | | `AdminDesignStockResponse`: `stock` (`stocked`, `reserved`, `available`), one page of `movements` newest first (`limit` default 50, at most 200), and `nextBefore`, the cursor (`<occurredAt>~<id>`) to pass as `before` for the next page, or null; 400 `input.invalid`, 404 `design.not_found` |
| `POST /admin/shop/designs/:id/stock` | `AdjustStockInput`: `{ set, reason, requestId? }` or `{ delta, reason, requestId? }` | `AdminDesignStockResponse` after the change, with the first page of the history; 400 `input.invalid` (no reason, a reason over 200 characters, both or neither of `set` and `delta`, a change of 0, a `requestId` that is not a UUID or was used for another Design, an unknown field), 400 `stock.invalid_quantity`, 403 `request.cross_origin`, 404 `design.not_found`, 409 `stock.below_reserved`, 409 `stock.lock_timeout`, 500 `internal` (nothing changed). Once the change is made the answer is never an error: if the stock cannot be read again it is 200 with the workflow's own `stock`, no `movements` and `refreshed: false` |

A kernel error (such as a missing admin user) goes to the kernel's own error handler; any other failure is answered 500 `internal` and logged with its stack, never with the request body.

## The Admin

The Design panel has a Stock section once the Design is saved: In stock, Held for shoppers and Available; a required reason; "Set stock" with a number of Pieces, and "Add 1 piece" and "Remove 1 piece" (disabled while nothing is available). The count itself is never an editable field. The reason and the target are checked in the browser before anything is sent, and each error is shown in and linked to its field. Each click sends a new request id. The history lists the rows newest first with time (in the admin's language), cause, change, the count after it, who made it and the reason, 50 at a time with "Show older changes". A refused change shows the error's text and reloads the count; a change made whose history could not be refreshed says so and asks the Owner not to send it again.

## Running it locally

- `pnpm --filter @shop/commerce exec medusa db:migrate` creates `stock_movement` and runs the seed and backfill.
- Integration tests: `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration`. The stock suite needs no file storage (its Designs have no photos); the lock-timeout test waits the full 5 s limit.
- The admin smoke (`docs/designs.md`) also sets the published Design's stock to 10 with a reason, adds and removes one piece, shows one refused change, checks the rows, and saves `docs/screenshots/admin-design-stock.png`.
