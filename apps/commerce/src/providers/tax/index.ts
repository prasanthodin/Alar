import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import ShopTaxProvider from "./service"

/** Registered as `tp_shop_shop` (identifier `shop`, id `shop` in medusa-config). */
export const SHOP_TAX_PROVIDER_ID = "tp_shop_shop"

export default ModuleProvider(Modules.TAX, {
  services: [ShopTaxProvider],
})
