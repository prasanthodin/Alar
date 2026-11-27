import type { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ApiError, BagView } from "@shop/contracts"
import { loadBag } from "../../../../../lib/bag"
import { sendShopErrorOrInternal } from "../../../../../lib/shop-errors"

/**
 * GET /store/shop/bag/:cartId: the Shopper's Bag (`BagView`), with line
 * totals, the four price lines and the delivery charge computed on the server
 * (Story 1.8). 404 `bag.not_found` for an unknown or completed cart, and for
 * one that is not in rupees, not in the India region or not in one of the
 * publishable key's sales channels. The cart id is the Bag's only key, as on
 * the kernel's own cart routes.
 */
export async function GET(req: MedusaStoreRequest, res: MedusaResponse<{ bag: BagView } | ApiError>) {
  try {
    const bag = await loadBag(req.scope, req.params.cartId!, req.publishable_key_context?.sales_channel_ids ?? [])
    res.set("Cache-Control", "private, no-store")
    res.json({ bag })
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}
