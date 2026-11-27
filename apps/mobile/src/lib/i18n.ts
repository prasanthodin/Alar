import type { ErrorCode } from "@shop/contracts"
import en from "../../messages/en.json"

export type MessageKey = keyof typeof en

// Compile-time completeness check: typecheck fails if an error code has no text in en.json.
const errorMessages: Record<`error.${ErrorCode}`, string> = en

/** Shopper text from the translation file, with `{name}` placeholders filled in. */
export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  return en[key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  )
}

export function errorText(code: ErrorCode): string {
  return errorMessages[`error.${code}`]
}

/** "1 item" or "N items". */
export function itemCount(n: number): string {
  return n === 1 ? t("common.item") : t("common.items", { n })
}
