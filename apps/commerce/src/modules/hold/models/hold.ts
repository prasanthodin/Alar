import { model } from "@medusajs/framework/utils"

/**
 * A Hold (Story 1.9, AD-6): a Shopper's Pieces kept for her while she pays.
 * It is this record plus the kernel reservations tagged with its id
 * (`external_id`). `live` until `released` (she cancelled) or `expired` (the
 * scheduled job found it past `expires_at`); `ended_at` is when it stopped.
 * A cart has at most one live Hold (partial unique index). Written only by
 * the `begin-checkout` and `release-hold` workflows.
 */
export const Hold = model
  .define("hold", {
    id: model.id({ prefix: "hold" }).primaryKey(),
    checkout_id: model.text(),
    cart_id: model.text(),
    expires_at: model.dateTime(),
    status: model.enum(["live", "released", "expired"]).default("live"),
    ended_at: model.dateTime().nullable(),
  })
  .indexes([
    { name: "IDX_hold_cart_id_live_unique", on: ["cart_id"], unique: true, where: "status = 'live'" },
    { name: "IDX_hold_checkout_id_unique", on: ["checkout_id"], unique: true },
    { name: "IDX_hold_status_expires_at", on: ["status", "expires_at"] },
  ])
