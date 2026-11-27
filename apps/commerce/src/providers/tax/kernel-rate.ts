import { MathBN } from "@medusajs/framework/utils"
import type { TaxSplit } from "@shop/contracts"

/**
 * The kernel computes a tax-inclusive line itself from the rate a tax provider
 * returns: subtotal = price × qty / (1 + rate/100), tax = subtotal × rate/100.
 * At the nominal rate (5%) that gives 1571.428571… for Rs 1,650, not the
 * money functions' 157142 paise. So the provider returns, per line, the rate
 * at which the kernel's own arithmetic lands on the money functions' split:
 * tax / taxable × 100, rounded to a value the kernel can store.
 *
 * The cart stores a tax line's rate as a PostgreSQL `real` (single precision),
 * so the rate is chosen among single-precision values near the ideal one, and
 * accepted only when the kernel's arithmetic (its own BigNumber maths) gives
 * the split to the paisa both for the stored value and for the shortest
 * decimal PostgreSQL prints for it.
 *
 * This converts the money functions' result into the kernel's terms; it does
 * not compute tax.
 */

const F32 = new Float32Array(1)
const U32 = new Uint32Array(F32.buffer)

/** The single-precision value `steps` units in the last place away from `f` (a positive float32). */
function f32Step(f: number, steps: number): number {
  F32[0] = f
  U32[0] = U32[0]! + steps
  return F32[0]
}

/** The shortest decimal that reads back as the same single-precision value (what PostgreSQL prints for a `real`). */
export function shortestFloat32(f: number): number {
  const target = Math.fround(f)
  for (let digits = 1; digits <= 9; digits++) {
    const candidate = Number(target.toPrecision(digits))
    if (Math.fround(candidate) === target) return candidate
  }
  return target
}

/** Paise → rupees as an exact decimal string (the kernel's major units). */
function rupees(paise: number): string {
  return MathBN.div(paise, 100).toFixed()
}

/** True when the kernel's arithmetic at `rate` gives exactly this line split to the paisa. */
export function kernelMatches(split: TaxSplit, quantity: number, rate: number): boolean {
  const total = MathBN.mult(rupees(split.taxablePaise + split.taxPaise), quantity)
  const subtotal = MathBN.div(total, MathBN.add(1, MathBN.div(rate, 100)))
  const tax = MathBN.mult(subtotal, MathBN.div(rate, 100))
  const toPaise = (v: ReturnType<typeof MathBN.convert>) => MathBN.mult(v, 100).decimalPlaces(0).toNumber()
  return toPaise(subtotal) === split.taxablePaise * quantity && toPaise(tax) === split.taxPaise * quantity
}

/** How far (in single-precision steps) the search goes either side of the ideal rate. */
const SEARCH_STEPS = 16

/**
 * The percentage rate to give the kernel for one line of `quantity` pieces at
 * this per-piece split. `exact` is false when no storable rate reproduces the
 * split to the paisa (a very large line value); the nearest rate is returned then.
 */
export function kernelRateFor(split: TaxSplit, quantity: number): { rate: number; exact: boolean } {
  if (split.taxPaise === 0) return { rate: 0, exact: true }
  const ideal = Math.fround((split.taxPaise / split.taxablePaise) * 100)
  for (let distance = 0; distance <= SEARCH_STEPS; distance++) {
    for (const steps of distance === 0 ? [0] : [-distance, distance]) {
      const stored = f32Step(ideal, steps)
      if (kernelMatches(split, quantity, stored) && kernelMatches(split, quantity, shortestFloat32(stored))) {
        return { rate: shortestFloat32(stored), exact: true }
      }
    }
  }
  return { rate: shortestFloat32(ideal), exact: false }
}
