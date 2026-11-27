import { z } from "zod"
import { Id, IsoDateTime } from "./common"
import { Paise, RateBp, ShelfPrice } from "./money"
import { TaxCode } from "./settings"

// ---------------------------------------------------------------------------
// Checkout and Hold (Story 1.9, FR-19, FR-16; AD-6, AD-30). A signed-in
// Shopper begins checkout with her address: under the stock lock the server
// re-checks the Bag, snapshots what she agreed to pay for into a Checkout,
// and holds her Pieces (a Hold with kernel reservations) for a set time.
// No payment starts here (Story 1.10 adds it).
// ---------------------------------------------------------------------------

/** India's states and union territories, as an address names them. */
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const

export const IndianState = z.enum(INDIAN_STATES)
export type IndianState = z.infer<typeof IndianState>

/**
 * An Indian mobile number: 10 digits starting 6 to 9. Spaces and hyphens
 * are ignored ("98765 43210"); a country code or leading 0 is not accepted.
 */
export const IndianMobile = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^[6-9][0-9]{9}$/, "A 10-digit Indian mobile number"))
export type IndianMobile = z.infer<typeof IndianMobile>

/** An Indian pincode: 6 digits, not starting with 0. */
export const Pincode = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "A 6-digit pincode")
export type Pincode = z.infer<typeof Pincode>

/**
 * Where the Shopper wants her Order delivered. Every field is required. The
 * address is personal data: it is stored with the Checkout and in its
 * recovery file, and never written to a log.
 */
export const CheckoutAddress = z.strictObject({
  name: z.string().trim().min(1).max(100),
  mobile: IndianMobile,
  addressLine: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  pincode: Pincode,
  state: IndianState,
})
export type CheckoutAddress = z.infer<typeof CheckoutAddress>
export type CheckoutAddressInput = z.input<typeof CheckoutAddress>

/** `POST /store/shop/checkouts`: the Bag (its cart id) and the delivery address. */
export const BeginCheckoutInput = z.strictObject({
  cartId: Id,
  address: CheckoutAddress,
})
export type BeginCheckoutInput = z.infer<typeof BeginCheckoutInput>

/**
 * One line of a Checkout's snapshot: what the Shopper agreed to pay for.
 * `unitPricePaise` is the tax-inclusive shelf price of one Piece;
 * `lineTotalPaise` = unit price × quantity = `taxableTotalPaise` +
 * `taxTotalPaise`, the tax worked out per Piece by the money functions from
 * the bands of `taxCode` in effect when the snapshot was taken (`rateBp`).
 */
export const CheckoutSnapshotLine = z
  .object({
    lineId: Id,
    variantId: Id,
    designId: Id,
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPricePaise: ShelfPrice,
    taxableTotalPaise: Paise,
    taxTotalPaise: Paise,
    lineTotalPaise: Paise,
    rateBp: RateBp,
    taxCode: TaxCode,
  })
  .refine((l) => l.lineTotalPaise === l.unitPricePaise * l.quantity, {
    message: "lineTotalPaise must be unitPricePaise × quantity",
    path: ["lineTotalPaise"],
  })
  .refine((l) => l.taxableTotalPaise + l.taxTotalPaise === l.lineTotalPaise, {
    message: "taxableTotalPaise + taxTotalPaise must be lineTotalPaise",
    path: ["taxTotalPaise"],
  })
export type CheckoutSnapshotLine = z.infer<typeof CheckoutSnapshotLine>

/** The version of the snapshot shape; later stories add fields (Story 1.10: the payment and Order). */
export const CHECKOUT_SNAPSHOT_VERSION = 1

/**
 * What the Shopper agreed to pay for, taken under the stock lock when she
 * began checkout: the lines with their unit prices and tax, the shipping
 * charge, the total, the address and her Shopper (customer) id. Stored with
 * the Checkout and written as its recovery file; never changed afterwards.
 */
export const CheckoutSnapshot = z
  .object({
    version: z.literal(CHECKOUT_SNAPSHOT_VERSION),
    cartId: Id,
    customerId: Id,
    currencyCode: z.literal("inr"),
    lines: z.array(CheckoutSnapshotLine).min(1),
    shippingPaise: Paise,
    totalPaise: Paise,
    address: CheckoutAddress,
    takenAt: IsoDateTime,
  })
  .refine((s) => s.totalPaise === s.lines.reduce((sum, l) => sum + l.lineTotalPaise, 0) + s.shippingPaise, {
    message: "totalPaise must be the lines' totals plus shipping",
    path: ["totalPaise"],
  })
export type CheckoutSnapshot = z.infer<typeof CheckoutSnapshot>

/**
 * A Checkout's state. `held` while its Hold lasts; `cancelled` when the
 * Shopper cancelled; `expired` when the Hold ran out. Story 1.10 adds the
 * payment states.
 */
export const CheckoutStatus = z.enum(["held", "cancelled", "expired"])
export type CheckoutStatus = z.infer<typeof CheckoutStatus>

/** A Hold's state: `live` until it is `released` (cancelled) or `expired`. */
export const HoldStatus = z.enum(["live", "released", "expired"])
export type HoldStatus = z.infer<typeof HoldStatus>

/**
 * A Checkout as its Shopper sees it. Every amount comes from the snapshot;
 * `holdExpiresAt` is the true end of the Hold, from the server.
 */
export const CheckoutView = z.object({
  id: Id,
  status: CheckoutStatus,
  lines: z.array(CheckoutSnapshotLine).min(1),
  shippingPaise: Paise,
  totalPaise: Paise,
  holdExpiresAt: IsoDateTime,
  address: CheckoutAddress,
  createdAt: IsoDateTime,
})
export type CheckoutView = z.infer<typeof CheckoutView>

/** The answer of the checkout routes. */
export const CheckoutResponse = z.object({ checkout: CheckoutView })
export type CheckoutResponse = z.infer<typeof CheckoutResponse>

/**
 * The recovery file `checkouts/<checkoutId>.json` in the private `documents`
 * bucket (AD-30): enough to rebuild an Order with its original numbers if
 * the database is lost. Story 1.10 adds the Order id, Story 1.13 the invoice
 * number. Never logged.
 */
export const CheckoutRecoveryFile = z.object({
  version: z.literal(CHECKOUT_SNAPSHOT_VERSION),
  checkoutId: Id,
  holdId: Id,
  holdExpiresAt: IsoDateTime,
  createdAt: IsoDateTime,
  snapshot: CheckoutSnapshot,
})
export type CheckoutRecoveryFile = z.infer<typeof CheckoutRecoveryFile>

/** The key of a Checkout's recovery file in the `documents` bucket. */
export function checkoutRecoveryKey(checkoutId: string): string {
  return `checkouts/${checkoutId}.json`
}

/**
 * Why a Bag line stops checkout (`cart.changed`): its price is not the
 * Design's price now (`price_changed`), fewer Pieces are left than it holds
 * (`short_of_stock`), or its Design is no longer on sale (`unavailable`).
 * Pieces held by other Shoppers do not count as short: that is
 * `stock.unavailable`.
 */
export const ChangedLineReason = z.enum(["price_changed", "short_of_stock", "unavailable"])
export type ChangedLineReason = z.infer<typeof ChangedLineReason>

/**
 * One changed line in `cart.changed`'s `details.lines`. `unitPricePaise` is
 * the line's price in the Bag, `currentPricePaise` the Design's price now
 * (null when it is not on sale); `available` the Pieces left, not counting
 * other Shoppers' Holds.
 */
export const ChangedLine = z.object({
  lineId: Id,
  variantId: Id,
  name: z.string().min(1),
  reason: ChangedLineReason,
  quantity: z.number().int().positive(),
  unitPricePaise: ShelfPrice,
  currentPricePaise: ShelfPrice.nullable(),
  available: z.number().int().nonnegative(),
})
export type ChangedLine = z.infer<typeof ChangedLine>

/** The details of `cart.changed`: each changed line. Nothing was created. */
export const CartChangedDetails = z.object({ lines: z.array(ChangedLine).min(1) })
export type CartChangedDetails = z.infer<typeof CartChangedDetails>

/** The setting that holds the Hold length in minutes. */
export const HOLD_MINUTES_SETTING = "checkout.hold_minutes" as const

/** When a Hold that starts at `from` ends. */
export function holdExpiry(from: Date, minutes: number): Date {
  return new Date(from.getTime() + minutes * 60_000)
}
