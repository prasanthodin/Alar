import { describe, expect, it } from "vitest"
import { colors, sizes, tailwindTheme, typography } from "./index"

describe("tokens", () => {
  it("carry the DESIGN.md brand values", () => {
    expect(colors.primary).toBe("#6F52F0")
    expect(sizes.button).toBe(40)
    expect(sizes.field).toBe(44)
    expect(typography.body.fontSize).toBe(14)
    expect(typography.h1.fontFamily).toBe("Plus Jakarta Sans")
  })

  it("give Tailwind no shadow but none", () => {
    expect(tailwindTheme.boxShadow).toEqual({ none: "none" })
  })

  it("express sizes in px for Tailwind", () => {
    expect(tailwindTheme.extend.height.button).toBe("40px")
    expect(tailwindTheme.fontSize.body).toEqual(["14px", { lineHeight: "20px", fontWeight: "400" }])
  })
})
