import { describe, expect, it } from "vitest"
import {
  AdminDesignView,
  CreateDesignInput,
  DesignAttributesPatch,
  DesignPhotos,
  ErrorCode,
  isDesignShelfPrice,
  MAX_DESIGN_PHOTOS,
  MAX_PRICE_RUPEES,
  Metres,
  NotPublishableDetails,
  parseCreateDesignInput,
  parseSetDesignPriceInput,
  PublishDesignInput,
  shelfPriceFromRupees,
  UpdateDesignInput,
  UPLOAD_MAX_FILES,
  UPLOAD_MAX_MEGABYTES,
  uploadRefusalMessage,
  UploadRefusalDetails,
  DesignPhotosInput,
  PublishRequirement,
  TaxCodeList,
} from "./index"

const photo = (i: number, role: "close_up" | "other" = "other") => ({
  fileId: `photo-${i}.jpg`,
  url: `http://localhost:4566/catalog/photo-${i}.jpg`,
  role,
  position: i,
})

const complete = {
  name: "Arani silk saree",
  description: "Maroon with a temple border",
  attributes: {
    fibre: "Silk",
    weave: "Arani",
    lengthM: 6.3,
    widthM: 1.14,
    blousePieceIncluded: true,
    care: "Dry clean only",
    countryOfOrigin: "India",
    taxCode: "saree",
    stitched: false,
  },
  photos: [photo(0, "close_up"), photo(1)],
  priceRupees: 3150,
}

describe("design error codes", () => {
  it("are stable codes in the error enum", () => {
    for (const code of [
      "design.unknown_tax_code",
      "design.not_publishable",
      "design.not_found",
      "design.already_published",
      "design.not_draft",
      "design.unknown_photo",
      "upload.invalid_file",
      "request.cross_origin",
    ]) {
      expect(ErrorCode.safeParse(code).success).toBe(true)
    }
  })
})

describe("shelfPriceFromRupees", () => {
  it("turns whole rupees into a shelf price in paise", () => {
    expect(shelfPriceFromRupees(3150)).toEqual({ ok: true, data: 315000 })
    expect(shelfPriceFromRupees(1)).toEqual({ ok: true, data: 100 })
    expect(shelfPriceFromRupees(MAX_PRICE_RUPEES)).toEqual({ ok: true, data: MAX_PRICE_RUPEES * 100 })
  })

  it.each([3150.5, 0, -100, MAX_PRICE_RUPEES + 1, Number.NaN, Number.POSITIVE_INFINITY, "3150", null, undefined])(
    "refuses %s with money.invalid_shelf_price",
    (value) => {
      const res = shelfPriceFromRupees(value)
      expect(res.ok).toBe(false)
      if (!res.ok) expect(res.error.code).toBe("money.invalid_shelf_price")
    }
  )

  it("isDesignShelfPrice needs a positive whole number of rupees", () => {
    expect(isDesignShelfPrice(315000)).toBe(true)
    expect(isDesignShelfPrice(0)).toBe(false)
    expect(isDesignShelfPrice(315050)).toBe(false)
    expect(isDesignShelfPrice(null)).toBe(false)
  })
})

describe("parseCreateDesignInput", () => {
  it("accepts a complete form", () => {
    const res = parseCreateDesignInput(complete)
    expect(res).toEqual({ ok: true, data: complete })
  })

  it("fills left-out attributes as empty and photos as none", () => {
    const res = parseCreateDesignInput({ name: "Plain", priceRupees: 900 })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.data.description).toBe("")
    expect(res.data.photos).toEqual([])
    expect(res.data.attributes).toEqual({
      fibre: null,
      weave: null,
      lengthM: null,
      widthM: null,
      blousePieceIncluded: false,
      care: null,
      countryOfOrigin: null,
      taxCode: null,
      stitched: false,
    })
  })

  it.each([3150.5, 0])("refuses a price of Rs %s with money.invalid_shelf_price", (priceRupees) => {
    const res = parseCreateDesignInput({ ...complete, priceRupees })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("money.invalid_shelf_price")
  })

  it("refuses other problems with input.invalid and names them", () => {
    const res = parseCreateDesignInput({ ...complete, name: " " })
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe("input.invalid")
      expect(String(res.error.details?.issues)).toContain("name")
    }
    for (const body of [
      { ...complete, priceRupees: undefined },
      { ...complete, status: "published" },
      { ...complete, attributes: { ...complete.attributes, metadata: { x: 1 } } },
      { ...complete, attributes: { ...complete.attributes, taxCode: "Saree!" } },
      { ...complete, attributes: { ...complete.attributes, lengthM: 6.305 } },
      null,
    ]) {
      const r = parseCreateDesignInput(body)
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error.code).toBe("input.invalid")
    }
  })

  it("CreateDesignInput keeps attribute names category-neutral", () => {
    expect(Object.keys(CreateDesignInput.shape.attributes.unwrap().shape).sort()).toEqual(
      ["blousePieceIncluded", "care", "countryOfOrigin", "fibre", "lengthM", "stitched", "taxCode", "weave", "widthM"].sort()
    )
  })
})

describe("photos", () => {
  it("accepts ordered photos with one close-up", () => {
    expect(DesignPhotos.safeParse([photo(0), photo(1, "close_up"), photo(2)]).success).toBe(true)
    expect(DesignPhotos.safeParse([]).success).toBe(true)
  })

  it("refuses two close-ups, gaps in the order, a file twice and too many photos", () => {
    expect(DesignPhotos.safeParse([photo(0, "close_up"), photo(1, "close_up")]).success).toBe(false)
    expect(DesignPhotos.safeParse([photo(0), photo(2)]).success).toBe(false)
    expect(DesignPhotos.safeParse([photo(0), { ...photo(0), position: 1 }]).success).toBe(false)
    expect(
      DesignPhotos.safeParse(Array.from({ length: MAX_DESIGN_PHOTOS + 1 }, (_, i) => photo(i))).success
    ).toBe(false)
    expect(DesignPhotos.safeParse([{ ...photo(0), url: "javascript:alert(1)" }]).success).toBe(false)
  })
})

describe("metres", () => {
  it("allows whole centimetres only", () => {
    expect(Metres.safeParse(6.3).success).toBe(true)
    expect(Metres.safeParse(1.14).success).toBe(true)
    expect(Metres.safeParse(0).success).toBe(false)
    expect(Metres.safeParse(1.145).success).toBe(false)
    expect(Metres.safeParse(101).success).toBe(false)
  })
})

describe("update, price and publish inputs", () => {
  it("UpdateDesignInput takes any subset but not nothing, and never a status", () => {
    expect(UpdateDesignInput.safeParse({ name: "New" }).success).toBe(true)
    expect(UpdateDesignInput.safeParse({ attributes: { fibre: "Cotton" } }).success).toBe(true)
    expect(UpdateDesignInput.safeParse({}).success).toBe(false)
    expect(UpdateDesignInput.safeParse({ status: "published" }).success).toBe(false)
    expect(DesignAttributesPatch.parse({ fibre: null })).toEqual({ fibre: null })
  })

  it("parseSetDesignPriceInput refuses bad prices with money.invalid_shelf_price", () => {
    expect(parseSetDesignPriceInput({ priceRupees: 2950 })).toEqual({ ok: true, data: { priceRupees: 2950 } })
    const bad = parseSetDesignPriceInput({ priceRupees: 2950.5 })
    expect(!bad.ok && bad.error.code).toBe("money.invalid_shelf_price")
    const missing = parseSetDesignPriceInput({})
    expect(!missing.ok && missing.error.code).toBe("input.invalid")
  })

  it("PublishDesignInput defaults to no confirmation", () => {
    expect(PublishDesignInput.parse({})).toEqual({ trueColourConfirmed: false })
    expect(PublishDesignInput.parse({ trueColourConfirmed: true })).toEqual({ trueColourConfirmed: true })
  })

  it("NotPublishableDetails lists at least one known requirement", () => {
    expect(NotPublishableDetails.safeParse({ missing: ["fabricCloseUpPhoto", "trueColourConfirmation"] }).success).toBe(true)
    expect(NotPublishableDetails.safeParse({ missing: [] }).success).toBe(false)
    expect(NotPublishableDetails.safeParse({ missing: ["weaver"] }).success).toBe(false)
  })
})

describe("AdminDesignView", () => {
  it("accepts a draft without a price and ignores unknown fields", () => {
    const view = {
      id: "prod_1",
      variantId: "variant_1",
      name: "Arani silk saree",
      description: "",
      status: "draft",
      pricePaise: null,
      attributes: { ...complete.attributes },
      photos: complete.photos,
      trueColourConfirmation: null,
      createdAt: "2026-11-27T10:00:00.000Z",
      updatedAt: "2026-11-27T10:00:00.000Z",
      metadata: { anything: true },
    }
    const parsed = AdminDesignView.parse(view)
    expect("metadata" in parsed).toBe(false)
    expect(AdminDesignView.safeParse({ ...view, pricePaise: 315050 }).success).toBe(false)
  })
})

describe("photo inputs, uploads and tax codes", () => {
  it("lets a request name photos without an address (the kernel derives it)", () => {
    const input = [{ fileId: "a.jpg", role: "close_up", position: 0 }]
    expect(DesignPhotosInput.safeParse(input).success).toBe(true)
    expect(DesignPhotos.safeParse(input).success).toBe(false)
    expect(DesignPhotosInput.safeParse([{ fileId: "a.jpg", role: "other", position: 1 }]).success).toBe(false)
  })

  it("fills the limits into the upload refusal message", () => {
    const message = uploadRefusalMessage("too_large")
    expect(message).toContain(`${UPLOAD_MAX_FILES} JPEG`)
    expect(message).toContain(`${UPLOAD_MAX_MEGABYTES} MB`)
    expect(UploadRefusalDetails.safeParse({ reason: "too_many_files" }).success).toBe(true)
    expect(UploadRefusalDetails.safeParse({ reason: "too_big" }).success).toBe(false)
  })

  it("includes the sales channel and shipping profile in the publish requirements", () => {
    expect(PublishRequirement.options.slice(-2)).toEqual(["salesChannel", "shippingProfile"])
  })

  it("TaxCodeList holds tax codes only", () => {
    expect(TaxCodeList.safeParse({ taxCodes: ["saree", "shirt_5"] }).success).toBe(true)
    expect(TaxCodeList.safeParse({ taxCodes: ["Saree!"] }).success).toBe(false)
  })
})
