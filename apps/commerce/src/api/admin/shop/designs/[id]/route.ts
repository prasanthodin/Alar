import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AdminDesignResponse, parseInput, UpdateDesignInput, type ApiError } from "@shop/contracts"
import { loadDesign } from "../../../../../lib/designs"
import { sendEnvelope, sendShopError } from "../../../../../lib/shop-errors"
import { updateDesignWorkflow } from "../../../../../workflows/update-design"

/** GET /admin/shop/designs/:id: one Design; 404 `design.not_found`. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignResponse | ApiError>) {
  try {
    const { view } = await loadDesign(req.scope, req.params.id)
    res.json(AdminDesignResponse.parse({ design: view }))
  } catch (e) {
    sendShopError(res, e)
  }
}

/**
 * POST /admin/shop/designs/:id (`UpdateDesignInput`): changes the name,
 * description, attributes or photos through `update-design`. Never the
 * status or the price.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignResponse | ApiError>) {
  const parsed = parseInput(UpdateDesignInput, req.body)
  if (!parsed.ok) return sendEnvelope(res, parsed.error)
  try {
    await updateDesignWorkflow(req.scope).run({
      input: { id: req.params.id, update: parsed.data, actorId: req.auth_context.actor_id },
    })
    const { view } = await loadDesign(req.scope, req.params.id)
    res.json(AdminDesignResponse.parse({ design: view }))
  } catch (e) {
    sendShopError(res, e)
  }
}
