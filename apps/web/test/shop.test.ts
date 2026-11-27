import { afterEach, describe, expect, it, vi } from "vitest"
import en from "../messages/en.json"

vi.mock("server-only", () => ({}))
// Outside a Next.js request there is no incremental cache: run the function directly.
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }))

const getShopPublic = vi.fn()
const publicApi = vi.fn((_options?: { timeoutMs?: number }) => ({ getShopPublic }))
vi.mock("../src/lib/session", () => ({ publicApi, api: () => { throw new Error("the cookie client must not be used") } }))

const { shopName } = await import("../src/lib/shop")

afterEach(() => {
  vi.unstubAllEnvs()
  getShopPublic.mockReset()
  publicApi.mockClear()
})

describe("shopName", () => {
  it("uses the name from shop settings, through the anonymous client with a short time limit", async () => {
    getShopPublic.mockResolvedValue({ ok: true, data: { name: "Neutral Store" } })
    vi.stubEnv("NEXT_PUBLIC_STORE_NAME", "Configured Name")
    expect(await shopName()).toBe("Neutral Store")
    expect(publicApi).toHaveBeenCalledWith({ timeoutMs: 3000 })
  })

  it("falls back to NEXT_PUBLIC_STORE_NAME when the kernel call fails", async () => {
    getShopPublic.mockResolvedValue({ ok: false, error: { code: "network.unavailable", message: "down" } })
    vi.stubEnv("NEXT_PUBLIC_STORE_NAME", "Configured Name")
    expect(await shopName()).toBe("Configured Name")
  })

  it("falls back to the translation text when the call fails and no name is configured", async () => {
    getShopPublic.mockResolvedValue({ ok: false, error: { code: "internal", message: "boom" } })
    vi.stubEnv("NEXT_PUBLIC_STORE_NAME", "")
    expect(await shopName()).toBe(en["brand.defaultName"])
  })

  it("falls back when the call itself throws", async () => {
    getShopPublic.mockRejectedValue(new Error("unexpected"))
    vi.stubEnv("NEXT_PUBLIC_STORE_NAME", "")
    expect(await shopName()).toBe(en["brand.defaultName"])
  })
})
