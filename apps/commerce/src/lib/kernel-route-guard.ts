import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { isShopRoute, matchKernelRoute, normalisePath, type ApiError } from "@shop/contracts"

/**
 * Where the guard is mounted: every kernel route namespace (AD-21). Nothing
 * under /rbac, /cloud or /hooks is allowed yet; Story 1.10 adds the payment hook.
 */
export const KERNEL_ROUTE_MATCHERS = ["/store*", "/admin*", "/auth*", "/rbac*", "/cloud*", "/hooks*"] as const

export type GuardDecision = { allowed: true } | { allowed: false; error: ApiError }

/**
 * Decides whether a kernel request may reach its handler. Shop routes pass
 * untouched (the prefix match is case-sensitive, so `/Store/shop/x` is not a
 * shop route and is refused); every other path must match ALLOWED_KERNEL_ROUTES
 * in `@shop/contracts`. The kernel answers CORS preflights for its existing
 * routes itself (`preflightContinue: false`), so only the preflights it leaves
 * alone reach the guard; those are judged by the method they ask for.
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
