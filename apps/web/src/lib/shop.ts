import "server-only"
import { unstable_cache } from "next/cache"
import { configuredStoreName } from "./server-env"
import { publicApi } from "./session"
import { shopNameFrom } from "./shop-name"

/** A slow kernel must not hold every page for the full request time limit just for the name. */
const SHOP_NAME_TIMEOUT_MS = 3_000

/** How long a name read from the kernel is reused across requests (the shop route allows 60 s too). */
export const SHOP_NAME_CACHE_SECONDS = 60

/**
 * The name from shop settings, cached across requests. A failed call throws,
 * so a failure is never cached and the next request tries the kernel again.
 */
const cachedSettingsName = unstable_cache(
  async (): Promise<string> => {
    const result = await publicApi({ timeoutMs: SHOP_NAME_TIMEOUT_MS }).getShopPublic()
    if (!result.ok) throw new Error(`shop name: ${result.error.code}`)
    return result.data.name
  },
  ["shop-name"],
  { revalidate: SHOP_NAME_CACHE_SECONDS }
)

/**
 * The shop name: from shop settings through api-client (anonymous, cached for
 * a minute), with the configured and translation fallbacks when the call
 * fails. Server only.
 */
export async function shopName(): Promise<string> {
  try {
    return shopNameFrom({ ok: true, data: { name: await cachedSettingsName() } })
  } catch {
    return shopNameFrom(
      { ok: false, error: { code: "network.unavailable", message: "shop name unavailable" } },
      configuredStoreName()
    )
  }
}
