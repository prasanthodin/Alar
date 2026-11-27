import { Modules, ProductStatus, toHandle } from "@medusajs/framework/utils"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow, createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import type { CreateDesignInput } from "@shop/contracts"
import { attributesToColumns, DESIGN_CURRENCY, type DesignAttributesColumns } from "../lib/designs"
import { DESIGN_ATTRIBUTES_MODULE } from "../modules/design-attributes"
import {
  checkDesignTaxCodeStep,
  createDesignAttributesStep,
  recordPriceChangeStep,
  resolveDesignPhotosStep,
  resolveDesignProductDefaultsStep,
} from "./steps/design-steps"

export type CreateDesignWorkflowInput = {
  /** The parsed request (`parseCreateDesignInput`). */
  design: CreateDesignInput
  /** The price as a checked shelf price in paise (`shelfPriceFromRupees`). */
  pricePaise: number
  /** The admin user who creates it. */
  actorId: string
}

/** The option and value of a Design's one Variant (one Variant per Design in Epic 1). */
export const DESIGN_OPTION = { title: "Design", value: "Standard" } as const

/**
 * Creates a Design, saved unpublished (kernel status `draft`): a kernel
 * product with one Variant priced in rupees (major units), its typed
 * attributes linked to it, and the first price-history row (old price null).
 * Each photo must be a file in the `catalog` bucket (`design.unknown_photo`);
 * its public address is derived by the kernel.
 * Each step undoes itself if a later one fails, so a refusal creates nothing.
 */
export const createDesignWorkflow = createWorkflow("create-design", (input: CreateDesignWorkflowInput) => {
  checkDesignTaxCodeStep({ taxCode: input.design.attributes.taxCode })
  const photos = resolveDesignPhotosStep({ photos: input.design.photos })
  const defaults = resolveDesignProductDefaultsStep()

  const productInput = transform({ input, defaults }, ({ input, defaults }) => ({
    products: [
      {
        title: input.design.name,
        handle: `${toHandle(input.design.name) || "design"}-${defaults.handleSuffix}`,
        description: input.design.description,
        status: ProductStatus.DRAFT,
        options: [{ title: DESIGN_OPTION.title, values: [DESIGN_OPTION.value] }],
        variants: [
          {
            title: DESIGN_OPTION.value,
            options: { [DESIGN_OPTION.title]: DESIGN_OPTION.value },
            // Kernel prices are in major units: whole rupees.
            prices: [{ amount: input.pricePaise / 100, currency_code: DESIGN_CURRENCY }],
          },
        ],
        sales_channels: defaults.salesChannelIds.map((id) => ({ id })),
        ...(defaults.shippingProfileId ? { shipping_profile_id: defaults.shippingProfileId } : {}),
      },
    ],
  }))
  const products = createProductsWorkflow.runAsStep({ input: productInput })

  const attributesInput = transform({ input, photos }, ({ input, photos }) => ({
    ...(attributesToColumns(input.design.attributes) as DesignAttributesColumns),
    photos: photos ?? [],
  }))
  const attributes = createDesignAttributesStep(attributesInput)

  const links = transform({ products, attributes }, ({ products, attributes }) => [
    {
      [Modules.PRODUCT]: { product_id: products[0]!.id },
      [DESIGN_ATTRIBUTES_MODULE]: { design_attributes_id: attributes.id },
    },
  ])
  createRemoteLinkStep(links)

  const priceRow = transform({ products, input }, ({ products, input }) => ({
    variantId: products[0]!.variants[0]!.id,
    oldPricePaise: null,
    newPricePaise: input.pricePaise,
    changedBy: input.actorId,
  }))
  recordPriceChangeStep(priceRow)

  return new WorkflowResponse(transform({ products }, ({ products }) => ({ id: products[0]!.id })))
})
