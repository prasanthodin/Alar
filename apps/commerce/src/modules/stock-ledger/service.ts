import type { InferTypeOf, ModulesSdkTypes } from "@medusajs/framework/types"
import { STOCK_HISTORY_DEFAULT_LIMIT, STOCK_HISTORY_MAX_LIMIT, type StockMovementCause } from "@shop/contracts"
import { StockMovement } from "./models/stock-movement"

/** A stored stock-movement row. */
export type StockMovementRow = InferTypeOf<typeof StockMovement>

/** One stock change to record (AD-6). Quantities are whole Pieces; `change` is signed. */
export type RecordStockMovementInput = {
  inventoryItemId: string
  variantId: string
  cause: StockMovementCause
  change: number
  stockedAfter: number
  reservedAfter: number
  /** Who made the change: an admin's email for a manual adjustment, a system name otherwise. */
  actor: string
  /** The admin user id behind `actor`, or null for a system row. */
  actorId?: string | null
  reason: string
  /** The client's id of the change; unique, so the same change is never recorded twice. */
  requestId?: string | null
  occurredAt?: Date
}

/** A page of a Variant's history: at most `limit` rows, newest first, after the row at `before`. */
export type StockHistoryPage = {
  rows: StockMovementRow[]
  /** True when older rows follow the last one. */
  more: boolean
}

type InjectedDependencies = {
  stockMovementService: ModulesSdkTypes.IMedusaInternalService<typeof StockMovement>
}

/**
 * The stock ledger: append-only stock-movement rows. It exposes `record`,
 * `findByRequestId` and `listForVariant` only, and a database trigger
 * refuses any UPDATE or DELETE of a row. Rows are written only by the stock
 * workflows (AD-6), inside the stock lock. Deliberately not a
 * `MedusaService`, which would generate update and delete methods.
 */
export default class StockLedgerModuleService {
  protected readonly movements_: InjectedDependencies["stockMovementService"]

  constructor({ stockMovementService }: InjectedDependencies) {
    this.movements_ = stockMovementService
  }

  /** Inserts one row and returns it. A `requestId` already recorded fails on the unique index. */
  async record(input: RecordStockMovementInput): Promise<StockMovementRow> {
    const created = await this.movements_.create({
      inventory_item_id: input.inventoryItemId,
      variant_id: input.variantId,
      cause: input.cause,
      change: input.change,
      stocked_after: input.stockedAfter,
      reserved_after: input.reservedAfter,
      actor: input.actor,
      actor_id: input.actorId ?? null,
      reason: input.reason,
      request_id: input.requestId ?? null,
      occurred_at: input.occurredAt ?? new Date(),
    })
    return created as unknown as StockMovementRow
  }

  /** The row recorded for a client's request id, or null. */
  async findByRequestId(requestId: string): Promise<StockMovementRow | null> {
    const [row] = await this.movements_.list({ request_id: requestId }, { take: 1 })
    return (row as unknown as StockMovementRow | undefined) ?? null
  }

  /**
   * One page of a Variant's rows, newest first (by `occurred_at`, then `id`):
   * at most `limit` (default 50, at most 200), after the row at `before`.
   */
  async listForVariant(
    variantId: string,
    page: { limit?: number; before?: { occurredAt: Date; id: string } } = {}
  ): Promise<StockHistoryPage> {
    const limit = Math.min(Math.max(1, page.limit ?? STOCK_HISTORY_DEFAULT_LIMIT), STOCK_HISTORY_MAX_LIMIT)
    const after = page.before
      ? {
          $or: [
            { occurred_at: { $lt: page.before.occurredAt } },
            { occurred_at: page.before.occurredAt, id: { $lt: page.before.id } },
          ],
        }
      : {}
    const rows = await this.movements_.list(
      { variant_id: variantId, ...after } as never,
      { order: { occurred_at: "DESC", id: "DESC" }, take: limit + 1 }
    )
    return { rows: rows.slice(0, limit) as unknown as StockMovementRow[], more: rows.length > limit }
  }
}
