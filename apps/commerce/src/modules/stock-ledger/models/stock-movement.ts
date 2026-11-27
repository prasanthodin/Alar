import { model } from "@medusajs/framework/utils"

/**
 * One change of a Variant's stock at the shop's stock location (AD-6): its
 * cause, the signed change in Pieces, the stocked and reserved quantities
 * after it, who made it (an admin's email for a manual adjustment), why, and
 * when. Rows are only inserted, never edited or deleted.
 */
export const StockMovement = model
  .define("stock_movement", {
    id: model.id({ prefix: "smov" }).primaryKey(),
    inventory_item_id: model.text(),
    variant_id: model.text(),
    cause: model.enum([
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
    reason: model.text(),
    occurred_at: model.dateTime(),
  })
  .indexes([{ name: "IDX_stock_movement_variant_id_occurred_at", on: ["variant_id", "occurred_at"] }])
