import { describe, expect, it, vi } from "vitest"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { acquireStockLocks, releaseStockLocks, stockLockKey, stockLockKeys, withStockLocks } from "../stock-lock"

/** A locking module that refuses keys held by another owner, like the Redis provider. */
function fakeLocking(held: Record<string, string> = {}) {
  const locks = new Map(Object.entries(held))
  return {
    locks,
    acquire: vi.fn(async (key: string, args: { ownerId: string }) => {
      const owner = locks.get(key)
      if (owner && owner !== args.ownerId) {
        throw new MedusaError(MedusaError.Types.CONFLICT, `Failed to acquire lock for key "${key}"`)
      }
      locks.set(key, args.ownerId)
    }),
    release: vi.fn(async (keys: string | string[], args: { ownerId: string }) => {
      for (const key of Array.isArray(keys) ? keys : [keys]) if (locks.get(key) === args.ownerId) locks.delete(key)
      return true
    }),
  }
}

function container(locking: ReturnType<typeof fakeLocking>, logger = { warn: vi.fn() }) {
  return { resolve: (key: string) => (key === Modules.LOCKING ? locking : logger) } as never
}

describe("stock lock keys", () => {
  it("names one key per inventory item, without repeats, sorted", () => {
    expect(stockLockKey("iitem_1")).toBe("shop-stock:iitem_1")
    expect(stockLockKeys(["iitem_b", "iitem_a", "iitem_b"])).toEqual(["shop-stock:iitem_a", "shop-stock:iitem_b"])
  })
})

describe("acquireStockLocks", () => {
  it("takes every key with one owner unique to this acquisition, and releases them", async () => {
    const locking = fakeLocking()
    const a = await acquireStockLocks(container(locking), ["iitem_2", "iitem_1"])
    const b = await acquireStockLocks(container(locking), ["iitem_3"])
    expect(a.keys).toEqual(["shop-stock:iitem_1", "shop-stock:iitem_2"])
    expect(a.ownerId).not.toBe(b.ownerId)
    expect(locking.acquire).toHaveBeenCalledWith("shop-stock:iitem_1", expect.objectContaining({ expire: 120 }))
    await releaseStockLocks(container(locking), a)
    expect([...locking.locks.keys()]).toEqual(["shop-stock:iitem_3"])
  })

  it("refuses with stock.lock_timeout when a key stays held past the limit, and gives back the keys it took", async () => {
    const locking = fakeLocking({ "shop-stock:iitem_2": "someone-else" })
    const err = await acquireStockLocks(container(locking), ["iitem_1", "iitem_2"], { timeoutMs: 120 }).catch((e) => e)
    expect(err).toMatchObject({ code: "stock.lock_timeout" })
    expect([...locking.locks.entries()]).toEqual([["shop-stock:iitem_2", "someone-else"]])
  })

  it("waits for a key that is released before the limit", async () => {
    const locking = fakeLocking({ "shop-stock:iitem_1": "someone-else" })
    setTimeout(() => locking.locks.delete("shop-stock:iitem_1"), 100)
    const locks = await acquireStockLocks(container(locking), ["iitem_1"], { timeoutMs: 2_000 })
    expect(locking.locks.get("shop-stock:iitem_1")).toBe(locks.ownerId)
  })

  it("does not wait past the limit for an attempt that hangs, and gives back a key it takes late", async () => {
    const locking = fakeLocking()
    let finish: () => void = () => undefined
    locking.acquire.mockImplementationOnce(
      (key: string, args: { ownerId: string }) =>
        new Promise<void>((resolve) => {
          finish = () => {
            locking.locks.set(key, args.ownerId)
            resolve()
          }
        })
    )
    const started = Date.now()
    const err = await acquireStockLocks(container(locking), ["iitem_1"], { timeoutMs: 150 }).catch((e) => e)
    expect(err).toMatchObject({ code: "stock.lock_timeout" })
    expect(Date.now() - started).toBeLessThan(1_000)
    finish()
    await new Promise((r) => setTimeout(r, 10))
    expect(locking.locks.size).toBe(0)
  })

  it("rethrows a locking failure that is not a held key at once", async () => {
    const locking = fakeLocking()
    locking.acquire.mockRejectedValueOnce(new Error("redis down"))
    await expect(acquireStockLocks(container(locking), ["iitem_1"], { timeoutMs: 5_000 })).rejects.toThrow("redis down")
    expect(locking.acquire).toHaveBeenCalledTimes(1)
  })
})

describe("releaseStockLocks and withStockLocks", () => {
  it("never throws on release; a failed release is logged and the lock expires by itself", async () => {
    const locking = fakeLocking()
    const logger = { warn: vi.fn() }
    locking.release.mockRejectedValueOnce(new Error("redis down"))
    await expect(releaseStockLocks(container(locking, logger), { keys: ["shop-stock:x"], ownerId: "o" })).resolves.toBeUndefined()
    expect(logger.warn).toHaveBeenCalled()
  })

  it("runs the job under the locks and releases them even when it fails", async () => {
    const locking = fakeLocking()
    const seen: string[] = []
    await expect(
      withStockLocks(container(locking), ["iitem_1"], async () => {
        seen.push(...locking.locks.keys())
        throw new Error("job failed")
      })
    ).rejects.toThrow("job failed")
    expect(seen).toEqual(["shop-stock:iitem_1"])
    expect(locking.locks.size).toBe(0)
  })
})
