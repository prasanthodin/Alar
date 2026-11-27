import { MedusaError } from "@medusajs/framework/utils"
import { ErrorCode, type ApiError } from "@shop/contracts"

/** HTTP status of each error a shop admin route answers itself; other errors go to the kernel's handler. */
const STATUS: Partial<Record<ErrorCode, number>> = {
  "input.invalid": 400,
  "money.invalid_shelf_price": 400,
  "tax.no_band": 400,
  "design.unknown_tax_code": 400,
  "design.not_publishable": 400,
  "upload.invalid_file": 400,
  "design.unknown_photo": 400,
  "request.cross_origin": 403,
  "design.not_found": 404,
  "design.already_published": 409,
  "design.not_draft": 409,
  "stock.invalid_quantity": 400,
  "stock.below_reserved": 409,
  "stock.lock_timeout": 409,
}

const KERNEL_TYPE: Partial<Record<ErrorCode, string>> = {
  "design.not_found": MedusaError.Types.NOT_FOUND,
  "design.already_published": MedusaError.Types.NOT_ALLOWED,
  "design.not_draft": MedusaError.Types.NOT_ALLOWED,
  "stock.below_reserved": MedusaError.Types.NOT_ALLOWED,
  "stock.lock_timeout": MedusaError.Types.CONFLICT,
  internal: MedusaError.Types.UNEXPECTED_STATE,
}

/**
 * A kernel error carrying a shop error code (and optional details), thrown by
 * workflow steps and turned into the error envelope by `sendShopError`.
 */
export function shopError(code: ErrorCode, message: string, details?: Record<string, unknown>): MedusaError {
  const error = new MedusaError(KERNEL_TYPE[code] ?? MedusaError.Types.INVALID_DATA, message, code)
  if (details) Object.assign(error, { details })
  return error
}

/** Any response that can answer with the error envelope. */
export type EnvelopeResponse = { status(code: number): { json(body: ApiError): unknown } }

type Thrown = { code?: unknown; message?: unknown; details?: unknown; errors?: { error?: Thrown }[] }

/** The shop error envelope inside a thrown error (a workflow may wrap it), or null when it has none. */
export function shopErrorOf(e: unknown): ApiError | null {
  const candidates: Thrown[] = []
  if (e && typeof e === "object") {
    const t = e as Thrown
    candidates.push(t)
    const inner = t.errors?.[0]?.error
    if (inner) candidates.push(inner)
  }
  for (const c of candidates) {
    const code = ErrorCode.safeParse(c.code)
    if (!code.success || STATUS[code.data] === undefined) continue
    const details = c.details && typeof c.details === "object" ? (c.details as Record<string, unknown>) : undefined
    const message = typeof c.message === "string" ? c.message : code.data
    return details ? { code: code.data, message, details } : { code: code.data, message }
  }
  return null
}

/** Answers with the envelope and its status, or rethrows an error that carries no shop code. */
export function sendShopError(res: EnvelopeResponse, e: unknown): void {
  const envelope = shopErrorOf(e)
  if (!envelope) throw e
  res.status(STATUS[envelope.code] ?? 400).json(envelope)
}

/** A minimal logger, as far as `sendShopErrorOrInternal` uses one. */
type ErrorLogger = { error(message: string): void }

/** The error a workflow failed with (it may be wrapped), or the error itself. */
function innerError(e: unknown): unknown {
  const inner = (e as Thrown | null)?.errors?.[0]?.error
  return inner ?? e
}

/**
 * Answers with the envelope of a shop error. A kernel error (a `MedusaError`
 * such as not found or invalid data) is rethrown for the kernel's handler, as
 * `sendShopError` does. Anything else, and a shop `internal` fault, is
 * answered 500 `internal` and logged with its stack (never the request).
 */
export function sendShopErrorOrInternal(res: EnvelopeResponse, e: unknown, logger: ErrorLogger): void {
  const envelope = shopErrorOf(e)
  if (envelope) {
    res.status(STATUS[envelope.code] ?? 400).json(envelope)
    return
  }
  const inner = innerError(e)
  if (
    MedusaError.isMedusaError(inner) &&
    (inner as MedusaError).code !== "internal" &&
    (inner as MedusaError).type !== MedusaError.Types.UNEXPECTED_STATE
  ) {
    throw inner
  }
  const detail = inner instanceof Error ? (inner.stack ?? inner.message) : String(inner)
  logger.error(`shop: request failed: ${detail}`)
  res.status(500).json({ code: "internal", message: "Something went wrong" })
}

/** Answers with an envelope for a refused request. */
export function sendEnvelope(res: EnvelopeResponse, error: ApiError): void {
  res.status(STATUS[error.code] ?? 400).json(error)
}
