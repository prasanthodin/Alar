import { describe, expect, it } from "vitest"
import { BagLine, BagQuantity, BagView, DesignCard, DesignView, ErrorCode, lowStockCount } from "./index"

const image = { url: "/mock/1-1-maroon.jpg", alt: "Maroon silk saree", isSample: true }
const card = {
  id: "arani-maroon",
  handle: "arani-silk-saree-x1y2",
  name: "Arani silk saree",
  subtitle: "Maroon, temple border",
  price: 315000,
  mrp: 360000,
  image,
  availability: "available",
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

  it("DesignCard needs an availability the server computed, available or sold out", () => {
    expect(DesignCard.safeParse({ ...card, availability: "sold_out" }).success).toBe(true)
    expect(DesignCard.safeParse({ ...card, availability: "low" }).success).toBe(false)
    const { availability: _a, ...noAvailability } = card
    expect(DesignCard.safeParse(noAvailability).success).toBe(false)
  })

  it("DesignView carries a description and typed details, and never a weaver among them", () => {
    const details = {
      fibre: "Silk",
      weave: "Kanchipuram",
      lengthM: 6.2,
      widthM: 1.15,
      blousePieceIncluded: true,
      care: "Dry clean only",
      countryOfOrigin: "India",
      weaver: "someone",
    }
    const view = DesignView.parse({
      ...card,
      images: [image],
      variants: [{ id: "v1", colourName: "Standard", swatch: image, stock: 2 }],
      attributes: [],
      details,
    })
    expect(view.description).toBe("")
    expect(view.details && "weaver" in view.details).toBe(false)
    expect(DesignView.safeParse({ ...view, details: { ...details, lengthM: 6.234 } }).success).toBe(false)
  })

  it("BagLine carries the line total from the server", () => {
    const line = {
      id: "cali_01",
      designId: "prod_01",
      handle: "arani-silk-saree-x1y2",
      variantId: "variant_01",
      name: "Arani silk saree",
      colourName: "Standard",
      image,
      price: 315000,
      mrp: 315000,
      quantity: 2,
      lineTotal: 630000,
      stock: 3,
    }
    expect(BagLine.safeParse(line).success).toBe(true)
    const { lineTotal: _l, ...noTotal } = line
    expect(BagLine.safeParse(noTotal).success).toBe(false)
  })

  it("BagQuantity is a whole number of Pieces from 1", () => {
    expect(BagQuantity.safeParse(1).success).toBe(true)
    expect(BagQuantity.safeParse(0).success).toBe(false)
    expect(BagQuantity.safeParse(1.5).success).toBe(false)
  })

  it("BagView needs all four price lines", () => {
    const empty = { lines: [], totalMrp: 0, discount: 0, delivery: 0, total: 0, count: 0 }
    expect(BagView.safeParse(empty).success).toBe(true)
    const { delivery: _d, ...noDelivery } = empty
    expect(BagView.safeParse(noDelivery).success).toBe(false)
  })

  it("design.not_found, bag.stock_exceeded and bag.not_found are stable error codes", () => {
    expect(ErrorCode.safeParse("design.not_found").success).toBe(true)
    expect(ErrorCode.safeParse("bag.stock_exceeded").success).toBe(true)
    expect(ErrorCode.safeParse("bag.not_found").success).toBe(true)
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
