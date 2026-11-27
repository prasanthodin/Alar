import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AdminDesignResponse, parseSetDesignPriceInput, shelfPriceFromRupees, type ApiError } from "@shop/contracts"
import { loadDesign } from "../../../../../../lib/designs"
import { sendEnvelope, sendShopError } from "../../../../../../lib/shop-errors"
import { setDesignPriceWorkflow } from "../../../../../../workflows/set-design-price"

/**
 * POST /admin/shop/designs/:id/price (`SetDesignPriceInput`, whole rupees):
 * sets the Variant's price through `set-design-price`, which writes one
 * price-history row per change. 400 `money.invalid_shelf_price` changes nothing.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignResponse | ApiError>) {
  const parsed = parseSetDesignPriceInput(req.body)
  if (!parsed.ok) return sendEnvelope(res, parsed.error)
  const price = shelfPriceFromRupees(parsed.data.priceRupees)
  if (!price.ok) return sendEnvelope(res, price.error)
  try {
    await setDesignPriceWorkflow(req.scope).run({
      input: { id: req.params.id, pricePaise: price.data, actorId: req.auth_context.actor_id },
    })
    const { view } = await loadDesign(req.scope, req.params.id)
    res.json(AdminDesignResponse.parse({ design: view }))
  } catch (e) {
    sendShopError(res, e)
  }
}
