import { describe, expect, it } from "vitest"
import checkEnv from "../check-env-variables"

const { checkEnvVariables, findInvalidEnv, envErrorMessage } = checkEnv

const valid = {
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: "http://localhost:8080",
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_0123456789abcdef",
}

function exitSpy() {
  const errors: string[] = []
  let code: number | undefined
  return {
    errors,
    code: () => code,
    deps: {
      error: (message: string) => {
        errors.push(message)
      },
      exit: (c: number) => {
        code = c
      },
    },
  }
}

describe("findInvalidEnv", () => {
  it("accepts the required variables alone", () => {
    expect(findInvalidEnv(valid)).toEqual([])
  })

  it("accepts the optional variables when they are well formed", () => {
    expect(
      findInvalidEnv({
        ...valid,
        COMMERCE_INTERNAL_URL: "http://commerce:9000",
        NEXT_PUBLIC_BASE_URL: "http://localhost:8080",
      })
    ).toEqual([])
  })

  it.each(Object.keys(valid))("reports %s when it is missing or empty", (name) => {
    const missing: Record<string, string | undefined> = { ...valid }
    delete missing[name]
    expect(findInvalidEnv(missing)).toEqual([name])
    expect(findInvalidEnv({ ...valid, [name]: "" })).toEqual([name])
  })

  it.each([
    ["NEXT_PUBLIC_MEDUSA_BACKEND_URL", "not-a-url"],
    ["NEXT_PUBLIC_MEDUSA_BACKEND_URL", "ftp://host"],
    ["NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", "not a key"],
    ["COMMERCE_INTERNAL_URL", "commerce:9000"],
    ["NEXT_PUBLIC_BASE_URL", "localhost"],
  ])("reports malformed %s", (name, value) => {
    expect(findInvalidEnv({ ...valid, [name]: value })).toEqual([name])
  })
})

describe("checkEnvVariables", () => {
  it("does nothing when the environment is valid", () => {
    const spy = exitSpy()
    checkEnvVariables(valid, spy.deps)
    expect(spy.code()).toBeUndefined()
    expect(spy.errors).toEqual([])
  })

  it("exits 1 naming a missing variable", () => {
    const spy = exitSpy()
    checkEnvVariables({ NEXT_PUBLIC_MEDUSA_BACKEND_URL: valid.NEXT_PUBLIC_MEDUSA_BACKEND_URL }, spy.deps)
    expect(spy.code()).toBe(1)
    expect(spy.errors).toEqual([envErrorMessage("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")])
  })

  it("exits 1 naming a malformed variable, never printing its value", () => {
    const spy = exitSpy()
    const value = "not-a-url-hunter2"
    checkEnvVariables({ ...valid, NEXT_PUBLIC_MEDUSA_BACKEND_URL: value }, spy.deps)
    expect(spy.code()).toBe(1)
    expect(spy.errors).toEqual(["Missing or invalid environment variable: NEXT_PUBLIC_MEDUSA_BACKEND_URL"])
    expect(spy.errors.join("\n")).not.toContain(value)
  })
})
