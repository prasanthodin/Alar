# Stock in Pieces

A Design's Variant has a stock count in whole Pieces at the shop's one stock location, India. The Owner sets and adjusts it on the Design page, always with a reason, and every change is one stock-movement row that is never edited (Story 1.7, FR-36; AD-4, AD-6, AD-21).

## The rules

- **available = stocked − reserved** (AD-6). Stocked is the kernel inventory level's `stocked_quantity` at India; reserved is its `reserved_quantity`, which stays 0 until Holds reserve Pieces (Story 1.9).
- Quantities are whole Pieces, 0 or more (at most `MAX_STOCK_PIECES`, 100,000).
- Only the seven stock workflows change a quantity: `adjust-stock` (here), and later `begin-checkout`, `confirm-payment`, `release-hold`, `fulfil-order`, `cancel-order` and `restock-return`. Each takes the stock lock and writes stock-movement rows. The kernel's own stock, inventory-item, reservation and stock-location write routes are on the never-allowed list (`docs/kernel-routes.md`), so `POST /admin/inventory-items/:id/location-levels/:location_id` and the rest answer 403 `route.not_allowed`.

## Where things live

| Part | Location |
| --- | --- |
| Schemas, causes, `resolveStockTarget`, error codes | `packages/contracts/src/stock.ts` (`AdjustStockInput`, `VariantStockView`, `StockMovementView`, `AdminDesignStockResponse`, `StockMovementCause`) |
| Ledger module (table `stock_movement`, module key `stockLedger`) | `apps/commerce/src/modules/stock-ledger/` |
| Stock lock | `apps/commerce/src/lib/stock-lock.ts` |
| Stock location, reading a Variant's stock, creating its stock record | `apps/commerce/src/lib/stock.ts` |
| Workflow and steps | `apps/commerce/src/workflows/adjust-stock.ts`, `workflows/steps/stock-steps.ts` |
| Seed and backfill | `apps/commerce/src/migration-scripts/stock-location-seed.ts` (`seedShopStockLocation`) |
| Admin route | `apps/commerce/src/api/admin/shop/designs/[id]/stock/route.ts` |
| Admin Stock section | `apps/commerce/src/admin/components/design-stock.tsx`, shown in the Design panel; text under `shopStock` in `src/admin/i18n/json/en.json` |
| Tests | `packages/contracts/src/stock.test.ts`, `apps/commerce/src/lib/__tests__/stock-lock.test.ts`, `apps/commerce/integration-tests/http/stock.spec.ts`, admin smoke `apps/commerce/e2e/designs.spec.ts` |

## The stock location

There is one stock location, India (address country `IN`), and never a second. `db:migrate` runs the seed, which is idempotent:

1. An India location is kept as it is.
2. Otherwise the oldest existing location becomes India (renamed, address set to country `IN`, other address fields cleared). On a database seeded from the starter this is "European Warehouse", so its links and the demo products' levels stay and no location is added. With no location at all, India is created. Any other location left over is logged as a warning and not used.
3. India is linked to the store's default sales channel. It is not linked to a fulfilment set: the kernel does not need one for stock levels, and the India shipping option is Story 1.8's.
4. Backfill: every existing Design's Variant gets `manage_inventory: true`, one inventory item (created and linked if it has none) and a level at India with 0 stocked, where any of these is missing.

`create-design` (Story 1.6) does the same for each new Design: its Variant is created with `manage_inventory: true`, the kernel creates and links its inventory item, and the step `ensure-variant-stock` adds the level at India with 0 stocked. If a later step fails, the level (and anything else that step created) is removed. Creating a Design fails with `internal` if the India location has not been seeded.

## The stock lock

`acquireStockLocksStep({ inventoryItemIds, timeoutMs? })` and `releaseStockLocksStep(locks)` (or `withStockLocks(container, ids, fn, options)` outside a workflow) wrap the kernel's locking module on Redis:

- One key per inventory item, `shop-stock:<inventoryItemId>`, without repeats and sorted, so two workflows locking several items never wait on each other in a circle.
- Each acquisition has its own owner id, so only it can release its keys. A key held by another owner is retried every 50 ms until the time limit (`STOCK_LOCK_TIMEOUT_MS`, 5 s); then the keys already taken are released and the step fails with `stock.lock_timeout`. A lock lives 30 s (`STOCK_LOCK_TTL_SECONDS`) if its holder dies without releasing it.
- If a later step fails, the acquire step's compensation releases the keys after the later steps are undone. The release step never fails: a lock that cannot be released expires by itself, and a failed release must not undo a change already recorded.

## `adjust-stock`

Input: the Variant, either `set` (an absolute target, "set to 10") or `delta` (a signed change, "+1"), the reason and the admin's email.

1. Find the Variant's inventory item and its level at India (`internal` if either is missing).
2. Take the stock lock on the inventory item.
3. Read stocked and reserved, and resolve the target against them: `set` as given, or stocked + `delta`. A result below 0 (or above the limit) is refused with `stock.invalid_quantity`, one below reserved with `stock.below_reserved`. Nothing has changed yet.
4. Set the stocked quantity (the kernel's `updateInventoryLevelsStep`, whose compensation restores the earlier quantity).
5. Write one stock-movement row with cause `manual_adjustment`. If the row cannot be written, step 4's compensation restores the quantity and the route answers 500 `internal`.
6. Release the lock.

A target equal to the current quantity changes nothing and writes no row. Two adjustments at the same moment run one after the other under the lock, so two "+1" raise the count by 2 and write two rows.

## Stock-movement rows

`stock_movement`: `{ id, inventory_item_id, variant_id, cause, change, stocked_after, reserved_after, actor, reason, occurred_at }`, indexed on `(variant_id, occurred_at)`. `change` is signed; `actor` is the admin's email for a manual adjustment; `cause` is one of `manual_adjustment`, `checkout_hold`, `payment_confirmed`, `hold_released`, `fulfilled`, `order_cancelled`, `return_restocked` (one per stock workflow; only the first is written so far).

Rows are only inserted. The module's service is deliberately not a `MedusaService` (which would generate update and delete methods): it has `record` and `listForVariant` only, and no route updates or deletes a row. A stock workflow writes its row as its last write and gives it no compensation, so a failure before or at the row restores the quantities instead.

## Routes

Under `/admin/shop`, so they accept only a signed-in admin's session cookie, and a write must come from an admin origin (`request.cross_origin` otherwise), as in `docs/designs.md`.

| Route | Body | Answer |
| --- | --- | --- |
| `GET /admin/shop/designs/:id/stock` | | `AdminDesignStockResponse`: `stock` (`stocked`, `reserved`, `available`) and `movements`, newest first; 404 `design.not_found` |
| `POST /admin/shop/designs/:id/stock` | `AdjustStockInput`: `{ set, reason }` or `{ delta, reason }` | `AdminDesignStockResponse` after the change; 400 `input.invalid` (no reason, a reason over 200 characters, both or neither of `set` and `delta`, a change of 0, an unknown field), 400 `stock.invalid_quantity`, 409 `stock.below_reserved`, 409 `stock.lock_timeout`, 404 `design.not_found`, 500 `internal` |

## The Admin

The Design panel has a Stock section once the Design is saved: In stock, Held for shoppers and Available; a required reason; "Set stock" with a number of Pieces, and "Add 1 piece" and "Remove 1 piece". The count itself is never an editable field. The reason and the target are checked in the browser before anything is sent. The history lists every row newest first with time, cause, change, the count after it, who made it and the reason. A refused change shows the error's text and reloads the count.

## Running it locally

- `pnpm --filter @shop/commerce exec medusa db:migrate` creates `stock_movement` and runs the seed and backfill.
- Integration tests: `DB_USERNAME=postgres DB_PASSWORD=postgres REDIS_URL=redis://localhost:6379/9 pnpm --filter @shop/commerce test:integration`. The stock suite needs no file storage (its Designs have no photos); the lock-timeout test waits the full 5 s limit.
- The admin smoke (`docs/designs.md`) also sets the published Design's stock to 10 with a reason, checks the row, and saves `docs/screenshots/admin-design-stock.png`.
