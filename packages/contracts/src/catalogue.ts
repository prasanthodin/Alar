import { z } from "zod"
import { Id } from "./common"
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

/** A Design as a product card shows it. Prices are shelf prices in paise. */
export const DesignCard = z.object({
  id: Id,
  name: z.string().min(1),
  subtitle: z.string(),
  price: ShelfPrice,
  mrp: ShelfPrice,
  image: ImageRef,
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

/** A Design as its product page shows it. Never carries a Weaver. */
export const DesignView = DesignCard.extend({
  images: z.array(ImageRef).min(1),
  variants: z.array(VariantView).min(1),
  attributes: z.array(AttributeView),
  fullView: ImageRef.optional(),
})
export type DesignView = z.infer<typeof DesignView>

/** One line of the Bag. */
export const BagLine = z.object({
  id: Id,
  designId: Id,
  variantId: Id,
  name: z.string().min(1),
  colourName: z.string().min(1),
  image: ImageRef,
  price: ShelfPrice,
  mrp: ShelfPrice,
  quantity: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
})
export type BagLine = z.infer<typeof BagLine>

/**
 * The Shopper's Bag (the kernel's cart). The four price lines are always
 * present and in this order: totalMrp, discount, delivery, total.
 */
export const BagView = z.object({
  lines: z.array(BagLine),
  totalMrp: Paise,
  discount: Paise,
  delivery: Paise,
  total: Paise,
  count: z.number().int().nonnegative(),
})
export type BagView = z.infer<typeof BagView>

/** Default low-stock level until the Owner sets one (FR-3): at or below it the true count is shown. */
export const LOW_STOCK_LEVEL = 3

/** The count to show as "Only N left", or null when nothing should be shown (sold out or above the level). */
export function lowStockCount(stock: number, level: number = LOW_STOCK_LEVEL): number | null {
  return stock > 0 && stock <= level ? stock : null
}
