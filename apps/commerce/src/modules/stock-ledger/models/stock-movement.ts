import { model } from "@medusajs/framework/utils"

/**
 * One change of a Variant's stock at the shop's stock location (AD-6): its
 * cause, the signed change in Pieces, the stocked and reserved quantities
 * after it, who made it (an admin's email and user id for a manual
 * adjustment), why, and when. Rows are only inserted: a database trigger
 * refuses any UPDATE or DELETE (migration `Migration20261127204437`), so the
 * kernel's `deleted_at` column is never set. `request_id` is the client's id
 * of the change, unique, so a resent request is recorded once.
 */
export const StockMovement = model
  .define("stock_movement", {
    id: model.id({ prefix: "smov" }).primaryKey(),
    inventory_item_id: model.text(),
    variant_id: model.text(),
    cause: model.enum([
      "opening_balance",
      "manual_adjustment",
      "checkout_hold",
      "payment_confirmed",
      "hold_released",
      "fulfilled",
      "order_cancelled",
      "return_restocked",
    ]),
    change: model.number(),
    stocked_after: model.number(),
    reserved_after: model.number(),
    actor: model.text(),
    actor_id: model.text().nullable(),
    reason: model.text(),
    occurred_at: model.dateTime(),
    request_id: model.text().nullable(),
  })
  .indexes([
    { name: "IDX_stock_movement_variant_id_occurred_at", on: ["variant_id", "occurred_at"] },
    { name: "IDX_stock_movement_request_id_unique", on: ["request_id"], unique: true, where: "request_id IS NOT NULL" },
  ])
