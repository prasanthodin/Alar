import Medusa from "@medusajs/js-sdk"
import { fail, ok, type ErrorCode, type Result } from "@shop/contracts"
import type { z } from "zod"

/** Where the session token lives. The web keeps it in an httpOnly cookie; mobile in secure storage. */
export type TokenStore = {
  get(): string | null | undefined | Promise<string | null | undefined>
  set(token: string): void | Promise<void>
  clear(): void | Promise<void>
}

export type ApiClientConfig = {
  /** Kernel base URL, e.g. `http://localhost:9000`. */
  baseUrl: string
  /** Kernel publishable key, sent as `x-publishable-api-key`. */
  publishableKey: string
  /** Client platform, e.g. `web` or `android`; sent in `X-Client`. */
  platform: string
  /** Client version; sent in `X-Client` as `<platform>/<version>`. */
  version: string
  /** The Shopper's language, sent as `Accept-Language`. */
  getLanguage: () => string
  tokenStore: TokenStore
  /** Per-request time limit in ms. Defaults to REQUEST_TIMEOUT_MS. */
  timeoutMs?: number
  /** Source of catalogue and Bag data. Only `mock` exists for now; the kernel source arrives with Epic 2. */
  catalogueSource?: "mock"
  /** Base URL of the mock pictures, e.g. `/mock` or `http://192.168.1.5:8081/mock`. Defaults to `/mock`. */
  mockAssetBaseUrl?: string
}

/** A kernel that accepts the connection but never answers must not hang the caller. */
export const REQUEST_TIMEOUT_MS = 15_000

/** Kernel failure as seen by the transport, before mapping to a contract code. */
export type KernelFailure =
  | { kind: "http"; status: number; message: string }
  | { kind: "network"; message: string }
  | { kind: "invalid"; message: string }

export type RequestOptions<S extends z.ZodType> = {
  method: "GET" | "POST" | "DELETE"
  path: string
  body?: unknown
  /** Bearer token for this request; omit for anonymous requests. */
  token?: string | null
  schema: S
}

export type Transport = {
  request<S extends z.ZodType>(
    opts: RequestOptions<S>
  ): Promise<{ ok: true; data: z.infer<S> } | { ok: false; failure: KernelFailure }>
}

const STATE_CHANGING = new Set(["POST", "PUT", "PATCH", "DELETE"])

function isHttpError(e: unknown): e is { status: number; message: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    typeof (e as { status?: unknown }).status === "number"
  )
}

/** Builds the transport over the kernel SDK. Every request carries the AD-19 headers. */
export function createTransport(config: ApiClientConfig): Transport {
  const sdk = new Medusa({
    baseUrl: config.baseUrl,
    publishableKey: config.publishableKey,
    // The token is handed in per request from the caller's TokenStore; the SDK never stores it.
    auth: { type: "jwt", jwtTokenStorageMethod: "nostore" },
  })

  return {
    async request(opts) {
      const headers: Record<string, string> = {
        "X-Client": `${config.platform}/${config.version}`,
        "Accept-Language": config.getLanguage(),
        "X-Request-Id": crypto.randomUUID(),
      }
      if (STATE_CHANGING.has(opts.method)) {
        headers["Idempotency-Key"] = crypto.randomUUID()
      }
      if (opts.token) {
        headers.Authorization = `Bearer ${opts.token}`
      }

      const signal = AbortSignal.timeout(config.timeoutMs ?? REQUEST_TIMEOUT_MS)
      // Race the abort too, so a fetch that ignores the signal still cannot hang the caller.
      const aborted = new Promise<never>((_, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true })
      })

      let raw: unknown
      try {
        raw = await Promise.race([
          sdk.client.fetch<unknown>(opts.path, {
            method: opts.method,
            headers,
            signal,
            ...(opts.body === undefined ? {} : { body: opts.body as Record<string, unknown> }),
          }),
          aborted,
        ])
      } catch (e) {
        if (isHttpError(e)) {
          return {
            ok: false,
            failure: { kind: "http", status: e.status, message: String(e.message ?? "") },
          }
        }
        if (e instanceof SyntaxError) {
          return { ok: false, failure: { kind: "invalid", message: "Response was not valid JSON" } }
        }
        // Includes the timeout abort (a DOMException named TimeoutError).
        return {
          ok: false,
          failure: {
            kind: "network",
            message: e instanceof Error || e instanceof DOMException ? e.message : "Request failed",
          },
        }
      }

      const parsed = opts.schema.safeParse(raw)
      if (!parsed.success) {
        return {
          ok: false,
          failure: {
            kind: "invalid",
            message: `Response of ${opts.method} ${opts.path} did not match its schema: ${parsed.error.issues
              .map((i) => `${i.path.join(".") || "(root)"} ${i.message}`)
              .join("; ")}`,
          },
        }
      }
      return { ok: true, data: parsed.data }
    },
  }
}

/**
 * Maps a transport failure to a contract error. Only `authStatuses` become `authCode`;
 * 426 is `client.update_required`, 429 is `rate.limited`, every other status is `internal`.
 */
export function mapFailure<T>(
  failure: KernelFailure,
  authCode: ErrorCode,
  authStatuses: readonly number[] = [401]
): Result<T> {
  switch (failure.kind) {
    case "network":
      return fail("network.unavailable", failure.message)
    case "invalid":
      return fail("response.invalid", failure.message)
    case "http": {
      const message = failure.message || `HTTP ${failure.status}`
      if (failure.status === 426) return fail("client.update_required", message)
      if (failure.status === 429) return fail("rate.limited", message)
      if (authStatuses.includes(failure.status)) return fail(authCode, message)
      return fail("internal", message)
    }
  }
}

export { ok }
