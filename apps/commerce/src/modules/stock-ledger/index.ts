import { Module } from "@medusajs/framework/utils"
import StockLedgerModuleService from "./service"

/** Container key of the stock ledger module. */
export const STOCK_LEDGER_MODULE = "stockLedger"

export default Module(STOCK_LEDGER_MODULE, {
  service: StockLedgerModuleService,
})

export type { default as StockLedgerModuleService } from "./service"
export type { RecordStockMovementInput, StockMovementRow } from "./service"
