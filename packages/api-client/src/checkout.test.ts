import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createApiClient, type TokenStore } from "./index"

type Call = { path: string; method: string; headers: Headers; body: unknown }
type Route = (call: Call) => Response | Promise<Response>

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
}

let calls: Call[]
let routes: Record<string, Route>

beforeEach(() => {
  calls = []
  routes = {}
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: URL | string, init: RequestInit = {}) => {
      const url = new URL(String(input))
      const method = (init.method ?? "GET").toUpperCase()
      const call: Call = {
        path: url.pathname,
        method,
        headers: new Headers(init.headers),
        body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
      }
      calls.push(call)
      const route = routes[`${method} ${url.pathname}`]
      return route ? route(call) : json(404, { type: "not_found", message: "no route" })
    })
  )
})
afterEach(() => vi.unstubAllGlobals())

function store(initial: string | null): TokenStore {
  let value = initial
  return {
    get: () => value,
    set: (v) => {
      value = v
    },
    clear: () => {
      value = null
    },
  }
}

function client({ token = "session-token", cartId = "cart_01" }: { token?: string | null; cartId?: string | null } = {}) {
  return createApiClient({
    baseUrl: "http://kernel.test",
    publishableKey: "pk_test",
    platform: "web",
    version: "1.2.3",
    getLanguage: () => "en",
    tokenStore: store(token),
    bagStore: store(cartId),
  })
}

const address = {
  name: "Meena Iyer",
  mobile: "98765 43210",
  addressLine: "12 Temple Street",
  city: "Kanchipuram",
  pincode: "631501",
  state: "Tamil Nadu" as const,
}

const checkout = {
  id: "chk_01",
  status: "held",
  lines: [
    {
      lineId: "cali_01",
      variantId: "variant_01",
      designId: "prod_01",
      name: "Arani silk saree",
      quantity: 1,
      unitPricePaise: 315000,
      taxableTotalPaise: 300000,
      taxTotalPaise: 15000,
      lineTotalPaise: 315000,
      rateBp: 500,
      taxCode: "saree",
    },
  ],
  shippingPaise: 0,
  totalPaise: 315000,
  holdExpiresAt: "2026-11-27T10:30:00.000Z",
  address: { ...address, mobile: "9876543210" },
  createdAt: "2026-11-27T10:15:00.000Z",
}

describe("beginCheckout", () => {
  it("posts the stored Bag and the checked address with the session token and an idempotency key", async () => {
    routes["POST /store/shop/checkouts"] = () => json(201, { checkout })
    const res = await client().beginCheckout(address)
    expect(res).toEqual({ ok: true, data: checkout })
    expect(calls).toHaveLength(1)
    const [call] = calls
    expect(call!.body).toEqual({ cartId: "cart_01", address: { ...address, mobile: "9876543210" } })
    expect(call!.headers.get("authorization")).toBe("Bearer session-token")
    expect(call!.headers.get("idempotency-key")).toBeTruthy()
    expect(call!.headers.get("x-publishable-api-key")).toBe("pk_test")
  })

  it("asks a signed-out Shopper to sign in, and needs a Bag, without calling the kernel", async () => {
    expect(await client({ token: null }).beginCheckout(address)).toMatchObject({
      ok: false,
      error: { code: "auth.unauthenticated" },
    })
    expect(await client({ cartId: null }).beginCheckout(address)).toMatchObject({ ok: false, error: { code: "bag.not_found" } })
    expect(calls).toHaveLength(0)
  })

  it("refuses a 5-digit pincode or a short mobile number with input.invalid naming the field", async () => {
    expect(await client().beginCheckout({ ...address, pincode: "63150" })).toMatchObject({
      ok: false,
      error: { code: "input.invalid", details: { fields: ["pincode"] } },
    })
    expect(await client().beginCheckout({ ...address, mobile: "12345" })).toMatchObject({
      ok: false,
      error: { code: "input.invalid", details: { fields: ["mobile"] } },
    })
    expect(calls).toHaveLength(0)
  })

  it("passes on cart.changed with each changed line, and stock.unavailable and cart.locked", async () => {
    const lines = [
      {
        lineId: "cali_01",
        variantId: "variant_01",
        name: "Arani silk saree",
        reason: "price_changed",
        quantity: 1,
        unitPricePaise: 315000,
        currentPricePaise: 330000,
        available: 2,
      },
    ]
    routes["POST /store/shop/checkouts"] = () => json(409, { code: "cart.changed", message: "changed", details: { lines } })
    expect(await client().beginCheckout(address)).toEqual({
      ok: false,
      error: { code: "cart.changed", message: "changed", details: { lines } },
    })
    for (const code of ["stock.unavailable", "cart.locked"]) {
      routes["POST /store/shop/checkouts"] = () => json(409, { code, message: code })
      expect(await client().beginCheckout(address)).toMatchObject({ ok: false, error: { code } })
    }
  })

  it("maps a refused session to auth.unauthenticated and an unknown failure to internal", async () => {
    routes["POST /store/shop/checkouts"] = () => json(401, { type: "unauthorized", message: "Unauthorized" })
    expect(await client().beginCheckout(address)).toMatchObject({ ok: false, error: { code: "auth.unauthenticated" } })
    routes["POST /store/shop/checkouts"] = () => json(500, { code: "internal", message: "Something went wrong" })
    expect(await client().beginCheckout(address)).toMatchObject({ ok: false, error: { code: "internal" } })
  })

  it("refuses an answer that is not a CheckoutView", async () => {
    routes["POST /store/shop/checkouts"] = () => json(201, { checkout: { ...checkout, status: "paid" } })
    expect(await client().beginCheckout(address)).toMatchObject({ ok: false, error: { code: "response.invalid" } })
  })
})

describe("getCheckout and cancelCheckout", () => {
  it("read and cancel the Shopper's own Checkout with her token", async () => {
    routes["GET /store/shop/checkouts/chk_01"] = () => json(200, { checkout })
    routes["POST /store/shop/checkouts/chk_01/cancel"] = () => json(200, { checkout: { ...checkout, status: "cancelled" } })
    expect(await client().getCheckout("chk_01")).toEqual({ ok: true, data: checkout })
    expect(await client().cancelCheckout("chk_01")).toMatchObject({ ok: true, data: { status: "cancelled" } })
    expect(calls.map((c) => [c.method, c.path, c.headers.get("authorization")])).toEqual([
      ["GET", "/store/shop/checkouts/chk_01", "Bearer session-token"],
      ["POST", "/store/shop/checkouts/chk_01/cancel", "Bearer session-token"],
    ])
  })

  it("answer checkout.not_found for another Shopper's Checkout, and need a session", async () => {
    routes["GET /store/shop/checkouts/chk_02"] = () => json(404, { code: "checkout.not_found", message: "No Checkout" })
    expect(await client().getCheckout("chk_02")).toMatchObject({ ok: false, error: { code: "checkout.not_found" } })
    expect(await client({ token: null }).cancelCheckout("chk_01")).toMatchObject({
      ok: false,
      error: { code: "auth.unauthenticated" },
    })
  })
})

describe("a Bag held by a checkout", () => {
  it("refuses a change with cart.locked", async () => {
    routes["POST /store/carts/cart_01/line-items/cali_01"] = () =>
      json(409, { code: "cart.locked", message: "This Bag is held for a checkout" })
    expect(await client().setBagQuantity("cali_01", 2)).toMatchObject({ ok: false, error: { code: "cart.locked" } })
    routes["DELETE /store/carts/cart_01/line-items/cali_01"] = () => json(409, { code: "cart.locked", message: "held" })
    expect(await client().removeFromBag("cali_01")).toMatchObject({ ok: false, error: { code: "cart.locked" } })
  })

  it("shares the Bag store between the Bag and its checkout when none is given", async () => {
    routes["POST /store/carts"] = () => json(200, { cart: { id: "cart_mem" } })
    routes["GET /store/shop/bag/cart_mem"] = () =>
      json(200, { bag: { lines: [], totalMrp: 0, discount: 0, delivery: 0, total: 0, count: 0 } })
    routes["POST /store/shop/checkouts"] = () => json(201, { checkout })
    const api = createApiClient({
      baseUrl: "http://kernel.test",
      publishableKey: "pk_test",
      platform: "web",
      version: "1.2.3",
      getLanguage: () => "en",
      tokenStore: store("session-token"),
    })
    expect((await api.addToBag("variant_01")).ok).toBe(true)
    expect((await api.beginCheckout(address)).ok).toBe(true)
    expect(calls.at(-1)!.body).toMatchObject({ cartId: "cart_mem" })
  })
})
