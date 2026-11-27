import { describe, expect, it, vi } from "vitest"
import { sendShopError, shopError, shopErrorOf } from "../shop-errors"

describe("shop errors", () => {
  it("carries the code and details of a shop error, also when a workflow wraps it", () => {
    const e = shopError("design.not_publishable", "missing", { missing: ["fibre"] })
    expect(shopErrorOf(e)).toEqual({ code: "design.not_publishable", message: "missing", details: { missing: ["fibre"] } })
    const wrapped = { errors: [{ error: { code: "design.unknown_tax_code", message: "x" } }] }
    expect(shopErrorOf(wrapped)).toEqual({ code: "design.unknown_tax_code", message: "x" })
  })

  it("answers with the status of the code", () => {
    const json = vi.fn()
    const res = { status: vi.fn(() => ({ json })) }
    sendShopError(res, shopError("design.not_found", "No Design"))
    expect(res.status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({ code: "design.not_found", message: "No Design" })
  })

  it("rethrows an error without a shop code, for the kernel's handler", () => {
    const res = { status: vi.fn() }
    const boom = new Error("boom")
    expect(() => sendShopError(res as never, boom)).toThrow(boom)
    expect(() => sendShopError(res as never, { code: "internal", message: "x" })).toThrow()
    expect(res.status).not.toHaveBeenCalled()
  })
})
