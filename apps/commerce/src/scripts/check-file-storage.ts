/**
 * Uploads a small public file through the kernel's file module (the S3
 * provider) and prints its public address and SHA-256, so a caller outside the
 * container can fetch it and compare the bytes. Used by scripts/compose-smoke.sh.
 *
 *   medusa exec ./src/scripts/check-file-storage.ts
 *
 * Output lines: FILE_URL=<public address> and FILE_SHA256=<hex digest>.
 */
import { createHash, randomUUID } from "node:crypto"
import { Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function checkFileStorage({ container }: ExecArgs) {
  const files = container.resolve(Modules.FILE)
  const content = Buffer.from(`file storage check ${randomUUID()}\n`, "utf8")

  const [file] = await files.createFiles([
    {
      filename: "storage-check.txt",
      mimeType: "text/plain",
      content: content.toString("base64"),
      access: "public",
    },
  ])

  console.log(`FILE_URL=${file.url}`)
  console.log(`FILE_SHA256=${createHash("sha256").update(content).digest("hex")}`)
}
