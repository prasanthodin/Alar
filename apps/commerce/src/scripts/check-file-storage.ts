/**
 * Uploads a small public file through the kernel's file module (the S3
 * provider) and prints its public address and SHA-256, so a caller outside the
 * container can fetch it and compare the bytes. Used by scripts/compose-smoke.sh.
 *
 *   medusa exec ./src/scripts/check-file-storage.ts
 *
 * Output lines: FILE_URL=<public address> and FILE_SHA256=<hex digest>.
 *
 * With `keep` (`medusa exec ./src/scripts/check-file-storage.js keep`) the file
 * stays so the caller can fetch it, and FILE_ID=<id> is printed for
 * `delete <id>` afterwards. Without `keep` the file is fetched here from its
 * public address and deleted, so nothing is left in the bucket. (Plain words,
 * because `medusa exec` rejects unknown --options.)
 */
import { createHash, randomUUID } from "node:crypto"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function checkFileStorage({ container, args }: ExecArgs) {
  const files = container.resolve(Modules.FILE)

  const deleteIndex = args.indexOf("delete")
  if (deleteIndex !== -1) {
    const id = args[deleteIndex + 1]
    if (!id) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, "delete needs a file id")
    }
    await files.deleteFiles(id)
    console.log(`FILE_DELETED=${id}`)
    return
  }
  const content = Buffer.from(`file storage check ${randomUUID()}\n`, "utf8")

  const [file] = await files.createFiles([
    {
      filename: "storage-check.txt",
      mimeType: "text/plain",
      content: content.toString("base64"),
      access: "public",
    },
  ])

  const sha256 = createHash("sha256").update(content).digest("hex")
  console.log(`FILE_URL=${file.url}`)
  console.log(`FILE_SHA256=${sha256}`)

  if (args.includes("keep")) {
    console.log(`FILE_ID=${file.id}`)
    return
  }
  try {
    const res = await fetch(file.url)
    const fetched = createHash("sha256").update(Buffer.from(await res.arrayBuffer())).digest("hex")
    if (res.status !== 200 || fetched !== sha256) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `GET ${file.url} returned ${res.status}${fetched === sha256 ? "" : " with different bytes"}`
      )
    }
    console.log("FILE_FETCHED=OK")
  } finally {
    await files.deleteFiles(file.id)
    console.log(`FILE_DELETED=${file.id}`)
  }
}
