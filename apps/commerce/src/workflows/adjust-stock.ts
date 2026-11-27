import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateInventoryLevelsStep } from "@medusajs/medusa/core-flows"
import { acquireStockLocksStep, releaseStockLocksStep, STOCK_LOCK_TIMEOUT_MS } from "../lib/stock-lock"
import { checkStockAdjustmentStep, loadStockTargetStep, recordStockMovementStep } from "./steps/stock-steps"

export type AdjustStockWorkflowInput = {
  /** The Variant whose stock changes. */
  variantId: string
  /** An absolute target in Pieces ("set to 10"); exactly one of `set` and `delta`. */
  set?: number
  /** A signed change in Pieces ("+1"); exactly one of `set` and `delta`. */
  delta?: number
  /** Why the Owner changes it (1 to 200 characters, checked by the route). */
  reason: string
  /** The admin's email, recorded as the row's actor. */
  actor: string
  /** The admin's user id, recorded next to the email. */
  actorId?: string
  /** The client's id of this change (a UUID); a resent request with it is not applied again. */
  requestId?: string
  /** How long to wait for the stock lock; default `STOCK_LOCK_TIMEOUT_MS`. */
  lockTimeoutMs?: number
}

/** What `adjust-stock` answers: the stock after it (the quantity now, for a replayed request). */
export type AdjustStockResult = {
  variantId: string
  inventoryItemId: string
  stocked: number
  reserved: number
  change: number
  replayed: boolean
}

/**
 * The Owner's manual stock change (Story 1.7, FR-36; AD-6), the only way a
 * stock count is edited by hand. Under the stock lock on the Variant's
 * inventory item it reads the stocked and reserved quantities at the India
 * location, resolves `set` or `delta` against them, refuses a result below 0
 * (`stock.invalid_quantity`) or below reserved (`stock.below_reserved`),
 * sets the stocked quantity (core step) and writes one stock-movement row
 * with cause `manual_adjustment`. If the row cannot be written, the core
 * step's compensation restores the earlier quantity. A lock it cannot take in
 * time refuses with `stock.lock_timeout` and changes nothing. A result equal
 * to the current quantity changes nothing and writes no row. A `requestId`
 * already recorded (a resent request) changes nothing and answers with the
 * stock as it is; the row's unique index backs this up.
 */
export const adjustStockWorkflow = createWorkflow("adjust-stock", (input: AdjustStockWorkflowInput) => {
  const target = loadStockTargetStep({ variantId: input.variantId })

  const lockInput = transform({ input, target }, ({ input, target }) => ({
    inventoryItemIds: [target.inventoryItemId],
    timeoutMs: input.lockTimeoutMs ?? STOCK_LOCK_TIMEOUT_MS,
  }))
  const locks = acquireStockLocksStep(lockInput)

  const checked = checkStockAdjustmentStep(
    transform({ input, target }, ({ input, target }) => ({
      target,
      set: input.set,
      delta: input.delta,
      requestId: input.requestId,
    }))
  )

  const changed = transform({ checked }, ({ checked }) => !checked.replayed && checked.change !== 0)
  when("stock-changed", { changed }, ({ changed }) => changed).then(() => {
    const levelUpdate = transform({ target, checked }, ({ target, checked }) => [
      {
        inventory_item_id: target.inventoryItemId,
        location_id: target.locationId,
        stocked_quantity: checked.stockedAfter,
      },
    ])
    updateInventoryLevelsStep(levelUpdate)

    const row = transform({ input, target, checked }, ({ input, target, checked }) => ({
      target,
      cause: "manual_adjustment" as const,
      change: checked.change,
      stockedAfter: checked.stockedAfter,
      reservedAfter: checked.reserved,
      actor: input.actor,
      actorId: input.actorId ?? null,
      reason: input.reason,
      requestId: input.requestId ?? null,
    }))
    recordStockMovementStep(row)
  })
  releaseStockLocksStep(locks)

  return new WorkflowResponse(
    transform({ target, checked }, ({ target, checked }): AdjustStockResult => ({
      variantId: target.variantId,
      inventoryItemId: target.inventoryItemId,
      stocked: checked.stockedAfter,
      reserved: checked.reserved,
      change: checked.change,
      replayed: checked.replayed,
    }))
  )
})
