/**
 * Writes the kernel's publishable API key (created by the starter's initial
 * data seed during `medusa db:migrate`) to the file named by
 * PUBLISHABLE_KEY_FILE, so the website container can read it at start.
 * The compose stack runs this between migrations and `medusa start`.
 *
 *   PUBLISHABLE_KEY_FILE=/var/lib/shop/publishable-key medusa exec ./src/scripts/export-publishable-key.js
 *
 * A publishable key is public (browsers send it); it is not a secret.
 */
import { mkdir, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function exportPublishableKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const target = process.env.PUBLISHABLE_KEY_FILE
  if (!target) {
    logger.info("PUBLISHABLE_KEY_FILE is not set; nothing to export")
    return
  }

  const apiKeys = container.resolve(Modules.API_KEY)
  const keys = await apiKeys.listApiKeys(
    { type: "publishable" },
    { order: { created_at: "ASC" } }
  )
  const token = keys.find((key) => !key.revoked_at)?.token
  if (!token) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "No publishable API key exists; run `medusa db:migrate` first")
  }

  await mkdir(path.dirname(target), { recursive: true })
  const temporary = `${target}.tmp`
  await writeFile(temporary, token, { mode: 0o644 })
  await rename(temporary, target)
  logger.info(`Publishable API key written to ${target}`)
}
