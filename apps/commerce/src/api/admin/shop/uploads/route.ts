import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { UploadResult, UPLOAD_IMAGE_TYPES, type ApiError } from "@shop/contracts"
import { detectImageType, imageExtension } from "../../../../lib/image-type"
import { sendEnvelope } from "../../../../lib/shop-errors"

/** A safe file name: the original's letters, digits and dashes (at most 60), with the detected extension. */
function fileName(original: string, extension: string): string {
  const base = original
    .replace(/\.[^.]*$/, "")
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return `${base || "photo"}.${extension}`
}

/**
 * POST /admin/shop/uploads (multipart, field `files`): stores Design photos
 * through the kernel's file module in the public `catalog` bucket and returns
 * each file's id and public address (`UploadResult`). Only JPEG, PNG and WebP
 * photos of 10 MB or less, whose bytes match their type, are accepted; any
 * other file refuses the whole upload with 400 `upload.invalid_file`.
 * Size and count limits are applied while reading (`photoUpload` middleware).
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<UploadResult | ApiError>) {
  const files = (req.files ?? []) as Express.Multer.File[]
  if (!Array.isArray(files) || files.length === 0) {
    return sendEnvelope(res, { code: "upload.invalid_file", message: "No photo was sent (field `files`)" })
  }
  const accepted = []
  for (const file of files) {
    const type = detectImageType(file.buffer)
    if (!type || file.mimetype !== type || !(UPLOAD_IMAGE_TYPES as readonly string[]).includes(file.mimetype)) {
      return sendEnvelope(res, {
        code: "upload.invalid_file",
        message: "Only JPEG, PNG and WebP photos are accepted",
        details: { file: file.originalname, type: file.mimetype },
      })
    }
    accepted.push({
      filename: fileName(file.originalname, imageExtension(type)),
      mimeType: type,
      content: file.buffer.toString("base64"),
      access: "public" as const,
    })
  }
  const { result } = await uploadFilesWorkflow(req.scope).run({ input: { files: accepted } })
  res.status(201).json(UploadResult.parse({ files: result.map((f) => ({ id: f.id, url: f.url })) }))
}
