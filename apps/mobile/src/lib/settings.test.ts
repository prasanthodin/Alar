import { describe, expect, it } from "vitest"
import { resolveMockAssetBaseUrl, resolveStoreName } from "./settings"

describe("resolveStoreName", () => {
  it("uses the configured name in lower case", () => {
    expect(resolveStoreName("Kadai", "shop")).toBe("kadai")
  })

  it("falls back to the translation file when unset or blank", () => {
    expect(resolveStoreName(undefined, "shop")).toBe("shop")
    expect(resolveStoreName("   ", "shop")).toBe("shop")
  })
})

describe("resolveMockAssetBaseUrl", () => {
  it("prefers the env value without a trailing slash", () => {
    expect(
      resolveMockAssetBaseUrl({ envValue: "https://cdn.test/mock/", platform: "android", hostUri: "x:8081" })
    ).toBe("https://cdn.test/mock")
  })

  it("uses /mock on the web", () => {
    expect(resolveMockAssetBaseUrl({ envValue: undefined, platform: "web", hostUri: "x:8081" })).toBe("/mock")
  })

  it("uses the dev server on a phone", () => {
    expect(
      resolveMockAssetBaseUrl({ envValue: undefined, platform: "android", hostUri: "192.168.1.5:8081" })
    ).toBe("http://192.168.1.5:8081/mock")
  })
})
