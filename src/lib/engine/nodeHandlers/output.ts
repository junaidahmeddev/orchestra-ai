// ============================================================
// Output Node Handler
//
// The Output node is the terminal node of a workflow. It
// captures the final result and formats it according to the
// config's `format` field (json, markdown, or plain_text).
// ============================================================

import { NodeHandlerInput, NodeHandlerOutput } from "../types";

export async function handleOutput(input: NodeHandlerInput): Promise<NodeHandlerOutput> {
  const format = (input.config.format || "json").toLowerCase();

  const extractMainText = (data: Record<string, unknown>): string | null => {
    const candidate = data.result ?? data.text ?? data.output;
    if (candidate !== undefined && candidate !== null) {
      if (typeof candidate === "string") return candidate;
      if (typeof candidate === "number" || typeof candidate === "boolean") return String(candidate);
      if (typeof candidate === "object") return JSON.stringify(candidate, null, 2);
    }
    return null;
  };

  const mainText = extractMainText(input.data);
  let formattedResult: unknown;

  switch (format) {
    case "markdown":
      formattedResult = mainText
        ? mainText
        : `## Workflow Output\n\n\`\`\`json\n${JSON.stringify(input.data, null, 2)}\n\`\`\``;
      break;
    case "plain_text":
    case "text":
      formattedResult = mainText
        ? mainText
        : JSON.stringify(input.data, null, 2);
      break;
    case "json":
    default:
      formattedResult = input.data;
      break;
  }

  return {
    output: {
      result: formattedResult,
      format,
      isFinalOutput: true,
    },
  };
}
