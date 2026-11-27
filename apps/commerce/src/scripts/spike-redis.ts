/**
 * Spike item 3 (local part): proves the kernel's Redis modules on the running
 * stack — an event travels through the event bus to a subscriber, a workflow
 * runs on the workflow engine, and a lock is taken and released. Prints one OK
 * or FAIL line per item and exits non-zero if any item fails.
 *
 *   medusa exec ./src/scripts/spike-redis.ts          (from apps/commerce)
 *   docker compose -f infra/compose.yaml exec commerce medusa exec ./src/scripts/spike-redis.js
 *
 * The event is handled by the shared-mode commerce process (this script runs
 * with MEDUSA_WORKER_MODE=server, which `medusa exec` sets), so commerce must
 * be running. It changes no business state.
 */
import { randomUUID } from "node:crypto"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import {
  SPIKE_EVENT,
  SPIKE_ONE_STEP_WORKFLOW,
  SPIKE_RECORD_EVENT_WORKFLOW,
} from "../workflows/spike-redis"

const EVENT_TIMEOUT_MS = 30_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function errorText(err: unknown): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`
  }
  return String(err)
}

export default async function spikeRedis({ container }: ExecArgs) {
  const nonce = randomUUID()
  const failures: string[] = []
  const eventBus = container.resolve(Modules.EVENT_BUS)
  const engine = container.resolve(Modules.WORKFLOW_ENGINE)
  const locking = container.resolve(Modules.LOCKING)

  async function check(component: string, run: () => Promise<string>) {
    try {
      const detail = await run()
      console.log(`OK   ${component}: ${detail}`)
    } catch (err) {
      console.log(`FAIL ${component}: ${errorText(err)}`)
      failures.push(component)
    }
  }

  async function storedRunIsDone(workflowId: string, transactionId: string) {
    const runs = await engine.listWorkflowExecutions({
      workflow_id: workflowId,
      transaction_id: transactionId,
    })
    return runs.some((run) => run.state === "done")
  }

  await check("event bus (event-bus-redis)", async () => {
    const service = eventBus.constructor.name
    if (service !== "RedisEventBusService") {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `the event bus is ${service}, not the Redis module`)
    }
    await eventBus.emit({ name: SPIKE_EVENT, data: { nonce } })
    const transactionId = `spike-event-${nonce}`
    const deadline = Date.now() + EVENT_TIMEOUT_MS
    while (Date.now() < deadline) {
      if (await storedRunIsDone(SPIKE_RECORD_EVENT_WORKFLOW, transactionId)) {
        return `${SPIKE_EVENT} emitted and received by its subscriber`
      }
      await sleep(250)
    }
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `${SPIKE_EVENT} was not received within ${EVENT_TIMEOUT_MS / 1000} s`)
  })

  await check("workflow engine (workflow-engine-redis)", async () => {
    const transactionId = `spike-run-${nonce}`
    const { result } = await engine.run(SPIKE_ONE_STEP_WORKFLOW, {
      input: { nonce },
      transactionId,
    })
    if ((result as { nonce?: string } | undefined)?.nonce !== nonce) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `unexpected result ${JSON.stringify(result)}`)
    }
    if (!(await storedRunIsDone(SPIKE_ONE_STEP_WORKFLOW, transactionId))) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "the finished run was not stored")
    }
    return `${SPIKE_ONE_STEP_WORKFLOW} ran and finished`
  })

  await check("locking (locking-redis)", async () => {
    const provider = String((locking as unknown as { defaultProviderId?: string }).defaultProviderId)
    if (!provider.includes("locking-redis")) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `the default locking provider is ${provider}, not locking-redis`)
    }
    const key = `spike-redis-${nonce}`
    await locking.acquire(key, { ownerId: "spike-a", expire: 30 })

    let blocked = false
    try {
      await locking.acquire(key, { ownerId: "spike-b", expire: 30 })
    } catch (err) {
      // Only a lock conflict counts; anything else (such as Redis being down) is a failure.
      if ((err as { type?: string }).type !== MedusaError.Types.CONFLICT) {
        throw err
      }
      blocked = true
    }
    if (!blocked) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "a second owner took a lock that was held")
    }

    if (!(await locking.release(key, { ownerId: "spike-a" }))) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "the lock was not released")
    }
    await locking.acquire(key, { ownerId: "spike-b", expire: 30 })
    await locking.release(key, { ownerId: "spike-b" })
    return "lock taken, refused to a second owner, released and taken again"
  })

  if (failures.length > 0) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Spike failed: ${failures.join(", ")}`)
  }
  console.log("SPIKE OK")
}
