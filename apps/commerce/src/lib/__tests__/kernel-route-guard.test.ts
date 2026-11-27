import { describe, expect, it, vi } from "vitest"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { decideKernelRoute, kernelRouteGuard } from "../kernel-route-guard"

describe("decideKernelRoute", () => {
  it("lets an allowed route through, ignoring the query string", () => {
    expect(decideKernelRoute("GET", "/store/customers/me?fields=id")).toEqual({ allowed: true })
    expect(decideKernelRoute("POST", "/auth/customer/emailpass")).toEqual({ allowed: true })
  })

  it("refuses an unlisted route with the route.not_allowed envelope, without the query string", () => {
    expect(decideKernelRoute("GET", "/store/collections?q=secret")).toEqual({
      allowed: false,
      error: { code: "route.not_allowed", message: "GET /store/collections is not an allowed kernel route" },
    })
  })

  it.each([
    ["POST", "/store/carts/cart_01/complete"],
    ["POST", "/store/carts/cart_01/complete/"],
    ["POST", "/STORE/carts/cart_01/complete"],
    ["POST", "/store/carts//complete"],
    ["POST", "/admin/payments/pay_01/refund"],
    ["POST", "/admin/reservations"],
  ])("refuses %s %s", (method, url) => {
    expect(decideKernelRoute(method, url).allowed).toBe(false)
  })

  it("passes shop routes untouched", () => {
    expect(decideKernelRoute("POST", "/store/shop/anything")).toEqual({ allowed: true })
    expect(decideKernelRoute("DELETE", "/admin/shop/x/y")).toEqual({ allowed: true })
  })

  it("judges a CORS preflight by the method it asks for", () => {
    expect(decideKernelRoute("OPTIONS", "/auth/customer/emailpass", "POST").allowed).toBe(true)
    expect(decideKernelRoute("OPTIONS", "/store/carts/c/complete", "POST").allowed).toBe(false)
    expect(decideKernelRoute("OPTIONS", "/store/customers/me").allowed).toBe(false)
  })
})

describe("kernelRouteGuard", () => {
  function run(method: string, originalUrl: string) {
    const json = vi.fn()
    const status = vi.fn(() => ({ json }))
    const next = vi.fn()
    const req = { method, originalUrl, headers: {} } as unknown as MedusaRequest
    const res = { status } as unknown as MedusaResponse
    kernelRouteGuard(req, res, next as unknown as MedusaNextFunction)
    return { status, json, next }
  }

  it("calls next for an allowed route", () => {
    const { next, status } = run("GET", "/store/customers/me")
    expect(next).toHaveBeenCalledOnce()
    expect(status).not.toHaveBeenCalled()
  })

  it("answers 403 with the envelope and never calls next for a refused route", () => {
    const { next, status, json } = run("POST", "/store/carts/cart_01/complete")
    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({
      code: "route.not_allowed",
      message: "POST /store/carts/cart_01/complete is not an allowed kernel route",
    })
  })
})
