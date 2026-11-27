import type { ErrorCode } from "@shop/contracts"
import en from "../../messages/en.json"

export type MessageKey = keyof typeof en

/** Shopper-facing text. Every string shown to a Shopper comes from messages/en.json. */
export function t(key: MessageKey): string {
  return en[key]
}

// Compile-time completeness check: typecheck fails if an error code has no message in en.json.
const errorMessages: Record<`error.${ErrorCode}`, string> = en

/** Shopper-facing text for a contract error code. */
export function errorText(code: ErrorCode): string {
  return errorMessages[`error.${code}`]
}

/**
 * The wordmark: the configured store name (or the default), lower case, until
 * shop settings provide it. The caller passes the configured name, read on the
 * server at request time (`configuredStoreName` in server-env).
 */
export function storeName(configured?: string): string {
  return (configured || t("brand.defaultName")).toLowerCase()
}
