import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { listExpiredLiveHolds } from "../lib/holds"
import { releaseHoldWorkflow } from "../workflows/release-hold"

/** The most expired Holds one run releases; the rest wait a minute for the next run. */
export const RELEASE_EXPIRED_HOLDS_BATCH = 100

/**
 * Every minute (Story 1.9): releases each live Hold whose time has run out,
 * through `release-hold` with the reason `expired` (its Checkout becomes
 * `expired`, its Pieces return to stock). One Hold failing does not stop the
 * others; it is logged by id only and tried again on the next run.
 * `release-hold` is idempotent, so a Hold the Shopper cancels meanwhile, or
 * one two runs both pick, is released once.
 */
export default async function releaseExpiredHolds(container: MedusaContainer, now: Date = new Date()) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const expired = await listExpiredLiveHolds(container, now, RELEASE_EXPIRED_HOLDS_BATCH)
  let released = 0
  for (const hold of expired) {
    try {
      const { result } = await releaseHoldWorkflow(container).run({ input: { holdId: hold.id, reason: "expired" } })
      if (result.released) released++
    } catch (e) {
      logger.error(`holds: could not release expired hold ${hold.id}: ${(e as Error)?.message ?? "unknown error"}`)
    }
  }
  if (released) logger.info(`holds: released ${released} expired hold(s)`)
  return { found: expired.length, released }
}

export const config = {
  name: "release-expired-holds",
  schedule: "* * * * *",
}
