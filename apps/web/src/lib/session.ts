import "server-only"
import { createApiClient, type TokenStore } from "@shop/api-client"
import { cookies } from "next/headers"
import pkg from "../../package.json"

export const SESSION_COOKIE = "shop_session"
const THIRTY_DAYS = 60 * 60 * 24 * 30

/** The session token lives only in an httpOnly cookie, never readable by browser script. */
function cookieTokenStore(): TokenStore {
  return {
    async get() {
      return (await cookies()).get(SESSION_COOKIE)?.value ?? null
    },
    async set(token) {
      ;(await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: THIRTY_DAYS,
      })
    },
    async clear() {
      ;(await cookies()).delete(SESSION_COOKIE)
    },
  }
}

/** An api-client for the current request. Server only. */
export function api() {
  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000",
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
    platform: "web",
    version: pkg.version,
    getLanguage: () => "en",
    tokenStore: cookieTokenStore(),
  })
}
