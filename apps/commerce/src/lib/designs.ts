import { ContainerRegistrationKeys, MathBN, MedusaError } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import {
  AdminDesignView,
  DesignPhotos,
  DesignStatus,
  ShelfPrice,
  type DesignAttributes,
  type DesignPhoto,
} from "@shop/contracts"
import { shopError } from "./shop-errors"

/** The currency of a Design's one price (the India region's). */
export const DESIGN_CURRENCY = "inr"

/** The columns of a `design_attributes` row, as the module stores them. */
export type DesignAttributesColumns = {
  fibre: string | null
  weave: string | null
  length_cm: number | null
  width_cm: number | null
  blouse_piece_included: boolean
  care: string | null
  country_of_origin: string | null
  tax_code: string | null
  stitched: boolean
}

/** Metres (at most two decimals) as whole centimetres. */
export function metresToCm(metres: number | null): number | null {
  return metres === null ? null : Math.round(metres * 100)
}

/** Whole centimetres as metres. */
export function cmToMetres(cm: number | null | undefined): number | null {
  return typeof cm === "number" ? cm / 100 : null
}

/** The given attributes as columns; fields left out are left out. */
export function attributesToColumns(attributes: Partial<DesignAttributes>): Partial<DesignAttributesColumns> {
  const out: Partial<DesignAttributesColumns> = {}
  if (attributes.fibre !== undefined) out.fibre = attributes.fibre
  if (attributes.weave !== undefined) out.weave = attributes.weave
  if (attributes.lengthM !== undefined) out.length_cm = metresToCm(attributes.lengthM)
  if (attributes.widthM !== undefined) out.width_cm = metresToCm(attributes.widthM)
  if (attributes.blousePieceIncluded !== undefined) out.blouse_piece_included = attributes.blousePieceIncluded
  if (attributes.care !== undefined) out.care = attributes.care
  if (attributes.countryOfOrigin !== undefined) out.country_of_origin = attributes.countryOfOrigin
  if (attributes.taxCode !== undefined) out.tax_code = attributes.taxCode
  if (attributes.stitched !== undefined) out.stitched = attributes.stitched
  return out
}

/** A stored row as the contract's attributes. */
export function attributesFromRow(row: Partial<DesignAttributesColumns>): DesignAttributes {
  return {
    fibre: row.fibre ?? null,
    weave: row.weave ?? null,
    lengthM: cmToMetres(row.length_cm),
    widthM: cmToMetres(row.width_cm),
    blousePieceIncluded: row.blouse_piece_included ?? false,
    care: row.care ?? null,
    countryOfOrigin: row.country_of_origin ?? null,
    taxCode: row.tax_code ?? null,
    stitched: row.stitched ?? false,
  }
}

/** Stored photos, checked against the contract; a stored value that fails it is a fault on the shop's side. */
export function photosFromRow(photos: unknown): DesignPhoto[] {
  const parsed = DesignPhotos.safeParse(photos ?? [])
  if (!parsed.success) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Stored Design photos are not valid", "internal")
  }
  return parsed.data
}

/** A kernel amount in rupees (major units) as paise, or null when it is not a shelf price. */
export function kernelAmountToPaise(amount: unknown): number | null {
  if (amount === null || amount === undefined) return null
  const paise = MathBN.mult(MathBN.convert(amount as never), 100)
  if (!paise.isInteger()) return null
  const parsed = ShelfPrice.safeParse(paise.toNumber())
  return parsed.success ? parsed.data : null
}

/** The fields a Design is read with (a kernel product and its linked attributes). */
export const DESIGN_PRODUCT_FIELDS = [
  "id",
  "handle",
  "title",
  "description",
  "status",
  "created_at",
  "updated_at",
  "variants.id",
  "variants.created_at",
  "variants.prices.id",
  "variants.prices.amount",
  "variants.prices.currency_code",
  "variants.prices.rules_count",
  "sales_channels.id",
  "shipping_profile.id",
  "design_attributes.*",
]

type Price = { id: string; amount: unknown; currency_code: string; rules_count?: number | null }
export type ProductRow = {
  id: string
  handle?: string | null
  title: string
  description?: string | null
  status: string
  created_at: Date | string
  updated_at: Date | string
  variants?: ({ id: string; created_at?: Date | string; prices?: (Price | null)[] | null } | null)[] | null
  sales_channels?: ({ id: string } | null)[] | null
  shipping_profile?: { id: string } | null
  design_attributes?: (Partial<DesignAttributesColumns> & {
    id: string
    photos?: unknown
    true_colour_confirmed_at?: Date | string | null
    true_colour_confirmed_by?: string | null
  }) | null
}

/** A Design as the workflows need it: the view plus the ids behind it. */
export type DesignRecord = {
  view: AdminDesignView
  /** The product's handle: the Design's address on the website. */
  handle: string
  attributesId: string
  /** The kernel price of the one Variant in rupees, if it has one. */
  priceId: string | null
  /** The product's sales channels and shipping profile: without them the kernel cannot sell or ship it. */
  salesChannelIds: string[]
  shippingProfileId: string | null
}

const iso = (d: Date | string) => new Date(d).toISOString()

/**
 * A kernel product with its attributes as a Design, or null when the product
 * is not a Design. A product status outside `DesignStatus` or stored photos
 * that fail the contract are faults on the shop's side (`internal`).
 */
export function designFromProduct(product: ProductRow): DesignRecord | null {
  const attrs = product.design_attributes
  const variant = (product.variants ?? []).filter((v): v is NonNullable<typeof v> => Boolean(v))[0]
  if (!attrs || !variant) return null
  const prices = (variant.prices ?? []).filter((p): p is Price => Boolean(p) && p!.currency_code === DESIGN_CURRENCY)
  const price = prices.find((p) => !p.rules_count) ?? prices[0] ?? null
  const status = DesignStatus.safeParse(product.status)
  if (!status.success) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Design ${product.id} has an unknown status`, "internal")
  }
  const view = AdminDesignView.parse({
    id: product.id,
    variantId: variant.id,
    name: product.title,
    description: product.description ?? "",
    status: status.data,
    pricePaise: price ? kernelAmountToPaise(price.amount) : null,
    attributes: attributesFromRow(attrs),
    photos: photosFromRow(attrs.photos),
    trueColourConfirmation:
      attrs.true_colour_confirmed_at && attrs.true_colour_confirmed_by
        ? { at: iso(attrs.true_colour_confirmed_at), by: attrs.true_colour_confirmed_by }
        : null,
    createdAt: iso(product.created_at),
    updatedAt: iso(product.updated_at),
  })
  return {
    view,
    handle: product.handle ?? product.id,
    attributesId: attrs.id,
    priceId: price?.id ?? null,
    salesChannelIds: (product.sales_channels ?? []).flatMap((c) => (c?.id ? [c.id] : [])),
    shippingProfileId: product.shipping_profile?.id ?? null,
  }
}

/** Reads one Design by its product id; `design.not_found` when there is no such Design. */
export async function loadDesign(container: MedusaContainer, id: string): Promise<DesignRecord> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: DESIGN_PRODUCT_FIELDS,
    filters: { id },
  })
  const record = data[0] ? designFromProduct(data[0] as unknown as ProductRow) : null
  if (!record) throw shopError("design.not_found", `No Design ${id}`, { id })
  return record
}

/**
 * Every Design, newest first. A Design that cannot be read (a fault, such as
 * stored photos that fail the contract) is logged and left out, so one bad
 * row does not hide the others; reading it alone still fails.
 */
export async function listDesigns(container: MedusaContainer): Promise<AdminDesignView[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: rows } = await query.graph({
    entity: "design_attributes",
    fields: ["id", "created_at", "product.id"],
  })
  const ids = rows
    .slice()
    .sort((a, b) => new Date(b.created_at as Date).getTime() - new Date(a.created_at as Date).getTime())
    .map((r) => (r as { product?: { id?: string } | null }).product?.id)
    .filter((id): id is string => Boolean(id))
  if (ids.length === 0) return []
  const { data } = await query.graph({
    entity: "product",
    fields: DESIGN_PRODUCT_FIELDS,
    filters: { id: ids },
  })
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const byId = new Map<string, AdminDesignView | null>()
  for (const p of data) {
    try {
      byId.set(p.id, designFromProduct(p as unknown as ProductRow)?.view ?? null)
    } catch {
      logger.error(`designs: Design ${p.id} cannot be read and is left out of the list`)
    }
  }
  return ids.map((id) => byId.get(id)).filter((v): v is AdminDesignView => Boolean(v))
}
