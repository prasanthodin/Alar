import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep, updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import { DESIGN_CURRENCY } from "../lib/designs"
import { checkDesignPriceSellableStep, designLockKey, loadDesignStep, recordPriceChangeStep } from "./steps/design-steps"

export type SetDesignPriceWorkflowInput = {
  /** The Design's kernel product id. */
  id: string
  /** The new price as a checked shelf price in paise (`shelfPriceFromRupees`). */
  pricePaise: number
  /** The admin user who changes it. */
  actorId: string
}

/**
 * Sets the price of a Design's one Variant: the kernel price in rupees (major
 * units) and one price-history row with the old and new price in paise. The
 * same price again changes nothing and writes no row. A published Design
 * only takes a price a tax band in effect fits (`tax.no_band`). If writing
 * the history row fails, the kernel price is restored.
 */
export const setDesignPriceWorkflow = createWorkflow("set-design-price", (input: SetDesignPriceWorkflowInput) => {
  // The read of the old price, the compare and both writes happen under the
  // Design's lock, so concurrent changes never record a stale old price.
  const lock = transform({ input }, ({ input }) => ({ key: designLockKey(input.id), timeout: 10, ttl: 60 }))
  acquireLockStep(lock)
  const design = loadDesignStep({ id: input.id })

  const changed = transform({ design, input }, ({ design, input }) => design.view.pricePaise !== input.pricePaise)
  when("design-price-changed", { changed }, ({ changed }) => changed).then(() => {
    checkDesignPriceSellableStep({ design, pricePaise: input.pricePaise })
    const variantUpdate = transform({ design, input }, ({ design, input }) => ({
      selector: { id: design.view.variantId },
      update: {
        prices: [
          {
            ...(design.priceId ? { id: design.priceId } : {}),
            amount: input.pricePaise / 100,
            currency_code: DESIGN_CURRENCY,
          },
        ],
      },
    }))
    updateProductVariantsWorkflow.runAsStep({ input: variantUpdate })

    const priceRow = transform({ design, input }, ({ design, input }) => ({
      variantId: design.view.variantId,
      oldPricePaise: design.view.pricePaise,
      newPricePaise: input.pricePaise,
      changedBy: input.actorId,
    }))
    recordPriceChangeStep(priceRow)
  })
  releaseLockStep(lock)

  return new WorkflowResponse(transform({ design }, ({ design }) => ({ id: design.view.id })))
})
