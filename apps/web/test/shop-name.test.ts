import { describe, expect, it } from "vitest"
import en from "../messages/en.json"
import { storeName } from "../src/lib/i18n"
import { shopNameFrom } from "../src/lib/shop-name"

describe("shopNameFrom", () => {
  it("uses the name from shop settings when the call succeeded", () => {
    expect(shopNameFrom({ ok: true, data: { name: "Neutral Store" } }, "Configured")).toBe("Neutral Store")
  })

  it("falls back to the configured name, then the translation text, when the call failed", () => {
    const failed = { ok: false as const, error: { code: "network.unavailable" as const, message: "down" } }
    expect(shopNameFrom(failed, "Configured")).toBe("Configured")
    expect(shopNameFrom(failed)).toBe(en["brand.defaultName"])
    expect(shopNameFrom(failed, "")).toBe(en["brand.defaultName"])
  })

  it("shows the wordmark in lower case", () => {
    expect(storeName("Neutral Store")).toBe("neutral store")
    expect(storeName()).toBe(en["brand.defaultName"].toLowerCase())
  })
})
