import type { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ApiError, BagView } from "@shop/contracts"
import { loadBag } from "../../../../../lib/bag"
import { sendShopErrorOrInternal } from "../../../../../lib/shop-errors"

/**
 * GET /store/shop/bag/:cartId: the Shopper's Bag (`BagView`), with line
 * totals, the four price lines and the delivery charge computed on the server
 * (Story 1.8). 404 `bag.not_found` for an unknown or completed cart. The cart
 * id is the Bag's only key, as on the kernel's own cart routes.
 */
export async function GET(req: MedusaStoreRequest, res: MedusaResponse<{ bag: BagView } | ApiError>) {
  try {
    const bag = await loadBag(req.scope, req.params.cartId!)
    res.set("Cache-Control", "private, no-store")
    res.json({ bag })
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}
