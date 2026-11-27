import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  availablePieces,
  DesignCard,
  DesignView,
  type AdminDesignView,
  type DesignPhoto,
  type ImageRef,
} from "@shop/contracts"
import { DESIGN_PRODUCT_FIELDS, designFromProduct, type DesignRecord, type ProductRow } from "./designs"
import { previewTokenExpiry, verifyPreviewToken } from "./preview-token"
import { shopError } from "./shop-errors"
import { findShopStockLocationId, quantity, warnIfOverReserved } from "./stock"

/**
 * The Shopper's catalogue (Story 1.8): published Designs as `DesignCard` and
 * `DesignView`, with availability computed here from stocked − reserved
 * Pieces at the India stock location. Never carries a Weaver.
 */

/** The name of a Design's one Variant when the kernel has none to show. */
const DEFAULT_VARIANT_NAME = "Standard"

/** Extra product fields the Shopper's views need besides the Design's own. */
const STORE_FIELDS = [
  ...DESIGN_PRODUCT_FIELDS,
  "variants.title",
  "variants.manage_inventory",
  "variants.inventory_items.inventory_item_id",
]

type StoreVariantRow = NonNullable<NonNullable<ProductRow["variants"]>[number]> & {
  title?: string | null
  manage_inventory?: boolean | null
  inventory_items?: ({ inventory_item_id?: string | null } | null)[] | null
}

type StoreProductRow = Omit<ProductRow, "variants"> & { variants?: (StoreVariantRow | null)[] | null }

/** A Design that a Shopper may be shown, with what its views need. */
export type StoreDesign = {
  record: DesignRecord
  view: AdminDesignView & { pricePaise: number }
  variantName: string
  /** Pieces available now: stocked − reserved at the India location, never below 0. */
  available: number
}

/**
 * Pieces available per Variant at the India stock location. A Variant whose
 * stock the kernel does not manage, or without a level there, has none
 * (a Design's Variant always has one: `create-design` and the stock seed).
 */
export async function availableByVariant(
  container: MedusaContainer,
  variants: { id: string; manageInventory: boolean; inventoryItemIds: string[] }[]
): Promise<Map<string, number>> {
  const out = new Map<string, number>(variants.map((v) => [v.id, 0]))
  const locationId = await findShopStockLocationId(container)
  const counted = variants.filter((v) => v.manageInventory && v.inventoryItemIds.length === 1)
  if (!locationId || counted.length === 0) return out
  const levels = await container.resolve(Modules.INVENTORY).listInventoryLevels({
    inventory_item_id: counted.map((v) => v.inventoryItemIds[0]!),
    location_id: locationId,
  })
  const byItem = new Map(levels.map((l) => [l.inventory_item_id, l]))
  for (const v of counted) {
    const itemId = v.inventoryItemIds[0]!
    const level = byItem.get(itemId)
    if (!level) continue
    const stocked = quantity(level.stocked_quantity)
    const reserved = quantity(level.reserved_quantity)
    warnIfOverReserved(container, itemId, { stocked, reserved })
    out.set(v.id, availablePieces(stocked, reserved))
  }
  return out
}

/** The products' rows as Designs a Shopper can be shown: a Design, with a price and at least one photo. */
async function toStoreDesigns(container: MedusaContainer, rows: StoreProductRow[]): Promise<StoreDesign[]> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const candidates: { record: DesignRecord; row: StoreProductRow }[] = []
  for (const row of rows) {
    try {
      const record = designFromProduct(row)
      if (record) candidates.push({ record, row })
    } catch {
      logger.error(`catalogue: Design ${row.id} cannot be read and is left out`)
    }
  }
  const variants = candidates.map(({ record, row }) => {
    const variant = (row.variants ?? []).find((v) => v?.id === record.view.variantId)
    return {
      id: record.view.variantId,
      manageInventory: variant?.manage_inventory === true,
      inventoryItemIds: (variant?.inventory_items ?? []).flatMap((l) => (l?.inventory_item_id ? [l.inventory_item_id] : [])),
      title: variant?.title ?? null,
    }
  })
  const available = await availableByVariant(container, variants)
  const out: StoreDesign[] = []
  candidates.forEach(({ record }, i) => {
    const { view } = record
    if (view.pricePaise === null || view.photos.length === 0) {
      logger.warn(`catalogue: Design ${view.id} has no price or no photo and is not shown`)
      return
    }
    out.push({
      record,
      view: { ...view, pricePaise: view.pricePaise },
      variantName: variants[i]!.title?.trim() || DEFAULT_VARIANT_NAME,
      available: available.get(view.variantId) ?? 0,
    })
  })
  return out
}

/** The photos in order, the main one first: the first that is not the fabric close-up, else the first. */
function orderedPhotos(photos: DesignPhoto[]): DesignPhoto[] {
  const sorted = photos.slice().sort((a, b) => a.position - b.position)
  const main = sorted.find((p) => p.role !== "close_up") ?? sorted[0]
  return main ? [main, ...sorted.filter((p) => p !== main)] : []
}

function imageOf(photo: DesignPhoto, name: string): ImageRef {
  return { url: photo.url, alt: name, isSample: false }
}

/** The card line under the name: fibre and weave, as recorded. */
function subtitleOf(view: AdminDesignView): string {
  return [view.attributes.fibre, view.attributes.weave].filter(Boolean).join(", ")
}

export function toDesignCard(design: StoreDesign): DesignCard {
  const { view } = design
  const [main] = orderedPhotos(view.photos)
  return DesignCard.parse({
    id: view.id,
    handle: design.record.handle,
    name: view.name,
    subtitle: subtitleOf(view),
    price: view.pricePaise,
    // No MRP in Epic 1: the price is the MRP, so no discount is shown.
    mrp: view.pricePaise,
    image: imageOf(main!, view.name),
    availability: design.available > 0 ? "available" : "sold_out",
  })
}

export function toDesignView(design: StoreDesign, preview?: { expiresAt: Date }): DesignView {
  const { view } = design
  const images = orderedPhotos(view.photos).map((p) => imageOf(p, view.name))
  const a = view.attributes
  return DesignView.parse({
    ...toDesignCard(design),
    description: view.description,
    images,
    variants: [{ id: view.variantId, colourName: design.variantName, swatch: images[0], stock: design.available }],
    attributes: [],
    details: {
      fibre: a.fibre,
      weave: a.weave,
      lengthM: a.lengthM,
      widthM: a.widthM,
      blousePieceIncluded: a.blousePieceIncluded,
      care: a.care,
      countryOfOrigin: a.countryOfOrigin,
    },
    ...(preview ? { preview: { expiresAt: preview.expiresAt.toISOString() } } : {}),
  })
}

/** True when the product is in one of the publishable key's sales channels. */
function inChannels(record: DesignRecord, salesChannelIds: readonly string[]): boolean {
  return record.salesChannelIds.some((id) => salesChannelIds.includes(id))
}

/**
 * The published Designs in the key's sales channels, newest first. A Design
 * that is not published, has no price or no photo, or cannot be read is left out.
 */
export async function listStoreDesigns(
  container: MedusaContainer,
  salesChannelIds: readonly string[]
): Promise<StoreDesign[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: links } = await query.graph({
    entity: "design_attributes",
    fields: ["id", "created_at", "product.id"],
  })
  const ids = links
    .slice()
    .sort((a, b) => new Date(b.created_at as Date).getTime() - new Date(a.created_at as Date).getTime())
    .map((r) => (r as { product?: { id?: string } | null }).product?.id)
    .filter((id): id is string => Boolean(id))
  if (ids.length === 0 || salesChannelIds.length === 0) return []
  const { data } = await query.graph({
    entity: "product",
    fields: STORE_FIELDS,
    filters: { id: ids, status: "published" },
  })
  const designs = await toStoreDesigns(container, data as unknown as StoreProductRow[])
  const order = new Map(ids.map((id, i) => [id, i]))
  return designs
    .filter((d) => inChannels(d.record, salesChannelIds))
    .sort((a, b) => (order.get(a.view.id) ?? 0) - (order.get(b.view.id) ?? 0))
}

/**
 * One Design by its handle, as a Shopper sees it. A published Design in the
 * key's sales channels is shown to anyone (a preview token is then ignored);
 * any other Design only with a valid preview token for it (then `preview`
 * says until when). Everything else is
 * `design.not_found`, so an unpublished Design cannot be told from a missing one.
 */
export async function loadStoreDesign(
  container: MedusaContainer,
  handle: string,
  options: { salesChannelIds: readonly string[]; previewToken?: unknown; previewSecret: string; now?: Date }
): Promise<{ design: StoreDesign; preview?: { expiresAt: Date } }> {
  const notFound = () => shopError("design.not_found", `No Design ${handle}`, { handle })
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "product", fields: STORE_FIELDS, filters: { handle } })
  const [design] = await toStoreDesigns(container, data as unknown as StoreProductRow[])
  if (!design) throw notFound()

  if (design.view.status === "published" && inChannels(design.record, options.salesChannelIds)) return { design }
  // Not on sale: only a valid, unexpired preview token for this Design shows it.
  const token = options.previewToken
  if (!verifyPreviewToken(token, design.view.id, options.previewSecret, options.now ?? new Date())) throw notFound()
  return { design, preview: { expiresAt: previewTokenExpiry(token as string)! } }
}

/** Reads the Designs of these products (for Bag lines), by product id. */
export async function storeDesignsByProduct(
  container: MedusaContainer,
  productIds: string[]
): Promise<Map<string, StoreDesign>> {
  if (productIds.length === 0) return new Map()
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "product", fields: STORE_FIELDS, filters: { id: productIds } })
  const designs = await toStoreDesigns(container, data as unknown as StoreProductRow[])
  return new Map(designs.map((d) => [d.view.id, d]))
}

export { orderedPhotos }
