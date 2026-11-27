import { Module } from "@medusajs/framework/utils"
import PriceHistoryModuleService from "./service"

/** Container key of the price history module. */
export const PRICE_HISTORY_MODULE = "priceHistory"

export default Module(PRICE_HISTORY_MODULE, {
  service: PriceHistoryModuleService,
})

export type { default as PriceHistoryModuleService } from "./service"
