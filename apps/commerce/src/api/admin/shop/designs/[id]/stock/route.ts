import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import {
  AdjustStockInput,
  AdminDesignStockResponse,
  availablePieces,
  parseInput,
  parseStockHistoryCursor,
  StockHistoryQuery,
  stockHistoryCursor,
  type ApiError,
} from "@shop/contracts"
import { loadDesign } from "../../../../../../lib/designs"
import { sendEnvelope, sendShopErrorOrInternal } from "../../../../../../lib/shop-errors"
import { movementView, readVariantStock } from "../../../../../../lib/stock"
import { STOCK_LEDGER_MODULE, type StockLedgerModuleService } from "../../../../../../modules/stock-ledger"
import { adjustStockWorkflow, type AdjustStockResult } from "../../../../../../workflows/adjust-stock"

/** The Design's Variant stock and one page of its stock-movement rows, newest first. */
async function stockOf(scope: MedusaContainer, variantId: string, page: StockHistoryQuery): Promise<AdminDesignStockResponse> {
  const ledger = scope.resolve<StockLedgerModuleService>(STOCK_LEDGER_MODULE)
  const cursor = page.before ? parseStockHistoryCursor(page.before) : null
  const [stock, history] = await Promise.all([
    readVariantStock(scope, variantId),
    ledger.listForVariant(variantId, {
      limit: page.limit,
      ...(cursor ? { before: { occurredAt: new Date(cursor.occurredAt), id: cursor.id } } : {}),
    }),
  ])
  const movements = history.rows.map(movementView)
  const last = movements[movements.length - 1]
  return AdminDesignStockResponse.parse({
    stock,
    movements,
    nextBefore: history.more && last ? stockHistoryCursor(last) : null,
    refreshed: true,
  })
}

/**
 * GET /admin/shop/designs/:id/stock (`StockHistoryQuery`: `limit`, default
 * 50, and the `before` cursor of the previous page): the stocked, reserved
 * and available Pieces of the Design's Variant and one page of its stock
 * history, newest first, with `nextBefore` for the next page.
 * 400 `input.invalid`; 404 `design.not_found`.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignStockResponse | ApiError>) {
  const query = parseInput(StockHistoryQuery, req.query)
  if (!query.ok) return sendEnvelope(res, query.error)
  try {
    const { view } = await loadDesign(req.scope, req.params.id)
    res.json(await stockOf(req.scope, view.variantId, query.data))
  } catch (e) {
    sendShopErrorOrInternal(res, e, req.scope.resolve(ContainerRegistrationKeys.LOGGER))
  }
}

/**
 * POST /admin/shop/designs/:id/stock (`AdjustStockInput`: `set` or `delta`,
 * a reason and an optional `requestId`): changes the stocked quantity
 * through `adjust-stock`, which writes one stock-movement row with the
 * admin's email and user id. A resent request with the same `requestId` is
 * not applied again. Answers the stock and the first page of the history; if
 * they cannot be read again after the change, it still answers 200 with the
 * workflow's own result and `refreshed: false`, never an error, so the Owner
 * does not send the change again.
 * 400 `input.invalid`, `stock.invalid_quantity`; 403 `request.cross_origin`;
 * 404 `design.not_found`; 409 `stock.below_reserved`, `stock.lock_timeout`;
 * 500 `internal` when the change could not be recorded (the quantity is
 * restored). There is no route that edits or deletes a row.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminDesignStockResponse | ApiError>) {
  const parsed = parseInput(AdjustStockInput, req.body)
  if (!parsed.ok) return sendEnvelope(res, parsed.error)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  let result: AdjustStockResult
  try {
    const { view } = await loadDesign(req.scope, req.params.id)
    const user = await req.scope.resolve(Modules.USER).retrieveUser(req.auth_context.actor_id, { select: ["id", "email"] })
    result = (
      await adjustStockWorkflow(req.scope).run({
        input: {
          variantId: view.variantId,
          ...(parsed.data.set !== undefined ? { set: parsed.data.set } : { delta: parsed.data.delta }),
          reason: parsed.data.reason,
          actor: user.email,
          actorId: user.id,
          ...(parsed.data.requestId ? { requestId: parsed.data.requestId } : {}),
        },
      })
    ).result
  } catch (e) {
    return sendShopErrorOrInternal(res, e, logger)
  }

  // The change is made. From here on, never answer with an error.
  try {
    res.json(await stockOf(req.scope, result.variantId, StockHistoryQuery.parse({})))
  } catch (e) {
    logger.error(`stock: the change was made but the stock could not be read again: ${(e as Error).stack ?? e}`)
    res.json(
      AdminDesignStockResponse.parse({
        stock: {
          variantId: result.variantId,
          inventoryItemId: result.inventoryItemId,
          stocked: result.stocked,
          reserved: result.reserved,
          available: availablePieces(result.stocked, result.reserved),
        },
        movements: [],
        nextBefore: null,
        refreshed: false,
      })
    )
  }
}
