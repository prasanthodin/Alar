import { describe, expect, it } from "vitest"
import {
  ALLOWED_KERNEL_ROUTES,
  KernelRoute,
  NEVER_ALLOWED_KERNEL_ROUTES,
  isShopRoute,
  matchKernelRoute,
  matchesPattern,
  routesOverlap,
} from "./index"

const label = (r: KernelRoute) => `${r.method} ${r.pattern}`

describe("route lists", () => {
  it("every allowed and never-allowed route is a valid KernelRoute", () => {
    for (const route of [...ALLOWED_KERNEL_ROUTES, ...NEVER_ALLOWED_KERNEL_ROUTES]) {
      const parsed = KernelRoute.safeParse(route)
      expect(parsed.success, `${label(route)}: ${parsed.error?.message}`).toBe(true)
    }
  })

  it("lists each allowed route once", () => {
    const labels = ALLOWED_KERNEL_ROUTES.map(label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it("allows no never-allowed route, by pattern overlap", () => {
    const clashes = NEVER_ALLOWED_KERNEL_ROUTES.flatMap((never) =>
      ALLOWED_KERNEL_ROUTES.filter((allowed) => routesOverlap(allowed, never)).map(
        (allowed) => `${label(allowed)} overlaps never-allowed ${label(never)}`
      )
    )
    expect(clashes).toEqual([])
  })

  it("holds no shop route", () => {
    const shop = ALLOWED_KERNEL_ROUTES.filter((r) => isShopRoute(r.pattern)).map(label)
    expect(shop).toEqual([])
  })

  it("has no blanket write rule and no wildcard on a write", () => {
    for (const route of ALLOWED_KERNEL_ROUTES) {
      if (route.method !== "GET") expect(route.pattern, label(route)).not.toContain("*")
    }
  })

  it("contains the Story 1.2 sign-up and sign-in routes", () => {
    for (const [method, path] of [
      ["POST", "/auth/customer/emailpass/register"],
      ["POST", "/auth/customer/emailpass"],
      ["POST", "/store/customers"],
      ["GET", "/store/customers/me"],
    ] as const) {
      expect(matchKernelRoute(method, path), `${method} ${path}`).toBeDefined()
    }
  })

  it.each([
    ["POST", "/store/carts/cart_01/complete"],
    ["POST", "/admin/inventory-items/iitem_01/location-levels/sloc_01"],
    ["POST", "/admin/inventory-items/iitem_01/location-levels"],
    ["POST", "/admin/reservations"],
    ["DELETE", "/admin/reservations/res_01"],
    ["POST", "/admin/payments/pay_01/capture"],
    ["POST", "/admin/payments/pay_01/refund"],
    ["POST", "/admin/payment-collections/pc_01/mark-as-paid"],
    ["POST", "/admin/order-edits/oe_01/confirm"],
  ])("refuses %s %s", (method, path) => {
    expect(matchKernelRoute(method, path)).toBeUndefined()
    expect(matchKernelRoute(method, path, NEVER_ALLOWED_KERNEL_ROUTES)).toBeDefined()
  })
})

describe("never-allowed guard", () => {
  it("names a never-allowed route that someone adds to the allowed list", () => {
    const tampered = [...ALLOWED_KERNEL_ROUTES, { method: "POST", pattern: "/store/carts/:cart/complete" } as const]
    const clashes = NEVER_ALLOWED_KERNEL_ROUTES.flatMap((never) =>
      tampered.filter((a) => routesOverlap(a, never)).map((a) => `${label(a)} overlaps ${label(never)}`)
    )
    expect(clashes).toEqual(["POST /store/carts/:cart/complete overlaps POST /store/carts/:id/complete"])
  })

  it("catches a broad pattern that would cover a never-allowed route", () => {
    expect(routesOverlap({ method: "POST", pattern: "/admin/payments/:id/:action" }, { method: "POST", pattern: "/admin/payments/:id/refund" })).toBe(true)
    expect(routesOverlap({ method: "GET", pattern: "/admin/*" }, { method: "GET", pattern: "/admin/orders/:id" })).toBe(true)
  })

  it("does not flag different methods or different shapes", () => {
    expect(routesOverlap({ method: "GET", pattern: "/admin/reservations" }, { method: "POST", pattern: "/admin/reservations" })).toBe(false)
    expect(routesOverlap({ method: "POST", pattern: "/admin/payments/:id" }, { method: "POST", pattern: "/admin/payments/:id/refund" })).toBe(false)
    expect(routesOverlap({ method: "POST", pattern: "/admin/orders/:id/complete" }, { method: "POST", pattern: "/admin/orders/:id/credit-lines" })).toBe(false)
  })
})

describe("KernelRoute", () => {
  it("refuses a wildcard on a write and a wildcard before the end", () => {
    expect(KernelRoute.safeParse({ method: "POST", pattern: "/admin/*" }).success).toBe(false)
    expect(KernelRoute.safeParse({ method: "GET", pattern: "/admin/*/x" }).success).toBe(false)
    expect(KernelRoute.safeParse({ method: "GET", pattern: "/admin/products/*" }).success).toBe(true)
  })

  it("refuses a path outside the kernel namespaces", () => {
    expect(KernelRoute.safeParse({ method: "GET", pattern: "/hooks/payment/:provider" }).success).toBe(false)
  })
})

describe("matchesPattern", () => {
  it("matches literals and one segment per :param", () => {
    expect(matchesPattern("/admin/orders/:id", "/admin/orders/order_01")).toBe(true)
    expect(matchesPattern("/admin/orders/:id", "/admin/orders/order_01/changes")).toBe(false)
    expect(matchesPattern("/admin/orders/:id", "/admin/orders")).toBe(false)
    expect(matchesPattern("/admin/orders/:id", "/admin/orders//")).toBe(false)
  })

  it("ignores the query string and a trailing slash", () => {
    expect(matchesPattern("/store/customers/me", "/store/customers/me/?fields=id")).toBe(true)
  })

  it("is case-sensitive, so an odd spelling is refused", () => {
    expect(matchesPattern("/store/customers/me", "/store/customers/ME")).toBe(false)
  })

  it("lets a final * match the rest, including nothing", () => {
    expect(matchesPattern("/admin/products/*", "/admin/products")).toBe(true)
    expect(matchesPattern("/admin/products/*", "/admin/products/prod_01/variants")).toBe(true)
    expect(matchesPattern("/admin/products/*", "/admin/product-tags")).toBe(false)
  })

  it("refuses an empty segment in the middle", () => {
    expect(matchesPattern("/store/carts/:id/complete", "/store/carts//complete")).toBe(false)
  })
})

describe("matchKernelRoute", () => {
  it("checks HEAD as GET and is case-insensitive about the method", () => {
    expect(matchKernelRoute("HEAD", "/store/customers/me")).toBeDefined()
    expect(matchKernelRoute("get", "/store/customers/me")).toBeDefined()
  })

  it("refuses an unlisted kernel route", () => {
    expect(matchKernelRoute("GET", "/store/collections")).toBeUndefined()
    expect(matchKernelRoute("POST", "/store/customers/me")).toBeUndefined()
  })

  it("keeps identities apart: Shopper routes for customers, admin sign-in for users", () => {
    expect(matchKernelRoute("POST", "/auth/customer/emailpass")).toBeDefined()
    expect(matchKernelRoute("POST", "/auth/user/emailpass")).toBeDefined()
    expect(matchKernelRoute("POST", "/auth/user/emailpass/register")).toBeUndefined()
    expect(matchKernelRoute("POST", "/auth/customer/google")).toBeUndefined()
  })
})

describe("isShopRoute", () => {
  it.each(["/store/shop", "/store/shop/anything", "/admin/shop/x/y", "/internal/jobs", "/webhooks/razorpay", "/webhooks"])(
    "treats %s as a shop route",
    (path) => expect(isShopRoute(path)).toBe(true)
  )

  it.each(["/store/shopping", "/store/carts", "/admin/shops", "/internals", "/Store/shop/x"])(
    "does not treat %s as a shop route",
    (path) => expect(isShopRoute(path)).toBe(false)
  )
})
