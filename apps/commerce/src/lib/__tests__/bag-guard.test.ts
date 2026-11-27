import { describe, expect, it } from "vitest"
import { cartWriteSchema } from "../bag-guard"

const item = { variant_id: "variant_01", quantity: 1 }

describe("cartWriteSchema", () => {
  it("takes only items with a Variant and a quantity on create", () => {
    const schema = cartWriteSchema("POST", "/store/carts")!
    expect(schema.safeParse({ items: [item] }).success).toBe(true)
    for (const extra of [
      { region_id: "reg_01" },
      { currency_code: "usd" },
      { sales_channel_id: "sc_01" },
      { promo_codes: ["SALE"] },
      { email: "a@example.test" },
      { shipping_address: { country_code: "de" } },
      { billing_address: { country_code: "de" } },
      { metadata: { a: 1 } },
      { customer_id: "cus_01" },
      { locale: "de" },
    ]) {
      expect(schema.safeParse({ items: [item], ...extra }).success, JSON.stringify(extra)).toBe(false)
    }
    expect(schema.safeParse({ items: [{ ...item, unit_price: 1 }] }).success).toBe(false)
    expect(schema.safeParse({ items: [{ ...item, metadata: { a: 1 } }] }).success).toBe(false)
    expect(schema.safeParse({ items: [] }).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it("takes a Variant and a quantity to add, and only a quantity to change a line", () => {
    const add = cartWriteSchema("POST", "/store/carts/cart_01/line-items?fields=id")!
    expect(add.safeParse(item).success).toBe(true)
    expect(add.safeParse({ ...item, metadata: {} }).success).toBe(false)
    expect(add.safeParse({ ...item, quantity: 0 }).success).toBe(false)
    const change = cartWriteSchema("POST", "/store/carts/cart_01/line-items/cali_01/")!
    expect(change.safeParse({ quantity: 2 }).success).toBe(true)
    expect(change.safeParse({ quantity: 2, metadata: {} }).success).toBe(false)
    expect(change.safeParse({ quantity: 1.5 }).success).toBe(false)
  })

  it("leaves other requests alone (the allow-list judges them)", () => {
    expect(cartWriteSchema("DELETE", "/store/carts/cart_01/line-items/cali_01")).toBeNull()
    expect(cartWriteSchema("GET", "/store/carts")).toBeNull()
    expect(cartWriteSchema("POST", "/store/carts/cart_01/complete")).toBeNull()
    expect(cartWriteSchema("POST", "/store/shop/bag/cart_01")).toBeNull()
  })
})
