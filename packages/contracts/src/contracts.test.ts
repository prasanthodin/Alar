import { describe, expect, it } from "vitest"
import {
  ApiError,
  ErrorCode,
  Id,
  IsoDateTime,
  ShopperView,
  SignUpInput,
  fail,
  ok,
  resultSchema,
} from "./index"

const shopper = {
  id: "cus_01JABC",
  email: "asha@example.com",
  firstName: "Asha",
  lastName: "Rao",
  createdAt: "2026-11-27T10:15:00.000Z",
}

describe("ErrorCode", () => {
  it("contains the codes every client relies on", () => {
    for (const code of [
      "auth.invalid_credentials",
      "auth.sign_up_failed",
      "auth.unauthenticated",
      "response.invalid",
      "network.unavailable",
      "client.update_required",
      "route.not_allowed",
      "internal",
    ]) {
      expect(ErrorCode.safeParse(code).success).toBe(true)
    }
  })

  it("rejects an unknown code", () => {
    expect(ErrorCode.safeParse("auth.nope").success).toBe(false)
  })
})

describe("ApiError", () => {
  it("accepts the envelope with and without details", () => {
    expect(ApiError.parse({ code: "internal", message: "x" })).toEqual({
      code: "internal",
      message: "x",
    })
    expect(
      ApiError.parse({ code: "internal", message: "x", details: { a: 1 } })
    ).toEqual({ code: "internal", message: "x", details: { a: 1 } })
  })

  it("rejects a missing message", () => {
    expect(ApiError.safeParse({ code: "internal" }).success).toBe(false)
  })
})

describe("common", () => {
  it("Id refuses an empty string", () => {
    expect(Id.safeParse("").success).toBe(false)
    expect(Id.safeParse("cus_1").success).toBe(true)
  })

  it("IsoDateTime accepts UTC and refuses offsets and plain dates", () => {
    expect(IsoDateTime.safeParse("2026-11-27T10:15:00Z").success).toBe(true)
    expect(IsoDateTime.safeParse("2026-11-27T10:15:00.123Z").success).toBe(true)
    expect(IsoDateTime.safeParse("2026-11-27T15:45:00+05:30").success).toBe(false)
    expect(IsoDateTime.safeParse("2026-11-27").success).toBe(false)
  })

  it("resultSchema accepts both branches and rejects a mixed shape", () => {
    const schema = resultSchema(ShopperView)
    expect(schema.safeParse(ok(shopper)).success).toBe(true)
    expect(schema.safeParse(fail("internal", "boom")).success).toBe(true)
    expect(schema.safeParse({ ok: true, error: { code: "internal", message: "x" } }).success).toBe(false)
  })
})

describe("ShopperView", () => {
  it("accepts a full shopper", () => {
    expect(ShopperView.parse(shopper)).toEqual(shopper)
  })

  it("accepts a shopper without names", () => {
    const { firstName: _f, lastName: _l, ...bare } = shopper
    expect(ShopperView.parse(bare)).toEqual(bare)
  })

  it("strips unknown keys", () => {
    const parsed = ShopperView.parse({ ...shopper, has_account: true, metadata: {} })
    expect(parsed).toEqual(shopper)
    expect("has_account" in parsed).toBe(false)
  })

  it("rejects bad shapes", () => {
    expect(ShopperView.safeParse({ ...shopper, email: "not-an-email" }).success).toBe(false)
    expect(ShopperView.safeParse({ ...shopper, id: 42 }).success).toBe(false)
    expect(ShopperView.safeParse({ ...shopper, createdAt: "yesterday" }).success).toBe(false)
    const { id: _id, ...noId } = shopper
    expect(ShopperView.safeParse(noId).success).toBe(false)
  })
})

describe("SignUpInput", () => {
  it("requires a password of at least 8 characters", () => {
    expect(SignUpInput.safeParse({ email: "a@example.com", password: "1234567" }).success).toBe(false)
    expect(SignUpInput.safeParse({ email: "a@example.com", password: "12345678" }).success).toBe(true)
  })
})
