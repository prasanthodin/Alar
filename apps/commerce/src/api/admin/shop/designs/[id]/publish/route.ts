import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { parseInput, PublishDesignInput, PublishDesignResult, type ApiError } from "@shop/contracts"
import { loadDesign } from "../../../../../../lib/designs"
import { sendEnvelope, sendShopError } from "../../../../../../lib/shop-errors"
import { publishDesignWorkflow } from "../../../../../../workflows/publish-design"

/**
 * POST /admin/shop/designs/:id/publish (`PublishDesignInput`): publishes the
 * Design through `publish-design`, the only way to publish. A refusal is 400
 * `design.not_publishable` with `details.missing` naming every missing item;
 * the Design stays unpublished.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<PublishDesignResult | ApiError>) {
  const parsed = parseInput(PublishDesignInput, req.body)
  if (!parsed.ok) return sendEnvelope(res, parsed.error)
  try {
    await publishDesignWorkflow(req.scope).run({
      input: {
        id: req.params.id,
        trueColourConfirmed: parsed.data.trueColourConfirmed,
        actorId: req.auth_context.actor_id,
      },
    })
    const { view } = await loadDesign(req.scope, req.params.id)
    res.json(PublishDesignResult.parse({ design: view, missing: [] }))
  } catch (e) {
    sendShopError(res, e)
  }
}
