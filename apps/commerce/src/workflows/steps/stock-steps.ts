import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { resolveStockTarget, type StockMovementCause } from "@shop/contracts"
import { shopError } from "../../lib/shop-errors"
import {
  ensureVariantStock,
  loadStockTarget,
  readStockLevel,
  shopStockLocationId,
  undoEnsureVariantStock,
  type EnsuredVariantStock,
  type StockTarget,
} from "../../lib/stock"
import { STOCK_LEDGER_MODULE, type StockLedgerModuleService } from "../../modules/stock-ledger"

/** Reads where a Variant's stock is kept (its inventory item at the India location). Reads only. */
export const loadStockTargetStep = createStep("load-stock-target", async (input: { variantId: string }, { container }) => {
  return new StepResponse<StockTarget>(await loadStockTarget(container, input.variantId))
})

/**
 * Gives a Variant its stock record at the India location where it is missing
 * (`manage_inventory`, one inventory item, a level with 0 stocked); undone by
 * removing what it created.
 */
export const ensureVariantStockStep = createStep(
  "ensure-variant-stock",
  async (input: { variantId: string }, { container }) => {
    const locationId = await shopStockLocationId(container)
    const done = await ensureVariantStock(container, input.variantId, locationId)
    return new StepResponse({ inventoryItemId: done.inventoryItemId, locationId }, { variantId: input.variantId, done })
  },
  async (undo: { variantId: string; done: EnsuredVariantStock } | undefined, { container }) => {
    if (!undo) return
    await undoEnsureVariantStock(container, undo.variantId, undo.done)
  }
)

export type CheckStockAdjustmentInput = {
  target: StockTarget
  set?: number
  delta?: number
}

/** The checked adjustment: the quantities now, the stocked quantity it leads to and the signed change. */
export type CheckedStockAdjustment = {
  stockedBefore: number
  reserved: number
  stockedAfter: number
  change: number
}

/**
 * Reads the stocked and reserved quantities (run it under the stock lock)
 * and resolves `set` or `delta` against them. Refuses a result below 0 with
 * `stock.invalid_quantity` and one below what is reserved with
 * `stock.below_reserved`. Reads only.
 */
export const checkStockAdjustmentStep = createStep(
  "check-stock-adjustment",
  async (input: CheckStockAdjustmentInput, { container }) => {
    const { stocked, reserved } = await readStockLevel(container, input.target)
    const resolved = resolveStockTarget({ stocked, reserved }, { set: input.set, delta: input.delta })
    if (!resolved.ok) {
      const details = { stocked, reserved, ...(input.set !== undefined ? { set: input.set } : { delta: input.delta }) }
      throw resolved.code === "stock.below_reserved"
        ? shopError("stock.below_reserved", "Stock cannot go below the reserved quantity", details)
        : shopError("stock.invalid_quantity", "Stock must be a whole number of Pieces, 0 or more", details)
    }
    return new StepResponse<CheckedStockAdjustment>({
      stockedBefore: stocked,
      reserved,
      stockedAfter: resolved.stocked,
      change: resolved.change,
    })
  }
)

export type RecordStockMovementStepInput = {
  target: StockTarget
  cause: StockMovementCause
  change: number
  stockedAfter: number
  reservedAfter: number
  actor: string
  reason: string
}

/**
 * Writes one stock-movement row (AD-6). Rows are only inserted, so it has no
 * compensation: it is the last write of a stock workflow, and if it fails the
 * earlier steps' compensations restore the quantities.
 */
export const recordStockMovementStep = createStep(
  "record-stock-movement",
  async (input: RecordStockMovementStepInput, { container }) => {
    const ledger = container.resolve<StockLedgerModuleService>(STOCK_LEDGER_MODULE)
    const row = await ledger.record({
      inventoryItemId: input.target.inventoryItemId,
      variantId: input.target.variantId,
      cause: input.cause,
      change: input.change,
      stockedAfter: input.stockedAfter,
      reservedAfter: input.reservedAfter,
      actor: input.actor,
      reason: input.reason,
    })
    return new StepResponse({ id: row.id })
  }
)
