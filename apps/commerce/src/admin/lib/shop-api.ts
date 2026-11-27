import {
  AdminDesignList,
  AdminDesignStockResponse,
  AdminDesignResponse,
  ApiError,
  NotPublishableDetails,
  PublishDesignResult,
  TaxCodeList,
  UploadRefusalDetails,
  UploadResult,
  type DesignAttributesInput,
  type DesignPhotoInput,
  type PublishRequirement,
  type UploadRefusalReason,
  type UpdateDesignInput,
} from "@shop/contracts"

/** A stock change as the Stock section sends it: an absolute target or a signed change, with the reason. */
export type AdjustStockRequest = ({ set: number } | { delta: number }) & { reason: string }

/** A contract schema, as far as this client uses it. */
type Schema<T> = { safeParse(value: unknown): { success: true; data: T } | { success: false } }

/** The create request as the form sends it (left-out attributes are empty). */
export type CreateDesignRequest = {
  name: string
  description: string
  attributes: DesignAttributesInput
  photos: DesignPhotoInput[]
  priceRupees: number
}

/**
 * The shop's admin API (`/admin/shop/*`), called with the dashboard's session
 * cookie. The Designs page calls nothing else; kernel product and stock
 * writes are refused by the route allow-list.
 */

/** A refused call: the shop error envelope. */
export class ShopApiError extends Error {
  readonly error: ApiError
  constructor(error: ApiError) {
    super(error.message)
    this.error = error
  }

  /** The missing items of a `design.not_publishable` refusal, or an empty list. */
  get missing(): PublishRequirement[] {
    if (this.error.code !== "design.not_publishable") return []
    const parsed = NotPublishableDetails.safeParse(this.error.details)
    return parsed.success ? parsed.data.missing : []
  }

  /** Which upload limit an `upload.invalid_file` refusal hit, or null. */
  get uploadReason(): UploadRefusalReason | null {
    if (this.error.code !== "upload.invalid_file") return null
    const parsed = UploadRefusalDetails.safeParse(this.error.details)
    return parsed.success ? parsed.data.reason : null
  }
}

async function call<T>(schema: Schema<T>, path: string, init: RequestInit = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: isForm ? init.headers : { "content-type": "application/json", accept: "application/json", ...init.headers },
  })
  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const parsed = ApiError.safeParse(body)
    throw new ShopApiError(parsed.success ? parsed.data : { code: "internal", message: `HTTP ${res.status}` })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw new ShopApiError({ code: "response.invalid", message: "Unexpected response" })
  return parsed.data
}

const json = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) })

export const shopApi = {
  listDesigns: () => call(AdminDesignList, "/admin/shop/designs"),
  listTaxCodes: () => call(TaxCodeList, "/admin/shop/tax-codes"),
  getDesign: (id: string) => call(AdminDesignResponse, `/admin/shop/designs/${encodeURIComponent(id)}`),
  createDesign: (input: CreateDesignRequest) =>
    call(AdminDesignResponse, "/admin/shop/designs", json(input)),
  updateDesign: (id: string, input: UpdateDesignInput) =>
    call(AdminDesignResponse, `/admin/shop/designs/${encodeURIComponent(id)}`, json(input)),
  setPrice: (id: string, priceRupees: number) =>
    call(AdminDesignResponse, `/admin/shop/designs/${encodeURIComponent(id)}/price`, json({ priceRupees })),
  publish: (id: string, trueColourConfirmed: boolean) =>
    call(PublishDesignResult, `/admin/shop/designs/${encodeURIComponent(id)}/publish`, json({ trueColourConfirmed })),
  getStock: (id: string) => call(AdminDesignStockResponse, `/admin/shop/designs/${encodeURIComponent(id)}/stock`),
  adjustStock: (id: string, input: AdjustStockRequest) =>
    call(AdminDesignStockResponse, `/admin/shop/designs/${encodeURIComponent(id)}/stock`, json(input)),
  uploadPhotos: (files: File[]) => {
    const form = new FormData()
    for (const file of files) form.append("files", file)
    return call(UploadResult, "/admin/shop/uploads", { method: "POST", body: form })
  },
}
