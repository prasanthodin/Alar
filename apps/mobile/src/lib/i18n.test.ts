import { ErrorCode } from "@shop/contracts"
import { describe, expect, it } from "vitest"
import en from "../../messages/en.json"
import { errorText, itemCount, t } from "./i18n"

describe("translation file", () => {
  it("has text for every error code", () => {
    for (const code of ErrorCode.options) expect(errorText(code)).toBeTruthy()
  })

  it("fills placeholders", () => {
    expect(t("common.onlyLeft", { n: 3 })).toBe("Only 3 left")
    expect(itemCount(1)).toBe("1 item")
    expect(itemCount(4)).toBe("4 items")
  })

  it('says "Bag", never "Cart", and never mentions a weaver', () => {
    for (const text of Object.values(en)) {
      expect(text).not.toMatch(/\bcart\b/i)
      expect(text).not.toMatch(/weaver/i)
    }
  })
})
