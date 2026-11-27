import { describe, expect, it } from "vitest"
import { withHiddenEntries } from "../hide-admin-navigation"

describe("withHiddenEntries", () => {
  it("hides Inventory and keeps every other preference", () => {
    const current = {
      widgets: {
        "core:nav:/orders": { order: 1, section: "main" },
        "core:nav:/inventory": { order: 3 },
      },
      extra: { kept: true },
    }
    expect(withHiddenEntries(current)).toEqual({
      widgets: {
        "core:nav:/orders": { order: 1, section: "main" },
        "core:nav:/inventory": { order: 3, hidden: true },
      },
      extra: { kept: true },
    })
  })

  it("starts a layout when there is none", () => {
    expect(withHiddenEntries(null)).toEqual({ widgets: { "core:nav:/inventory": { hidden: true } } })
  })

  it("does not change the layout it is given", () => {
    const current = { widgets: { "core:nav:/inventory": { order: 3 } } }
    withHiddenEntries(current)
    expect(current).toEqual({ widgets: { "core:nav:/inventory": { order: 3 } } })
  })
})
