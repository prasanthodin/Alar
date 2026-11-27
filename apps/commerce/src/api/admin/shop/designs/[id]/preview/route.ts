import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DesignPreviewLink, type ApiError, type PublishRequirement } from "@shop/contracts"
import { readEnv, storefrontUrl } from "../../../../../../env"
import { loadDesign } from "../../../../../../lib/designs"
import { signPreviewToken } from "../../../../../../lib/preview-token"
import { sendEnvelope, sendShopError } from "../../../../../../lib/shop-errors"

/**
 * POST /admin/shop/designs/:id/preview: a signed link to the Design's page on
 * the website, which shows it as a Shopper would see it even while it is
 * unpublished, for one hour (Story 1.8). 404 `design.not_found`. The website
 * shows a Design only once it has a price and a photo, so without them it is
 * 400 `design.not_publishable` with `details.missing` naming what to add. The
 * link cannot be revoked; it stops working when it expires or when
 * PREVIEW_TOKEN_SECRET is rotated.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<DesignPreviewLink | ApiError>) {
  try {
    const record = await loadDesign(req.scope, req.params.id!)
    const missing: PublishRequirement[] = []
    if (record.view.pricePaise === null) missing.push("shelfPrice")
    if (record.view.photos.length === 0) missing.push("otherPhoto")
    if (missing.length) {
      return sendEnvelope(res, {
        code: "design.not_publishable",
        message: "A preview needs a price and at least one photo",
        details: { missing },
      })
    }
    const env = readEnv()
    const { token, expiresAt } = signPreviewToken(record.view.id, env.PREVIEW_TOKEN_SECRET)
    const url = `${storefrontUrl(env)}/designs/${encodeURIComponent(record.handle)}?preview=${encodeURIComponent(token)}`
    // The token is in the link: never cached, never sent on as a referrer.
    res.set("Cache-Control", "private, no-store")
    res.set("Referrer-Policy", "no-referrer")
    res.json(DesignPreviewLink.parse({ url, expiresAt: expiresAt.toISOString() }))
  } catch (e) {
    sendShopError(res, e)
  }
}
