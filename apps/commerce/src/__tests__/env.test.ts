import { describe, expect, it } from "vitest"
import { envErrorMessage, firstCorsOrigin, loadEnvOrExit, parseEnv, readEnv, storefrontUrl } from "../env"

const valid = {
  DATABASE_URL: "postgres://commerce:pw@postgres:5432/commerce?sslmode=disable",
  REDIS_URL: "redis://redis:6379",
  STORE_CORS: "http://localhost:8080",
  ADMIN_CORS: "http://localhost:8080,http://localhost:9000",
  AUTH_CORS: "http://localhost:8080,/example\\.com$/",
  JWT_SECRET: "a-long-enough-secret",
  COOKIE_SECRET: "another-long-secret",
  S3_ENDPOINT: "http://floci:4566",
  S3_BUCKET: "catalog",
  S3_REGION: "us-east-1",
  S3_FILE_URL: "http://localhost:4566/catalog/",
  S3_ACCESS_KEY_ID: "key-id",
  S3_SECRET_ACCESS_KEY: "key-secret",
  S3_DOCUMENTS_BUCKET: "documents",
  PREVIEW_TOKEN_SECRET: "a-preview-signing-key-of-32-chars-or-more",
}

function exitSpy() {
  const errors: string[] = []
  let code: number | undefined
  const deps = {
    error: (message: string) => {
      errors.push(message)
    },
    exit: ((c: number) => {
      code = c
      throw new Error("exit")
    }) as (code: number) => never,
  }
  return { deps, errors, code: () => code }
}

describe("parseEnv", () => {
  it("accepts a complete environment and applies defaults", () => {
    const result = parseEnv(valid)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.env.MEDUSA_WORKER_MODE).toBe("shared")
      expect(result.env.LOG_LEVEL).toBe("info")
      expect(result.env.S3_FILE_URL).toBe("http://localhost:4566/catalog")
    }
  })

  it.each(Object.keys(valid))("reports %s when it is missing", (name) => {
    const source: Record<string, string | undefined> = { ...valid }
    delete source[name]
    expect(parseEnv(source)).toEqual({ ok: false, invalid: [name] })
  })

  it("treats an empty value as missing", () => {
    expect(parseEnv({ ...valid, REDIS_URL: "" })).toEqual({ ok: false, invalid: ["REDIS_URL"] })
  })

  it.each([
    ["DATABASE_URL", "not-a-url"],
    ["DATABASE_URL", "mysql://host/db"],
    ["REDIS_URL", "http://redis:6379"],
    ["STORE_CORS", "localhost:8080"],
    ["JWT_SECRET", "short"],
    ["S3_ENDPOINT", "floci:4566"],
    ["S3_BUCKET", "Catalog_Bucket"],
    ["S3_DOCUMENTS_BUCKET", "Documents"],
    ["S3_DOCUMENTS_BUCKET", "catalog"],
    ["S3_FILE_URL", "not a url"],
    ["MEDUSA_WORKER_MODE", "both"],
    ["LOG_LEVEL", "loud"],
    ["JWT_SECRET", "          "],
    ["JWT_SECRET", "   short   "],
    ["JWT_SECRET", "supersecret"],
    ["COOKIE_SECRET", "SuperSecret"],
    ["COOKIE_SECRET", "build-placeholder"],
    ["STORE_CORS", "http://localhost:8080/"],
    ["STORE_CORS", "http://localhost:8080/path"],
    ["ADMIN_CORS", "http://localhost:8080,,http://localhost:9000"],
    ["AUTH_CORS", "/unclosed(/"],
    ["PREVIEW_TOKEN_SECRET", "only-31-characters-long-secret!"],
    ["PREVIEW_TOKEN_SECRET", "                                        "],
    ["STOREFRONT_URL", "localhost:8000"],
    ["STOREFRONT_URL", "http://localhost:8000/shop"],
  ])("reports malformed %s", (name, value) => {
    expect(parseEnv({ ...valid, [name]: value })).toEqual({ ok: false, invalid: [name] })
  })

  it("trims secrets and every CORS entry", () => {
    const result = parseEnv({
      ...valid,
      JWT_SECRET: "  a-long-enough-secret  ",
      STORE_CORS: " http://localhost:8080 , http://localhost:9000 ,/example\\.com$/ ",
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.env.JWT_SECRET).toBe("a-long-enough-secret")
      expect(result.env.STORE_CORS).toBe("http://localhost:8080,http://localhost:9000,/example\\.com$/")
    }
  })

  it("lists every bad variable once", () => {
    const result = parseEnv({ ...valid, DATABASE_URL: "nope", REDIS_URL: undefined })
    expect(result).toEqual({ ok: false, invalid: ["DATABASE_URL", "REDIS_URL"] })
  })
})

describe("the website's address and readEnv", () => {
  it("takes STOREFRONT_URL, else the first exact origin in STORE_CORS", () => {
    const withUrl = parseEnv({ ...valid, STOREFRONT_URL: "https://shop.example.test/" })
    expect(withUrl.ok && storefrontUrl(withUrl.env)).toBe("https://shop.example.test")
    const fromCors = parseEnv({ ...valid, STORE_CORS: "/preview\\.example$/,http://localhost:8000" })
    expect(fromCors.ok && storefrontUrl(fromCors.env)).toBe("http://localhost:8000")
    expect(firstCorsOrigin("/only-regex/")).toBeNull()
  })

  it("readEnv throws naming the bad variable, never its value", () => {
    expect(readEnv(valid).PREVIEW_TOKEN_SECRET).toBe(valid.PREVIEW_TOKEN_SECRET)
    let thrown: unknown = null
    try {
      readEnv({ ...valid, PREVIEW_TOKEN_SECRET: "short-secret-value" })
    } catch (e) {
      thrown = e
    }
    expect(thrown).toBeInstanceOf(Error)
    expect(String(thrown)).toContain("Missing or invalid environment variable: PREVIEW_TOKEN_SECRET")
    expect(String(thrown)).not.toContain("short-secret-value")
  })
})

describe("loadEnvOrExit", () => {
  it("returns the parsed environment when it is valid", () => {
    const spy = exitSpy()
    expect(loadEnvOrExit(valid, spy.deps).REDIS_URL).toBe("redis://redis:6379")
    expect(spy.errors).toEqual([])
    expect(spy.code()).toBeUndefined()
  })

  it("exits 1 naming a missing variable", () => {
    const spy = exitSpy()
    const { DATABASE_URL: _omit, ...source } = valid
    expect(() => loadEnvOrExit(source, spy.deps)).toThrow("exit")
    expect(spy.code()).toBe(1)
    expect(spy.errors).toEqual([envErrorMessage("DATABASE_URL")])
  })

  it("exits 1 naming a malformed variable, never printing its value", () => {
    const spy = exitSpy()
    const secretLooking = "not-a-url-with-a-password-hunter2"
    expect(() => loadEnvOrExit({ ...valid, DATABASE_URL: secretLooking }, spy.deps)).toThrow("exit")
    expect(spy.code()).toBe(1)
    expect(spy.errors).toEqual(["Missing or invalid environment variable: DATABASE_URL"])
    expect(spy.errors.join("\n")).not.toContain(secretLooking)
  })
})
