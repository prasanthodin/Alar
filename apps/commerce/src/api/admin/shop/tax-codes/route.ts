import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TaxCodeList } from "@shop/contracts"
import { SETTINGS_MODULE } from "../../../../modules/settings"
import type SettingsModuleService from "../../../../modules/settings/service"

/** GET /admin/shop/tax-codes: the tax codes with a band in effect now (`TaxCodeList`), for the Design form. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse<TaxCodeList>) {
  const settings = req.scope.resolve<SettingsModuleService>(SETTINGS_MODULE)
  res.json(TaxCodeList.parse({ taxCodes: await settings.listTaxCodes() }))
}
