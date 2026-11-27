import { z } from "zod"
import { Id, IsoDateTime } from "./common"

// ---------------------------------------------------------------------------
// Stock in Pieces (Story 1.7, FR-36; AD-6). A Variant's stock is counted in
// whole Pieces at the shop's one stock location: available = stocked -
// reserved. Every change is one stock-movement row, only ever inserted.
// ---------------------------------------------------------------------------

/** The most Pieces one Variant may have stocked, and the largest single change. */
export const MAX_STOCK_PIECES = 100_000

/** A number of whole Pieces, 0 or more. */
export const Pieces = z.number().int().nonnegative()
export type Pieces = z.infer<typeof Pieces>

/**
 * Why a stock count changed. Each stock workflow (AD-6) writes its own cause:
 * `manual_adjustment` (`adjust-stock`, Story 1.7), `checkout_hold`
 * (`begin-checkout`), `payment_confirmed` (`confirm-payment`), `hold_released`
 * (`release-hold`), `fulfilled` (`fulfil-order`), `order_cancelled`
 * (`cancel-order`) and `return_restocked` (`restock-return`).
 */
export const StockMovementCause = z.enum([
  "manual_adjustment",
  "checkout_hold",
  "payment_confirmed",
  "hold_released",
  "fulfilled",
  "order_cancelled",
  "return_restocked",
])
export type StockMovementCause = z.infer<typeof StockMovementCause>

/** The reason the Owner types for a change: 1 to 200 characters after trimming. */
export const StockReason = z.string().trim().min(1).max(200)
export type StockReason = z.infer<typeof StockReason>

/**
 * `POST /admin/shop/designs/:id/stock`: either an absolute target (`set`,
 * "set to 10") or a signed change (`delta`, "+1", never 0), never both, with
 * the reason. Both are resolved inside the stock lock against the stocked
 * quantity at that moment.
 */
export const AdjustStockInput = z
  .strictObject({
    set: Pieces.max(MAX_STOCK_PIECES).optional(),
    delta: z
      .number()
      .int()
      .min(-MAX_STOCK_PIECES)
      .max(MAX_STOCK_PIECES)
      .refine((n) => n !== 0, { message: "A change of 0 changes nothing" })
      .optional(),
    reason: StockReason,
  })
  .refine((v) => (v.set === undefined) !== (v.delta === undefined), {
    message: "Send either set or delta",
  })
export type AdjustStockInput = z.infer<typeof AdjustStockInput>

/** A Variant's stock at the shop's stock location. `available` is `stocked - reserved` (AD-6). */
export const VariantStockView = z
  .object({
    variantId: Id,
    inventoryItemId: Id,
    stocked: Pieces,
    reserved: Pieces,
    available: Pieces,
  })
  .refine((v) => v.available === Math.max(0, v.stocked - v.reserved), {
    message: "available must be stocked - reserved",
  })
export type VariantStockView = z.infer<typeof VariantStockView>

/**
 * One stock-movement row: what changed one Variant's stock, by how much
 * (`change`, signed), the counts after it, who did it (an admin's email for
 * a manual adjustment) and why. Rows are only inserted, never edited.
 */
export const StockMovementView = z.object({
  id: Id,
  inventoryItemId: Id,
  variantId: Id,
  cause: StockMovementCause,
  change: z.number().int(),
  stockedAfter: Pieces,
  reservedAfter: Pieces,
  actor: z.string().min(1),
  reason: z.string(),
  occurredAt: IsoDateTime,
})
export type StockMovementView = z.infer<typeof StockMovementView>

/** `GET /admin/shop/designs/:id/stock` and the answer of an adjustment: the stock and its history, newest first. */
export const AdminDesignStockResponse = z.object({
  stock: VariantStockView,
  movements: z.array(StockMovementView),
})
export type AdminDesignStockResponse = z.infer<typeof AdminDesignStockResponse>

/** `available = stocked - reserved`, never below 0. */
export function availablePieces(stocked: number, reserved: number): number {
  return Math.max(0, stocked - reserved)
}

export type StockTarget =
  | { ok: true; stocked: number; change: number }
  | { ok: false; code: "stock.invalid_quantity" | "stock.below_reserved" }

/**
 * The stocked quantity an adjustment leads to, from the current stocked and
 * reserved quantities: `set` as given, or the current quantity plus `delta`.
 * Refuses a result below 0 or above `MAX_STOCK_PIECES` with
 * `stock.invalid_quantity`, and a result below what is reserved with
 * `stock.below_reserved`.
 */
export function resolveStockTarget(
  current: { stocked: number; reserved: number },
  input: { set?: number; delta?: number }
): StockTarget {
  const stocked = input.set !== undefined ? input.set : current.stocked + (input.delta ?? 0)
  if (!Number.isSafeInteger(stocked) || stocked < 0 || stocked > MAX_STOCK_PIECES) {
    return { ok: false, code: "stock.invalid_quantity" }
  }
  if (stocked < current.reserved) return { ok: false, code: "stock.below_reserved" }
  return { ok: true, stocked, change: stocked - current.stocked }
}
