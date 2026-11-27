import sharp from "sharp"
import type { UploadImageType } from "@shop/contracts"
import { detectImageType } from "./image-type"

const SHARP_FORMAT: Record<UploadImageType, "jpeg" | "png" | "webp"> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
}

/**
 * A photo ready to be made public: decoded, turned upright from its EXIF
 * orientation, converted to sRGB and re-encoded in the same format with all
 * metadata (EXIF with GPS position and device, XMP, IPTC, ICC) removed.
 * Returns null when the bytes are not a JPEG, PNG or WebP image that decodes,
 * or when the type the browser stated differs from the bytes. Only the first
 * frame of an animated image is kept.
 */
export async function normalisePhoto(
  bytes: Buffer,
  statedType: string
): Promise<{ type: UploadImageType; bytes: Buffer } | null> {
  const type = detectImageType(bytes)
  if (!type || type !== statedType) return null
  try {
    const image = sharp(bytes, { failOn: "error" })
    const meta = await image.metadata()
    if (meta.format !== SHARP_FORMAT[type]) return null
    // sharp keeps no metadata unless asked (no keepMetadata/withMetadata here).
    const out = await image.rotate().toFormat(SHARP_FORMAT[type], { quality: 90 }).toBuffer()
    return { type, bytes: out }
  } catch {
    return null
  }
}
