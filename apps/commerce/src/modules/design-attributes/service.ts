import { MedusaService } from "@medusajs/framework/utils"
import { DesignAttributes } from "./models/design-attributes"

/**
 * The typed attributes of Designs. Written only by the shop's Design
 * workflows (`create-design`, `update-design`, `publish-design`).
 */
export default class DesignAttributesModuleService extends MedusaService({ DesignAttributes }) {}
