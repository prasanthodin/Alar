import { describe, expect, it } from "vitest"
import { BagView, DesignCard, DesignView, ErrorCode, lowStockCount } from "./index"

const image = { url: "/mock/1-1-maroon.jpg", alt: "Maroon silk saree", isSample: true }
const card = {
  id: "arani-maroon",
  name: "Arani silk saree",
  subtitle: "Maroon, temple border",
  price: 315000,
  mrp: 360000,
  image,
  badge: "Just in",
  rating: { value: 4.6, count: 128 },
}

describe("catalogue schemas", () => {
  it("DesignCard accepts a card and rejects a non-rupee price", () => {
    expect(DesignCard.parse(card)).toEqual(card)
    expect(DesignCard.safeParse({ ...card, price: 315050 }).success).toBe(false)
    expect(DesignCard.safeParse({ ...card, price: 3150.5 }).success).toBe(false)
  })

  it("DesignView strips unknown keys such as a weaver", () => {
    const view = DesignView.parse({
      ...card,
      images: [image],
      variants: [{ id: "v1", colourName: "Maroon", swatch: image, stock: 3 }],
      attributes: [{ label: "Fabric", value: "Pure silk" }],
      weaver: "someone",
    })
    expect("weaver" in view).toBe(false)
  })

  it("BagView needs all four price lines", () => {
    const empty = { lines: [], totalMrp: 0, discount: 0, delivery: 0, total: 0, count: 0 }
    expect(BagView.safeParse(empty).success).toBe(true)
    const { delivery: _d, ...noDelivery } = empty
    expect(BagView.safeParse(noDelivery).success).toBe(false)
  })

  it("design.not_found is a stable error code", () => {
    expect(ErrorCode.safeParse("design.not_found").success).toBe(true)
  })
})

describe("lowStockCount", () => {
  it("shows the true count at or below the level only", () => {
    expect(lowStockCount(3)).toBe(3)
    expect(lowStockCount(1)).toBe(1)
    expect(lowStockCount(4)).toBeNull()
    expect(lowStockCount(0)).toBeNull()
    expect(lowStockCount(5, 5)).toBe(5)
  })
})
