import type { InferTypeOf, ModulesSdkTypes } from "@medusajs/framework/types"
import type { StockMovementCause } from "@shop/contracts"
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
  /** Who made the change: an admin's email for a manual adjustment. */
  actor: string
  reason: string
  occurredAt?: Date
}

type InjectedDependencies = {
  stockMovementService: ModulesSdkTypes.IMedusaInternalService<typeof StockMovement>
}

/**
 * The stock ledger: append-only stock-movement rows. It exposes `record`
 * and `listForVariant` only; nothing in the shop can edit or delete a row.
 * Rows are written only by the stock workflows (AD-6), inside the stock lock.
 * Deliberately not a `MedusaService`, which would generate update and delete
 * methods.
 */
export default class StockLedgerModuleService {
  protected readonly movements_: InjectedDependencies["stockMovementService"]

  constructor({ stockMovementService }: InjectedDependencies) {
    this.movements_ = stockMovementService
  }

  /** Inserts one row and returns it. */
  async record(input: RecordStockMovementInput): Promise<StockMovementRow> {
    const created = await this.movements_.create({
      inventory_item_id: input.inventoryItemId,
      variant_id: input.variantId,
      cause: input.cause,
      change: input.change,
      stocked_after: input.stockedAfter,
      reserved_after: input.reservedAfter,
      actor: input.actor,
      reason: input.reason,
      occurred_at: input.occurredAt ?? new Date(),
    })
    return created as unknown as StockMovementRow
  }

  /** Every row of one Variant, newest first. */
  async listForVariant(variantId: string): Promise<StockMovementRow[]> {
    const rows = await this.movements_.list(
      { variant_id: variantId },
      { order: { occurred_at: "DESC", created_at: "DESC", id: "DESC" } }
    )
    return rows as unknown as StockMovementRow[]
  }
}
