import { Module } from "@medusajs/framework/utils"
import DesignAttributesModuleService from "./service"

/** Container key of the Design attributes module. */
export const DESIGN_ATTRIBUTES_MODULE = "designAttributes"

export default Module(DESIGN_ATTRIBUTES_MODULE, {
  service: DesignAttributesModuleService,
})

export type { default as DesignAttributesModuleService } from "./service"
