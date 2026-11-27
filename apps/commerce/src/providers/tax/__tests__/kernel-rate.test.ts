import { getLineItemsTotals, MathBN } from "@medusajs/framework/utils"
import { splitInclusivePrice } from "@shop/contracts"
import { describe, expect, it } from "vitest"
import { kernelMatches, kernelRateFor, shortestFloat32 } from "../kernel-rate"

/** The kernel's own line totals for a tax-inclusive line, in paise (rounded to the paisa). */
function kernelLine(pricePaise: number, quantity: number, rate: number) {
  const all: Record<string, { subtotal: unknown; tax_total: unknown; total: unknown }> = getLineItemsTotals(
    [
      {
        id: "line",
        unit_price: MathBN.div(pricePaise, 100).toFixed(),
        quantity,
        is_tax_inclusive: true,
        tax_lines: [{ rate }],
        adjustments: [],
      } as never,
    ],
    { includeTax: true }
  ) as never
  const totals = all.line!
  const paise = (v: unknown) => MathBN.mult(MathBN.convert(v as never), 100).decimalPlaces(0).toNumber()
  return { taxablePaise: paise(totals.subtotal), taxPaise: paise(totals.tax_total), totalPaise: paise(totals.total) }
}

describe("shortestFloat32", () => {
  it("gives the shortest decimal that reads back as the same single-precision value", () => {
    expect(shortestFloat32(5)).toBe(5)
    expect(shortestFloat32(0.1)).toBe(0.1)
    const f = Math.fround(5.000572731669)
    expect(Math.fround(shortestFloat32(f))).toBe(f)
  })
})

describe("kernelRateFor", () => {
  it("returns 0 when there is no tax", () => {
    expect(kernelRateFor({ taxablePaise: 315000, taxPaise: 0 }, 1)).toEqual({ rate: 0, exact: true })
  })

  it("the nominal rate does not reproduce the money functions (why the provider adjusts it)", () => {
    // Rs 1,650 at 5%: the kernel gives 1571.428571... = 157143 paise to the paisa, the money functions 157142.
    expect(kernelLine(165000, 1, 5).taxablePaise).toBe(157143)
    expect(splitInclusivePrice(165000, 500).taxablePaise).toBe(157142)
  })

  for (const [rupees, rateBp] of [
    [2100, 500],
    [3150, 500],
    [1650, 500],
    [1650, 1200],
  ] as const) {
    it(`makes the kernel's own totals equal the money functions for Rs ${rupees} at ${rateBp} bp`, () => {
      const split = splitInclusivePrice(rupees * 100, rateBp)
      const { rate, exact } = kernelRateFor(split, 1)
      expect(exact).toBe(true)
      // Already in the form PostgreSQL prints for a `real`, so storing it changes nothing.
      expect(shortestFloat32(rate)).toBe(rate)
      expect(kernelLine(rupees * 100, 1, rate)).toEqual({ ...split, totalPaise: rupees * 100 })
      expect(kernelLine(rupees * 100, 1, Math.fround(rate))).toEqual({ ...split, totalPaise: rupees * 100 })
    })
  }

  for (const rateBp of [500, 1200]) {
    it(`matches the kernel for one piece at every price Rs 100..10,00,000 step 50 at ${rateBp} bp`, () => {
      const misses: number[] = []
      for (let rupees = 100; rupees <= 1_000_000; rupees += 50) {
        const split = splitInclusivePrice(rupees * 100, rateBp)
        const { rate, exact } = kernelRateFor(split, 1)
        if (!exact || !kernelMatches(split, 1, rate) || !kernelMatches(split, 1, Math.fround(rate))) misses.push(rupees)
      }
      expect(misses).toEqual([])
    })
  }

  it("scales to several pieces of an everyday price", () => {
    for (const quantity of [2, 3, 5, 10]) {
      const split = splitInclusivePrice(165000, 500)
      const { rate, exact } = kernelRateFor(split, quantity)
      expect(exact).toBe(true)
      expect(kernelLine(165000, quantity, rate)).toEqual({
        taxablePaise: split.taxablePaise * quantity,
        taxPaise: split.taxPaise * quantity,
        totalPaise: 165000 * quantity,
      })
    }
  })

  it("says when no storable rate reproduces a very large line to the paisa", () => {
    // Ten pieces at Rs 9,99,950 and 18%: the rate would need more precision than a PostgreSQL real holds.
    const split = splitInclusivePrice(99_995_000, 1800)
    expect(kernelRateFor(split, 10).exact).toBe(false)
  })
})
