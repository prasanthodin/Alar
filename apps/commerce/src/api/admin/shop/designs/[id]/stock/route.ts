import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { AdjustStockInput, AdminDesignStockResponse, parseInput, type ApiError } from "@shop/contracts"
import { loadDesign } from "../../../../../../lib/designs"
import { sendEnvelope, sendShopErrorOrInternal } from "../../../../../../lib/shop-errors"
import { movementView, readVariantStock } from "../../../../../../lib/stock"
import { STOCK_LEDGER_MODULE, type StockLedgerModuleService } from "../../../../../../modules/stock-ledger"
import { adjustStockWorkflow } from "../../../../../../workflows/adjust-stock"

/** The Design's Variant stock and its stock-movement rows, newest first. */
async function stockOf(scope: MedusaContainer, variantId: string): Promise<AdminDesignStockResponse> {
  const ledger = scope.resolve<StockLedgerModuleService>(STOCK_LEDGER_MODULE)
  const [stock, rows] = await Promise.all([readVariantStock(scope, variantId), ledger.listForVariant(variantId)])
  return AdminDesignStockResponse.parse({ stock, movements: rows.map(movementView) })
}

/**
 * GET /admin/shop/designs/:id/stock: the stocked, reserved and available
 * Pieces of the Design's Variant and its stock history, newest first.
 * 404 `design.not_found`.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignStockResponse | ApiError>) {
  try {
    const { view } = await loadDesign(req.scope, req.params.id)
    res.json(await stockOf(req.scope, view.variantId))
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}

/**
 * POST /admin/shop/designs/:id/stock (`AdjustStockInput`: `set` or `delta`,
 * and a reason): changes the stocked quantity through `adjust-stock`, which
 * writes one stock-movement row with the admin's email. 400
 * `stock.invalid_quantity`, `input.invalid`; 409 `stock.below_reserved`,
 * `stock.lock_timeout`; 500 `internal` when the change could not be recorded
 * (the quantity is restored). There is no route that edits or deletes a row.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignStockResponse | ApiError>) {
  const parsed = parseInput(AdjustStockInput, req.body)
  if (!parsed.ok) return sendEnvelope(res, parsed.error)
  try {
    const { view } = await loadDesign(req.scope, req.params.id)
    const user = await req.scope.resolve(Modules.USER).retrieveUser(req.auth_context.actor_id, { select: ["id", "email"] })
    await adjustStockWorkflow(req.scope).run({
      input: {
        variantId: view.variantId,
        ...(parsed.data.set !== undefined ? { set: parsed.data.set } : { delta: parsed.data.delta }),
        reason: parsed.data.reason,
        actor: user.email,
      },
    })
    res.json(await stockOf(req.scope, view.variantId))
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}
