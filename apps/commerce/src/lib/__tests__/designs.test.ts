import { describe, expect, it } from "vitest"
import {
  attributesFromRow,
  attributesToColumns,
  cmToMetres,
  designFromProduct,
  kernelAmountToExactPaise,
  kernelAmountToPaise,
  metresToCm,
  type ProductRow,
} from "../designs"

const photo = { fileId: "f0.jpg", url: "http://localhost:4566/catalog/f0.jpg", role: "close_up", position: 0 }

function product(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: "prod_1",
    handle: "arani-silk-saree-ab12",
    title: "Arani silk saree",
    description: null,
    status: "draft",
    created_at: new Date("2026-11-27T10:00:00.000Z"),
    updated_at: "2026-11-27T11:00:00.000Z",
    variants: [
      {
        id: "variant_1",
        prices: [
          { id: "price_eur", amount: 30, currency_code: "eur" },
          { id: "price_region", amount: 3000, currency_code: "inr", rules_count: 1 },
          { id: "price_inr", amount: 3150, currency_code: "inr", rules_count: 0 },
        ],
      },
    ],
    sales_channels: [{ id: "sc_1" }, null],
    shipping_profile: { id: "sp_1" },
    design_attributes: {
      id: "dattr_1",
      fibre: "Silk",
      length_cm: 630,
      width_cm: 114,
      blouse_piece_included: true,
      tax_code: "saree",
      photos: [photo],
      true_colour_confirmed_at: "2026-11-27T10:30:00.000Z",
      true_colour_confirmed_by: "user_1",
    },
    ...overrides,
  }
}

describe("metres and centimetres", () => {
  it("stores metres as whole centimetres, also where the float is not exact", () => {
    expect(1.14 * 100).not.toBe(114)
    expect(metresToCm(1.14)).toBe(114)
    expect(metresToCm(6.3)).toBe(630)
    expect(metresToCm(0.29)).toBe(29)
    expect(metresToCm(null)).toBeNull()
    expect(cmToMetres(114)).toBe(1.14)
    expect(cmToMetres(null)).toBeNull()
  })

  it("maps the attributes to columns and back", () => {
    const attrs = attributesFromRow({ length_cm: 114, width_cm: 630, fibre: "Silk" })
    expect(attrs).toMatchObject({ lengthM: 1.14, widthM: 6.3, fibre: "Silk", taxCode: null, stitched: false })
    expect(attributesToColumns({ lengthM: 1.14, taxCode: null })).toEqual({ length_cm: 114, tax_code: null })
  })
})

describe("kernelAmountToPaise", () => {
  it("turns whole rupees in major units into paise", () => {
    expect(kernelAmountToPaise(3150)).toBe(315000)
    expect(kernelAmountToPaise("2950")).toBe(295000)
    expect(kernelAmountToPaise(0)).toBe(0)
  })

  it("is null for no amount or an amount that is not whole rupees", () => {
    expect(kernelAmountToPaise(null)).toBeNull()
    expect(kernelAmountToPaise(undefined)).toBeNull()
    expect(kernelAmountToPaise(3150.5)).toBeNull()
    expect(kernelAmountToPaise(0.001)).toBeNull()
    expect(kernelAmountToPaise(-10)).toBeNull()
  })
})

describe("designFromProduct", () => {
  it("reads the view and the ids behind it, using the rupee price without rules", () => {
    const record = designFromProduct(product())!
    expect(record.view).toEqual({
      id: "prod_1",
      variantId: "variant_1",
      name: "Arani silk saree",
      description: "",
      status: "draft",
      pricePaise: 315000,
      attributes: {
        fibre: "Silk",
        weave: null,
        lengthM: 6.3,
        widthM: 1.14,
        blousePieceIncluded: true,
        care: null,
        countryOfOrigin: null,
        taxCode: "saree",
        stitched: false,
      },
      photos: [photo],
      trueColourConfirmation: { at: "2026-11-27T10:30:00.000Z", by: "user_1" },
      createdAt: "2026-11-27T10:00:00.000Z",
      updatedAt: "2026-11-27T11:00:00.000Z",
    })
    expect(record).toMatchObject({
      attributesId: "dattr_1",
      priceId: "price_inr",
      salesChannelIds: ["sc_1"],
      shippingProfileId: "sp_1",
    })
  })

  it("has no price without a rupee price, and no confirmation without both parts", () => {
    const record = designFromProduct(
      product({
        variants: [{ id: "variant_1", prices: [{ id: "p", amount: 30, currency_code: "eur" }] }],
        design_attributes: { id: "dattr_1", photos: [], true_colour_confirmed_at: "2026-11-27T10:30:00.000Z" },
        sales_channels: [],
        shipping_profile: null,
      })
    )!
    expect(record.view.pricePaise).toBeNull()
    expect(record.view.trueColourConfirmation).toBeNull()
    expect(record.salesChannelIds).toEqual([])
    expect(record.shippingProfileId).toBeNull()
  })

  it("is null for a product that is not a Design", () => {
    expect(designFromProduct(product({ design_attributes: null }))).toBeNull()
    expect(designFromProduct(product({ variants: [] }))).toBeNull()
  })

  it("fails as a fault for an unknown status or stored photos that break the contract", () => {
    expect(() => designFromProduct(product({ status: "archived" }))).toThrow(/unknown status/)
    expect(() =>
      designFromProduct(product({ design_attributes: { id: "dattr_1", photos: [{ ...photo, position: 3 }] } }))
    ).toThrow(/photos are not valid/)
    // Never the product id in place of a missing handle.
    expect(() => designFromProduct(product({ handle: null }))).toThrow(/has no handle/)
  })
})

describe("kernelAmountToExactPaise", () => {
  it("converts whole paise and refuses a missing, fractional or negative amount", () => {
    expect(kernelAmountToExactPaise(3150, "total")).toBe(315000)
    expect(kernelAmountToExactPaise(0, "total")).toBe(0)
    expect(() => kernelAmountToExactPaise(undefined, "The total")).toThrow(/The total is missing/)
    expect(() => kernelAmountToExactPaise(null, "The total")).toThrow(/missing/)
    expect(() => kernelAmountToExactPaise(31.505, "The total")).toThrow(/whole number of paise/)
    expect(() => kernelAmountToExactPaise(-1, "The total")).toThrow(/whole number of paise/)
  })
})
