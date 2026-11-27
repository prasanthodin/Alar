import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import DesignAttributesModule from "../modules/design-attributes"

/**
 * A Design is a kernel product with one set of typed attributes (Story 1.6).
 * Query reads them as `product.design_attributes` and `design_attributes.product`.
 */
export default defineLink(ProductModule.linkable.product, DesignAttributesModule.linkable.designAttributes)
