import { describe, expect, it } from "vitest"
import {
  ErrorCode,
  RateBp,
  TaxBand,
  TaxBands,
  findBand,
  splitInclusivePrice,
  taxForShelfPrice,
  type TaxBand as Band,
} from "./index"

const FLAT_5: Band[] = [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 }]

describe("splitInclusivePrice", () => {
  it("splits Rs 2,100 at 5% exactly (taxable 200000, tax 10000)", () => {
    expect(splitInclusivePrice(210000, 500)).toEqual({ taxablePaise: 200000, taxPaise: 10000 })
  })

  it("puts the remainder in the tax: Rs 1,650 at 5% is 157142 + 7858", () => {
    const split = splitInclusivePrice(165000, 500)
    expect(split).toEqual({ taxablePaise: 157142, taxPaise: 7858 })
    expect(split.taxablePaise + split.taxPaise).toBe(165000)
  })

  it("handles zero price and zero rate", () => {
    expect(splitInclusivePrice(0, 500)).toEqual({ taxablePaise: 0, taxPaise: 0 })
    expect(splitInclusivePrice(315000, 0)).toEqual({ taxablePaise: 315000, taxPaise: 0 })
  })

  it("splits an amount that is not a whole rupee (a discounted value)", () => {
    expect(splitInclusivePrice(165050, 500)).toEqual({ taxablePaise: 157190, taxPaise: 7860 })
  })

  it("throws for amounts and rates outside the schemas", () => {
    expect(() => splitInclusivePrice(1650.5, 500)).toThrow(RangeError)
    expect(() => splitInclusivePrice(-100, 500)).toThrow(RangeError)
    expect(() => splitInclusivePrice(Number.NaN, 500)).toThrow(RangeError)
    expect(() => splitInclusivePrice(165000, 5.5)).toThrow(RangeError)
    expect(() => splitInclusivePrice(165000, -1)).toThrow(RangeError)
    expect(() => splitInclusivePrice(165000, 10001)).toThrow(RangeError)
  })

  for (const rateBp of [500, 1200]) {
    it(`taxable + tax = price, with taxable the exact floor, for every price Rs 100..10,00,000 step 50 at ${rateBp} bp`, () => {
      let checked = 0
      for (let rupees = 100; rupees <= 1_000_000; rupees += 50) {
        const price = rupees * 100
        const { taxablePaise, taxPaise } = splitInclusivePrice(price, rateBp)
        if (taxablePaise + taxPaise !== price) throw new Error(`sum differs at ${price}`)
        if (!Number.isInteger(taxablePaise) || !Number.isInteger(taxPaise)) throw new Error(`not integer at ${price}`)
        // floor: taxable × (10000 + r) ≤ price × 10000 < (taxable + 1) × (10000 + r)
        const lhs = BigInt(taxablePaise) * BigInt(10000 + rateBp)
        const scaled = BigInt(price) * 10000n
        if (!(lhs <= scaled && scaled < lhs + BigInt(10000 + rateBp))) throw new Error(`not the floor at ${price}`)
        // The remainder is in the tax: tax ≥ the exact tax on the taxable value.
        if (BigInt(taxPaise) * 10000n < BigInt(taxablePaise) * BigInt(rateBp)) throw new Error(`tax short at ${price}`)
        checked++
      }
      expect(checked).toBe(19999)
    })
  }
})

describe("TaxBand and TaxBands", () => {
  it("accept the seeded saree band and a stitched-item style threshold", () => {
    expect(TaxBands.safeParse(FLAT_5).success).toBe(true)
    expect(
      TaxBands.safeParse([
        { minTaxablePaise: 0, maxTaxablePaise: 250000, rateBp: 500 },
        { minTaxablePaise: 250001, maxTaxablePaise: null, rateBp: 1800 },
      ]).success
    ).toBe(true)
    expect(TaxBands.safeParse([]).success).toBe(true)
  })

  it("refuse floats, inverted ranges, overlaps and bands out of order", () => {
    expect(RateBp.safeParse(5.5).success).toBe(false)
    expect(TaxBand.safeParse({ minTaxablePaise: 0.5, maxTaxablePaise: null, rateBp: 500 }).success).toBe(false)
    expect(TaxBand.safeParse({ minTaxablePaise: 100, maxTaxablePaise: 99, rateBp: 500 }).success).toBe(false)
    expect(
      TaxBands.safeParse([
        { minTaxablePaise: 0, maxTaxablePaise: 250000, rateBp: 500 },
        { minTaxablePaise: 250000, maxTaxablePaise: null, rateBp: 1800 },
      ]).success
    ).toBe(false)
    expect(
      TaxBands.safeParse([
        { minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 },
        { minTaxablePaise: 250001, maxTaxablePaise: null, rateBp: 1800 },
      ]).success
    ).toBe(false)
  })
})

describe("findBand", () => {
  const bands: Band[] = [
    { minTaxablePaise: 0, maxTaxablePaise: 100000, rateBp: 500 },
    { minTaxablePaise: 200000, maxTaxablePaise: null, rateBp: 1200 },
  ]

  it("finds the band containing the value, ends inclusive", () => {
    expect(findBand(bands, 0)?.rateBp).toBe(500)
    expect(findBand(bands, 100000)?.rateBp).toBe(500)
    expect(findBand(bands, 200000)?.rateBp).toBe(1200)
    expect(findBand(bands, 99_999_999)?.rateBp).toBe(1200)
  })

  it("returns null in a gap and for no bands", () => {
    expect(findBand(bands, 100001)).toBeNull()
    expect(findBand(bands, 199999)).toBeNull()
    expect(findBand([], 0)).toBeNull()
  })
})

describe("taxForShelfPrice", () => {
  it("uses the band for the price", () => {
    expect(taxForShelfPrice(210000, FLAT_5)).toEqual({
      ok: true,
      data: { pricePaise: 210000, rateBp: 500, band: FLAT_5[0], taxablePaise: 200000, taxPaise: 10000 },
    })
    const r = taxForShelfPrice(165000, FLAT_5)
    expect(r.ok && [r.data.taxablePaise, r.data.taxPaise]).toEqual([157142, 7858])
  })

  it("rejects a shelf price that is not a whole number of rupees", () => {
    const r = taxForShelfPrice(165050, FLAT_5)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe("money.invalid_shelf_price")
    for (const bad of [1650.5, -100]) {
      const res = taxForShelfPrice(bad, FLAT_5)
      expect(!res.ok && res.error.code).toBe("money.invalid_shelf_price")
    }
  })

  it("fails with tax.no_band and no total when no band fits", () => {
    const none = taxForShelfPrice(210000, [])
    expect(none).toEqual({ ok: false, error: expect.objectContaining({ code: "tax.no_band" }) })
    expect("data" in none).toBe(false)

    const gap: Band[] = [
      { minTaxablePaise: 0, maxTaxablePaise: 100000, rateBp: 500 },
      { minTaxablePaise: 300000, maxTaxablePaise: null, rateBp: 1200 },
    ]
    // Rs 2,100 at 5% is 200000 taxable (in the gap); at 12% it is 187500 (below the second band).
    const r = taxForShelfPrice(210000, gap)
    expect(!r.ok && r.error.code).toBe("tax.no_band")
  })

  it("picks the band whose range holds the taxable value at that band's own rate", () => {
    const threshold: Band[] = [
      { minTaxablePaise: 0, maxTaxablePaise: 250000, rateBp: 500 },
      { minTaxablePaise: 250001, maxTaxablePaise: null, rateBp: 1800 },
    ]
    // Rs 2,625 at 5%: taxable exactly 250000, inside the first band.
    const low = taxForShelfPrice(262500, threshold)
    expect(low.ok && [low.data.rateBp, low.data.taxablePaise]).toEqual([500, 250000])
    // Rs 3,000: 285714 at 5% is above the first band; 254237 at 18% is in the second.
    const high = taxForShelfPrice(300000, threshold)
    expect(high.ok && [high.data.rateBp, high.data.taxablePaise, high.data.taxPaise]).toEqual([1800, 254237, 45763])
    // Rs 2,900: 276190 at 5% is above the first band, 245762 at 18% is below the second: no band.
    const between = taxForShelfPrice(290000, threshold)
    expect(!between.ok && between.error.code).toBe("tax.no_band")
    // The whole gap: Rs 2,626 to Rs 2,950 have no band; Rs 2,625 and Rs 2,951 do.
    const fits = (rupees: number) => taxForShelfPrice(rupees * 100, threshold).ok
    expect([fits(2625), fits(2626), fits(2950), fits(2951)]).toEqual([true, false, false, true])
  })

  it("its error codes are stable contract codes", () => {
    for (const code of [
      "money.invalid_shelf_price",
      "tax.no_band",
      "tax.kernel_mismatch",
      "tax.discount_unsupported",
      "tax.shipping_unsupported",
      "settings.invalid_value",
      "settings.not_found",
      "settings.past_effective_from",
    ]) {
      expect(ErrorCode.safeParse(code).success).toBe(true)
    }
  })
})
