import { z } from "zod"

/**
 * Stable error codes shared by every unit. Codes never change meaning once
 * shipped; clients map them to Shopper-facing text in their translation files.
 */
export const ErrorCode = z.enum([
  "auth.invalid_credentials",
  "auth.sign_up_failed",
  "auth.unauthenticated",
  "input.invalid",
  "response.invalid",
  "network.unavailable",
  "rate.limited",
  "client.update_required",
  "route.not_allowed",
  "design.not_found",
  "design.unknown_tax_code",
  "design.not_publishable",
  "design.already_published",
  "design.not_draft",
  "design.unknown_photo",
  "upload.invalid_file",
  "request.cross_origin",
  "bag.stock_exceeded",
  "bag.not_found",
  "stock.below_reserved",
  "stock.invalid_quantity",
  "stock.lock_timeout",
  "money.invalid_shelf_price",
  "tax.no_band",
  "tax.kernel_mismatch",
  "tax.discount_unsupported",
  "tax.shipping_unsupported",
  "settings.invalid_value",
  "settings.not_found",
  "settings.past_effective_from",
  "internal",
])
export type ErrorCode = z.infer<typeof ErrorCode>

/** The error envelope: `{ code, message, details? }`. `message` is for developers, not Shoppers. */
export const ApiError = z.object({
  code: ErrorCode,
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
})
export type ApiError = z.infer<typeof ApiError>
