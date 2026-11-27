import "server-only"
import { createApiClient, type TokenStore } from "@shop/api-client"
import { cookies } from "next/headers"
import pkg from "../../package.json"
import { commerceBaseUrl, publishableKey } from "./server-env"

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

type ClientOptions = { timeoutMs?: number }

function client(tokenStore: TokenStore, options: ClientOptions) {
  return createApiClient({
    baseUrl: commerceBaseUrl(),
    publishableKey: publishableKey(),
    platform: "web",
    version: pkg.version,
    getLanguage: () => "en",
    tokenStore,
    ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
  })
}

/** An api-client for the current request, with the Shopper's session cookie. Server only. */
export function api(options: ClientOptions = {}) {
  return client(cookieTokenStore(), options)
}

/** No session: for public, Shopper-independent reads that may be cached across requests. */
const noSession: TokenStore = {
  get: () => null,
  set: () => {},
  clear: () => {},
}

/** An anonymous api-client that never reads or writes cookies. Server only. */
export function publicApi(options: ClientOptions = {}) {
  return client(noSession, options)
}
