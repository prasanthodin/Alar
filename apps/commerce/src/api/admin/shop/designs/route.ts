import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  AdminDesignList,
  AdminDesignResponse,
  parseCreateDesignInput,
  shelfPriceFromRupees,
  type ApiError,
} from "@shop/contracts"
import { listDesigns, loadDesign } from "../../../../lib/designs"
import { sendEnvelope, sendShopError } from "../../../../lib/shop-errors"
import { createDesignWorkflow } from "../../../../workflows/create-design"

/** GET /admin/shop/designs: every Design, newest first (`AdminDesignList`). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignList>) {
  res.json(AdminDesignList.parse({ designs: await listDesigns(req.scope) }))
}

/**
 * POST /admin/shop/designs (`CreateDesignInput`): creates a Design, saved
 * unpublished, through `create-design`. 400 `money.invalid_shelf_price`,
 * `design.unknown_tax_code` or `input.invalid` create nothing.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignResponse | ApiError>) {
  const parsed = parseCreateDesignInput(req.body)
  if (!parsed.ok) return sendEnvelope(res, parsed.error)
  const price = shelfPriceFromRupees(parsed.data.priceRupees)
  if (!price.ok) return sendEnvelope(res, price.error)
  try {
    const { result } = await createDesignWorkflow(req.scope).run({
      input: { design: parsed.data, pricePaise: price.data, actorId: req.auth_context.actor_id },
    })
    const { view } = await loadDesign(req.scope, result.id)
    res.status(201).json(AdminDesignResponse.parse({ design: view }))
  } catch (e) {
    sendShopError(res, e)
  }
}
