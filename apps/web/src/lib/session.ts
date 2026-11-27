import "server-only"
import { createApiClient, type TokenStore } from "@shop/api-client"
import { cookies } from "next/headers"
import pkg from "../../package.json"
import { commerceBaseUrl, publishableKey } from "./server-env"

export const SESSION_COOKIE = "shop_session"
/** The Bag's cart id (Story 1.8): a lasting cookie, so the Bag survives a closed browser. */
export const BAG_COOKIE = "shop_bag"
const THIRTY_DAYS = 60 * 60 * 24 * 30

type CookieStore = TokenStore & {
  /** True when a write was skipped because cookies are read-only here (a page render). */
  readonly skippedWrite: boolean
}

/** A value that lives only in an httpOnly cookie, never readable by browser script. */
function cookieStore(name: string, options: { quietWrites?: boolean } = {}): CookieStore {
  // A Server Component may read cookies but not change them; there a write is
  // skipped and noted, so the page can ask a server action to make it.
  let skippedWrite = false
  const write = async (change: () => Promise<void>) => {
    if (!options.quietWrites) return change()
    try {
      await change()
    } catch {
      // Rendering a page: cookies are read-only here.
      skippedWrite = true
    }
  }
  return {
    get skippedWrite() {
      return skippedWrite
    },
    async get() {
      return (await cookies()).get(name)?.value ?? null
    },
    async set(value) {
      await write(async () => {
        ;(await cookies()).set(name, value, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: THIRTY_DAYS,
        })
      })
    },
    async clear() {
      await write(async () => {
        ;(await cookies()).delete(name)
      })
    },
  }
}

function cookieTokenStore(): TokenStore {
  return cookieStore(SESSION_COOKIE)
}

type ClientOptions = { timeoutMs?: number }

function client(tokenStore: TokenStore, options: ClientOptions, bagStore?: TokenStore) {
  return createApiClient({
    baseUrl: commerceBaseUrl(),
    publishableKey: publishableKey(),
    platform: "web",
    version: pkg.version,
    getLanguage: () => "en",
    tokenStore,
    catalogueSource: "kernel",
    ...(bagStore ? { bagStore } : {}),
    ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
  })
}

/** An api-client for the current request, with the Shopper's session and Bag cookies. Server only. */
export function api(options: ClientOptions = {}) {
  return client(cookieTokenStore(), options, cookieStore(BAG_COOKIE, { quietWrites: true }))
}

/**
 * The Shopper's Bag for the current request. `staleCookie` is true when the
 * stored Bag no longer exists (or was bought) and its cookie could not be
 * cleared while rendering; the page then asks a server action to clear it.
 */
export async function readBag() {
  const bagStore = cookieStore(BAG_COOKIE, { quietWrites: true })
  const result = await client(cookieTokenStore(), {}, bagStore).getBag()
  return { result, staleCookie: bagStore.skippedWrite }
}

/** True when the request carries a Shopper session (its token is checked where it is used). */
export async function hasSession(): Promise<boolean> {
  return Boolean((await cookies()).get(SESSION_COOKIE)?.value)
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
