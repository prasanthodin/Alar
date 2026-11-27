import type { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ApiError, DesignCard } from "@shop/contracts"
import { sendShopErrorOrInternal } from "../../../../lib/shop-errors"
import { listStoreDesigns, toDesignCard } from "../../../../lib/store-catalogue"

/**
 * GET /store/shop/designs: the published Designs in the publishable key's
 * sales channels, newest first, as `DesignCard`s with their availability
 * (Story 1.8). No filters and no search in Epic 1. Anonymous: a shop route,
 * so not on the kernel allow-list; the kernel still requires the publishable key.
 */
export async function GET(req: MedusaStoreRequest, res: MedusaResponse<{ designs: DesignCard[] } | ApiError>) {
  try {
    const designs = await listStoreDesigns(req.scope, req.publishable_key_context?.sales_channel_ids ?? [])
    res.json({ designs: designs.map(toDesignCard) })
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}
