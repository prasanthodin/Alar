import { describe, expect, it } from "vitest"
import {
  Availability,
  BagView,
  BeginCheckoutInput,
  CartChangedDetails,
  CheckoutAddress,
  CheckoutRecoveryFile,
  CheckoutSnapshot,
  CheckoutSnapshotLine,
  CheckoutStatus,
  CheckoutView,
  checkoutRecoveryKey,
  ErrorCode,
  HOLD_MINUTES_SETTING,
  holdExpiry,
  INDIAN_STATES,
  parseSettingValue,
  settingSchema,
  splitInclusivePrice,
} from "./index"

const address = {
  name: "Meena Iyer",
  mobile: "98765 43210",
  addressLine: "12 Temple Street",
  city: "Kanchipuram",
  pincode: "631501",
  state: "Tamil Nadu",
}

const split = splitInclusivePrice(315000, 500)
const line = {
  lineId: "cali_1",
  variantId: "variant_1",
  designId: "prod_1",
  name: "Arani silk saree",
  quantity: 1,
  unitPricePaise: 315000,
  taxableTotalPaise: split.taxablePaise,
  taxTotalPaise: split.taxPaise,
  lineTotalPaise: 315000,
  rateBp: 500,
  taxCode: "saree",
}

const snapshot = {
  version: 1,
  cartId: "cart_1",
  customerId: "cus_1",
  currencyCode: "inr",
  lines: [line],
  shippingPaise: 0,
  totalPaise: 315000,
  address: CheckoutAddress.parse(address),
  takenAt: "2026-11-27T10:15:00.000Z",
}

describe("checkout error codes", () => {
  it("are stable codes in the error enum", () => {
    for (const code of ["cart.changed", "cart.locked", "stock.unavailable", "checkout.not_found"]) {
      expect(ErrorCode.safeParse(code).success).toBe(true)
    }
  })
})

describe("Availability", () => {
  it("adds held (unavailable for now) to available and sold out", () => {
    expect(Availability.options).toEqual(["available", "sold_out", "held"])
  })
})

describe("CheckoutAddress", () => {
  it("accepts a full address and normalises the mobile number", () => {
    const parsed = CheckoutAddress.parse(address)
    expect(parsed.mobile).toBe("9876543210")
    expect(parsed.state).toBe("Tamil Nadu")
  })

  it("requires every field", () => {
    for (const field of Object.keys(address)) {
      const partial: Record<string, unknown> = { ...address }
      delete partial[field]
      expect(CheckoutAddress.safeParse(partial).success, field).toBe(false)
      expect(CheckoutAddress.safeParse({ ...address, [field]: "  " }).success, `${field} blank`).toBe(false)
    }
  })

  it("refuses a 5-digit or 7-digit pincode and one starting with 0", () => {
    for (const pincode of ["63150", "6315011", "031501", "63150a"]) {
      expect(CheckoutAddress.safeParse({ ...address, pincode }).success, pincode).toBe(false)
    }
  })

  it("refuses a mobile number that is not 10 Indian digits", () => {
    for (const mobile of ["987654321", "98765432101", "5876543210", "+919876543210", "09876543210", "98765abcde"]) {
      expect(CheckoutAddress.safeParse({ ...address, mobile }).success, mobile).toBe(false)
    }
  })

  it("takes a state or union territory of India only, and no unknown field", () => {
    expect(INDIAN_STATES).toHaveLength(36)
    expect(CheckoutAddress.safeParse({ ...address, state: "Ceylon" }).success).toBe(false)
    expect(CheckoutAddress.safeParse({ ...address, country: "IN" }).success).toBe(false)
  })
})

describe("BeginCheckoutInput", () => {
  it("is the cart id and the address, nothing else", () => {
    expect(BeginCheckoutInput.safeParse({ cartId: "cart_1", address }).success).toBe(true)
    expect(BeginCheckoutInput.safeParse({ cartId: "", address }).success).toBe(false)
    expect(BeginCheckoutInput.safeParse({ cartId: "cart_1", address, totalPaise: 1 }).success).toBe(false)
  })
})

describe("CheckoutSnapshot", () => {
  it("accepts lines whose tax splits each line exactly and a total of lines plus shipping", () => {
    expect(CheckoutSnapshot.parse(snapshot).totalPaise).toBe(315000)
  })

  it("refuses a line whose taxable and tax do not add up to its total, or whose total is not price × quantity", () => {
    expect(CheckoutSnapshotLine.safeParse({ ...line, taxTotalPaise: line.taxTotalPaise + 1 }).success).toBe(false)
    expect(CheckoutSnapshotLine.safeParse({ ...line, quantity: 2 }).success).toBe(false)
    expect(CheckoutSnapshotLine.safeParse({ ...line, unitPricePaise: 315050, lineTotalPaise: 315050 }).success).toBe(false)
  })

  it("refuses a total that is not the lines plus shipping, and an empty snapshot", () => {
    expect(CheckoutSnapshot.safeParse({ ...snapshot, totalPaise: 315001 }).success).toBe(false)
    expect(CheckoutSnapshot.safeParse({ ...snapshot, lines: [] }).success).toBe(false)
    expect(CheckoutSnapshot.safeParse({ ...snapshot, shippingPaise: 5000 }).success).toBe(false)
    expect(CheckoutSnapshot.safeParse({ ...snapshot, shippingPaise: 5000, totalPaise: 320000 }).success).toBe(true)
  })
})

describe("CheckoutView and the recovery file", () => {
  it("has the snapshot's lines and total, the Hold's end and the status", () => {
    const view = CheckoutView.parse({
      id: "chk_1",
      status: "held",
      lines: [line],
      shippingPaise: 0,
      totalPaise: 315000,
      holdExpiresAt: "2026-11-27T10:30:00.000Z",
      address: snapshot.address,
      createdAt: "2026-11-27T10:15:00.000Z",
    })
    expect(view.holdExpiresAt).toBe("2026-11-27T10:30:00.000Z")
    expect(CheckoutStatus.options).toEqual(["held", "cancelled", "expired"])
  })

  it("keys the recovery file by the Checkout id and carries the snapshot with the Shopper id", () => {
    expect(checkoutRecoveryKey("chk_1")).toBe("checkouts/chk_1.json")
    const file = CheckoutRecoveryFile.parse({
      version: 1,
      checkoutId: "chk_1",
      holdId: "hold_1",
      holdExpiresAt: "2026-11-27T10:30:00.000Z",
      createdAt: "2026-11-27T10:15:00.000Z",
      snapshot,
    })
    expect(file.snapshot.customerId).toBe("cus_1")
  })
})

describe("cart.changed details", () => {
  it("lists each changed line with the reason", () => {
    const details = CartChangedDetails.parse({
      lines: [
        {
          lineId: "cali_1",
          variantId: "variant_1",
          name: "Arani silk saree",
          reason: "price_changed",
          quantity: 1,
          unitPricePaise: 315000,
          currentPricePaise: 330000,
          available: 2,
        },
      ],
    })
    expect(details.lines[0]!.reason).toBe("price_changed")
    expect(CartChangedDetails.safeParse({ lines: [] }).success).toBe(false)
  })
})

describe("the Hold length", () => {
  it("is the dated setting checkout.hold_minutes: whole minutes from 1 to 60", () => {
    expect(settingSchema(HOLD_MINUTES_SETTING)).not.toBeNull()
    expect(parseSettingValue(HOLD_MINUTES_SETTING, 15)).toEqual({ ok: true, data: 15 })
    for (const bad of [0, 61, 1.5, "15"]) {
      expect(parseSettingValue(HOLD_MINUTES_SETTING, bad).ok, String(bad)).toBe(false)
    }
  })

  it("ends that many minutes after it starts", () => {
    expect(holdExpiry(new Date("2026-11-27T10:15:00.000Z"), 15).toISOString()).toBe("2026-11-27T10:30:00.000Z")
  })
})

describe("BagView", () => {
  it("has no hold unless the server sends one", () => {
    const bag = { lines: [], totalMrp: 0, discount: 0, delivery: 0, total: 0, count: 0 }
    expect(BagView.parse(bag).hold).toBeNull()
    expect(BagView.parse({ ...bag, hold: { checkoutId: "chk_1", expiresAt: "2026-11-27T10:30:00.000Z" } }).hold).toEqual({
      checkoutId: "chk_1",
      expiresAt: "2026-11-27T10:30:00.000Z",
    })
  })
})
