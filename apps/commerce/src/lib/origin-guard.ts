import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendEnvelope } from "./shop-errors"

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

/** True when `origin` is one of the comma-separated entries: an exact origin or a `/regex/`. */
export function originAllowed(origin: string, allowList: string): boolean {
  return allowList
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .some((entry) => {
      if (entry.length > 2 && entry.startsWith("/") && entry.endsWith("/")) {
        try {
          return new RegExp(entry.slice(1, -1)).test(origin)
        } catch {
          return false
        }
      }
      return entry === origin
    })
}

/** The origin a request says it comes from: `Origin`, else the origin of `Referer`, else null. */
export function requestOrigin(headers: { origin?: string | string[]; referer?: string | string[] }): string | null {
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)
  const origin = first(headers.origin)
  if (origin && origin !== "null") return origin
  const referer = first(headers.referer)
  if (!referer) return null
  try {
    return new URL(referer).origin
  } catch {
    return null
  }
}

/**
 * Shop admin routes are authenticated by the dashboard's session cookie, so a
 * write (POST, PUT, PATCH, DELETE) must come from an admin origin: its
 * `Origin` (or, without one, its `Referer`) must be in `ADMIN_CORS`. Anything
 * else, including a write that names no origin, gets 403 `request.cross_origin`
 * and changes nothing. Reads pass.
 */
export function adminOriginGuard(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  if (!WRITE_METHODS.has(req.method.toUpperCase())) return next()
  const { projectConfig } = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
  const origin = requestOrigin(req.headers)
  if (origin && originAllowed(origin, projectConfig.http.adminCors ?? "")) return next()
  sendEnvelope(res, {
    code: "request.cross_origin",
    message: "A shop admin write must come from an admin origin (ADMIN_CORS)",
  })
}
