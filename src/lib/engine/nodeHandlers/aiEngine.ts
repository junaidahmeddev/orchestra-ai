// ============================================================
// AI Engine Node Handler (STUB)
//
// In Phase 6, this will call the Vercel AI SDK with the user's
// chosen provider (OpenAI/Anthropic/Gemini), system prompt, and
// temperature. For now, it returns a placeholder response so the
// engine's orchestration logic can be tested end-to-end.
// ============================================================

import { NodeHandlerInput, NodeHandlerOutput } from "../types";

export async function handleAIEngine(input: NodeHandlerInput): Promise<NodeHandlerOutput> {
  const provider = input.config.provider || "OPENAI";
  const model = input.config.model || "gpt-4o";

  return {
    output: {
      result: `[AI response placeholder — provider: ${provider}, model: ${model}]`,
      provider,
      model,
      systemPrompt: input.config.systemPrompt || "",
      temperature: input.config.temperature ?? 0.7,
      upstreamData: input.data,
    },
  };
}
