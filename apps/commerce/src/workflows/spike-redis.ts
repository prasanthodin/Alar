import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

/**
 * Two tiny workflows for the Redis 8 spike (Story 1.3, spike item 3). They
 * change no business state. Finished runs are kept for an hour so the spike
 * script can read them back from another process.
 */

export const SPIKE_EVENT = "shop.spike.ping"
export const SPIKE_ONE_STEP_WORKFLOW = "spike-one-step"
export const SPIKE_RECORD_EVENT_WORKFLOW = "spike-record-event"

const RETENTION_SECONDS = 60 * 60

type SpikeInput = { nonce: string }

const spikeEchoStep = createStep("spike-echo", async (input: SpikeInput) => {
  return new StepResponse({ nonce: input.nonce })
})

export const spikeOneStepWorkflow = createWorkflow(
  { name: SPIKE_ONE_STEP_WORKFLOW, store: true, retentionTime: RETENTION_SECONDS },
  (input: SpikeInput) => new WorkflowResponse(spikeEchoStep(input))
)

const spikeRecordStep = createStep("spike-record", async (input: SpikeInput) => {
  return new StepResponse({ nonce: input.nonce })
})

/** Run by the spike subscriber; the stored run is the record that the event arrived. */
export const spikeRecordEventWorkflow = createWorkflow(
  { name: SPIKE_RECORD_EVENT_WORKFLOW, store: true, retentionTime: RETENTION_SECONDS },
  (input: SpikeInput) => new WorkflowResponse(spikeRecordStep(input))
)
