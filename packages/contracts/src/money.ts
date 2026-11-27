import { z } from "zod"
import { fail, ok, type Result } from "./common"

/** An amount of money in paise (1 rupee = 100 paise): a non-negative integer. */
export const Paise = z.number().int().nonnegative()
export type Paise = z.infer<typeof Paise>

/** A shelf price: tax-inclusive, in paise, always a whole number of rupees. */
export const ShelfPrice = Paise.refine((v) => v % 100 === 0, {
  message: "A shelf price is a whole number of rupees (a multiple of 100 paise)",
})
export type ShelfPrice = z.infer<typeof ShelfPrice>

/** Groups the digits of a non-negative integer the Indian way: 1,12,300. */
function groupIndian(n: number): string {
  const digits = String(n)
  if (digits.length <= 3) return digits
  const last3 = digits.slice(-3)
  const rest = digits.slice(0, -3)
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`
}

/**
 * Formats paise as whole rupees with the rupee sign and Indian digit grouping,
 * e.g. 315000 -> "₹3,150", 11230000 -> "₹1,12,300". Never shows decimals; a
 * remainder below one rupee is rounded to the nearest rupee. Clients format
 * amounts, they never compute them.
 */
export function formatRupees(paise: number): string {
  const parsed = Paise.safeParse(paise)
  if (!parsed.success) {
    throw new RangeError(`formatRupees expects a non-negative integer of paise, got ${paise}`)
  }
  return `₹${groupIndian(Math.round(parsed.data / 100))}`
}

/** The discount as a whole percentage of the MRP, rounded down (never overstated). */
export function percentOff(mrp: number, price: number): number {
  if (!Number.isFinite(mrp) || !Number.isFinite(price) || mrp <= 0 || price >= mrp) return 0
  return Math.floor(((mrp - price) * 100) / mrp)
}

// ---------------------------------------------------------------------------
// Tax from a tax-inclusive price (AD-5, AD-13). Every tax amount in the shop
// comes from these functions: the kernel's tax provider calls them, and no
// other code computes tax. Amounts are integer paise, rates integer basis
// points (1 bp = 0.01%); there are no floats in this arithmetic.
// ---------------------------------------------------------------------------

/** A tax rate in basis points: 500 = 5%, 1200 = 12%. An integer from 0 to 10000. */
export const RateBp = z.number().int().min(0).max(10_000)
export type RateBp = z.infer<typeof RateBp>

/**
 * One tax band: a range of per-piece taxable value (after discount, before
 * tax), both ends inclusive, with the rate that applies in it.
 * `maxTaxablePaise: null` means no upper limit.
 */
export const TaxBand = z
  .object({
    minTaxablePaise: Paise,
    maxTaxablePaise: Paise.nullable(),
    rateBp: RateBp,
  })
  .refine((b) => b.maxTaxablePaise === null || b.maxTaxablePaise >= b.minTaxablePaise, {
    message: "maxTaxablePaise must not be below minTaxablePaise",
    path: ["maxTaxablePaise"],
  })
export type TaxBand = z.infer<typeof TaxBand>

/**
 * The bands of one tax code, in ascending order of `minTaxablePaise` and not
 * overlapping. Gaps are allowed: a taxable value in a gap has no band.
 */
export const TaxBands = z.array(TaxBand).superRefine((bands, ctx) => {
  for (let i = 1; i < bands.length; i++) {
    const prev = bands[i - 1]!
    const band = bands[i]!
    if (prev.maxTaxablePaise === null || band.minTaxablePaise <= prev.maxTaxablePaise) {
      ctx.addIssue({
        code: "custom",
        message: "Bands must be in ascending order and must not overlap",
        path: [i, "minTaxablePaise"],
      })
    }
  }
})
export type TaxBands = z.infer<typeof TaxBands>

/** A tax-inclusive amount split into its taxable value and its tax: taxable + tax = the amount. */
export type TaxSplit = { taxablePaise: number; taxPaise: number }

/** The tax of one shelf price: the split, the rate applied and the band it came from. */
export type ShelfPriceTax = TaxSplit & { pricePaise: number; rateBp: number; band: TaxBand }

function assertPaise(value: number, what: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${what} must be a non-negative integer of paise, got ${value}`)
  }
}

/**
 * Splits a tax-inclusive amount at one rate:
 * taxable = floor(price × 10000 / (10000 + rateBp)) and tax = price − taxable,
 * so taxable + tax = price exactly and the rounding remainder is in the tax.
 * Throws RangeError for an amount or rate outside the schemas (a programming error).
 */
export function splitInclusivePrice(pricePaise: number, rateBp: number): TaxSplit {
  assertPaise(pricePaise, "pricePaise")
  if (!RateBp.safeParse(rateBp).success) {
    throw new RangeError(`rateBp must be an integer from 0 to 10000, got ${rateBp}`)
  }
  // BigInt keeps the product exact for any safe integer amount; division truncates (floor for non-negatives).
  const taxablePaise = Number((BigInt(pricePaise) * 10_000n) / BigInt(10_000 + rateBp))
  return { taxablePaise, taxPaise: pricePaise - taxablePaise }
}

/** The band whose range contains this per-piece taxable value, or null (a gap, or no bands). */
export function findBand(bands: readonly TaxBand[], taxablePaise: number): TaxBand | null {
  assertPaise(taxablePaise, "taxablePaise")
  return (
    bands.find(
      (b) =>
        taxablePaise >= b.minTaxablePaise && (b.maxTaxablePaise === null || taxablePaise <= b.maxTaxablePaise)
    ) ?? null
  )
}

/**
 * The tax in one tax-inclusive shelf price (per piece). Bands are tried in
 * order: for each band's rate the taxable value is worked out, and the first
 * band whose range contains that taxable value is used. Fails with
 * `money.invalid_shelf_price` for a price that is not a whole number of rupees
 * and `tax.no_band` when no band fits (no total is returned).
 */
export function taxForShelfPrice(pricePaise: number, bands: readonly TaxBand[]): Result<ShelfPriceTax> {
  if (!ShelfPrice.safeParse(pricePaise).success) {
    return fail("money.invalid_shelf_price", "A shelf price is a non-negative whole number of rupees in paise", {
      pricePaise,
    })
  }
  for (const band of bands) {
    const split = splitInclusivePrice(pricePaise, band.rateBp)
    if (findBand([band], split.taxablePaise)) {
      return ok({ pricePaise, rateBp: band.rateBp, band, ...split })
    }
  }
  return fail("tax.no_band", "No tax band contains the taxable value of this price", { pricePaise })
}
