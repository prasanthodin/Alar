import type { UploadImageType } from "@shop/contracts"

/**
 * The image type of a file from its first bytes, or null when it is not a
 * JPEG, PNG or WebP image. The type a browser sends is not trusted: a photo
 * is accepted only when its bytes and its stated type agree.
 */
export function detectImageType(bytes: Uint8Array): UploadImageType | null {
  const at = (i: number) => bytes[i]
  const ascii = (start: number, text: string) =>
    [...text].every((ch, i) => at(start + i) === ch.charCodeAt(0))

  if (bytes.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "image/jpeg"
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (bytes.length >= png.length && png.every((b, i) => at(i) === b)) return "image/png"
  if (bytes.length >= 12 && ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp"
  return null
}

/** The file name extension for an accepted image type. */
export function imageExtension(type: UploadImageType): string {
  return type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp"
}
