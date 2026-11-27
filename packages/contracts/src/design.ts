import { z } from "zod"
import { fail, Id, IsoDateTime, ok, type Result } from "./common"
import { Paise, ShelfPrice } from "./money"
import { TaxCode } from "./settings"

// ---------------------------------------------------------------------------
// A Design as the Owner creates and publishes it (Story 1.6, FR-34 first
// version). Attribute names are category-neutral (NFR-17) so later categories
// reuse them; a Design has exactly one Variant and one rupee price in Epic 1.
// ---------------------------------------------------------------------------

/** Optional free text: trimmed, 1 to `max` characters, or null when not given. */
function optionalText(max: number) {
  return z.string().trim().min(1).max(max).nullable()
}

/** True when `value` has at most two decimal places (centimetre precision for metres). */
export function hasAtMostTwoDecimals(value: number): boolean {
  if (!Number.isFinite(value)) return false
  const hundredths = value * 100
  return Math.abs(hundredths - Math.round(hundredths)) < 1e-6
}

/** A length in metres: positive, at most 100, with at most two decimals (whole centimetres). */
export const Metres = z
  .number()
  .positive()
  .max(100)
  .refine(hasAtMostTwoDecimals, { message: "At most two decimals (whole centimetres)" })
export type Metres = z.infer<typeof Metres>

/** The typed attribute fields. Never stored in the kernel's free-form metadata. */
const attributeFields = {
  fibre: optionalText(80),
  weave: optionalText(80),
  lengthM: Metres.nullable(),
  widthM: Metres.nullable(),
  blousePieceIncluded: z.boolean(),
  care: optionalText(500),
  countryOfOrigin: optionalText(56),
  /** Must name a tax code with bands in settings (`tax.bands.<code>`), checked by the kernel on save. */
  taxCode: TaxCode.nullable(),
  stitched: z.boolean(),
}

/** A Design's attributes as stored and shown. */
export const DesignAttributes = z.object(attributeFields)
export type DesignAttributes = z.infer<typeof DesignAttributes>

/** Attributes on create: a field left out is empty (null, or false for yes/no fields). */
export const DesignAttributesInput = z.strictObject({
  fibre: attributeFields.fibre.default(null),
  weave: attributeFields.weave.default(null),
  lengthM: attributeFields.lengthM.default(null),
  widthM: attributeFields.widthM.default(null),
  blousePieceIncluded: attributeFields.blousePieceIncluded.default(false),
  care: attributeFields.care.default(null),
  countryOfOrigin: attributeFields.countryOfOrigin.default(null),
  taxCode: attributeFields.taxCode.default(null),
  stitched: attributeFields.stitched.default(false),
})
export type DesignAttributesInput = z.input<typeof DesignAttributesInput>

/** Attributes on update: only the fields given change. */
export const DesignAttributesPatch = z.strictObject(attributeFields).partial()
export type DesignAttributesPatch = z.infer<typeof DesignAttributesPatch>

/** A photo's role: the fabric close-up (exactly one is needed to publish) or any other photo. */
export const PhotoRole = z.enum(["close_up", "other"])
export type PhotoRole = z.infer<typeof PhotoRole>

/**
 * One photo of a Design: a file uploaded through `POST /admin/shop/uploads`
 * into the `catalog` bucket, its public address, its role and its place in
 * the Design's order (0 first).
 */
export const DesignPhoto = z.object({
  fileId: Id.max(1024),
  url: z.url({ protocol: /^https?$/ }).max(2048),
  role: PhotoRole,
  position: z.number().int().nonnegative(),
})
export type DesignPhoto = z.infer<typeof DesignPhoto>

/** The most photos one Design holds. */
export const MAX_DESIGN_PHOTOS = 12

/**
 * A photo as a request names it: the uploaded file's id, its role and place.
 * A `url` sent with it is ignored: the kernel checks the file exists in the
 * `catalog` bucket and stores the public address it derives itself.
 */
export const DesignPhotoInput = DesignPhoto.extend({
  url: DesignPhoto.shape.url.optional(),
})
export type DesignPhotoInput = z.infer<typeof DesignPhotoInput>

/** Positions 0, 1, 2, ... in array order, each file once, at most one close-up. */
function checkPhotoOrder(photos: readonly { fileId: string; role: PhotoRole; position: number }[], ctx: z.RefinementCtx) {
  photos.forEach((photo, i) => {
    if (photo.position !== i) {
      ctx.addIssue({ code: "custom", message: "Positions must be 0, 1, 2, ... in order", path: [i, "position"] })
    }
  })
  const ids = new Set(photos.map((p) => p.fileId))
  if (ids.size !== photos.length) {
    ctx.addIssue({ code: "custom", message: "A file can be used once per Design" })
  }
  if (photos.filter((p) => p.role === "close_up").length > 1) {
    ctx.addIssue({ code: "custom", message: "At most one photo is the fabric close-up" })
  }
}

/** A Design's stored photos in order (see `checkPhotoOrder`). */
export const DesignPhotos = z.array(DesignPhoto).max(MAX_DESIGN_PHOTOS).superRefine(checkPhotoOrder)
export type DesignPhotos = z.infer<typeof DesignPhotos>

/** A Design's photos as a request sends them, in order. */
export const DesignPhotosInput = z.array(DesignPhotoInput).max(MAX_DESIGN_PHOTOS).superRefine(checkPhotoOrder)
export type DesignPhotosInput = z.infer<typeof DesignPhotosInput>

/** The highest price a Design may have, in whole rupees (Rs 1 crore). */
export const MAX_PRICE_RUPEES = 10_000_000

/**
 * A price typed in whole rupees as a shelf price in paise. Fails with
 * `money.invalid_shelf_price` for anything but a whole number of rupees from
 * Rs 1 to `MAX_PRICE_RUPEES` (so Rs 3,150.50 and Rs 0 are refused).
 */
export function shelfPriceFromRupees(rupees: unknown): Result<ShelfPrice> {
  if (typeof rupees !== "number" || !Number.isSafeInteger(rupees) || rupees < 1 || rupees > MAX_PRICE_RUPEES) {
    return fail(
      "money.invalid_shelf_price",
      `A price is a whole number of rupees from 1 to ${MAX_PRICE_RUPEES}`,
      { priceRupees: typeof rupees === "number" ? rupees : String(rupees) }
    )
  }
  const parsed = ShelfPrice.safeParse(rupees * 100)
  if (!parsed.success) {
    return fail("money.invalid_shelf_price", "Not a shelf price", { priceRupees: rupees })
  }
  return ok(parsed.data)
}

/** A shelf price a Design can be sold at: a whole number of rupees, more than zero. */
export function isDesignShelfPrice(pricePaise: number | null | undefined): pricePaise is ShelfPrice {
  return typeof pricePaise === "number" && pricePaise > 0 && ShelfPrice.safeParse(pricePaise).success
}

const name = z.string().trim().min(1).max(200)
const description = z.string().trim().max(5000)

/** `POST /admin/shop/designs`. `priceRupees` is checked with `shelfPriceFromRupees`. */
export const CreateDesignInput = z.strictObject({
  name,
  description: description.default(""),
  attributes: DesignAttributesInput.prefault({}),
  photos: DesignPhotosInput.default([]),
  priceRupees: z.number(),
})
export type CreateDesignInput = z.infer<typeof CreateDesignInput>

/**
 * `POST /admin/shop/designs/:id`. Only the fields given change; the price has
 * its own route and the status changes only through publishing.
 * `trueColourConfirmed` re-confirms the true colour when the photos change.
 */
export const UpdateDesignInput = z
  .strictObject({
    name: name.optional(),
    description: description.optional(),
    attributes: DesignAttributesPatch.optional(),
    photos: DesignPhotosInput.optional(),
    trueColourConfirmed: z.boolean().optional(),
  })
  .refine((v) => Object.values(v).some((field) => field !== undefined), { message: "Nothing to change" })
export type UpdateDesignInput = z.infer<typeof UpdateDesignInput>

/** `POST /admin/shop/designs/:id/price`. `priceRupees` is checked with `shelfPriceFromRupees`. */
export const SetDesignPriceInput = z.strictObject({
  priceRupees: z.number(),
})
export type SetDesignPriceInput = z.infer<typeof SetDesignPriceInput>

/** `POST /admin/shop/designs/:id/publish`: the Owner's confirmation that the photos show the true colour. */
export const PublishDesignInput = z.strictObject({
  trueColourConfirmed: z.boolean().default(false),
})
export type PublishDesignInput = z.infer<typeof PublishDesignInput>

/**
 * What `publish-design` needs, in the order the page lists them:
 * `taxCode` when no tax code is set, `taxBand` when the code has no band now
 * or no band fits the price, `otherPhoto` for at least one photo besides the
 * close-up, `salesChannel` and `shippingProfile` for a product the kernel
 * can sell and ship (the store's default sales channel and shipping profile).
 */
export const PublishRequirement = z.enum([
  "fibre",
  "lengthM",
  "widthM",
  "taxCode",
  "taxBand",
  "shelfPrice",
  "fabricCloseUpPhoto",
  "otherPhoto",
  "trueColourConfirmation",
  "salesChannel",
  "shippingProfile",
])
export type PublishRequirement = z.infer<typeof PublishRequirement>

/** The kernel product status of a Design. A new Design is `draft`; only `publish-design` makes it `published`. */
export const DesignStatus = z.enum(["draft", "proposed", "published", "rejected"])
export type DesignStatus = z.infer<typeof DesignStatus>

/** The Owner's confirmation that the photos show the true colour: when and by which admin user. */
export const TrueColourConfirmation = z.object({
  at: IsoDateTime,
  by: Id,
})
export type TrueColourConfirmation = z.infer<typeof TrueColourConfirmation>

/** A Design as the Admin shows it. `id` is the kernel product id. */
export const AdminDesignView = z.object({
  id: Id,
  variantId: Id,
  name: z.string().min(1),
  description: z.string(),
  status: DesignStatus,
  /** The one Variant's shelf price in paise, or null when the kernel holds no rupee price. */
  pricePaise: ShelfPrice.nullable(),
  attributes: DesignAttributes,
  photos: z.array(DesignPhoto),
  trueColourConfirmation: TrueColourConfirmation.nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
})
export type AdminDesignView = z.infer<typeof AdminDesignView>

/** `GET /admin/shop/designs`, newest first. */
export const AdminDesignList = z.object({
  designs: z.array(AdminDesignView),
})
export type AdminDesignList = z.infer<typeof AdminDesignList>

/** One Design in a response: create, read, update, price. */
export const AdminDesignResponse = z.object({
  design: AdminDesignView,
})
export type AdminDesignResponse = z.infer<typeof AdminDesignResponse>

/** A signed link that shows an unpublished Design as a Shopper would see it, until `expiresAt` (Story 1.8). */
export const DesignPreviewLink = z.object({
  url: z.url({ protocol: /^https?$/ }),
  expiresAt: IsoDateTime,
})
export type DesignPreviewLink = z.infer<typeof DesignPreviewLink>

/**
 * The outcome of `POST /admin/shop/designs/:id/publish`. A refusal is the
 * error `design.not_publishable` (HTTP 400) whose `details` are
 * `NotPublishableDetails`; a success has `missing: []`.
 */
export const PublishDesignResult = z.object({
  design: AdminDesignView,
  missing: z.array(PublishRequirement),
})
export type PublishDesignResult = z.infer<typeof PublishDesignResult>

/** `details` of the `design.not_publishable` error: every missing item. */
export const NotPublishableDetails = z.object({
  missing: z.array(PublishRequirement).min(1),
})
export type NotPublishableDetails = z.infer<typeof NotPublishableDetails>

/** One row of a Variant's price history: written on every price set or change, never edited. */
export const PriceHistoryEntry = z.object({
  variantId: Id,
  oldPricePaise: Paise.nullable(),
  newPricePaise: ShelfPrice,
  changedAt: IsoDateTime,
  changedBy: Id,
})
export type PriceHistoryEntry = z.infer<typeof PriceHistoryEntry>

// ---------------------------------------------------------------------------
// Photo uploads: `POST /admin/shop/uploads` (multipart, field `files`).
// ---------------------------------------------------------------------------

/** The image types a photo may have. */
export const UPLOAD_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export type UploadImageType = (typeof UPLOAD_IMAGE_TYPES)[number]

/** The largest photo, in bytes (10 MB). */
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024

/** The most files in one upload. */
export const UPLOAD_MAX_FILES = MAX_DESIGN_PHOTOS

/** The most megabytes one photo may have, for messages. */
export const UPLOAD_MAX_MEGABYTES = UPLOAD_MAX_BYTES / (1024 * 1024)

/**
 * Why an upload was refused (`details.reason` of `upload.invalid_file`):
 * `too_large` (a file over `UPLOAD_MAX_BYTES`), `too_many_files` (more than
 * `UPLOAD_MAX_FILES`), `unexpected_field` (a field other than the files),
 * `no_file`, `not_an_image` (not a JPEG, PNG or WebP image that decodes, or
 * its stated type differs) or `unreadable` (a broken multipart body).
 */
export const UploadRefusalReason = z.enum([
  "too_large",
  "too_many_files",
  "unexpected_field",
  "no_file",
  "not_an_image",
  "unreadable",
])
export type UploadRefusalReason = z.infer<typeof UploadRefusalReason>

/** `details` of the `upload.invalid_file` error. */
export const UploadRefusalDetails = z.object({
  reason: UploadRefusalReason,
  file: z.string().optional(),
})
export type UploadRefusalDetails = z.infer<typeof UploadRefusalDetails>

/** The developer message of an upload refusal, with the limits filled in. */
export function uploadRefusalMessage(reason: UploadRefusalReason): string {
  const limits = `at most ${UPLOAD_MAX_FILES} JPEG, PNG or WebP photos of ${UPLOAD_MAX_MEGABYTES} MB or less each`
  return `The upload was refused (${reason}): send ${limits} in the field \`files\``
}

/** `GET /admin/shop/tax-codes`: the tax codes with a band in effect now, in order. */
export const TaxCodeList = z.object({
  taxCodes: z.array(TaxCode),
})
export type TaxCodeList = z.infer<typeof TaxCodeList>

/** A stored photo: the file id to reference from a Design and its public address. */
export const UploadedFile = z.object({
  id: Id,
  url: z.url({ protocol: /^https?$/ }),
})
export type UploadedFile = z.infer<typeof UploadedFile>

export const UploadResult = z.object({
  files: z.array(UploadedFile).min(1),
})
export type UploadResult = z.infer<typeof UploadResult>

/**
 * Parses a create request. The price is checked first, so a bad price fails
 * with `money.invalid_shelf_price`; any other problem is `input.invalid`.
 */
export function parseCreateDesignInput(body: unknown): Result<CreateDesignInput> {
  return parseWithPrice(CreateDesignInput, body)
}

/** Parses a price request: `money.invalid_shelf_price` for a bad price, `input.invalid` otherwise. */
export function parseSetDesignPriceInput(body: unknown): Result<SetDesignPriceInput> {
  return parseWithPrice(SetDesignPriceInput, body)
}

function parseWithPrice<T extends { priceRupees: number }>(schema: z.ZodType<T>, body: unknown): Result<T> {
  const priceRupees = body && typeof body === "object" ? (body as { priceRupees?: unknown }).priceRupees : undefined
  if (priceRupees !== undefined) {
    const price = shelfPriceFromRupees(priceRupees)
    if (!price.ok) return price
  }
  return parseInput(schema, body)
}

/** Parses a request body with a contract schema; `input.invalid` with the issues on failure. */
export function parseInput<T>(schema: z.ZodType<T>, body: unknown): Result<T> {
  const parsed = schema.safeParse(body ?? {})
  if (!parsed.success) {
    return fail("input.invalid", "The request does not match its schema", {
      issues: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    })
  }
  return ok(parsed.data)
}
