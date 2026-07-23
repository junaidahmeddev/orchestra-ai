// ============================================================
// Node Handler Registry
//
// Maps each NodeType to its handler function. This lets the
// executor look up the right handler dynamically:
//   const handler = nodeHandlerRegistry["AI_ENGINE"];
//   const result = await handler(input);
// ============================================================

import { NodeHandler, NodeType } from "../types";
import { handleTrigger } from "./trigger";
import { handleAIEngine } from "./aiEngine";
import { handleDataProcessor } from "./dataProcessor";
import { handleIntegration } from "./integration";
import { handleOutput } from "./output";

export const nodeHandlerRegistry: Record<NodeType, NodeHandler> = {
  TRIGGER: handleTrigger,
  AI_ENGINE: handleAIEngine,
  DATA_PROCESSOR: handleDataProcessor,
  INTEGRATION: handleIntegration,
  OUTPUT: handleOutput,
};
