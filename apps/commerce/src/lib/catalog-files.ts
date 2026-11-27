import { MedusaError } from "@medusajs/framework/utils"
import { parseEnv } from "../env"

/**
 * The public address of a file in the `catalog` bucket, derived the way the
 * kernel's S3 file provider derives it on upload: `S3_FILE_URL` and the file
 * key, each path segment URL-encoded.
 */
export function catalogFileUrl(fileId: string, env: Record<string, string | undefined> = process.env): string {
  const parsed = parseEnv(env)
  if (!parsed.ok) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "File storage is not configured", "internal")
  }
  return `${parsed.env.S3_FILE_URL}/${fileId.split("/").map(encodeURIComponent).join("/")}`
}
