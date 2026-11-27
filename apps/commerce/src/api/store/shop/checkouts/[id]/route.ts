import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ApiError, CheckoutResponse } from "@shop/contracts"
import { loadCheckoutView } from "../../../../../lib/holds"
import { sendShopErrorOrInternal } from "../../../../../lib/shop-errors"

/**
 * GET /store/shop/checkouts/:id: the signed-in Shopper's own Checkout
 * (`CheckoutResponse`): the snapshot's lines and total, the address, the
 * status and the time its Hold ends (Story 1.9). Another Shopper's Checkout
 * is 404 `checkout.not_found`, like a missing one.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse<CheckoutResponse | ApiError>) {
  try {
    const checkout = await loadCheckoutView(req.scope, req.params.id!, req.auth_context.actor_id)
    res.set("Cache-Control", "private, no-store")
    res.json({ checkout })
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}
