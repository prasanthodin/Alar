import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { UPLOAD_MAX_BYTES, UPLOAD_MAX_FILES } from "@shop/contracts"
import multer from "multer"
import { sendEnvelope } from "./shop-errors"

/** Reads up to `UPLOAD_MAX_FILES` photos of at most `UPLOAD_MAX_BYTES` each into memory (the kernel's upload pattern). */
const readPhotos = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_BYTES, files: UPLOAD_MAX_FILES, fields: 0 },
}).array("files", UPLOAD_MAX_FILES)

/**
 * The multipart reader of `POST /admin/shop/uploads`. A file over the size
 * limit, too many files or any other multipart problem is answered with 400
 * `upload.invalid_file` before the route runs; nothing is stored.
 */
export function photoUpload(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  readPhotos(req as never, res as never, (err?: unknown) => {
    if (!err) return next()
    const reason = err instanceof multer.MulterError ? err.code : "UNREADABLE"
    sendEnvelope(res, {
      code: "upload.invalid_file",
      message: "The upload was refused: use at most 12 JPEG, PNG or WebP photos of 10 MB or less each",
      details: { reason },
    })
  })
}
