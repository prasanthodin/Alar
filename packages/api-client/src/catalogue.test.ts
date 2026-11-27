import { BagView, DesignCard, DesignView, lowStockCount } from "@shop/contracts"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ALL_CATEGORY_ID, createApiClient, type ApiClientConfig } from "./index"

const fetchSpy = vi.fn(async () => new Response("{}", { status: 500 }))
beforeEach(() => {
  fetchSpy.mockClear()
  vi.stubGlobal("fetch", fetchSpy)
})
afterEach(() => vi.unstubAllGlobals())

function client(extra: Partial<ApiClientConfig> = {}) {
  return createApiClient({
    baseUrl: "http://kernel.test",
    publishableKey: "pk_test",
    platform: "android",
    version: "0.1.0",
    getLanguage: () => "en",
    tokenStore: { get: () => null, set: () => {}, clear: () => {} },
    catalogueSource: "mock",
    mockAssetBaseUrl: "http://assets.test/mock/",
    ...extra,
  })
}

describe("mock catalogue", () => {
  it("lists categories as contract view models with sample pictures", async () => {
    const res = await client().listCategories()
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.data.map((c) => c.name)).toEqual(
      expect.arrayContaining(["Sarees", "Silk", "Cotton", "Wedding"])
    )
    for (const c of res.data) {
      expect(c.thumbnail.isSample).toBe(true)
      expect(c.thumbnail.url).toMatch(/^http:\/\/assets\.test\/mock\/[\w-]+\.jpg$/)
    }
  })

  it("lists eight designs, and only silk ones for the silk category", async () => {
    const api = client()
    const all = await api.listDesigns()
    expect(all.ok && all.data.length).toBe(8)
    if (all.ok) for (const d of all.data) expect(DesignCard.safeParse(d).success).toBe(true)

    const silk = await api.listDesigns({ categoryId: "silk" })
    expect(silk.ok).toBe(true)
    if (!silk.ok) return
    expect(silk.data.length).toBeGreaterThan(0)
    expect(silk.data.length).toBeLessThan(8)
    expect(silk.data.every((d) => /silk/i.test(d.name))).toBe(true)
  })

  it("the all-sarees category returns every design", async () => {
    const api = client()
    const all = await api.listDesigns()
    const catchAll = await api.listDesigns({ categoryId: ALL_CATEGORY_ID })
    expect(all.ok && catchAll.ok).toBe(true)
    if (!all.ok || !catchAll.ok) return
    expect(catchAll.data.map((d) => d.id)).toEqual(all.data.map((d) => d.id))
  })

  it("prices come from the boards in paise", async () => {
    const res = await client().getDesign("arani-silk")
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.data.price).toBe(315000)
    expect(res.data.mrp).toBe(360000)
    expect(DesignView.safeParse(res.data).success).toBe(true)
  })

  it("returns design.not_found for an unknown design", async () => {
    const res = await client().getDesign("nope")
    expect(res).toMatchObject({ ok: false, error: { code: "design.not_found" } })
  })

  it("never exposes a weaver", async () => {
    const res = await client().getDesign("arani-silk")
    expect(JSON.stringify(res).toLowerCase()).not.toContain("weaver")
  })

  it("has a low-stock variant whose true count is shown", async () => {
    const res = await client().getDesign("arani-silk")
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const maroon = res.data.variants.find((v) => v.colourName === "Maroon")
    expect(maroon?.stock).toBe(3)
    expect(lowStockCount(maroon!.stock)).toBe(3)
  })

  it("starts with an empty Bag with all four price lines", async () => {
    const res = await client().getBag()
    expect(res).toEqual({
      ok: true,
      data: { lines: [], totalMrp: 0, discount: 0, delivery: 0, total: 0, count: 0, hold: null },
    })
  })

  it("adds to the Bag and totals the four price lines", async () => {
    const api = client()
    await api.addToBag("arani-silk-maroon")
    const res = await api.addToBag("kasavu-cotton-ivory")
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(BagView.safeParse(res.data).success).toBe(true)
    // The Bag board: ₹5,600 MRP, ₹650 discount, free delivery, ₹4,950 total.
    expect(res.data).toMatchObject({
      count: 2,
      totalMrp: 560000,
      discount: 65000,
      delivery: 0,
      total: 495000,
    })
    expect(res.data.lines.map((l) => [l.variantId, l.quantity])).toEqual([
      ["arani-silk-maroon", 1],
      ["kasavu-cotton-ivory", 1],
    ])

    const again = await api.addToBag("arani-silk-maroon")
    expect(again.ok && again.data.count).toBe(3)
    expect(again.ok && again.data.lines[0]?.quantity).toBe(2)
    expect((await api.getBag()).ok && (await api.getBag())).toMatchObject({ data: { count: 3 } })
  })

  it("never adds more than the stock of a variant", async () => {
    const api = client()
    for (let i = 0; i < 3; i++) expect((await api.addToBag("arani-silk-maroon")).ok).toBe(true)
    const res = await api.addToBag("arani-silk-maroon")
    expect(res).toMatchObject({ ok: false, error: { code: "bag.stock_exceeded" } })
    expect(await api.addToBag("banarasi-silk-navy")).toMatchObject({ ok: false })
  })

  it("rejects an unknown variant", async () => {
    expect(await client().addToBag("nope")).toMatchObject({
      ok: false,
      error: { code: "design.not_found" },
    })
  })

  it("keeps one Bag per client", async () => {
    const a = client()
    const b = client()
    await a.addToBag("arani-silk-maroon")
    expect((await b.getBag()).ok && (await b.getBag())).toMatchObject({ data: { count: 0 } })
  })

  it("defaults the picture base to /mock and never calls the kernel", async () => {
    const api = client({ mockAssetBaseUrl: undefined })
    const res = await api.listDesigns()
    expect(res.ok && res.data[0]?.image.url.startsWith("/mock/")).toBe(true)
    await api.getDesign("arani-silk")
    await api.addToBag("arani-silk-maroon")
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("sets, refuses and removes Bag lines by line id", async () => {
    const api = client()
    const added = await api.addToBag("arani-silk-maroon", 2)
    expect(added.ok && added.data.lines[0]).toMatchObject({ quantity: 2, lineTotal: 630000 })
    const lineId = added.ok ? added.data.lines[0]!.id : ""

    expect(await api.setBagQuantity(lineId, 4)).toMatchObject({ ok: false, error: { code: "bag.stock_exceeded" } })
    expect((await api.getBag()).ok && (await api.getBag())).toMatchObject({ data: { count: 2 } })
    expect(await api.setBagQuantity(lineId, 0)).toMatchObject({ ok: false, error: { code: "input.invalid" } })

    const changed = await api.setBagQuantity(lineId, 3)
    expect(changed.ok && changed.data).toMatchObject({ count: 3, total: 945000 })

    const removed = await api.removeFromBag(lineId)
    expect(removed.ok && removed.data).toMatchObject({ count: 0, lines: [] })
    expect(await api.removeFromBag(lineId)).toMatchObject({ ok: false, error: { code: "bag.not_found" } })
  })

  it("marks a design with no pieces in any colour as sold out, and shows it", async () => {
    const res = await client().listDesigns()
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.data.find((d) => d.id === "banarasi-silk")?.availability).toBe("sold_out")
    expect(res.data.find((d) => d.id === "arani-silk")?.availability).toBe("available")
  })
})
