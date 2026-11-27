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

/** The wordmark: the store name, lower case, until shop settings provide it. */
export function storeName(): string {
  return (process.env.NEXT_PUBLIC_STORE_NAME || t("brand.defaultName")).toLowerCase()
}
