import type { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ApiError, DesignView } from "@shop/contracts"
import { readEnv } from "../../../../../env"
import { sendShopErrorOrInternal } from "../../../../../lib/shop-errors"
import { loadStoreDesign, toDesignView } from "../../../../../lib/store-catalogue"

/**
 * GET /store/shop/designs/:handle[?preview=<token>]: one Design as its page
 * shows it (`DesignView`), with availability computed on the server. An
 * unpublished Design is 404 `design.not_found` unless the request carries a
 * valid, unexpired preview token for it from the Admin (Story 1.8).
 */
export async function GET(req: MedusaStoreRequest, res: MedusaResponse<{ design: DesignView } | ApiError>) {
  try {
    const preview = typeof req.query.preview === "string" ? req.query.preview : undefined
    const { design, preview: previewInfo } = await loadStoreDesign(req.scope, req.params.handle!, {
      salesChannelIds: req.publishable_key_context?.sales_channel_ids ?? [],
      previewToken: preview,
      previewSecret: readEnv().PREVIEW_TOKEN_SECRET,
    })
    // A request with a token (even for a published Design) is never cached or sent on as a referrer.
    if (preview !== undefined) {
      res.set("Cache-Control", "private, no-store")
      res.set("Referrer-Policy", "no-referrer")
    }
    res.json({ design: toDesignView(design, previewInfo) })
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}
