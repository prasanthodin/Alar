import { describe, expect, it } from "vitest"
import { safeReturnPath, withReturnPath } from "../src/lib/return-path"

describe("safeReturnPath", () => {
  it("keeps a path on this site", () => {
    expect(safeReturnPath("/checkout")).toBe("/checkout")
    expect(safeReturnPath("/designs/arani?x=1")).toBe("/designs/arani?x=1")
  })

  it("refuses another site, protocol-relative and backslash paths, and non-strings", () => {
    for (const bad of ["https://evil.test/", "//evil.test", "/\\evil.test", "checkout", "", "/a\nb", undefined, ["/checkout"], 42]) {
      expect(safeReturnPath(bad), String(bad)).toBeNull()
    }
  })
})

describe("safeReturnPath and pages that act on arrival", () => {
  it("refuses /sign-out and /api, so a link cannot sign her out right after she signs in", () => {
    for (const bad of ["/sign-out", "/sign-out?next=/checkout", "/sign-out/", "/api", "/api/health", "/api?x=1"]) {
      expect(safeReturnPath(bad), bad).toBeNull()
    }
    expect(safeReturnPath("/sign-outlet")).toBe("/sign-outlet")
    expect(safeReturnPath("/apiary")).toBe("/apiary")
  })
})

describe("withReturnPath", () => {
  it("adds next only when there is one", () => {
    expect(withReturnPath("/sign-in", "/checkout")).toBe("/sign-in?next=%2Fcheckout")
    expect(withReturnPath("/sign-in", null)).toBe("/sign-in")
  })
})
