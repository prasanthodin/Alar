import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createApiClient } from "./index"

type Call = { url: string; method: string; headers: Headers }

let calls: Call[]
let respond: (call: Call) => Response | Promise<Response>

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
}

function client() {
  return createApiClient({
    baseUrl: "http://kernel.test",
    publishableKey: "pk_test",
    platform: "web",
    version: "1.2.3",
    getLanguage: () => "en",
    tokenStore: { get: () => null, set: () => {}, clear: () => {} },
    timeoutMs: 200,
  })
}

beforeEach(() => {
  calls = []
  respond = () => json(404, { message: "no route" })
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: URL | string, init: RequestInit = {}) => {
      const call = { url: String(input), method: (init.method ?? "GET").toUpperCase(), headers: new Headers(init.headers) }
      calls.push(call)
      return respond(call)
    })
  )
})
afterEach(() => vi.unstubAllGlobals())

describe("getShopPublic", () => {
  it("reads the shop name from the shop route, anonymously, with the client headers", async () => {
    respond = () => json(200, { name: "Neutral Store" })
    expect(await client().getShopPublic()).toEqual({ ok: true, data: { name: "Neutral Store" } })

    expect(calls).toHaveLength(1)
    const [call] = calls
    expect(new URL(call!.url).pathname).toBe("/store/shop/settings")
    expect(call!.method).toBe("GET")
    expect(call!.headers.get("x-publishable-api-key")).toBe("pk_test")
    expect(call!.headers.get("x-client")).toBe("web/1.2.3")
    expect(call!.headers.get("authorization")).toBeNull()
    expect(call!.headers.get("idempotency-key")).toBeNull()
  })

  it("ignores fields the view model does not know", async () => {
    respond = () => json(200, { name: "Neutral Store", legalName: "Something Pvt Ltd" })
    expect(await client().getShopPublic()).toEqual({ ok: true, data: { name: "Neutral Store" } })
  })

  it("returns response.invalid for a response that fails the schema", async () => {
    respond = () => json(200, { name: "" })
    const res = await client().getShopPublic()
    expect(!res.ok && res.error.code).toBe("response.invalid")
  })

  it("returns settings.not_found when the shop has no name yet", async () => {
    respond = () => json(404, { code: "settings.not_found", type: "not_found", message: "No value of shop.name" })
    const res = await client().getShopPublic()
    expect(!res.ok && res.error.code).toBe("settings.not_found")
  })

  it("returns internal for a server error and network.unavailable when the kernel cannot be reached", async () => {
    respond = () => json(500, { message: "boom" })
    const failed = await client().getShopPublic()
    expect(!failed.ok && failed.error.code).toBe("internal")

    respond = () => Promise.reject(new TypeError("fetch failed"))
    const offline = await client().getShopPublic()
    expect(!offline.ok && offline.error.code).toBe("network.unavailable")
  })
})
