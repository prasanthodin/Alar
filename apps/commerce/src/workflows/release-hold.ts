import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { acquireStockLocksStep, releaseStockLocksStep, STOCK_LOCK_TIMEOUT_MS } from "../lib/stock-lock"
import { endHoldStep, loadHoldStep, removeHoldReservationsStep } from "./steps/checkout-steps"
import { recordStockMovementsStep, type StockMovementRowInput } from "./steps/stock-steps"

/** Why a Hold ends: the Shopper cancelled checkout, or its time ran out (the scheduled job). */
export type ReleaseHoldReason = "cancelled" | "expired"

export type ReleaseHoldWorkflowInput = {
  holdId: string
  reason: ReleaseHoldReason
  /** How long to wait for the stock lock; default `STOCK_LOCK_TIMEOUT_MS`. */
  lockTimeoutMs?: number
}

/** What `release-hold` answers: whether this run ended the Hold (false when it was no longer live). */
export type ReleaseHoldResult = { holdId: string; checkoutId: string | null; released: boolean }

/** The stock-movement rows' actor: the workflow, not a person. */
export const RELEASE_HOLD_ACTOR = "system:release-hold"

/**
 * Ends a live Hold (Story 1.9, FR-19, FR-16; AD-6): when the Shopper cancels
 * checkout (`cancelled`: the Hold is `released`, the Checkout `cancelled`)
 * or when the scheduled job finds it past its expiry (`expired`: both
 * `expired`). Under the stock lock on the inventory items of the Hold's
 * reservations, it removes the reservations, ends the Hold and its Checkout
 * and, last, writes one `hold_released` stock-movement row per reservation;
 * the Bag can then be changed again. A Hold that is no longer live (or, for
 * `expired`, not yet past its expiry) is left alone, so running it twice,
 * or a cancel racing the job, changes nothing the second time.
 */
export const releaseHoldWorkflow = createWorkflow("release-hold", (input: ReleaseHoldWorkflowInput) => {
  const hold = loadHoldStep(transform({ input }, ({ input }) => ({ holdId: input.holdId })))

  const locks = acquireStockLocksStep(
    transform({ input, hold }, ({ input, hold }) => ({
      inventoryItemIds: hold.inventoryItemIds,
      timeoutMs: input.lockTimeoutMs ?? STOCK_LOCK_TIMEOUT_MS,
    }))
  )

  const removed = removeHoldReservationsStep(
    transform({ input }, ({ input }) => ({ holdId: input.holdId, reason: input.reason }))
  )

  when("hold-released", { removed }, ({ removed }) => removed.released && removed.checkoutId !== null).then(() => {
    endHoldStep(
      transform({ input, removed }, ({ input, removed }) => ({
        holdId: input.holdId,
        checkoutId: removed.checkoutId!,
        reason: input.reason,
      }))
    )
    recordStockMovementsStep(
      transform({ input, removed }, ({ input, removed }) =>
        removed.removed.map(
          (r): StockMovementRowInput => ({
            inventoryItemId: r.inventoryItemId,
            variantId: r.variantId,
            cause: "hold_released",
            change: -r.quantity,
            stockedAfter: r.stockedAfter,
            reservedAfter: r.reservedAfter,
            actor: RELEASE_HOLD_ACTOR,
            actorId: null,
            reason:
              input.reason === "cancelled"
                ? `Checkout ${removed.checkoutId} cancelled (hold ${input.holdId})`
                : `Hold ${input.holdId} expired (checkout ${removed.checkoutId})`,
            requestId: `${input.holdId}:release:${r.reservationId}`,
          })
        )
      )
    )
  })

  releaseStockLocksStep(locks)

  return new WorkflowResponse(
    transform({ input, removed }, ({ input, removed }): ReleaseHoldResult => ({
      holdId: input.holdId,
      checkoutId: removed.checkoutId,
      released: removed.released && removed.checkoutId !== null,
    }))
  )
})
