import { ProductStatus } from "@medusajs/framework/utils"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import type { PublishCheckView } from "../lib/publish-requirements"
import { checkDesignPublishableStep, loadDesignStep, updateDesignAttributesStep } from "./steps/design-steps"

export type PublishDesignWorkflowInput = {
  /** The Design's kernel product id. */
  id: string
  /** The Owner confirms that the photos show the saree's true colour. */
  trueColourConfirmed: boolean
  /** The admin user who publishes it. */
  actorId: string
}

/**
 * The only way a Design is published (kernel status `published`). Refuses
 * with `design.not_publishable`, naming every missing item, unless the Design
 * has a fibre, a length and a width, a tax code with a band in effect now
 * that fits its price, a valid shelf price, a fabric close-up photo, at least
 * one other photo, and the Owner's true-colour confirmation in this request.
 * A refusal changes nothing. The confirmation is stored with the time and
 * the admin user id; if publishing then fails it is restored.
 */
export const publishDesignWorkflow = createWorkflow("publish-design", (input: PublishDesignWorkflowInput) => {
  const design = loadDesignStep({ id: input.id })

  const view = transform({ design, input }, ({ design, input }): PublishCheckView => ({
    attributes: design.view.attributes,
    photos: design.view.photos,
    pricePaise: design.view.pricePaise,
    trueColourConfirmed: input.trueColourConfirmed,
  }))
  const checked = checkDesignPublishableStep({ view, required: true })

  const confirmation = transform({ input, checked }, ({ input, checked }) => ({
    true_colour_confirmed_at: checked.now,
    true_colour_confirmed_by: input.actorId,
  }))
  updateDesignAttributesStep({ id: design.attributesId, update: confirmation })

  const publish = transform({ design }, ({ design }) => ({
    selector: { id: design.view.id },
    update: { status: ProductStatus.PUBLISHED },
  }))
  updateProductsWorkflow.runAsStep({ input: publish })

  return new WorkflowResponse(transform({ design }, ({ design }) => ({ id: design.view.id })))
})
