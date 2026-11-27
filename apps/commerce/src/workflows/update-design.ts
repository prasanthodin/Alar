import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import type { UpdateDesignInput } from "@shop/contracts"
import { attributesToColumns } from "../lib/designs"
import type { PublishCheckView } from "../lib/publish-requirements"
import {
  checkDesignPublishableStep,
  checkDesignTaxCodeStep,
  loadDesignStep,
  updateDesignAttributesStep,
  type DesignAttributesUpdate,
} from "./steps/design-steps"

export type UpdateDesignWorkflowInput = {
  /** The Design's kernel product id. */
  id: string
  /** The parsed request (`UpdateDesignInput`): only the fields given change. */
  update: UpdateDesignInput
  /** The admin user who changes it. */
  actorId: string
}

/** True when the new photo list differs from the old one (files, roles or order). */
function photosChanged(before: unknown[], after: unknown[] | undefined): boolean {
  return after !== undefined && JSON.stringify(before) !== JSON.stringify(after)
}

/**
 * Changes a Design's name, description, attributes or photos. Never its
 * status (only `publish-design` publishes) or price (`set-design-price`).
 * New photos clear the true-colour confirmation unless the same request
 * confirms again (`trueColourConfirmed`). A published Design must stay
 * publishable: a change that would leave anything missing is refused with
 * `design.not_publishable`. Each step undoes itself if a later one fails.
 */
export const updateDesignWorkflow = createWorkflow("update-design", (input: UpdateDesignWorkflowInput) => {
  const design = loadDesignStep({ id: input.id })
  const taxCode = transform({ input }, ({ input }) => ({ taxCode: input.update.attributes?.taxCode }))
  checkDesignTaxCodeStep(taxCode)

  const after = transform({ design, input }, ({ design, input }) => {
    const { view } = design
    const changed = photosChanged(view.photos, input.update.photos)
    const reconfirmed = changed && input.update.trueColourConfirmed === true
    const check: PublishCheckView = {
      attributes: { ...view.attributes, ...(input.update.attributes ?? {}) },
      photos: input.update.photos ?? view.photos,
      pricePaise: view.pricePaise,
      trueColourConfirmed: changed ? reconfirmed : view.trueColourConfirmation !== null,
    }
    return { changed, reconfirmed, check, required: view.status === "published" }
  })
  const checked = checkDesignPublishableStep({ view: after.check, required: after.required })

  const columns = transform({ input, after, checked }, ({ input, after, checked }) => {
    const update: DesignAttributesUpdate = attributesToColumns(input.update.attributes ?? {})
    if (input.update.photos !== undefined) update.photos = input.update.photos
    if (after.changed) {
      update.true_colour_confirmed_at = after.reconfirmed ? checked.now : null
      update.true_colour_confirmed_by = after.reconfirmed ? input.actorId : null
    }
    return update
  })
  updateDesignAttributesStep({ id: design.attributesId, update: columns })

  const productUpdate = transform({ design, input }, ({ design, input }) => ({
    selector: { id: design.view.id },
    update: {
      title: input.update.name ?? design.view.name,
      description: input.update.description ?? design.view.description,
    },
  }))
  updateProductsWorkflow.runAsStep({ input: productUpdate })

  return new WorkflowResponse(transform({ design }, ({ design }) => ({ id: design.view.id })))
})
