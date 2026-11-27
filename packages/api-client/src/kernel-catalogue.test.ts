import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createApiClient, type TokenStore } from "./index"

type Call = { path: string; search: string; method: string; headers: Headers; body: unknown }
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
        search: url.search,
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

function memoryStore(initial: string | null = null): TokenStore & { value: string | null } {
  return {
    value: initial,
    get() {
      return this.value
    },
    set(v: string) {
      this.value = v
    },
    clear() {
      this.value = null
    },
  }
}

function client(bagStore = memoryStore(), token: string | null = "session-token") {
  return {
    bagStore,
    api: createApiClient({
      baseUrl: "http://kernel.test",
      publishableKey: "pk_test",
      platform: "web",
      version: "1.2.3",
      getLanguage: () => "en",
      // A signed-in Shopper: Bag calls must still be anonymous.
      tokenStore: { get: () => token, set: () => {}, clear: () => {} },
      bagStore,
    }),
  }
}

const image = { url: "http://files.test/catalog/a.jpg", alt: "Arani silk saree", isSample: false }
const card = {
  id: "prod_01",
  handle: "arani-silk-saree-ab12",
  name: "Arani silk saree",
  subtitle: "Silk, Arani",
  price: 315000,
  mrp: 315000,
  image,
  availability: "available",
}
const view = {
  ...card,
  description: "Woven in Arani.",
  images: [image],
  variants: [{ id: "variant_01", colourName: "Standard", swatch: image, stock: 2 }],
  attributes: [],
  details: {
    fibre: "Silk",
    weave: "Arani",
    lengthM: 6.2,
    widthM: 1.2,
    blousePieceIncluded: true,
    care: "Dry clean only",
    countryOfOrigin: "India",
  },
}

function bagWith(quantity: number) {
  return {
    lines: [
      {
        id: "cali_01",
        designId: "prod_01",
        handle: card.handle,
        variantId: "variant_01",
        name: card.name,
        colourName: "Standard",
        image,
        buyable: true,
        price: 315000,
        mrp: 315000,
        quantity,
        lineTotal: 315000 * quantity,
        stock: 2,
      },
    ],
    totalMrp: 315000 * quantity,
    discount: 0,
    delivery: 0,
    total: 315000 * quantity,
    count: quantity,
    hold: null,
  }
}
const cartRef = (id = "cart_01") => ({ cart: { id, total: 999, items: [] } })
const insufficient = () =>
  json(400, { type: "not_allowed", code: "insufficient_inventory", message: "Some variant does not have the required inventory" })

describe("kernel catalogue: Designs", () => {
  it("is the default source and lists Designs from the shop route, anonymously", async () => {
    routes["GET /store/shop/designs"] = () => json(200, { designs: [card, { ...card, id: "prod_02", availability: "sold_out" }] })
    const res = await client().api.listDesigns()
    expect(res.ok && res.data.map((d) => [d.id, d.availability])).toEqual([
      ["prod_01", "available"],
      ["prod_02", "sold_out"],
    ])
    expect(calls[0]!.headers.get("authorization")).toBeNull()
    expect(calls[0]!.headers.get("x-publishable-api-key")).toBe("pk_test")
  })

  it("refuses a list that breaks the contract", async () => {
    routes["GET /store/shop/designs"] = () => json(200, { designs: [{ ...card, price: 315050 }] })
    expect(await client().api.listDesigns()).toMatchObject({ ok: false, error: { code: "response.invalid" } })
  })

  it("has no categories yet", async () => {
    expect(await client().api.listCategories()).toEqual({ ok: true, data: [] })
    expect(calls).toEqual([])
  })

  it("reads one Design by handle, with the preview token when given", async () => {
    routes[`GET /store/shop/designs/${card.handle}`] = () => json(200, { design: view })
    const { api } = client()
    const res = await api.getDesign(card.handle)
    expect(res.ok && res.data.details?.weave).toBe("Arani")
    expect(calls[0]!.search).toBe("")

    await api.getDesign(card.handle, { preview: "1767225600.ab/cd" })
    expect(calls[1]!.search).toBe("?preview=1767225600.ab%2Fcd")
  })

  it("maps a 404 to design.not_found and other failures as usual", async () => {
    routes["GET /store/shop/designs/draft"] = () => json(404, { code: "design.not_found", message: "No Design draft" })
    expect(await client().api.getDesign("draft")).toMatchObject({ ok: false, error: { code: "design.not_found" } })
    routes["GET /store/shop/designs/broken"] = () => json(500, { message: "boom" })
    expect(await client().api.getDesign("broken")).toMatchObject({ ok: false, error: { code: "internal" } })
  })
})

describe("kernel catalogue: Bag", () => {
  it("is empty, without a call, before anything is added", async () => {
    expect(await client().api.getBag()).toEqual({
      ok: true,
      data: { lines: [], totalMrp: 0, discount: 0, delivery: 0, total: 0, count: 0, hold: null },
    })
    expect(calls).toEqual([])
  })

  it("creates a cart with the first line, keeps its id and returns the server's BagView", async () => {
    routes["POST /store/carts"] = () => json(200, cartRef())
    routes["GET /store/shop/bag/cart_01"] = () => json(200, { bag: bagWith(1) })
    const { api, bagStore } = client()

    const res = await api.addToBag("variant_01")
    expect(res).toEqual({ ok: true, data: bagWith(1) })
    expect(bagStore.value).toBe("cart_01")
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual(["POST /store/carts", "GET /store/shop/bag/cart_01"])
    expect(calls[0]!.body).toEqual({ items: [{ variant_id: "variant_01", quantity: 1 }] })
    // Anonymous, with an idempotency key on the write.
    expect(calls[0]!.headers.get("authorization")).toBeNull()
    expect(calls[0]!.headers.get("idempotency-key")).toBeTruthy()
  })

  it("adds to the stored cart after checking it is still a Bag", async () => {
    routes["POST /store/carts/cart_01/line-items"] = () => json(200, cartRef())
    routes["GET /store/shop/bag/cart_01"] = () => json(200, { bag: bagWith(2) })
    const res = await client(memoryStore("cart_01")).api.addToBag("variant_01", 1)
    expect(res.ok && res.data.count).toBe(2)
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      "GET /store/shop/bag/cart_01",
      "POST /store/carts/cart_01/line-items",
      "GET /store/shop/bag/cart_01",
    ])
    expect(calls[1]!.body).toEqual({ variant_id: "variant_01", quantity: 1 })
  })

  it("starts a new cart when the stored one was bought (completed): the Bag route answers bag.not_found", async () => {
    routes["GET /store/shop/bag/cart_done"] = () => json(404, { code: "bag.not_found", message: "No Bag cart_done" })
    routes["POST /store/carts"] = () => json(200, cartRef("cart_new"))
    routes["GET /store/shop/bag/cart_new"] = () => json(200, { bag: bagWith(1) })
    const { api, bagStore } = client(memoryStore("cart_done"))
    expect(await api.addToBag("variant_01")).toEqual({ ok: true, data: bagWith(1) })
    expect(bagStore.value).toBe("cart_new")
    // Never a write to the completed cart.
    expect(calls.map((c) => `${c.method} ${c.path}`)).not.toContain("POST /store/carts/cart_done/line-items")
  })

  it("keeps a Bag another add stored while this one made a cart (two first adds at once)", async () => {
    const bagStore = memoryStore()
    routes["POST /store/carts"] = () => {
      bagStore.value = "cart_first"
      return json(200, cartRef("cart_second"))
    }
    routes["POST /store/carts/cart_first/line-items"] = () => json(200, cartRef("cart_first"))
    routes["GET /store/shop/bag/cart_first"] = () => json(200, { bag: bagWith(2) })
    const res = await client(bagStore).api.addToBag("variant_01")
    expect(res.ok && res.data.count).toBe(2)
    expect(bagStore.value).toBe("cart_first")
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      "POST /store/carts",
      "POST /store/carts/cart_first/line-items",
      "GET /store/shop/bag/cart_first",
    ])
  })

  it("starts a new cart when the stored one is gone", async () => {
    routes["GET /store/shop/bag/cart_old"] = () => json(200, { bag: bagWith(1) })
    routes["POST /store/carts/cart_old/line-items"] = () => json(404, { type: "not_found", message: "Cart id not found" })
    routes["POST /store/carts"] = () => json(200, cartRef("cart_new"))
    routes["GET /store/shop/bag/cart_new"] = () => json(200, { bag: bagWith(1) })
    const { api, bagStore } = client(memoryStore("cart_old"))
    expect((await api.addToBag("variant_01")).ok).toBe(true)
    expect(bagStore.value).toBe("cart_new")
  })

  it("maps the kernel's inventory refusal to bag.stock_exceeded on add and on create", async () => {
    routes["GET /store/shop/bag/cart_01"] = () => json(200, { bag: bagWith(2) })
    routes["POST /store/carts/cart_01/line-items"] = insufficient
    routes["POST /store/carts"] = insufficient
    expect(await client(memoryStore("cart_01")).api.addToBag("variant_01", 3)).toMatchObject({
      ok: false,
      error: { code: "bag.stock_exceeded" },
    })
    const fresh = client()
    expect(await fresh.api.addToBag("variant_01", 3)).toMatchObject({ ok: false, error: { code: "bag.stock_exceeded" } })
    expect(fresh.bagStore.value).toBeNull()
  })

  it("maps the shop's design.not_found (a Variant of no published Design) by its code, not the kernel's text", async () => {
    routes["POST /store/carts"] = () => json(404, { code: "design.not_found", message: "No Design on sale has this Variant" })
    expect(await client().api.addToBag("variant_09")).toMatchObject({ ok: false, error: { code: "design.not_found" } })
    routes["POST /store/carts"] = () =>
      json(400, { type: "invalid_data", message: "Variants variant_09 do not exist or belong to a product that is not published" })
    expect(await client().api.addToBag("variant_09")).toMatchObject({ ok: false, error: { code: "internal" } })
    routes["POST /store/carts"] = () => json(400, { code: "input.invalid", message: "only the variant and quantity" })
    expect(await client().api.addToBag("variant_09")).toMatchObject({ ok: false, error: { code: "input.invalid" } })
  })

  it("refuses a quantity that is not a whole number from 1 without calling the kernel", async () => {
    const { api } = client(memoryStore("cart_01"))
    for (const q of [0, -1, 1.5]) {
      expect(await api.addToBag("variant_01", q)).toMatchObject({ ok: false, error: { code: "input.invalid" } })
      expect(await api.setBagQuantity("cali_01", q)).toMatchObject({ ok: false, error: { code: "input.invalid" } })
    }
    expect(calls).toEqual([])
  })

  it("sets a line's quantity and reads the Bag again", async () => {
    routes["POST /store/carts/cart_01/line-items/cali_01"] = () => json(200, cartRef())
    routes["GET /store/shop/bag/cart_01"] = () => json(200, { bag: bagWith(2) })
    const res = await client(memoryStore("cart_01")).api.setBagQuantity("cali_01", 2)
    expect(res.ok && res.data.lines[0]).toMatchObject({ quantity: 2, lineTotal: 630000 })
    expect(calls[0]!.body).toEqual({ quantity: 2 })
  })

  it("refuses too many with bag.stock_exceeded and never reads a changed Bag", async () => {
    routes["POST /store/carts/cart_01/line-items/cali_01"] = insufficient
    const res = await client(memoryStore("cart_01")).api.setBagQuantity("cali_01", 3)
    expect(res).toMatchObject({ ok: false, error: { code: "bag.stock_exceeded" } })
    expect(calls.map((c) => c.method)).toEqual(["POST"])
  })

  it("removes a line and reads the Bag again", async () => {
    routes["DELETE /store/carts/cart_01/line-items/cali_01"] = () =>
      json(200, { id: "cali_01", object: "line-item", deleted: true, parent: { id: "cart_01" } })
    routes["GET /store/shop/bag/cart_01"] = () =>
      json(200, { bag: { lines: [], totalMrp: 0, discount: 0, delivery: 0, total: 0, count: 0 } })
    const res = await client(memoryStore("cart_01")).api.removeFromBag("cali_01")
    expect(res.ok && res.data.count).toBe(0)
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      "DELETE /store/carts/cart_01/line-items/cali_01",
      "GET /store/shop/bag/cart_01",
    ])
  })

  it("answers bag.not_found for a change or removal without a Bag, or for an unknown cart", async () => {
    const { api } = client()
    expect(await api.setBagQuantity("cali_01", 1)).toMatchObject({ ok: false, error: { code: "bag.not_found" } })
    expect(await api.removeFromBag("cali_01")).toMatchObject({ ok: false, error: { code: "bag.not_found" } })
    expect(calls).toEqual([])

    routes["DELETE /store/carts/cart_x/line-items/cali_01"] = () => json(404, { type: "not_found", message: "Cart not found" })
    expect(await client(memoryStore("cart_x")).api.removeFromBag("cali_01")).toMatchObject({
      ok: false,
      error: { code: "bag.not_found" },
    })
  })

  it("reads the stored Bag; a Bag the server no longer has starts again empty and is forgotten", async () => {
    routes["GET /store/shop/bag/cart_01"] = () => json(200, { bag: bagWith(1) })
    expect((await client(memoryStore("cart_01")).api.getBag()).ok).toBe(true)

    routes["GET /store/shop/bag/cart_gone"] = () => json(404, { code: "bag.not_found", message: "No Bag cart_gone" })
    const gone = client(memoryStore("cart_gone"))
    expect(await gone.api.getBag()).toMatchObject({ ok: true, data: { count: 0, lines: [] } })
    expect(gone.bagStore.value).toBeNull()
  })

  it("passes other failures through the usual mapping", async () => {
    routes["GET /store/shop/bag/cart_01"] = () => json(500, { message: "boom" })
    expect(await client(memoryStore("cart_01")).api.getBag()).toMatchObject({ ok: false, error: { code: "internal" } })
    routes["POST /store/carts"] = () => json(429, { message: "slow down" })
    expect(await client().api.addToBag("variant_01")).toMatchObject({ ok: false, error: { code: "rate.limited" } })
    routes["GET /store/shop/bag/cart_01"] = () => json(200, { bag: bagWith(1) })
    routes["POST /store/carts/cart_01/line-items"] = () => json(403, { code: "route.not_allowed", message: "no" })
    expect(await client(memoryStore("cart_01")).api.addToBag("variant_01")).toMatchObject({
      ok: false,
      error: { code: "internal" },
    })
  })

  it("refuses a Bag whose amounts break the contract", async () => {
    routes["GET /store/shop/bag/cart_01"] = () => json(200, { bag: { ...bagWith(1), total: 3150.5 } })
    expect(await client(memoryStore("cart_01")).api.getBag()).toMatchObject({
      ok: false,
      error: { code: "response.invalid" },
    })
  })
})
