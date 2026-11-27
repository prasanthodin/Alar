import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { SPIKE_EVENT, spikeRecordEventWorkflow } from "../workflows/spike-redis"

/**
 * Records that a spike event travelled through the Redis event bus by running
 * a one-step workflow whose stored run the spike script reads back.
 */
export default async function spikeRedisPing({ event, container }: SubscriberArgs<{ nonce: string }>) {
  const nonce = event.data?.nonce
  if (typeof nonce !== "string" || !nonce) {
    return
  }
  await spikeRecordEventWorkflow(container).run({
    input: { nonce },
    context: { transactionId: `spike-event-${nonce}` },
  })
}

export const config: SubscriberConfig = {
  event: SPIKE_EVENT,
}
