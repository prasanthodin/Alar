import { describe, expect, it } from "vitest"
import {
  AdjustStockInput,
  AdminDesignStockResponse,
  availablePieces,
  ErrorCode,
  MAX_STOCK_PIECES,
  parseInput,
  resolveStockTarget,
  StockMovementCause,
  StockMovementView,
  VariantStockView,
} from "./index"

const movement = {
  id: "smov_1",
  inventoryItemId: "iitem_1",
  variantId: "variant_1",
  cause: "manual_adjustment",
  change: 10,
  stockedAfter: 10,
  reservedAfter: 0,
  actor: "owner@example.test",
  reason: "first delivery",
  occurredAt: "2026-11-27T10:15:00.000Z",
}

describe("stock error codes", () => {
  it("are stable codes in the error enum", () => {
    for (const code of ["stock.below_reserved", "stock.invalid_quantity", "stock.lock_timeout"]) {
      expect(ErrorCode.safeParse(code).success).toBe(true)
    }
  })
})

describe("StockMovementCause", () => {
  it("holds the cause of each of the seven stock workflows", () => {
    expect(StockMovementCause.options).toEqual([
      "manual_adjustment",
      "checkout_hold",
      "payment_confirmed",
      "hold_released",
      "fulfilled",
      "order_cancelled",
      "return_restocked",
    ])
  })
})

describe("AdjustStockInput", () => {
  it("accepts an absolute target or a signed change with a reason, trimmed", () => {
    expect(AdjustStockInput.parse({ set: 10, reason: " first delivery " })).toEqual({
      set: 10,
      reason: "first delivery",
    })
    expect(AdjustStockInput.parse({ delta: 1, reason: "found one" })).toEqual({ delta: 1, reason: "found one" })
    expect(AdjustStockInput.parse({ delta: -3, reason: "damaged" })).toEqual({ delta: -3, reason: "damaged" })
    expect(AdjustStockInput.parse({ set: 0, reason: "none left" }).set).toBe(0)
  })

  it.each([
    ["no reason", { set: 10 }],
    ["an empty reason", { set: 10, reason: "   " }],
    ["a reason over 200 characters", { set: 10, reason: "x".repeat(201) }],
    ["both set and delta", { set: 10, delta: 1, reason: "r" }],
    ["neither set nor delta", { reason: "r" }],
    ["a negative target", { set: -1, reason: "r" }],
    ["a fractional target", { set: 1.5, reason: "r" }],
    ["a target above the limit", { set: MAX_STOCK_PIECES + 1, reason: "r" }],
    ["a change of 0", { delta: 0, reason: "r" }],
    ["a fractional change", { delta: 0.5, reason: "r" }],
    ["an unknown field", { set: 1, reason: "r", cause: "fulfilled" }],
    ["a string number", { set: "10", reason: "r" }],
  ])("refuses %s with input.invalid", (_, body) => {
    const res = parseInput(AdjustStockInput, body)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("input.invalid")
  })

  it("accepts a 200-character reason", () => {
    expect(AdjustStockInput.safeParse({ set: 1, reason: "x".repeat(200) }).success).toBe(true)
  })
})

describe("resolveStockTarget", () => {
  it("sets an absolute target", () => {
    expect(resolveStockTarget({ stocked: 0, reserved: 0 }, { set: 10 })).toEqual({ ok: true, stocked: 10, change: 10 })
    expect(resolveStockTarget({ stocked: 7, reserved: 0 }, { set: 7 })).toEqual({ ok: true, stocked: 7, change: 0 })
  })

  it("adds a signed change to the current quantity", () => {
    expect(resolveStockTarget({ stocked: 4, reserved: 1 }, { delta: 1 })).toEqual({ ok: true, stocked: 5, change: 1 })
    expect(resolveStockTarget({ stocked: 4, reserved: 1 }, { delta: -3 })).toEqual({ ok: true, stocked: 1, change: -3 })
  })

  it("refuses a result below what is reserved with stock.below_reserved", () => {
    expect(resolveStockTarget({ stocked: 3, reserved: 2 }, { set: 1 })).toEqual({ ok: false, code: "stock.below_reserved" })
    expect(resolveStockTarget({ stocked: 3, reserved: 2 }, { delta: -2 })).toEqual({
      ok: false,
      code: "stock.below_reserved",
    })
    expect(resolveStockTarget({ stocked: 3, reserved: 2 }, { set: 2 })).toMatchObject({ ok: true, stocked: 2 })
  })

  it("refuses a negative result or one above the limit with stock.invalid_quantity", () => {
    expect(resolveStockTarget({ stocked: 2, reserved: 0 }, { delta: -3 })).toEqual({
      ok: false,
      code: "stock.invalid_quantity",
    })
    expect(resolveStockTarget({ stocked: 2, reserved: 1 }, { delta: -3 })).toEqual({
      ok: false,
      code: "stock.invalid_quantity",
    })
    expect(resolveStockTarget({ stocked: MAX_STOCK_PIECES, reserved: 0 }, { delta: 1 })).toEqual({
      ok: false,
      code: "stock.invalid_quantity",
    })
  })
})

describe("stock views", () => {
  it("availablePieces is stocked - reserved, never below 0", () => {
    expect(availablePieces(10, 3)).toBe(7)
    expect(availablePieces(2, 3)).toBe(0)
  })

  it("VariantStockView holds available = stocked - reserved", () => {
    const view = { variantId: "variant_1", inventoryItemId: "iitem_1", stocked: 3, reserved: 2, available: 1 }
    expect(VariantStockView.parse(view)).toEqual(view)
    expect(VariantStockView.safeParse({ ...view, available: 3 }).success).toBe(false)
    expect(VariantStockView.safeParse({ ...view, stocked: -1, available: 0 }).success).toBe(false)
  })

  it("StockMovementView takes a signed change and refuses an unknown cause", () => {
    expect(StockMovementView.parse(movement)).toEqual(movement)
    expect(StockMovementView.parse({ ...movement, change: -2 }).change).toBe(-2)
    expect(StockMovementView.safeParse({ ...movement, cause: "sale" }).success).toBe(false)
    expect(StockMovementView.safeParse({ ...movement, occurredAt: "2026-11-27" }).success).toBe(false)
  })

  it("AdminDesignStockResponse is the stock with its movements, and ignores unknown fields", () => {
    const res = AdminDesignStockResponse.parse({
      stock: { variantId: "variant_1", inventoryItemId: "iitem_1", stocked: 10, reserved: 0, available: 10 },
      movements: [{ ...movement, extra: true }],
      extra: 1,
    })
    expect(res.movements[0]).toEqual(movement)
    expect(res).not.toHaveProperty("extra")
  })
})
