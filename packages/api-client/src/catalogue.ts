import {
  BagView,
  CategoryView,
  DesignCard,
  DesignView,
  fail,
  ok,
  type ImageRef,
  type Result,
} from "@shop/contracts"
import { z } from "zod"
import type { TokenStore, Transport } from "./client"
import { checkQuantity, createKernelCatalogue } from "./kernel-catalogue"
import {
  ALL_CATEGORY_ID,
  mockCategories,
  mockDesigns,
  type MockDesign,
} from "./mock/catalogue-data"

/**
 * Where catalogue and Bag data come from: the kernel (the default, used by the
 * website), or the in-memory mock the early app shell uses.
 */
export type CatalogueSource = "mock" | "kernel"

/** Default base URL of the mock pictures; a client serves them itself (the app from its `public/mock`). */
export const DEFAULT_MOCK_ASSET_BASE_URL = "/mock"

export type CatalogueConfig = {
  catalogueSource?: CatalogueSource
  mockAssetBaseUrl?: string
  /** Where the kernel source keeps the Bag's cart id. Defaults to memory (one Bag per client). */
  bagStore?: TokenStore
}

/** Filters of the Design list. Only the mock knows categories; the kernel list has no filters in Epic 1. */
export type ListDesignsInput = { categoryId?: string }

/** Options of `getDesign`: a signed preview token from the Admin opens an unpublished Design. */
export type GetDesignOptions = { preview?: string }

export type Catalogue = {
  listCategories(): Promise<Result<CategoryView[]>>
  listDesigns(input?: ListDesignsInput): Promise<Result<DesignCard[]>>
  /** One Design by its handle (the mock also takes its id); `design.not_found` when there is none to show. */
  getDesign(handle: string, options?: GetDesignOptions): Promise<Result<DesignView>>
  getBag(): Promise<Result<BagView>>
  /** Adds Pieces of a Variant (default 1); `bag.stock_exceeded` when the Bag would hold more than are available. */
  addToBag(variantId: string, quantity?: number): Promise<Result<BagView>>
  /** Sets a line's quantity; `bag.stock_exceeded` (the line keeps its earlier quantity) or `bag.not_found`. */
  setBagQuantity(lineId: string, quantity: number): Promise<Result<BagView>>
  /** Removes a line; `bag.not_found` when there is no Bag. */
  removeFromBag(lineId: string): Promise<Result<BagView>>
}

/** Validates what the source produced against its contract, so a client never sees a bad shape. */
function checked<S extends z.ZodType>(schema: S, value: unknown, what: string): Result<z.infer<S>> {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    return fail("response.invalid", `${what} did not match its contract: ${parsed.error.message}`)
  }
  return ok(parsed.data)
}

function createMockCatalogue(assetBaseUrl: string): Catalogue {
  const base = assetBaseUrl.replace(/\/+$/, "")
  const image = (file: string, alt: string): ImageRef => ({ url: `${base}/${file}`, alt, isSample: true })

  const toCard = (d: MockDesign) => ({
    id: d.id,
    handle: d.id,
    name: d.name,
    subtitle: d.subtitle,
    price: d.pricePaise,
    mrp: d.mrpPaise,
    image: image(d.file, d.alt),
    availability: d.variants.some((v) => v.stock > 0) ? "available" : "sold_out",
    ...(d.badge ? { badge: d.badge } : {}),
    ...(d.rating ? { rating: d.rating } : {}),
  })

  const toView = (d: MockDesign) => ({
    ...toCard(d),
    images: [image(d.file, d.alt), ...(d.gallery ?? []).map((g) => image(g.file, g.alt))],
    variants: d.variants.map((v) => ({
      id: v.id,
      colourName: v.colourName,
      swatch: image(v.file, v.alt),
      stock: v.stock,
    })),
    attributes: d.attributes,
    ...(d.fullView ? { fullView: image(d.fullView.file, d.fullView.alt) } : {}),
  })

  const findVariant = (variantId: string) => {
    for (const design of mockDesigns) {
      const variant = design.variants.find((v) => v.id === variantId)
      if (variant) return { design, variant }
    }
    return null
  }

  // The Bag lives in memory, one per client: variant id -> quantity, in the order added.
  const bag = new Map<string, number>()
  const LINE_PREFIX = "line-"
  const lineIdOf = (variantId: string) => `${LINE_PREFIX}${variantId}`
  const variantOfLine = (lineId: string) => (lineId.startsWith(LINE_PREFIX) ? lineId.slice(LINE_PREFIX.length) : "")

  const bagView = (): Result<BagView> => {
    const lines = []
    for (const [variantId, quantity] of bag) {
      const found = findVariant(variantId)
      if (!found) continue
      const { design, variant } = found
      lines.push({
        id: lineIdOf(variantId),
        designId: design.id,
        handle: design.id,
        variantId,
        name: design.name,
        colourName: variant.colourName,
        image: image(variant.file, variant.alt),
        price: design.pricePaise,
        mrp: design.mrpPaise,
        quantity,
        lineTotal: design.pricePaise * quantity,
        stock: variant.stock,
      })
    }
    const totalMrp = lines.reduce((sum, l) => sum + l.mrp * l.quantity, 0)
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
    // Delivery is free on every Order at launch (seeded setting: Rs 0).
    const delivery = 0
    return checked(
      BagView,
      {
        lines,
        totalMrp,
        discount: totalMrp - subtotal,
        delivery,
        total: subtotal + delivery,
        count: lines.reduce((sum, l) => sum + l.quantity, 0),
      },
      "Bag"
    )
  }

  return {
    async listCategories() {
      return checked(
        z.array(CategoryView),
        mockCategories.map((c) => ({ id: c.id, name: c.name, thumbnail: image(c.file, c.name) })),
        "Categories"
      )
    },

    async listDesigns(input = {}) {
      const { categoryId } = input
      const designs =
        !categoryId || categoryId === ALL_CATEGORY_ID
          ? mockDesigns
          : mockDesigns.filter((d) => d.categoryIds.includes(categoryId))
      return checked(z.array(DesignCard), designs.map(toCard), "Designs")
    },

    async getDesign(id) {
      const design = mockDesigns.find((d) => d.id === id)
      if (!design) return fail("design.not_found", `No design with id ${id}`, { id })
      return checked(DesignView, toView(design), "Design")
    },

    async getBag() {
      return bagView()
    },

    async addToBag(variantId, quantity = 1) {
      const qty = checkQuantity(quantity)
      if (!qty.ok) return qty
      const found = findVariant(variantId)
      if (!found) return fail("design.not_found", `No variant with id ${variantId}`, { variantId })
      const current = bag.get(variantId) ?? 0
      if (current + qty.data > found.variant.stock) {
        return fail("bag.stock_exceeded", "The Bag would hold more pieces of this variant than are available", {
          variantId,
          stock: found.variant.stock,
        })
      }
      bag.set(variantId, current + qty.data)
      return bagView()
    },

    async setBagQuantity(lineId, quantity) {
      const qty = checkQuantity(quantity)
      if (!qty.ok) return qty
      const variantId = variantOfLine(lineId)
      const found = bag.has(variantId) ? findVariant(variantId) : null
      if (!found) return fail("bag.not_found", `No Bag line ${lineId}`, { lineId })
      if (qty.data > found.variant.stock) {
        return fail("bag.stock_exceeded", "Only the available pieces can be in the Bag", {
          variantId,
          stock: found.variant.stock,
        })
      }
      bag.set(variantId, qty.data)
      return bagView()
    },

    async removeFromBag(lineId) {
      const variantId = variantOfLine(lineId)
      if (!bag.has(variantId)) return fail("bag.not_found", `No Bag line ${lineId}`, { lineId })
      bag.delete(variantId)
      return bagView()
    },
  }
}

/** Builds the catalogue and Bag functions for the configured source (the kernel unless `mock`). */
export function createCatalogue(config: CatalogueConfig, transport: Transport): Catalogue {
  if (config.catalogueSource === "mock") {
    return createMockCatalogue(config.mockAssetBaseUrl ?? DEFAULT_MOCK_ASSET_BASE_URL)
  }
  return createKernelCatalogue(transport, config.bagStore)
}
