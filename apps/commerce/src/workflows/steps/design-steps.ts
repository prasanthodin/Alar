import { randomBytes } from "node:crypto"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { taxBandsKey, taxForShelfPrice, type DesignPhoto, type PublishRequirement } from "@shop/contracts"
import { loadDesign, type DesignAttributesColumns, type DesignRecord } from "../../lib/designs"
import { bandsInEffect, publishRequirements, type PublishCheckView } from "../../lib/publish-requirements"
import { shopError } from "../../lib/shop-errors"
import { DESIGN_ATTRIBUTES_MODULE } from "../../modules/design-attributes"
import type DesignAttributesModuleService from "../../modules/design-attributes/service"
import { PRICE_HISTORY_MODULE } from "../../modules/price-history"
import type PriceHistoryModuleService from "../../modules/price-history/service"
import { SETTINGS_MODULE } from "../../modules/settings"
import type SettingsModuleService from "../../modules/settings/service"

/** Reads a Design (`design.not_found` when there is none). Reads only, so nothing to undo. */
export const loadDesignStep = createStep("load-design", async (input: { id: string }, { container }) => {
  return new StepResponse<DesignRecord>(await loadDesign(container, input.id))
})

/**
 * Refuses a tax code that has no bands in settings (`tax.bands.<code>`) with
 * `design.unknown_tax_code`. An empty or unchanged (undefined) code passes.
 */
export const checkDesignTaxCodeStep = createStep(
  "check-design-tax-code",
  async (input: { taxCode?: string | null }, { container }) => {
    if (input.taxCode) {
      const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
      if (!(await settings.hasValue(taxBandsKey(input.taxCode)))) {
        throw shopError("design.unknown_tax_code", `Tax code ${input.taxCode} has no bands in settings`, {
          taxCode: input.taxCode,
        })
      }
    }
    return new StepResponse(true)
  }
)

/**
 * The kernel defaults a new Design's product needs: the store's default sales
 * channel and the default shipping profile (from the starter seed), when they
 * exist, and a suffix that keeps the product handle unique.
 */
export const resolveDesignProductDefaultsStep = createStep(
  "resolve-design-product-defaults",
  async (_: void, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: stores } = await query.graph({ entity: "store", fields: ["id", "default_sales_channel_id"] })
    const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id", "type", "created_at"] })
    const profile = profiles.find((p) => p.type === "default") ?? profiles[0]
    const salesChannelId = stores[0]?.default_sales_channel_id ?? null
    return new StepResponse({
      salesChannelIds: salesChannelId ? [salesChannelId] : [],
      shippingProfileId: profile?.id ?? null,
      handleSuffix: randomBytes(4).toString("hex"),
    })
  }
)

export type CreateDesignAttributesStepInput = DesignAttributesColumns & { photos: DesignPhoto[] }

/** Creates a Design's attribute row; undone by deleting it. */
export const createDesignAttributesStep = createStep(
  "create-design-attributes",
  async (input: CreateDesignAttributesStepInput, { container }) => {
    const service = container.resolve<DesignAttributesModuleService>(DESIGN_ATTRIBUTES_MODULE)
    const created = await service.createDesignAttributes({
      ...input,
      photos: input.photos as unknown as Record<string, unknown>,
    })
    return new StepResponse({ id: created.id }, created.id)
  },
  async (id, { container }) => {
    if (!id) return
    const service = container.resolve<DesignAttributesModuleService>(DESIGN_ATTRIBUTES_MODULE)
    await service.deleteDesignAttributes(id)
  }
)

/** Columns `updateDesignAttributesStep` may change. */
export type DesignAttributesUpdate = Partial<DesignAttributesColumns> & {
  photos?: DesignPhoto[]
  true_colour_confirmed_at?: string | null
  true_colour_confirmed_by?: string | null
}

const UPDATABLE = [
  "fibre",
  "weave",
  "length_cm",
  "width_cm",
  "blouse_piece_included",
  "care",
  "country_of_origin",
  "tax_code",
  "stitched",
  "photos",
  "true_colour_confirmed_at",
  "true_colour_confirmed_by",
] as const

/** Changes columns of a Design's attribute row; undone by restoring their earlier values. */
export const updateDesignAttributesStep = createStep(
  "update-design-attributes",
  async (input: { id: string; update: DesignAttributesUpdate }, { container }) => {
    const service = container.resolve<DesignAttributesModuleService>(DESIGN_ATTRIBUTES_MODULE)
    const before = await service.retrieveDesignAttributes(input.id)
    const keys = UPDATABLE.filter((k) => input.update[k] !== undefined)
    const previous: Record<string, unknown> = { id: input.id }
    const next: Record<string, unknown> = { id: input.id }
    for (const k of keys) {
      const prev = (before as Record<string, unknown>)[k]
      previous[k] = prev instanceof Date ? prev.toISOString() : (prev ?? null)
      next[k] = input.update[k]
    }
    if (keys.length > 0) await service.updateDesignAttributes(next as never)
    return new StepResponse({ id: input.id }, keys.length > 0 ? previous : undefined)
  },
  async (previous, { container }) => {
    if (!previous) return
    const service = container.resolve<DesignAttributesModuleService>(DESIGN_ATTRIBUTES_MODULE)
    await service.updateDesignAttributes(previous as never)
  }
)

export type RecordPriceChangeInput = {
  variantId: string
  oldPricePaise: number | null
  newPricePaise: number
  changedBy: string
}

/** Writes one price-history row (AD-5); undone by deleting it. */
export const recordPriceChangeStep = createStep(
  "record-price-change",
  async (input: RecordPriceChangeInput, { container }) => {
    const service = container.resolve<PriceHistoryModuleService>(PRICE_HISTORY_MODULE)
    const row = await service.createPriceHistories({
      variant_id: input.variantId,
      old_price_paise: input.oldPricePaise,
      new_price_paise: input.newPricePaise,
      changed_at: new Date(),
      changed_by: input.changedBy,
    })
    return new StepResponse({ id: row.id }, row.id)
  },
  async (id, { container }) => {
    if (!id) return
    const service = container.resolve<PriceHistoryModuleService>(PRICE_HISTORY_MODULE)
    await service.deletePriceHistories(id)
  }
)

export type CheckPublishableInput = {
  /** The Design as it would be after this change, with the confirmation it would carry. */
  view: PublishCheckView
  /** When false the check is skipped (an unpublished Design may be incomplete). */
  required: boolean
}

/**
 * Refuses with `design.not_publishable` (details `{ missing }`) when the
 * Design lacks anything publishing needs, judged with the tax bands in effect
 * now. Returns the time of the check, which a confirmation is stamped with.
 */
export const checkDesignPublishableStep = createStep(
  "check-design-publishable",
  async (input: CheckPublishableInput, { container }) => {
    const now = new Date()
    if (input.required) {
      const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
      const code = input.view.attributes.taxCode
      const bands = code ? await settings.listValues(taxBandsKey(code)) : []
      const missing: PublishRequirement[] = publishRequirements(input.view, bands, now)
      if (missing.length > 0) {
        throw shopError("design.not_publishable", `The Design is missing: ${missing.join(", ")}`, { missing })
      }
    }
    return new StepResponse({ now: now.toISOString() })
  }
)

/**
 * Refuses a new price for a published Design that no tax band in effect now
 * fits (`tax.no_band`), so a published Design is never on sale at a price
 * without a band (AD-5). An unpublished Design may take any shelf price.
 */
export const checkDesignPriceSellableStep = createStep(
  "check-design-price-sellable",
  async (input: { design: DesignRecord; pricePaise: number }, { container }) => {
    const { view } = input.design
    if (view.status === "published") {
      const code = view.attributes.taxCode
      const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
      const bands = bandsInEffect(code ? await settings.listValues(taxBandsKey(code)) : [], new Date())
      if (!bands || !taxForShelfPrice(input.pricePaise, bands).ok) {
        throw shopError("tax.no_band", "No tax band in effect fits this price", {
          pricePaise: input.pricePaise,
          taxCode: code,
        })
      }
    }
    return new StepResponse(true)
  }
)
