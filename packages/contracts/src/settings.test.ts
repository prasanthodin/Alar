import { describe, expect, it } from "vitest"
import {
  ShopPublicView,
  addDays,
  businessDate,
  isSettingKey,
  isTimeZone,
  parseSettingValue,
  pickEffective,
  settingSchema,
  startOfBusinessDay,
  startOfNextBusinessDay,
  taxBandsKey,
} from "./index"

describe("setting keys", () => {
  it("knows shop.name, shop.time_zone and tax.bands.<taxCode>", () => {
    expect(isSettingKey("shop.name")).toBe(true)
    expect(isSettingKey("shop.time_zone")).toBe(true)
    expect(isSettingKey("tax.bands.saree")).toBe(true)
    expect(taxBandsKey("saree")).toBe("tax.bands.saree")
  })

  it("refuses unknown keys and malformed tax codes", () => {
    expect(isSettingKey("shop.colour")).toBe(false)
    expect(isSettingKey("tax.bands.")).toBe(false)
    expect(isSettingKey("tax.bands.Saree")).toBe(false)
    expect(isSettingKey("tax.bands.a b")).toBe(false)
    expect(isSettingKey("toString")).toBe(false)
    expect(settingSchema("__proto__")).toBeNull()
  })
})

describe("parseSettingValue", () => {
  it("accepts valid values and trims the shop name", () => {
    expect(parseSettingValue("shop.name", "  Neutral Store ")).toEqual({ ok: true, data: "Neutral Store" })
    expect(parseSettingValue("shop.time_zone", "Asia/Kolkata")).toEqual({ ok: true, data: "Asia/Kolkata" })
    const bands = [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 }]
    expect(parseSettingValue("tax.bands.saree", bands)).toEqual({ ok: true, data: bands })
  })

  it("fails with settings.invalid_value for a bad value or an unknown key", () => {
    for (const [key, value] of [
      ["shop.name", ""],
      ["shop.name", "x".repeat(81)],
      ["shop.name", 42],
      ["shop.time_zone", "Mars/Olympus"],
      ["shop.time_zone", "../etc"],
      ["tax.bands.saree", [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 5.5 }]],
      ["tax.bands.saree", { rateBp: 500 }],
      ["shop.colour", "lavender"],
    ] as const) {
      const r = parseSettingValue(key, value)
      expect(r.ok, `${key}=${JSON.stringify(value)}`).toBe(false)
      if (!r.ok) expect(r.error.code).toBe("settings.invalid_value")
    }
  })

  it("ShopPublicView holds the name only", () => {
    expect(ShopPublicView.parse({ name: "Neutral Store", extra: 1 })).toEqual({ name: "Neutral Store" })
    expect(ShopPublicView.safeParse({ name: "" }).success).toBe(false)
  })
})

describe("pickEffective", () => {
  const d1 = { effectiveFrom: "2026-01-01T00:00:00.000Z", value: "D1" }
  const d2 = { effectiveFrom: "2026-06-01T00:00:00.000Z", value: "D2" }
  const d3 = { effectiveFrom: "2026-12-01T00:00:00.000Z", value: "D3" }

  it("returns the value with the latest effective time not after the time asked (D1 < D2 <= now < D3)", () => {
    const now = new Date("2026-11-27T10:00:00.000Z")
    expect(pickEffective([d3, d1, d2], now)?.value).toBe("D2")
    expect(pickEffective([d1, d2, d3], new Date(d2.effectiveFrom))?.value).toBe("D2")
    expect(pickEffective([d1, d2, d3], new Date(d3.effectiveFrom))?.value).toBe("D3")
  })

  it("returns null before the first value", () => {
    expect(pickEffective([d1, d2], new Date("2025-12-31T23:59:59.999Z"))).toBeNull()
    expect(pickEffective([], new Date())).toBeNull()
  })
})

describe("business days", () => {
  it("knows time zones", () => {
    expect(isTimeZone("Asia/Kolkata")).toBe(true)
    expect(isTimeZone("UTC")).toBe(true)
    expect(isTimeZone("Asia/Nowhere")).toBe(false)
  })

  it("midnight in Asia/Kolkata is 18:30 UTC the day before", () => {
    expect(startOfBusinessDay("2026-11-28", "Asia/Kolkata").toISOString()).toBe("2026-11-27T18:30:00.000Z")
    expect(startOfBusinessDay("2026-04-01", "Asia/Kolkata").toISOString()).toBe("2026-03-31T18:30:00.000Z")
  })

  it("handles a zone with daylight saving", () => {
    expect(startOfBusinessDay("2026-07-01", "Europe/London").toISOString()).toBe("2026-06-30T23:00:00.000Z")
    expect(startOfBusinessDay("2026-12-01", "Europe/London").toISOString()).toBe("2026-12-01T00:00:00.000Z")
    // The day the clocks go forward (29 March 2026) still starts at 00:00 GMT.
    expect(startOfBusinessDay("2026-03-29", "Europe/London").toISOString()).toBe("2026-03-29T00:00:00.000Z")
  })

  it("the business date follows the business time zone, not UTC", () => {
    expect(businessDate(new Date("2026-11-27T18:29:59.999Z"), "Asia/Kolkata")).toBe("2026-11-27")
    expect(businessDate(new Date("2026-11-27T18:30:00.000Z"), "Asia/Kolkata")).toBe("2026-11-28")
  })

  it("adds days across months and years", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28")
  })

  it("tomorrow starts at the next Asia/Kolkata midnight", () => {
    expect(startOfNextBusinessDay(new Date("2026-11-27T10:00:00.000Z"), "Asia/Kolkata").toISOString()).toBe(
      "2026-11-27T18:30:00.000Z"
    )
    // 23:30 IST on the 27th is 18:00 UTC; 00:30 IST on the 28th is 19:00 UTC.
    expect(startOfNextBusinessDay(new Date("2026-11-27T19:00:00.000Z"), "Asia/Kolkata").toISOString()).toBe(
      "2026-11-28T18:30:00.000Z"
    )
  })

  it("refuses a bad date or zone", () => {
    expect(() => startOfBusinessDay("2026-13-01", "Asia/Kolkata")).toThrow(RangeError)
    expect(() => startOfBusinessDay("2026-11-28", "Nowhere/City")).toThrow(RangeError)
  })
})
