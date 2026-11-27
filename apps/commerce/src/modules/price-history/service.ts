import { MedusaService } from "@medusajs/framework/utils"
import { PriceHistory } from "./models/price-history"

/**
 * Variant price history. Rows are written only by the price step of the
 * shop's Design workflows (`record-price-change`), whose compensation is the
 * only delete.
 */
export default class PriceHistoryModuleService extends MedusaService({ PriceHistory }) {}
