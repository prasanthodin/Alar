import "server-only"
import { cache } from "react"
import { configuredStoreName } from "./server-env"
import { api } from "./session"
import { shopNameFrom } from "./shop-name"

/** A slow kernel must not hold every page for the full request time limit just for the name. */
const SHOP_NAME_TIMEOUT_MS = 3_000

/**
 * The shop name for this request, read once per request (React `cache`) from
 * shop settings through api-client, with the configured and translation
 * fallbacks when the call fails. Server only.
 */
export const shopName = cache(async (): Promise<string> => {
  const result = await api({ timeoutMs: SHOP_NAME_TIMEOUT_MS }).getShopPublic()
  return shopNameFrom(result, configuredStoreName())
})
