// ============================================================
// Output Node Handler (STUB)
//
// The Output node is the terminal node of a workflow. It
// captures the final result and formats it according to the
// config's `format` field. In Phase 6, this will integrate
// with the real-time tracking UI.
// ============================================================

import { NodeHandlerInput, NodeHandlerOutput } from "../types";

export async function handleOutput(input: NodeHandlerInput): Promise<NodeHandlerOutput> {
  const format = input.config.format || "json";

  let formattedResult: unknown;

  switch (format) {
    case "markdown":
      formattedResult = `## Workflow Output\n\n\`\`\`json\n${JSON.stringify(input.data, null, 2)}\n\`\`\``;
      break;
    case "plain_text":
      formattedResult = JSON.stringify(input.data, null, 2);
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
