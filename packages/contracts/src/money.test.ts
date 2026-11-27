import { describe, expect, it } from "vitest"
import { Paise, ShelfPrice, formatRupees, percentOff } from "./index"

describe("formatRupees", () => {
  it("formats whole rupees with Indian grouping", () => {
    expect(formatRupees(315000)).toBe("₹3,150")
    expect(formatRupees(495000)).toBe("₹4,950")
    expect(formatRupees(99900)).toBe("₹999")
    expect(formatRupees(100000)).toBe("₹1,000")
  })

  it("formats zero", () => {
    expect(formatRupees(0)).toBe("₹0")
  })

  it("groups lakh and crore values in twos after the first three digits", () => {
    expect(formatRupees(11230000)).toBe("₹1,12,300")
    expect(formatRupees(10000000)).toBe("₹1,00,000")
    expect(formatRupees(1234567800)).toBe("₹1,23,45,678")
  })

  it("never shows decimals", () => {
    expect(formatRupees(315049)).toBe("₹3,150")
    expect(formatRupees(315050)).toBe("₹3,151")
  })

  it("rejects non-integer and negative amounts", () => {
    expect(() => formatRupees(3150.5)).toThrow(RangeError)
    expect(() => formatRupees(-100)).toThrow(RangeError)
    expect(() => formatRupees(Number.NaN)).toThrow(RangeError)
  })
})

describe("Paise and ShelfPrice", () => {
  it("Paise accepts non-negative integers only", () => {
    expect(Paise.safeParse(0).success).toBe(true)
    expect(Paise.safeParse(315000).success).toBe(true)
    expect(Paise.safeParse(10.5).success).toBe(false)
    expect(Paise.safeParse(-1).success).toBe(false)
    expect(Paise.safeParse("315000").success).toBe(false)
  })

  it("ShelfPrice must be a whole number of rupees", () => {
    expect(ShelfPrice.safeParse(315000).success).toBe(true)
    expect(ShelfPrice.safeParse(315050).success).toBe(false)
  })
})

describe("percentOff", () => {
  it("rounds down", () => {
    // 450 / 3600 = 12.5%
    expect(percentOff(360000, 315000)).toBe(12)
    // 400 / 2600 = 15.38%
    expect(percentOff(260000, 220000)).toBe(15)
    // 1 / 3 = 33.33%
    expect(percentOff(300, 200)).toBe(33)
  })

  it("is zero when there is no discount or no MRP", () => {
    expect(percentOff(240000, 240000)).toBe(0)
    expect(percentOff(200000, 240000)).toBe(0)
    expect(percentOff(0, 0)).toBe(0)
  })
})
