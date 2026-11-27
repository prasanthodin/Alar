import { MedusaService } from "@medusajs/framework/utils"
import { Hold } from "./models/hold"

/**
 * Holds (Story 1.9). Written only by the `begin-checkout` and
 * `release-hold` workflows, under the stock lock.
 */
export default class HoldModuleService extends MedusaService({ Hold }) {}
