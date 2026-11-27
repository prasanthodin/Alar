import type { ErrorCode } from "@shop/contracts"
import en from "../../messages/en.json"

export type MessageKey = keyof typeof en

/** Shopper-facing text. Every string shown to a Shopper comes from messages/en.json. */
export function t(key: MessageKey): string {
  return en[key]
}

/** Text with `{name}` placeholders filled in, e.g. tf("bag.onlyAvailable", { n: 2 }). */
export function tf(key: MessageKey, vars: Record<string, string | number>): string {
  return t(key).replace(/\{(\w+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole))
}

// Compile-time completeness check: typecheck fails if an error code has no message in en.json.
const errorMessages: Record<`error.${ErrorCode}`, string> = en

/** Shopper-facing text for a contract error code. */
export function errorText(code: ErrorCode): string {
  return errorMessages[`error.${code}`]
}

/**
 * The wordmark form of a shop name: lower case. The caller passes the name
 * from shop settings (`shopName` in lib/shop); without one, the translation text.
 */
export function storeName(name?: string): string {
  return (name || t("brand.defaultName")).toLowerCase()
}
