import { MedusaService } from "@medusajs/framework/utils"
import { Checkout } from "./models/checkout"

/**
 * Checkouts (Story 1.9). Written only by the `begin-checkout` and
 * `release-hold` workflows; the snapshot is checked against
 * `CheckoutSnapshot` by the code that writes and reads it.
 */
export default class CheckoutModuleService extends MedusaService({ Checkout }) {}
