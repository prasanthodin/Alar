import type { AuthenticatedMedusaRequest, MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BeginCheckoutInput, parseInput, type ApiError, type CheckoutResponse } from "@shop/contracts"
import { findLiveHold, holdExpired, loadCheckoutView } from "../../../../lib/holds"
import { sendEnvelope, sendShopErrorOrInternal } from "../../../../lib/shop-errors"
import { beginCheckoutWorkflow } from "../../../../workflows/begin-checkout"
import { releaseHoldWorkflow } from "../../../../workflows/release-hold"

/**
 * POST /store/shop/checkouts (`BeginCheckoutInput`: the Bag's cart id and the
 * delivery address): a signed-in Shopper (customer bearer token only) begins
 * checkout through `begin-checkout` (Story 1.9). 201 with the new Checkout
 * (`CheckoutResponse`); 200 with the existing one when her live Hold already
 * holds this Bag. A Hold on the Bag whose time has run out but which the
 * scheduled job has not released yet is released first, so she can begin
 * again.
 * 400 `input.invalid` (a missing or malformed field, an empty Bag),
 * `tax.no_band`; 401 signed out; 404 `bag.not_found`; 409 `cart.changed`
 * (`details.lines`: each changed line), `cart.locked` (another Shopper's
 * checkout holds this Bag), `stock.unavailable` (another Shopper is paying
 * for these Pieces), `stock.lock_timeout`; 500 `internal` (nothing is left
 * behind). The request body is never logged.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<CheckoutResponse | ApiError>) {
  const parsed = parseInput(BeginCheckoutInput, req.body)
  if (!parsed.ok) return sendEnvelope(res, parsed.error)
  const customerId = req.auth_context.actor_id
  const salesChannelIds = (req as unknown as MedusaStoreRequest).publishable_key_context?.sales_channel_ids ?? []
  try {
    const live = await findLiveHold(req.scope, parsed.data.cartId)
    if (live && holdExpired(live)) {
      await releaseHoldWorkflow(req.scope).run({ input: { holdId: live.id, reason: "expired" } })
    }
    const { result } = await beginCheckoutWorkflow(req.scope).run({
      input: { cartId: parsed.data.cartId, customerId, address: parsed.data.address, salesChannelIds },
    })
    const checkout = await loadCheckoutView(req.scope, result.checkoutId, customerId)
    res.set("Cache-Control", "private, no-store")
    res.status(result.created ? 201 : 200).json({ checkout })
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}
