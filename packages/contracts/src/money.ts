import { z } from "zod"

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
