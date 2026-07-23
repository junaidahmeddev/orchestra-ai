// ============================================================
// Integration Node Handler (STUB)
//
// In Phase 6, this will make real HTTP requests to external
// APIs (SendGrid, webhooks, generic REST endpoints) using the
// config's method and endpoint. For now, it returns a
// placeholder response.
// ============================================================

import { NodeHandlerInput, NodeHandlerOutput } from "../types";

export async function handleIntegration(input: NodeHandlerInput): Promise<NodeHandlerOutput> {
  const method = input.config.method || "POST";
  const endpoint = input.config.endpoint || "https://api.example.com";

  return {
    output: {
      result: `[Integration response placeholder — ${method} ${endpoint}]`,
      status: 200,
      method,
      endpoint,
      upstreamData: input.data,
    },
  };
}
