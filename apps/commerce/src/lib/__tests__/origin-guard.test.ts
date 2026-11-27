import { describe, expect, it, vi } from "vitest"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { adminOriginGuard, originAllowed, requestOrigin } from "../origin-guard"

const ADMIN_CORS = "http://localhost:5173, http://localhost:9000,/^https:\\/\\/admin\\.example\\.test$/"

function run(method: string, headers: Record<string, string>) {
  const json = vi.fn()
  const res = { status: vi.fn(() => ({ json })) }
  const next = vi.fn()
  const req = {
    method,
    headers,
    scope: { resolve: () => ({ projectConfig: { http: { adminCors: ADMIN_CORS } } }) },
  }
  adminOriginGuard(req as unknown as MedusaRequest, res as unknown as MedusaResponse, next as MedusaNextFunction)
  return { next, res, json }
}

describe("admin origin guard", () => {
  it("matches exact origins and /regex/ entries", () => {
    expect(originAllowed("http://localhost:9000", ADMIN_CORS)).toBe(true)
    expect(originAllowed("https://admin.example.test", ADMIN_CORS)).toBe(true)
    expect(originAllowed("http://localhost:9001", ADMIN_CORS)).toBe(false)
    expect(originAllowed("https://evil.example", ADMIN_CORS)).toBe(false)
  })

  it("takes Origin, else the origin of Referer", () => {
    expect(requestOrigin({ origin: "http://localhost:9000", referer: "https://evil.example/x" })).toBe("http://localhost:9000")
    expect(requestOrigin({ referer: "http://localhost:9000/app/designs" })).toBe("http://localhost:9000")
    expect(requestOrigin({ origin: "null" })).toBeNull()
    expect(requestOrigin({})).toBeNull()
  })

  it("lets reads and admin-origin writes through", () => {
    expect(run("GET", {}).next).toHaveBeenCalled()
    expect(run("POST", { origin: "http://localhost:9000" }).next).toHaveBeenCalled()
    expect(run("POST", { referer: "http://localhost:9000/app/designs/1" }).next).toHaveBeenCalled()
  })

  it.each([
    ["another origin", { origin: "https://evil.example" }],
    ["another referer", { referer: "https://evil.example/page" }],
    ["no origin at all", {}],
  ])("refuses a write from %s with 403 request.cross_origin", (_, headers) => {
    const { next, res, json } = run("POST", headers)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: "request.cross_origin" }))
  })
})
