import { z } from "zod"

/**
 * The kernel route allow-list (AD-21). Every kernel store, admin and auth route
 * is refused with `route.not_allowed` unless it is on ALLOWED_KERNEL_ROUTES.
 * Routes on NEVER_ALLOWED_KERNEL_ROUTES change money or stock outside the shop's
 * workflows; a test fails if one of them is ever allowed. Shop routes
 * (`/store/shop/*`, `/admin/shop/*`, `/internal/*`, `/webhooks/*`) are the shop's
 * own and are not governed by these lists.
 *
 * Add a kernel route only in the story that first calls it (docs/kernel-routes.md).
 */

export const KernelRouteMethod = z.enum(["GET", "POST", "DELETE"])
export type KernelRouteMethod = z.infer<typeof KernelRouteMethod>

const SEGMENT = /^(?:[a-z0-9][a-z0-9._-]*|:[a-z_][a-z0-9_]*)$/

/**
 * A kernel route: a method and an Express-style path pattern. `:name` matches one
 * path segment. A final `*` segment matches the rest of the path (zero or more
 * segments) and is allowed on read (GET) patterns only.
 */
export const KernelRoute = z
  .object({
    method: KernelRouteMethod,
    pattern: z.string().regex(/^\/(store|admin|auth)(\/|$)/, "A kernel route lives under /store, /admin or /auth"),
  })
  .superRefine((route, ctx) => {
    const segments = route.pattern.split("/").slice(1)
    segments.forEach((segment, i) => {
      const last = i === segments.length - 1
      if (segment === "*") {
        if (!last) ctx.addIssue({ code: "custom", message: "`*` is only allowed as the last segment" })
        if (route.method !== "GET") ctx.addIssue({ code: "custom", message: "`*` is only allowed on read (GET) patterns" })
        return
      }
      if (!SEGMENT.test(segment)) {
        ctx.addIssue({ code: "custom", message: `Invalid path segment "${segment}" in ${route.pattern}` })
      }
    })
  })
export type KernelRoute = z.infer<typeof KernelRoute>

const r = (method: KernelRouteMethod, pattern: string): KernelRoute => ({ method, pattern })

/**
 * Kernel routes that may be called. Writes are listed one by one; reads are the
 * ones the kept admin screens request (recorded from the dashboard, Story 1.4).
 */
export const ALLOWED_KERNEL_ROUTES: readonly KernelRoute[] = [
  // Shopper sign-up and sign-in (Story 1.2, packages/api-client). Customer identity only.
  r("POST", "/auth/customer/emailpass/register"),
  r("POST", "/auth/customer/emailpass"),
  r("POST", "/store/customers"),
  r("GET", "/store/customers/me"),

  // The Shopper's Bag (Story 1.8, packages/api-client): the kernel cart, anonymous,
  // its id kept by the client. The Bag is read through the shop route
  // GET /store/shop/bag/:cartId. Completion stays never-allowed.
  r("POST", "/store/carts"),
  r("POST", "/store/carts/:id/line-items"),
  r("POST", "/store/carts/:id/line-items/:line_id"),
  r("DELETE", "/store/carts/:id/line-items/:line_id"),

  // Admin sign-in and sign-out (dashboard). User identity only.
  r("GET", "/auth/user/providers"),
  r("POST", "/auth/user/emailpass"),
  r("POST", "/auth/session"),
  r("DELETE", "/auth/session"),
  r("GET", "/auth/mfa/factors"),

  // Reads every kept admin screen makes (shell, sidebar, top bar).
  r("GET", "/admin/users/me"),
  r("GET", "/admin/stores"),
  r("GET", "/admin/feature-flags"),
  r("GET", "/admin/modules"),
  r("GET", "/admin/plugins"),
  r("GET", "/admin/notifications"),
  r("GET", "/admin/cloud/announcements"),
  r("GET", "/admin/search-indexes"),
  r("GET", "/admin/layouts/configurations"),
  r("GET", "/admin/layouts/:key/configuration"),

  // Orders list and detail (read only; every order write waits for the shop's workflows).
  r("GET", "/admin/orders"),
  r("GET", "/admin/orders/:id"),
  r("GET", "/admin/orders/:id/changes"),
  r("GET", "/admin/orders/:id/preview"),
  r("GET", "/admin/returns"),
  r("GET", "/admin/claims"),
  r("GET", "/admin/exchanges"),
  r("GET", "/admin/reservations"),
  r("GET", "/admin/regions"),
  r("GET", "/admin/sales-channels"),

  // Products list and detail (read only).
  r("GET", "/admin/products"),
  r("GET", "/admin/products/:id"),
  r("GET", "/admin/products/:id/variants"),
  r("GET", "/admin/product-tags"),
  r("GET", "/admin/product-types"),

  // Customers list and detail (read only).
  r("GET", "/admin/customers"),
  r("GET", "/admin/customers/:id"),
  r("GET", "/admin/customer-groups"),

  // Settings: store, profile, users, regions, tax regions, return reasons, sales
  // channels, product types and tags, locations (read only). Not API keys: the
  // list read takes `?type=secret` too, and the query is not part of the match.
  r("GET", "/admin/currencies"),
  r("GET", "/admin/price-preferences"),
  r("GET", "/admin/sales-channels/:id"),
  r("GET", "/admin/users"),
  r("GET", "/admin/users/:id"),
  r("GET", "/admin/invites"),
  r("GET", "/admin/regions/:id"),
  r("GET", "/admin/tax-regions"),
  r("GET", "/admin/tax-regions/:id"),
  r("GET", "/admin/tax-rates"),
  r("GET", "/admin/return-reasons"),
  r("GET", "/admin/return-reasons/:id"),
  r("GET", "/admin/product-types/:id"),
  r("GET", "/admin/product-tags/:id"),
  r("GET", "/admin/stock-locations"),
  r("GET", "/admin/stock-locations/:id"),
  r("GET", "/admin/shipping-profiles"),
]

/**
 * Kernel routes that must never be allowed: cart completion; stock levels,
 * inventory items, stock locations and variant stock links; reservations;
 * payments, payment collections and store payment sessions; and Order,
 * fulfillment, return, claim, exchange and draft-order writes that move money
 * or stock. Only the shop's workflows do these.
 */
export const NEVER_ALLOWED_KERNEL_ROUTES: readonly KernelRoute[] = [
  // Cart completion: only `confirm-payment` completes a cart, on the server (Story 1.10).
  r("POST", "/store/carts/:id/complete"),

  // Stock levels and inventory items with levels (only `adjust-stock` and the stock workflows).
  r("POST", "/admin/inventory-items"),
  r("DELETE", "/admin/inventory-items/:id"),
  r("POST", "/admin/inventory-items/:id/location-levels"),
  r("POST", "/admin/inventory-items/:id/location-levels/batch"),
  r("POST", "/admin/inventory-items/:id/location-levels/:location_id"),
  r("DELETE", "/admin/inventory-items/:id/location-levels/:location_id"),
  r("POST", "/admin/inventory-items/location-levels/batch"),

  // Reservations (only Holds, through `begin-checkout` and `release-hold`).
  r("POST", "/admin/reservations"),
  r("POST", "/admin/reservations/:id"),
  r("DELETE", "/admin/reservations/:id"),

  // Payments and payment collections.
  r("POST", "/admin/payments/:id/capture"),
  r("POST", "/admin/payments/:id/refund"),
  r("POST", "/admin/payment-collections"),
  r("DELETE", "/admin/payment-collections/:id"),
  r("POST", "/admin/payment-collections/:id/mark-as-paid"),
  r("POST", "/admin/payment-collections/:id/payment-sessions"),
  r("POST", "/admin/orders/:id/payment-sessions/authorize"),

  // Store payment sessions: payment starts only in the shop's checkout (Story 1.10).
  r("POST", "/store/payment-collections/:id/payment-sessions"),
  r("POST", "/store/payment-collections/:id/payment-sessions/:session_id"),

  // Stock locations and the links that say how much stock a variant uses. The shop
  // has one stock location, India, seeded by the stock seed (Story 1.7): none is
  // created, changed, deleted or linked to sales channels or fulfilment here.
  r("POST", "/admin/stock-locations"),
  r("POST", "/admin/stock-locations/:id"),
  r("DELETE", "/admin/stock-locations/:id"),
  r("POST", "/admin/stock-locations/:id/sales-channels"),
  r("POST", "/admin/stock-locations/:id/fulfillment-sets"),
  r("POST", "/admin/stock-locations/:id/fulfillment-providers"),
  r("POST", "/admin/products/:id/variants/:variant_id/inventory-items"),
  r("POST", "/admin/products/:id/variants/:variant_id/inventory-items/:inventory_item_id"),
  r("DELETE", "/admin/products/:id/variants/:variant_id/inventory-items/:inventory_item_id"),
  r("POST", "/admin/products/:id/variants/inventory-items/batch"),

  // Orders: cancellation, credit lines and fulfillments (stock leaves only through `fulfil-order`).
  r("POST", "/admin/orders/:id/cancel"),
  r("POST", "/admin/orders/:id/credit-lines"),
  r("POST", "/admin/orders/:id/fulfillments"),
  r("POST", "/admin/orders/:id/fulfillments/:fulfillment_id/cancel"),
  r("POST", "/admin/orders/:id/fulfillments/:fulfillment_id/shipments"),
  r("POST", "/admin/orders/:id/fulfillments/:fulfillment_id/mark-as-delivered"),
  r("POST", "/admin/fulfillments/:id/shipment"),
  r("POST", "/admin/fulfillments/:id/cancel"),

  // Order edits.
  r("POST", "/admin/order-edits"),
  r("DELETE", "/admin/order-edits/:id"),
  r("POST", "/admin/order-edits/:id/request"),
  r("POST", "/admin/order-edits/:id/confirm"),
  r("POST", "/admin/order-edits/:id/items"),
  r("POST", "/admin/order-edits/:id/items/item/:item_id"),
  r("POST", "/admin/order-edits/:id/items/:action_id"),
  r("DELETE", "/admin/order-edits/:id/items/:action_id"),
  r("POST", "/admin/order-edits/:id/shipping-method"),
  r("POST", "/admin/order-edits/:id/shipping-method/:action_id"),
  r("DELETE", "/admin/order-edits/:id/shipping-method/:action_id"),

  // Returns: creating, requesting, receiving and their item actions (only `restock-return`).
  r("POST", "/admin/returns"),
  r("POST", "/admin/returns/:id/request"),
  r("POST", "/admin/returns/:id/request-items"),
  r("POST", "/admin/returns/:id/request-items/:action_id"),
  r("DELETE", "/admin/returns/:id/request-items/:action_id"),
  r("POST", "/admin/returns/:id/receive"),
  r("DELETE", "/admin/returns/:id/receive"),
  r("POST", "/admin/returns/:id/receive/confirm"),
  r("POST", "/admin/returns/:id/receive-items"),
  r("POST", "/admin/returns/:id/receive-items/:action_id"),
  r("DELETE", "/admin/returns/:id/receive-items/:action_id"),
  r("POST", "/admin/returns/:id/dismiss-items"),
  r("POST", "/admin/returns/:id/dismiss-items/:action_id"),
  r("DELETE", "/admin/returns/:id/dismiss-items/:action_id"),

  // Claims and exchanges: requesting them and their inbound and outbound item actions.
  ...(["claims", "exchanges"] as const).flatMap((kind) => [
    r("POST", `/admin/${kind}/:id/request`),
    ...(["inbound", "outbound"] as const).flatMap((side) => [
      r("POST", `/admin/${kind}/:id/${side}/items`),
      r("POST", `/admin/${kind}/:id/${side}/items/:action_id`),
      r("DELETE", `/admin/${kind}/:id/${side}/items/:action_id`),
    ]),
  ]),

  // Draft orders: converting into an Order, and every edit write.
  r("POST", "/admin/draft-orders/:id/convert-to-order"),
  r("POST", "/admin/draft-orders/:id/edit"),
  r("DELETE", "/admin/draft-orders/:id/edit"),
  r("POST", "/admin/draft-orders/:id/edit/request"),
  r("POST", "/admin/draft-orders/:id/edit/confirm"),
  r("POST", "/admin/draft-orders/:id/edit/items"),
  r("POST", "/admin/draft-orders/:id/edit/items/item/:item_id"),
  r("POST", "/admin/draft-orders/:id/edit/items/:action_id"),
  r("DELETE", "/admin/draft-orders/:id/edit/items/:action_id"),
  r("POST", "/admin/draft-orders/:id/edit/promotions"),
  r("DELETE", "/admin/draft-orders/:id/edit/promotions"),
  r("POST", "/admin/draft-orders/:id/edit/shipping-methods"),
  r("POST", "/admin/draft-orders/:id/edit/shipping-methods/:action_id"),
  r("DELETE", "/admin/draft-orders/:id/edit/shipping-methods/:action_id"),
  r("POST", "/admin/draft-orders/:id/edit/shipping-methods/method/:method_id"),
  r("DELETE", "/admin/draft-orders/:id/edit/shipping-methods/method/:method_id"),
]

/** Path prefixes of the shop's own routes, outside the kernel allow-list. */
export const SHOP_ROUTE_PREFIXES = ["/store/shop", "/admin/shop", "/internal", "/webhooks"] as const

/** The path without its query string and without a trailing slash (the root stays `/`). */
export function normalisePath(path: string): string {
  const bare = path.split(/[?#]/, 1)[0] ?? ""
  const trimmed = bare.replace(/\/+$/, "")
  return trimmed === "" ? "/" : trimmed
}

/** True for `/store/shop`, `/admin/shop`, `/internal` and `/webhooks` and anything below them. */
export function isShopRoute(path: string): boolean {
  const p = normalisePath(path)
  return SHOP_ROUTE_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
}

function segmentsOf(path: string): string[] {
  return normalisePath(path).split("/").slice(1)
}

/** Does the concrete path match the pattern? Case-sensitive, so odd spellings are refused. */
export function matchesPattern(pattern: string, path: string): boolean {
  const pat = segmentsOf(pattern)
  const got = segmentsOf(path)
  for (let i = 0; i < pat.length; i++) {
    const p = pat[i]!
    if (p === "*" && i === pat.length - 1) return true
    const g = got[i]
    if (g === undefined || g === "") return false
    if (p.startsWith(":")) continue
    if (p !== g) return false
  }
  return got.length === pat.length
}

/**
 * The allowed route a request matches, or undefined when it must be refused.
 * HEAD is checked as GET, since the kernel answers HEAD with the GET handler.
 */
export function matchKernelRoute(
  method: string,
  path: string,
  routes: readonly KernelRoute[] = ALLOWED_KERNEL_ROUTES
): KernelRoute | undefined {
  const m = method.toUpperCase() === "HEAD" ? "GET" : method.toUpperCase()
  return routes.find((route) => route.method === m && matchesPattern(route.pattern, path))
}

/**
 * Could one request match both routes? Same method, and every segment pair is
 * compatible (equal literals, or a `:param` on either side), with a final `*`
 * matching any remainder. Used to keep the never-allowed list out of the allowed one.
 */
export function routesOverlap(a: KernelRoute, b: KernelRoute): boolean {
  if (a.method !== b.method) return false
  const as = segmentsOf(a.pattern)
  const bs = segmentsOf(b.pattern)
  for (let i = 0; ; i++) {
    const x = as[i]
    const y = bs[i]
    if (x === "*" || y === "*") return true
    if (x === undefined || y === undefined) return x === y
    if (x.startsWith(":") || y.startsWith(":")) continue
    if (x !== y) return false
  }
}
