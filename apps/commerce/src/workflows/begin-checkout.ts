import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  addShippingMethodToCartWorkflow,
  transferCartCustomerWorkflow,
  updateCartWorkflow,
  updateTaxLinesWorkflow,
} from "@medusajs/medusa/core-flows"
import type { CheckoutAddress } from "@shop/contracts"
import { acquireStockLocksStep, releaseStockLocksStep, STOCK_LOCK_TIMEOUT_MS } from "../lib/stock-lock"
import {
  checkCheckoutStep,
  createCheckoutStep,
  createHoldStep,
  loadCheckoutCartStep,
  reserveHoldStep,
  verifyCheckoutCartStep,
  writeRecoveryFileStep,
} from "./steps/checkout-steps"
import { recordStockMovementsStep, type StockMovementRowInput } from "./steps/stock-steps"

export type BeginCheckoutWorkflowInput = {
  /** The Bag (kernel cart) to check out. */
  cartId: string
  /** The signed-in Shopper (kernel customer id). */
  customerId: string
  /** The delivery address, already checked against `CheckoutAddress`. */
  address: CheckoutAddress
  /** The publishable key's sales channels: a cart and its Designs must be in one of them. */
  salesChannelIds: string[]
  /** How long to wait for the stock lock; default `STOCK_LOCK_TIMEOUT_MS`. */
  lockTimeoutMs?: number
}

/** What `begin-checkout` answers: the Checkout, and whether this run created it. */
export type BeginCheckoutResult = { checkoutId: string; created: boolean }

/** The stock-movement rows' actor: the workflow, not a person. */
export const BEGIN_CHECKOUT_ACTOR = "system:begin-checkout"

/**
 * A signed-in Shopper begins checkout (Story 1.9, FR-19; AD-6, AD-30). No
 * payment starts here (Story 1.10).
 *
 * Under the stock lock on every inventory item in the Bag (sorted keys), it
 * reads the Bag again (a line added or changed since the locks were chosen
 * is `cart.changed`) and re-checks it: a changed price, a Design no longer on sale or a line
 * short of stock is `cart.changed` with each changed line; Pieces held by
 * other Shoppers are `stock.unavailable`; the same Shopper's live Hold gives
 * back its Checkout and creates nothing; anyone else's is `cart.locked`.
 * Then it puts the Shopper, the address and the standard shipping method on
 * the cart and refreshes its tax lines (the shop's tax provider re-checks the
 * bands), reads the cart back and compares it with the snapshot (a changed
 * price is `cart.changed`, a different tax or total `tax.kernel_mismatch`), snapshots the lines, unit prices, tax per line (money functions),
 * shipping, total, address and Shopper id into a Checkout, creates its Hold
 * (length from `checkout.hold_minutes`), reserves each line's Pieces in the
 * kernel tagged with the Hold id, writes the snapshot as the recovery file
 * `checkouts/<checkoutId>.json` in the private `documents` bucket and,
 * last, one `checkout_hold` stock-movement row per reservation.
 *
 * Any failure undoes what came before it: the recovery file version, the
 * reservations, the Hold and the Checkout (a reservation that fails part-way
 * removes the ones already made first), then the locks are released.
 */
export const beginCheckoutWorkflow = createWorkflow("begin-checkout", (input: BeginCheckoutWorkflowInput) => {
  const cart = loadCheckoutCartStep(
    transform({ input }, ({ input }) => ({
      cartId: input.cartId,
      salesChannelIds: input.salesChannelIds,
      customerId: input.customerId,
    }))
  )

  const locks = acquireStockLocksStep(
    transform({ input, cart }, ({ input, cart }) => ({
      inventoryItemIds: cart.inventoryItemIds,
      timeoutMs: input.lockTimeoutMs ?? STOCK_LOCK_TIMEOUT_MS,
    }))
  )

  const checked = checkCheckoutStep(
    transform({ input, cart }, ({ input, cart }) => ({
      cart,
      customerId: input.customerId,
      address: input.address,
      salesChannelIds: input.salesChannelIds,
    }))
  )

  const created = when("new-checkout", { checked }, ({ checked }) => checked.existingCheckoutId === null).then(() => {
    // The cart as Story 1.10 completes it: the Shopper, the address, the standard
    // shipping method, and tax lines from the shop's provider at this moment.
    transferCartCustomerWorkflow.runAsStep({
      input: transform({ input }, ({ input }) => ({ id: input.cartId, customer_id: input.customerId })),
    })
    updateCartWorkflow.runAsStep({
      input: transform({ input }, ({ input }) => ({
        id: input.cartId,
        shipping_address: {
          first_name: input.address.name,
          phone: input.address.mobile,
          address_1: input.address.addressLine,
          city: input.address.city,
          postal_code: input.address.pincode,
          province: input.address.state,
          country_code: "in",
        },
      })),
    })
    addShippingMethodToCartWorkflow.runAsStep({
      input: transform({ input, checked }, ({ input, checked }) => ({
        cart_id: input.cartId,
        options: [{ id: checked.shippingOptionId! }],
      })),
    })
    updateTaxLinesWorkflow.runAsStep({
      input: transform({ input }, ({ input }) => ({ cart_id: input.cartId, force_tax_calculation: true })),
    })
    // The refreshed cart must agree with the snapshot: prices (cart.changed), tax and totals (tax.kernel_mismatch).
    verifyCheckoutCartStep(
      transform({ input, checked }, ({ input, checked }) => ({ cartId: input.cartId, snapshot: checked.snapshot! }))
    )

    const checkout = createCheckoutStep(transform({ checked }, ({ checked }) => ({ snapshot: checked.snapshot! })))
    const hold = createHoldStep(
      transform({ input, checked, checkout }, ({ input, checked, checkout }) => ({
        checkoutId: checkout.id,
        cartId: input.cartId,
        holdMinutes: checked.holdMinutes,
      }))
    )
    const made = reserveHoldStep(
      transform({ checked, checkout, hold }, ({ checked, checkout, hold }) => ({
        holdId: hold.id,
        checkoutId: checkout.id,
        reservations: checked.reservations,
      }))
    )
    writeRecoveryFileStep(
      transform({ checked, checkout, hold }, ({ checked, checkout, hold }) => ({
        checkoutId: checkout.id,
        holdId: hold.id,
        holdExpiresAt: hold.expiresAt,
        createdAt: checkout.createdAt,
        snapshot: checked.snapshot!,
      }))
    )
    recordStockMovementsStep(
      transform({ made, checkout, hold }, ({ made, checkout, hold }) =>
        made.map(
          (m): StockMovementRowInput => ({
            inventoryItemId: m.inventoryItemId,
            variantId: m.variantId,
            cause: "checkout_hold",
            change: m.quantity,
            stockedAfter: m.stockedAfter,
            reservedAfter: m.reservedAfter,
            actor: BEGIN_CHECKOUT_ACTOR,
            actorId: null,
            reason: `Held for checkout ${checkout.id} (hold ${hold.id})`,
            requestId: `${hold.id}:hold:${m.reservationId}`,
          })
        )
      )
    )
    return transform({ checkout }, ({ checkout }) => ({ checkoutId: checkout.id }))
  })

  releaseStockLocksStep(locks)

  return new WorkflowResponse(
    transform({ checked, created }, ({ checked, created }): BeginCheckoutResult =>
      checked.existingCheckoutId
        ? { checkoutId: checked.existingCheckoutId, created: false }
        : { checkoutId: created!.checkoutId, created: true }
    )
  )
})
