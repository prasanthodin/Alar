import { describe, expect, it, vi } from "vitest"
import { MedusaError } from "@medusajs/framework/utils"
import { sendShopError, sendShopErrorOrInternal, shopError, shopErrorOf } from "../shop-errors"

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

describe("sendShopErrorOrInternal", () => {
  it("answers a stock error with its status, and anything else with 500 internal, logged by message only", () => {
    const json = vi.fn()
    const res = { status: vi.fn(() => ({ json })) }
    const logger = { error: vi.fn() }
    sendShopErrorOrInternal(res, shopError("stock.below_reserved", "below"), logger)
    expect(res.status).toHaveBeenLastCalledWith(409)
    expect(json).toHaveBeenLastCalledWith({ code: "stock.below_reserved", message: "below" })
    sendShopErrorOrInternal(res, shopError("stock.invalid_quantity", "negative"), logger)
    expect(res.status).toHaveBeenLastCalledWith(400)
    sendShopErrorOrInternal(res, shopError("stock.lock_timeout", "held"), logger)
    expect(res.status).toHaveBeenLastCalledWith(409)
    sendShopErrorOrInternal(res, new Error("ledger down"), logger)
    expect(res.status).toHaveBeenLastCalledWith(500)
    expect(json).toHaveBeenLastCalledWith({ code: "internal", message: "Something went wrong" })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("ledger down"))
    // The stack is logged, not only the message.
    expect(logger.error).toHaveBeenLastCalledWith(expect.stringContaining("shop-errors.test.ts"))
    sendShopErrorOrInternal(res, shopError("internal", "broken record"), logger)
    expect(res.status).toHaveBeenLastCalledWith(500)
    expect(json).toHaveBeenLastCalledWith({ code: "internal", message: "Something went wrong" })
  })

  it("rethrows a kernel error (not found, invalid data) for the kernel's handler, also wrapped by a workflow", () => {
    const res = { status: vi.fn() }
    const logger = { error: vi.fn() }
    const notFound = new MedusaError(MedusaError.Types.NOT_FOUND, "User not found")
    expect(() => sendShopErrorOrInternal(res as never, notFound, logger)).toThrow(notFound)
    const invalid = new MedusaError(MedusaError.Types.INVALID_DATA, "bad")
    expect(() => sendShopErrorOrInternal(res as never, { errors: [{ error: invalid }] }, logger)).toThrow(invalid)
    expect(res.status).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })
})
