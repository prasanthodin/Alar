import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ShopPublicView } from "@shop/contracts"
import { SETTINGS_MODULE } from "../../../../modules/settings"
import type SettingsModuleService from "../../../../modules/settings/service"

/**
 * GET /store/shop/settings: what the website and app may know about the shop
 * (`ShopPublicView`), read from the settings in effect now. A shop route, so
 * not on the kernel route allow-list.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse<ShopPublicView>) {
  const settings = req.scope.resolve<SettingsModuleService>(SETTINGS_MODULE)
  const view = ShopPublicView.parse({ name: await settings.getValue("shop.name") })
  // Public and the same for everyone; a rename shows within a minute.
  res.set("Cache-Control", "public, max-age=60")
  res.json(view)
}
