import { model } from "@medusajs/framework/utils"

/**
 * A Checkout (Story 1.9): what a signed-in Shopper agreed to pay for when
 * she began checkout. `snapshot` is the `CheckoutSnapshot` of
 * `@shop/contracts` (lines, unit prices, tax per line, shipping, total,
 * address, Shopper id), checked on write and read and never changed after it
 * is taken. `status` is `held` while its Hold lasts, then `cancelled` or
 * `expired`; Story 1.10 adds the payment states. Written only by the
 * `begin-checkout` and `release-hold` workflows.
 */
export const Checkout = model
  .define("checkout", {
    id: model.id({ prefix: "chk" }).primaryKey(),
    cart_id: model.text(),
    customer_id: model.text(),
    status: model.enum(["held", "cancelled", "expired"]).default("held"),
    snapshot: model.json(),
  })
  .indexes([
    { name: "IDX_checkout_cart_id", on: ["cart_id"] },
    { name: "IDX_checkout_customer_id", on: ["customer_id"] },
  ])
