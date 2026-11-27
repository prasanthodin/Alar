import { Module } from "@medusajs/framework/utils"
import CheckoutModuleService from "./service"

/** Container key of the checkout module (not `checkout`, to stay clear of kernel names). */
export const CHECKOUT_MODULE = "shopCheckout"

export default Module(CHECKOUT_MODULE, {
  service: CheckoutModuleService,
})

export type { default as CheckoutModuleService } from "./service"
