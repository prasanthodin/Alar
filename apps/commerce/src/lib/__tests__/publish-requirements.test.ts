import { describe, expect, it } from "vitest"
import type { TaxBands } from "@shop/contracts"
import { bandsInEffect, publishRequirements, type DatedTaxBands, type PublishCheckView } from "../publish-requirements"

const NOW = new Date("2026-11-27T10:00:00.000Z")
const SAREE: TaxBands = [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 }]
const SEEDED: DatedTaxBands[] = [{ effectiveFrom: "2026-03-31T18:30:00.000Z", value: SAREE }]

const photo = (i: number, role: "close_up" | "other") => ({
  fileId: `f${i}`,
  url: `http://localhost:4566/catalog/f${i}.jpg`,
  role,
  position: i,
})

const complete: PublishCheckView = {
  attributes: {
    fibre: "Silk",
    weave: "Arani",
    lengthM: 6.3,
    widthM: 1.14,
    blousePieceIncluded: true,
    care: null,
    countryOfOrigin: "India",
    taxCode: "saree",
    stitched: false,
  },
  pricePaise: 315000,
  photos: [photo(0, "close_up"), photo(1, "other")],
  trueColourConfirmed: true,
}

const withAttrs = (attrs: Partial<PublishCheckView["attributes"]>): PublishCheckView => ({
  ...complete,
  attributes: { ...complete.attributes, ...attrs },
})

describe("publishRequirements", () => {
  it("is empty for a complete Design with a band in effect now", () => {
    expect(publishRequirements(complete, SEEDED, NOW)).toEqual([])
  })

  it("names the close-up and the confirmation when both are missing", () => {
    const view = { ...complete, photos: [photo(0, "other"), photo(1, "other")], trueColourConfirmed: false }
    expect(publishRequirements(view, SEEDED, NOW)).toEqual(["fabricCloseUpPhoto", "trueColourConfirmation"])
  })

  it("names every missing item of an empty draft, in the page's order", () => {
    const empty: PublishCheckView = {
      attributes: {
        fibre: null,
        weave: null,
        lengthM: null,
        widthM: null,
        blousePieceIncluded: false,
        care: null,
        countryOfOrigin: null,
        taxCode: null,
        stitched: false,
      },
      pricePaise: null,
      photos: [],
      trueColourConfirmed: false,
    }
    expect(publishRequirements(empty, [], NOW)).toEqual([
      "fibre",
      "lengthM",
      "widthM",
      "taxCode",
      "shelfPrice",
      "fabricCloseUpPhoto",
      "otherPhoto",
      "trueColourConfirmation",
    ])
  })

  it("needs a photo besides the close-up", () => {
    expect(publishRequirements({ ...complete, photos: [photo(0, "close_up")] }, SEEDED, NOW)).toEqual(["otherPhoto"])
  })

  it("treats blank text as missing", () => {
    expect(publishRequirements(withAttrs({ fibre: "  " }), SEEDED, NOW)).toEqual(["fibre"])
  })

  it("needs a tax code with a band in effect now", () => {
    expect(publishRequirements(withAttrs({ taxCode: null }), SEEDED, NOW)).toEqual(["taxCode"])
    expect(publishRequirements(complete, [], NOW)).toEqual(["taxBand"])
    expect(publishRequirements(complete, [{ effectiveFrom: "2026-12-01T00:00:00.000Z", value: SAREE }], NOW)).toEqual([
      "taxBand",
    ])
    expect(publishRequirements(complete, [{ effectiveFrom: SEEDED[0]!.effectiveFrom, value: [] }], NOW)).toEqual([
      "taxBand",
    ])
  })

  it("needs a band that fits the price (AD-5)", () => {
    // 5% up to Rs 2,500 taxable, 18% above: Rs 2,800 fits neither.
    const threshold: DatedTaxBands[] = [
      {
        effectiveFrom: SEEDED[0]!.effectiveFrom,
        value: [
          { minTaxablePaise: 0, maxTaxablePaise: 250000, rateBp: 500 },
          { minTaxablePaise: 250001, maxTaxablePaise: null, rateBp: 1800 },
        ],
      },
    ]
    expect(publishRequirements({ ...complete, pricePaise: 280000 }, threshold, NOW)).toEqual(["taxBand"])
    expect(publishRequirements({ ...complete, pricePaise: 210000 }, threshold, NOW)).toEqual([])
  })

  it("needs a positive whole-rupee shelf price", () => {
    expect(publishRequirements({ ...complete, pricePaise: null }, SEEDED, NOW)).toEqual(["shelfPrice"])
    expect(publishRequirements({ ...complete, pricePaise: 0 }, SEEDED, NOW)).toEqual(["shelfPrice"])
    expect(publishRequirements({ ...complete, pricePaise: 315050 }, SEEDED, NOW)).toEqual(["shelfPrice"])
  })

  it("needs a length and a width", () => {
    expect(publishRequirements(withAttrs({ lengthM: null, widthM: null }), SEEDED, NOW)).toEqual(["lengthM", "widthM"])
  })
})

describe("bandsInEffect", () => {
  const later: TaxBands = [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 1200 }]
  const values: DatedTaxBands[] = [
    { effectiveFrom: "2026-12-01T00:00:00.000Z", value: later },
    { effectiveFrom: "2026-04-01T00:00:00.000Z", value: SAREE },
  ]

  it("takes the latest value not after now, whatever the order", () => {
    expect(bandsInEffect(values, NOW)).toBe(SAREE)
    expect(bandsInEffect(values, new Date("2026-12-01T00:00:00.000Z"))).toBe(later)
    expect(bandsInEffect(values, new Date("2026-01-01T00:00:00.000Z"))).toBeNull()
    expect(bandsInEffect([], NOW)).toBeNull()
  })
})
