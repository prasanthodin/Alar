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
import {
  ALL_CATEGORY_ID,
  mockCategories,
  mockDesigns,
  type MockDesign,
} from "./mock/catalogue-data"

/** Where catalogue and Bag data come from. Only the mock exists until Epic 2 brings the kernel source. */
export type CatalogueSource = "mock"

/** Default base URL of the mock pictures; a client serves them itself (the app from its `public/mock`). */
export const DEFAULT_MOCK_ASSET_BASE_URL = "/mock"

export type CatalogueConfig = {
  catalogueSource?: CatalogueSource
  mockAssetBaseUrl?: string
}

export type ListDesignsInput = { categoryId?: string }

export type Catalogue = {
  listCategories(): Promise<Result<CategoryView[]>>
  listDesigns(input?: ListDesignsInput): Promise<Result<DesignCard[]>>
  getDesign(id: string): Promise<Result<DesignView>>
  getBag(): Promise<Result<BagView>>
  addToBag(variantId: string): Promise<Result<BagView>>
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
    name: d.name,
    subtitle: d.subtitle,
    price: d.pricePaise,
    mrp: d.mrpPaise,
    image: image(d.file, d.alt),
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

  const bagView = (): Result<BagView> => {
    const lines = []
    for (const [variantId, quantity] of bag) {
      const found = findVariant(variantId)
      if (!found) continue
      const { design, variant } = found
      lines.push({
        id: `line-${variantId}`,
        designId: design.id,
        variantId,
        name: design.name,
        colourName: variant.colourName,
        image: image(variant.file, variant.alt),
        price: design.pricePaise,
        mrp: design.mrpPaise,
        quantity,
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

    async addToBag(variantId) {
      const found = findVariant(variantId)
      if (!found) return fail("design.not_found", `No variant with id ${variantId}`, { variantId })
      const current = bag.get(variantId) ?? 0
      if (current + 1 > found.variant.stock) {
        return fail("bag.stock_exceeded", "The Bag already holds every piece of this variant", {
          variantId,
          stock: found.variant.stock,
        })
      }
      bag.set(variantId, current + 1)
      return bagView()
    },
  }
}

function createUnconfiguredCatalogue(): Catalogue {
  const unavailable = async <T>(): Promise<Result<T>> =>
    fail("internal", "No catalogue source is configured; set catalogueSource (the kernel source arrives with Epic 2)")
  return {
    listCategories: unavailable,
    listDesigns: unavailable,
    getDesign: unavailable,
    getBag: unavailable,
    addToBag: unavailable,
  }
}

/** Builds the catalogue and Bag functions for the configured source. */
export function createCatalogue(config: CatalogueConfig): Catalogue {
  if (config.catalogueSource === "mock") {
    return createMockCatalogue(config.mockAssetBaseUrl ?? DEFAULT_MOCK_ASSET_BASE_URL)
  }
  return createUnconfiguredCatalogue()
}
