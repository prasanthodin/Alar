import { model } from "@medusajs/framework/utils"

/**
 * One dated value of a shop setting (AD-13). A read at time T takes the row
 * whose `effective_from` is the latest not after T. Values are checked against
 * the key's zod schema in `@shop/contracts` on write and on read.
 */
export const SettingValue = model
  .define("setting_value", {
    id: model.id({ prefix: "setv" }).primaryKey(),
    key: model.text(),
    value: model.json(),
    effective_from: model.dateTime(),
  })
  .indexes([
    {
      name: "IDX_setting_value_key_effective_from",
      on: ["key", "effective_from"],
      unique: true,
    },
  ])
