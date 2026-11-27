import { model } from "@medusajs/framework/utils"

/**
 * One price set or change of a Variant (AD-5): the old price (null for the
 * first), the new one, when and by which admin user. Amounts are paise.
 * Rows are only added, never edited.
 */
export const PriceHistory = model
  .define("price_history", {
    id: model.id({ prefix: "prch" }).primaryKey(),
    variant_id: model.text(),
    old_price_paise: model.number().nullable(),
    new_price_paise: model.number(),
    changed_at: model.dateTime(),
    changed_by: model.text(),
  })
  .indexes([{ name: "IDX_price_history_variant_id_changed_at", on: ["variant_id", "changed_at"] }])
