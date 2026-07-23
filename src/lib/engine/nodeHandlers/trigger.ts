// ============================================================
// Trigger Node Handler (STUB)
//
// The Trigger node is the entry point of a workflow.
// It doesn't transform data — it simply passes through whatever
// initial data the workflow was started with (e.g. a manual
// trigger payload, webhook body, etc.).
// ============================================================

import { NodeHandlerInput, NodeHandlerOutput } from "../types";

export async function handleTrigger(input: NodeHandlerInput): Promise<NodeHandlerOutput> {
  return {
    output: {
      ...input.data,
      _triggeredBy: input.config.triggerType || "MANUAL",
      _triggeredAt: new Date().toISOString(),
    },
  };
}
