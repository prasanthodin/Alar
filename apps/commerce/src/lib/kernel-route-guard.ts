import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { isShopRoute, matchKernelRoute, normalisePath, type ApiError } from "@shop/contracts"

/** Where the guard is mounted: every kernel store, admin and auth route (AD-21). */
export const KERNEL_ROUTE_MATCHERS = ["/store*", "/admin*", "/auth*"] as const

export type GuardDecision = { allowed: true } | { allowed: false; error: ApiError }

/**
 * Decides whether a kernel request may reach its handler. Shop routes pass
 * untouched; every other path must match ALLOWED_KERNEL_ROUTES in
 * `@shop/contracts`. A CORS preflight is judged by the method it asks for.
 */
export function decideKernelRoute(
  method: string,
  url: string,
  preflightMethod?: string | string[]
): GuardDecision {
  const path = normalisePath(url)
  if (isShopRoute(path)) return { allowed: true }
  const asked = Array.isArray(preflightMethod) ? preflightMethod[0] : preflightMethod
  const effective = method.toUpperCase() === "OPTIONS" && asked ? asked : method
  if (matchKernelRoute(effective, path)) return { allowed: true }
  return {
    allowed: false,
    error: {
      code: "route.not_allowed",
      message: `${effective.toUpperCase()} ${path} is not an allowed kernel route`,
    },
  }
}

/**
 * Refuses kernel routes that are not on the allow-list with 403 and the error
 * envelope. It runs before every kernel route handler, so a refused request
 * changes nothing.
 */
export function kernelRouteGuard(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  // `originalUrl` keeps the full path; the mount point strips it from `req.path`.
  const decision = decideKernelRoute(
    req.method,
    req.originalUrl,
    req.headers["access-control-request-method"]
  )
  if (decision.allowed) return next()
  res.status(403).json(decision.error)
}
