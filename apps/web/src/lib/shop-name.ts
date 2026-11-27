import type { Result, ShopPublicView } from "@shop/api-client"
import { t } from "./i18n"

/**
 * The shop name to show: from shop settings (read through api-client) when
 * the call succeeded, else the configured fallback (NEXT_PUBLIC_STORE_NAME),
 * else the translation text.
 */
export function shopNameFrom(result: Result<ShopPublicView>, configured?: string): string {
  return result.ok ? result.data.name : configured || t("brand.defaultName")
}
