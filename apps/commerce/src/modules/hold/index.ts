import { Module } from "@medusajs/framework/utils"
import HoldModuleService from "./service"

/** Container key of the hold module. */
export const HOLD_MODULE = "shopHold"

export default Module(HOLD_MODULE, {
  service: HoldModuleService,
})

export type { default as HoldModuleService } from "./service"
