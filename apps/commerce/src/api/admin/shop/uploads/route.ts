import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { uploadRefusalMessage, UploadResult, type ApiError } from "@shop/contracts"
import { imageExtension } from "../../../../lib/image-type"
import { normalisePhoto } from "../../../../lib/photo-normalise"
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
 * each file's id and public address (`UploadResult`). Each photo must be a
 * JPEG, PNG or WebP image that decodes and whose bytes match its stated type;
 * it is turned upright and re-encoded in the same format with all metadata
 * (EXIF with GPS and device, XMP, ICC) removed before it is stored. Any other
 * file refuses the whole upload with 400 `upload.invalid_file`
 * (`details.reason`) and nothing is stored. Size, count and field limits are
 * applied while reading (`photoUpload` middleware).
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<UploadResult | ApiError>) {
  const files = (req.files ?? []) as Express.Multer.File[]
  if (!Array.isArray(files) || files.length === 0) {
    return sendEnvelope(res, {
      code: "upload.invalid_file",
      message: uploadRefusalMessage("no_file"),
      details: { reason: "no_file" },
    })
  }
  const accepted = []
  for (const file of files) {
    const photo = await normalisePhoto(file.buffer, file.mimetype)
    if (!photo) {
      return sendEnvelope(res, {
        code: "upload.invalid_file",
        message: uploadRefusalMessage("not_an_image"),
        details: { reason: "not_an_image", file: file.originalname },
      })
    }
    accepted.push({
      filename: fileName(file.originalname, imageExtension(photo.type)),
      mimeType: photo.type,
      content: photo.bytes.toString("base64"),
      access: "public" as const,
    })
  }
  const { result } = await uploadFilesWorkflow(req.scope).run({ input: { files: accepted } })
  res.status(201).json(UploadResult.parse({ files: result.map((f) => ({ id: f.id, url: f.url })) }))
}
