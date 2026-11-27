import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ApiError, CheckoutResponse } from "@shop/contracts"
import { holdExpired, holds, loadCheckoutView, type HoldRow } from "../../../../../../lib/holds"
import { sendShopErrorOrInternal } from "../../../../../../lib/shop-errors"
import { releaseHoldWorkflow } from "../../../../../../workflows/release-hold"

/**
 * POST /store/shop/checkouts/:id/cancel: the Shopper cancels her checkout
 * (Story 1.9). `release-hold` removes the Hold's reservations under the
 * stock lock and writes the stock-movement rows; the Checkout becomes
 * `cancelled` (or `expired`, if its time had already run out) and the Bag
 * can be changed again. A Checkout that is no longer held is answered as it
 * is. 404 `checkout.not_found` for another Shopper's Checkout or none; 409
 * `stock.lock_timeout`.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<CheckoutResponse | ApiError>) {
  const customerId = req.auth_context.actor_id
  try {
    const before = await loadCheckoutView(req.scope, req.params.id!, customerId)
    if (before.status === "held") {
      const [hold] = await holds(req.scope).listHolds({ checkout_id: before.id, status: "live" }, { take: 1 })
      if (hold) {
        const row = hold as unknown as HoldRow
        await releaseHoldWorkflow(req.scope).run({
          input: { holdId: row.id, reason: holdExpired(row) ? "expired" : "cancelled" },
        })
      }
    }
    const checkout = await loadCheckoutView(req.scope, before.id, customerId)
    res.set("Cache-Control", "private, no-store")
    res.json({ checkout })
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}
