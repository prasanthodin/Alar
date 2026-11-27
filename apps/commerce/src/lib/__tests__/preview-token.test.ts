import { describe, expect, it } from "vitest"
import { PREVIEW_TOKEN_TTL_SECONDS, previewTokenExpiry, signPreviewToken, verifyPreviewToken } from "../preview-token"

const SECRET = "a-preview-signing-key-of-32-chars-or-more"
const NOW = new Date("2026-11-27T10:00:00.000Z")
const later = (seconds: number) => new Date(NOW.getTime() + seconds * 1000)

describe("preview tokens", () => {
  it("a fresh token opens its Design, and expires after an hour by default", () => {
    const { token, expiresAt } = signPreviewToken("prod_01", SECRET, NOW)
    expect(expiresAt.toISOString()).toBe("2026-11-27T11:00:00.000Z")
    expect(PREVIEW_TOKEN_TTL_SECONDS).toBe(3600)
    expect(verifyPreviewToken(token, "prod_01", SECRET, NOW)).toBe(true)
    expect(verifyPreviewToken(token, "prod_01", SECRET, later(3599))).toBe(true)
    expect(previewTokenExpiry(token)).toEqual(expiresAt)
  })

  it("an expired token is refused", () => {
    const { token } = signPreviewToken("prod_01", SECRET, NOW, 60)
    expect(verifyPreviewToken(token, "prod_01", SECRET, later(60))).toBe(false)
    expect(verifyPreviewToken(token, "prod_01", SECRET, later(3600))).toBe(false)
  })

  it("a tampered token is refused: another Design, a moved expiry, a changed signature or another secret", () => {
    const { token } = signPreviewToken("prod_01", SECRET, NOW)
    const [expiry, sig] = token.split(".") as [string, string]
    expect(verifyPreviewToken(token, "prod_02", SECRET, NOW)).toBe(false)
    expect(verifyPreviewToken(`${Number(expiry) + 3600}.${sig}`, "prod_01", SECRET, NOW)).toBe(false)
    const flipped = `${sig.slice(0, -1)}${sig.endsWith("A") ? "B" : "A"}`
    expect(verifyPreviewToken(`${expiry}.${flipped}`, "prod_01", SECRET, NOW)).toBe(false)
    expect(verifyPreviewToken(token, "prod_01", `${SECRET}-other`, NOW)).toBe(false)
  })

  it.each([undefined, null, 42, "", "garbage", "1767225600", "1767225600.", ".abc", "1767225600.too-short"])(
    "refuses a malformed token %p",
    (token) => {
      expect(verifyPreviewToken(token, "prod_01", SECRET, NOW)).toBe(false)
    }
  )
})
