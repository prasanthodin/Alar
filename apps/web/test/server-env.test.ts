import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { commerceBaseUrl, configuredStoreName, publicBaseUrl, publishableKey } = await import("../src/lib/server-env")

const NAMES = [
  "COMMERCE_INTERNAL_URL",
  "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_STORE_NAME",
]

function setEnv(values: Record<string, string | undefined>) {
  for (const name of NAMES) {
    vi.stubEnv(name, values[name] as string)
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("commerceBaseUrl", () => {
  it("prefers COMMERCE_INTERNAL_URL over the public backend URL", () => {
    setEnv({ COMMERCE_INTERNAL_URL: "http://commerce:9000", NEXT_PUBLIC_MEDUSA_BACKEND_URL: "http://localhost:8080" })
    expect(commerceBaseUrl()).toBe("http://commerce:9000")
  })

  it("falls back to the public backend URL when the internal one is blank", () => {
    setEnv({ COMMERCE_INTERNAL_URL: "   ", NEXT_PUBLIC_MEDUSA_BACKEND_URL: " http://localhost:8080 " })
    expect(commerceBaseUrl()).toBe("http://localhost:8080")
  })

  it("defaults to the local kernel when both are blank", () => {
    setEnv({ COMMERCE_INTERNAL_URL: "", NEXT_PUBLIC_MEDUSA_BACKEND_URL: "" })
    expect(commerceBaseUrl()).toBe("http://localhost:9000")
  })
})

describe("runtime values", () => {
  it("reads the publishable key, base URL and store name at call time", () => {
    setEnv({
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_runtime",
      NEXT_PUBLIC_BASE_URL: "https://shop.example",
      NEXT_PUBLIC_STORE_NAME: "Neutral Store",
    })
    expect(publishableKey()).toBe("pk_runtime")
    expect(publicBaseUrl()).toBe("https://shop.example")
    expect(configuredStoreName()).toBe("Neutral Store")
  })

  it("treats blank values as unset", () => {
    setEnv({ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: " ", NEXT_PUBLIC_BASE_URL: "", NEXT_PUBLIC_STORE_NAME: "  " })
    expect(publishableKey()).toBe("")
    expect(publicBaseUrl()).toBe("http://localhost:8000")
    expect(configuredStoreName()).toBeUndefined()
  })
})
