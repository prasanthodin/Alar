import { z } from "zod"
import { Id, IsoDateTime } from "./common"
import { Metres } from "./design"
import { Paise, ShelfPrice } from "./money"

/** A picture and its written description. `isSample` marks a placeholder that is not a photo of the item on sale. */
export const ImageRef = z.object({
  url: z.string().min(1),
  alt: z.string(),
  isSample: z.boolean(),
})
export type ImageRef = z.infer<typeof ImageRef>

export const CategoryView = z.object({
  id: Id,
  name: z.string().min(1),
  thumbnail: ImageRef,
})
export type CategoryView = z.infer<typeof CategoryView>

export const Rating = z.object({
  value: z.number().min(0).max(5),
  count: z.number().int().nonnegative(),
})
export type Rating = z.infer<typeof Rating>

/**
 * Whether a Design can be bought now, computed by the server from stocked −
 * reserved Pieces at the India stock location (Story 1.8). A sold-out Design
 * is still shown, with adding to the Bag disabled. `held` (Story 1.9): none
 * is available now, but only because other Shoppers' Holds have them while
 * they pay; shown as "unavailable for now", and it cannot be added either.
 */
export const Availability = z.enum(["available", "sold_out", "held"])
export type Availability = z.infer<typeof Availability>

/**
 * A Design as a product card shows it. Prices are tax-inclusive shelf prices
 * in paise. There is no MRP in Epic 1, so the kernel sends `mrp` equal to
 * `price` (no discount is shown). `handle` is the Design's address on the
 * website (`/designs/<handle>`). Stories 1.28 and 2.15 extend this schema.
 */
export const DesignCard = z.object({
  id: Id,
  handle: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string(),
  price: ShelfPrice,
  mrp: ShelfPrice,
  image: ImageRef,
  availability: Availability,
  badge: z.string().min(1).optional(),
  rating: Rating.optional(),
})
export type DesignCard = z.infer<typeof DesignCard>

/** One Variant of a Design (by colour). `stock` is the number of Pieces available now. */
export const VariantView = z.object({
  id: Id,
  colourName: z.string().min(1),
  swatch: ImageRef,
  stock: z.number().int().nonnegative(),
})
export type VariantView = z.infer<typeof VariantView>

/** A category-neutral detail line, e.g. { label: "Fabric", value: "Pure silk" }. */
export const AttributeView = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})
export type AttributeView = z.infer<typeof AttributeView>

/**
 * A Design's typed details as the shop records them (Story 1.6). Clients take
 * the labels and the wording ("6.2 m", "Included") from their translation
 * files. Never carries a Weaver.
 */
export const DesignDetails = z.object({
  fibre: z.string().nullable(),
  weave: z.string().nullable(),
  lengthM: Metres.nullable(),
  widthM: Metres.nullable(),
  blousePieceIncluded: z.boolean(),
  care: z.string().nullable(),
  countryOfOrigin: z.string().nullable(),
})
export type DesignDetails = z.infer<typeof DesignDetails>

/**
 * A preview of an unpublished Design, opened with a signed link from the
 * Admin. `expiresAt` is when the link stops working.
 */
export const DesignPreview = z.object({ expiresAt: IsoDateTime })
export type DesignPreview = z.infer<typeof DesignPreview>

/**
 * A Design as its product page shows it. Never carries a Weaver. The kernel
 * sends `details` and an empty `attributes`; the mock sends ready-made
 * `attributes` lines. `preview` is set only when an unpublished Design is
 * opened with a valid preview token.
 */
export const DesignView = DesignCard.extend({
  description: z.string().default(""),
  images: z.array(ImageRef).min(1),
  variants: z.array(VariantView).min(1),
  attributes: z.array(AttributeView),
  details: DesignDetails.optional(),
  fullView: ImageRef.optional(),
  preview: DesignPreview.optional(),
})
export type DesignView = z.infer<typeof DesignView>

/**
 * One line of the Bag. `price` is the shelf price of one Piece and
 * `lineTotal` the line's tax-inclusive total, both computed by the server;
 * `stock` is the number of Pieces available now (the most the line can hold).
 * `buyable` is false for a line whose Design is no longer on sale (unpublished
 * or gone): it can only be removed, and it may have no page (`handle` null)
 * and no photo (`image` null).
 */
export const BagLine = z.object({
  id: Id,
  designId: Id,
  handle: z.string().min(1).nullable(),
  variantId: Id,
  name: z.string().min(1),
  colourName: z.string().min(1),
  image: ImageRef.nullable(),
  buyable: z.boolean().default(true),
  price: ShelfPrice,
  mrp: ShelfPrice,
  quantity: z.number().int().positive(),
  lineTotal: Paise,
  stock: z.number().int().nonnegative(),
})
export type BagLine = z.infer<typeof BagLine>

/**
 * The live Hold on a Bag (Story 1.9): while it lasts the Bag cannot be
 * changed (`cart.locked`), and its Checkout is the Shopper's to pay or cancel.
 */
export const BagHold = z.object({ checkoutId: Id, expiresAt: IsoDateTime })
export type BagHold = z.infer<typeof BagHold>

/**
 * The Shopper's Bag (the kernel's cart). The four price lines are always
 * present and in this order: totalMrp, discount, delivery, total. Every
 * amount is computed by the server; clients only format them. `delivery` is
 * the charge of the shop's standard shipping option (Rs 0 in Epic 1), shown
 * before checkout. `hold` is set while a checkout holds the Bag's Pieces.
 */
export const BagView = z.object({
  lines: z.array(BagLine),
  totalMrp: Paise,
  discount: Paise,
  delivery: Paise,
  total: Paise,
  count: z.number().int().nonnegative(),
  hold: BagHold.nullable().default(null),
})
export type BagView = z.infer<typeof BagView>

/** A quantity of one Bag line: a whole number of Pieces, at least 1 (removing a line is its own call). */
export const BagQuantity = z.number().int().positive().max(100_000)
export type BagQuantity = z.infer<typeof BagQuantity>

/** Default low-stock level until the Owner sets one (FR-3): at or below it the true count is shown. */
export const LOW_STOCK_LEVEL = 3

/** The count to show as "Only N left", or null when nothing should be shown (sold out or above the level). */
export function lowStockCount(stock: number, level: number = LOW_STOCK_LEVEL): number | null {
  return stock > 0 && stock <= level ? stock : null
}
