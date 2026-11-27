import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DesignPreviewLink, type ApiError } from "@shop/contracts"
import { readEnv, storefrontUrl } from "../../../../../../env"
import { loadDesign } from "../../../../../../lib/designs"
import { signPreviewToken } from "../../../../../../lib/preview-token"
import { sendShopError } from "../../../../../../lib/shop-errors"

/**
 * POST /admin/shop/designs/:id/preview: a signed link to the Design's page on
 * the website, which shows it as a Shopper would see it even while it is
 * unpublished, for one hour (Story 1.8). 404 `design.not_found`. The website
 * shows a Design only once it has a price and a photo.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<DesignPreviewLink | ApiError>) {
  try {
    const record = await loadDesign(req.scope, req.params.id!)
    const env = readEnv()
    const { token, expiresAt } = signPreviewToken(record.view.id, env.PREVIEW_TOKEN_SECRET)
    const url = `${storefrontUrl(env)}/designs/${encodeURIComponent(record.handle)}?preview=${encodeURIComponent(token)}`
    res.set("Cache-Control", "no-store")
    res.json(DesignPreviewLink.parse({ url, expiresAt: expiresAt.toISOString() }))
  } catch (e) {
    sendShopError(res, e)
  }
}
