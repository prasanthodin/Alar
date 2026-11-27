import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import type { DesignPhoto, UpdateDesignInput } from "@shop/contracts"
import { attributesToColumns } from "../lib/designs"
import type { PublishCheckView } from "../lib/publish-requirements"
import {
  checkDesignPublishableStep,
  checkDesignTaxCodeStep,
  designLockKey,
  loadDesignStep,
  resolveDesignPhotosStep,
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
function photosChanged(before: DesignPhoto[], after: DesignPhoto[]): boolean {
  const key = (photos: DesignPhoto[]) => JSON.stringify(photos.map((p) => [p.fileId, p.role, p.position]))
  return key(before) !== key(after)
}

/**
 * Changes a Design's name, description, attributes or photos. Never its
 * status (only `publish-design` publishes) or price (`set-design-price`).
 * New photos clear the true-colour confirmation unless the same request
 * confirms again (`trueColourConfirmed`). A published Design must stay
 * publishable: a change that would leave anything missing is refused with
 * `design.not_publishable`. Photos must be files in the `catalog` bucket
 * (`design.unknown_photo`). Edits, price changes and publishing of one Design
 * run one at a time (a per-Design lock). Each step undoes itself if a later
 * one fails.
 */
export const updateDesignWorkflow = createWorkflow("update-design", (input: UpdateDesignWorkflowInput) => {
  const lock = transform({ input }, ({ input }) => ({ key: designLockKey(input.id), timeout: 10, ttl: 60 }))
  acquireLockStep(lock)
  const design = loadDesignStep({ id: input.id })
  const taxCode = transform({ input }, ({ input }) => ({ taxCode: input.update.attributes?.taxCode }))
  checkDesignTaxCodeStep(taxCode)
  const newPhotos = transform({ input }, ({ input }) => ({ photos: input.update.photos ?? null }))
  const photos = resolveDesignPhotosStep(newPhotos)

  const after = transform({ design, input, photos }, ({ design, input, photos }) => {
    const { view } = design
    const changed = photos !== null && photosChanged(view.photos, photos)
    const reconfirmed = changed && input.update.trueColourConfirmed === true
    const check: PublishCheckView = {
      attributes: { ...view.attributes, ...(input.update.attributes ?? {}) },
      photos: photos ?? view.photos,
      pricePaise: view.pricePaise,
      trueColourConfirmed: changed ? reconfirmed : view.trueColourConfirmation !== null,
      hasSalesChannel: design.salesChannelIds.length > 0,
      hasShippingProfile: design.shippingProfileId !== null,
    }
    return { changed, reconfirmed, check, required: view.status === "published" }
  })
  const checked = checkDesignPublishableStep({ view: after.check, required: after.required })

  const columns = transform({ input, after, checked, photos }, ({ input, after, checked, photos }) => {
    const update: DesignAttributesUpdate = attributesToColumns(input.update.attributes ?? {})
    if (photos !== null) update.photos = photos
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
  releaseLockStep(lock)

  return new WorkflowResponse(transform({ design }, ({ design }) => ({ id: design.view.id })))
})
