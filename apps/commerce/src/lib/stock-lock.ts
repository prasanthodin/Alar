import { randomUUID } from "node:crypto"
import { setTimeout as sleep } from "node:timers/promises"
import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { shopError } from "./shop-errors"

/**
 * The stock lock (AD-6): every workflow that changes a stock quantity takes
 * it on each inventory item it touches, on Redis through the kernel's locking
 * module, before it reads the quantity and until it has written the change
 * and its stock-movement row. Later stock workflows (`begin-checkout`,
 * `confirm-payment`, `release-hold`, `fulfil-order`, `cancel-order`,
 * `restock-return`) reuse these steps.
 */

/** How long to wait for a stock lock before refusing with `stock.lock_timeout`. */
export const STOCK_LOCK_TIMEOUT_MS = 5_000

/** How long a held stock lock lives if its holder dies without releasing it. */
export const STOCK_LOCK_TTL_SECONDS = 30

/** The pause between two attempts to take a held lock. */
const RETRY_INTERVAL_MS = 50

/** The lock key of one inventory item. */
export function stockLockKey(inventoryItemId: string): string {
  return `shop-stock:${inventoryItemId}`
}

/** The keys for these inventory items: one each, sorted, so two workflows never wait on each other in a circle. */
export function stockLockKeys(inventoryItemIds: readonly string[]): string[] {
  return [...new Set(inventoryItemIds)].sort().map(stockLockKey)
}

/** Held stock locks: the keys and the owner that holds them (unique per acquisition). */
export type StockLocks = { keys: string[]; ownerId: string }

export type StockLockOptions = {
  /** How long to wait for all the locks; default `STOCK_LOCK_TIMEOUT_MS`. */
  timeoutMs?: number
  /** How long the locks live without a release; default `STOCK_LOCK_TTL_SECONDS`. */
  ttlSeconds?: number
}

/** The locking provider's refusal when a key is held by another owner. */
const isHeldElsewhere = (e: unknown) =>
  Boolean(e) && typeof e === "object" && (e as { type?: unknown }).type === MedusaError.Types.CONFLICT

/**
 * Takes the stock lock of every inventory item, one key at a time in sorted
 * order. A key held by another owner is retried until the time limit; then
 * the keys already taken are released and `stock.lock_timeout` is thrown.
 * Any other locking failure is rethrown as it is, after the same release.
 */
export async function acquireStockLocks(
  container: MedusaContainer,
  inventoryItemIds: readonly string[],
  options: StockLockOptions = {}
): Promise<StockLocks> {
  const locking = container.resolve(Modules.LOCKING)
  const keys = stockLockKeys(inventoryItemIds)
  const ownerId = `shop-stock:${randomUUID()}`
  const deadline = Date.now() + (options.timeoutMs ?? STOCK_LOCK_TIMEOUT_MS)
  const expire = options.ttlSeconds ?? STOCK_LOCK_TTL_SECONDS
  const taken: string[] = []
  try {
    for (const key of keys) {
      for (;;) {
        try {
          await locking.acquire(key, { ownerId, expire })
          taken.push(key)
          break
        } catch (e) {
          if (!isHeldElsewhere(e)) throw e
          if (Date.now() >= deadline) {
            throw shopError("stock.lock_timeout", "The stock lock could not be taken in time", {
              inventoryItemIds: [...new Set(inventoryItemIds)].sort(),
            })
          }
          await sleep(RETRY_INTERVAL_MS)
        }
      }
    }
  } catch (e) {
    if (taken.length) await locking.release(taken, { ownerId }).catch(() => undefined)
    throw e
  }
  return { keys, ownerId }
}

/**
 * Releases held stock locks. Never throws: a lock that cannot be released
 * expires by itself after its time to live, and a failed release must not
 * undo a change that has been written with its stock-movement row.
 */
export async function releaseStockLocks(container: MedusaContainer, locks: StockLocks | null | undefined): Promise<void> {
  if (!locks?.keys.length) return
  try {
    await container.resolve(Modules.LOCKING).release(locks.keys, { ownerId: locks.ownerId })
  } catch (e) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.warn(`stock-lock: could not release ${locks.keys.join(", ")}; they expire by themselves (${(e as Error).message})`)
  }
}

/** Runs `fn` while holding the stock locks of these inventory items, and releases them afterwards. */
export async function withStockLocks<T>(
  container: MedusaContainer,
  inventoryItemIds: readonly string[],
  fn: () => Promise<T>,
  options: StockLockOptions = {}
): Promise<T> {
  const locks = await acquireStockLocks(container, inventoryItemIds, options)
  try {
    return await fn()
  } finally {
    await releaseStockLocks(container, locks)
  }
}

export type AcquireStockLocksStepInput = { inventoryItemIds: string[] } & StockLockOptions

/**
 * Workflow step: takes the stock locks (see `acquireStockLocks`). If a later
 * step fails, its compensation releases them after the later steps have
 * been undone.
 */
export const acquireStockLocksStep = createStep(
  "acquire-stock-locks",
  async (input: AcquireStockLocksStepInput, { container }) => {
    const locks = await acquireStockLocks(container, input.inventoryItemIds, input)
    return new StepResponse(locks, locks)
  },
  async (locks, { container }) => {
    await releaseStockLocks(container, locks)
  }
)

/** Workflow step: releases the stock locks taken by `acquireStockLocksStep`. Never fails. */
export const releaseStockLocksStep = createStep(
  "release-stock-locks",
  async (locks: StockLocks, { container }) => {
    await releaseStockLocks(container, locks)
    return new StepResponse(true)
  }
)
