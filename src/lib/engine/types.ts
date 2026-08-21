// ============================================================
// Engine Types — standalone types for the DAG execution engine.
// These mirror the canvas data shapes but are decoupled from
// React Flow / Zustand so the engine can be tested in isolation.
// ============================================================

/**
 * The five node types supported by orchestra.ai.
 * Maps 1:1 with the Prisma `NodeType` enum and the canvas store's type field.
 */
export type NodeType =
  | "TRIGGER"
  | "AI_ENGINE"
  | "DATA_PROCESSOR"
  | "INTEGRATION"
  | "OUTPUT";

/**
 * Configuration shape for each node type.
 * Matches the `config` JSON blob stored in WorkflowNode.config.
 */
export interface NodeConfig {
  // Trigger
  triggerType?: "MANUAL" | "WEBHOOK" | "CRON";

  // AI Engine
  provider?: "OPENAI" | "ANTHROPIC" | "GEMINI";
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  prompt?: string;
  temperature?: number;

  // Data Processor
  language?: "javascript" | "python";
  code?: string;

  // Integration
  service?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;

  // Output
  format?: string;
}

/**
 * A node in the engine's graph — stripped of React Flow visual props
 * (position, selected, dragging, etc.) down to what execution needs.
 */
export interface EngineNode {
  id: string;
  type: NodeType;
  label: string;
  config: NodeConfig;
}

/**
 * An edge (connection) in the engine's graph.
 */
export interface EngineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

/**
 * The data shape passed into every node handler.
 * `data` is the accumulated output from upstream nodes.
 */
export interface NodeHandlerInput {
  nodeId: string;
  config: NodeConfig;
  data: Record<string, unknown>;
  userId?: string;
}

/**
 * The data shape returned from every node handler.
 * `output` is what gets passed downstream to the next node(s).
 */
export interface NodeHandlerOutput {
  output: Record<string, unknown>;
}

/**
 * A node handler is an async function that takes input and returns output.
 * Handlers are pure — no database or API route dependencies.
 */
export type NodeHandler = (input: NodeHandlerInput) => Promise<NodeHandlerOutput>;
