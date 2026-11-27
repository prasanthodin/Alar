import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { UPLOAD_MAX_BYTES, UPLOAD_MAX_FILES, uploadRefusalMessage, type UploadRefusalReason } from "@shop/contracts"
import multer from "multer"
import { sendEnvelope } from "./shop-errors"

/** Reads up to `UPLOAD_MAX_FILES` photos of at most `UPLOAD_MAX_BYTES` each into memory (the kernel's upload pattern). */
const readPhotos = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_BYTES, files: UPLOAD_MAX_FILES, fields: 0 },
}).array("files", UPLOAD_MAX_FILES)

/** The refusal reason of a multer error. */
export function uploadReasonOf(err: unknown): UploadRefusalReason {
  const code = err instanceof multer.MulterError ? err.code : undefined
  switch (code) {
    case "LIMIT_FILE_SIZE":
      return "too_large"
    case "LIMIT_FILE_COUNT":
      return "too_many_files"
    case "LIMIT_UNEXPECTED_FILE":
      // multer reports a file over the count of `array("files", max)` this way too.
      return (err as multer.MulterError).field === "files" ? "too_many_files" : "unexpected_field"
    case "LIMIT_FIELD_KEY":
    case "LIMIT_FIELD_VALUE":
    case "LIMIT_FIELD_COUNT":
    case "LIMIT_PART_COUNT":
      return "unexpected_field"
    default:
      return "unreadable"
  }
}

/**
 * The multipart reader of `POST /admin/shop/uploads`. A file over the size
 * limit, too many files, a field other than the files or any other multipart
 * problem is answered with 400 `upload.invalid_file` (`details.reason`)
 * before the route runs; nothing is stored.
 */
export function photoUpload(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  readPhotos(req as never, res as never, (err?: unknown) => {
    if (!err) return next()
    const reason = uploadReasonOf(err)
    sendEnvelope(res, { code: "upload.invalid_file", message: uploadRefusalMessage(reason), details: { reason } })
  })
}
