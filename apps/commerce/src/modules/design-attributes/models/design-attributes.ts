import { model } from "@medusajs/framework/utils"

/**
 * A Design's typed attributes, linked one-to-one to its kernel product
 * (`src/links/product-design-attributes.ts`). Never the kernel's free-form
 * metadata. Names are category-neutral (NFR-17). Lengths are whole
 * centimetres, shown in metres (`lengthM`, `widthM`). `photos` holds the
 * Design's photos in order (`DesignPhotos` in `@shop/contracts`, checked on
 * write and read).
 */
export const DesignAttributes = model.define("design_attributes", {
  id: model.id({ prefix: "dattr" }).primaryKey(),
  fibre: model.text().nullable(),
  weave: model.text().nullable(),
  length_cm: model.number().nullable(),
  width_cm: model.number().nullable(),
  blouse_piece_included: model.boolean().default(false),
  care: model.text().nullable(),
  country_of_origin: model.text().nullable(),
  tax_code: model.text().nullable(),
  stitched: model.boolean().default(false),
  photos: model.json(),
  true_colour_confirmed_at: model.dateTime().nullable(),
  true_colour_confirmed_by: model.text().nullable(),
})
