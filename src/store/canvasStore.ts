import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  XYPosition,
} from "reactflow";

export interface NodeConfig {
  triggerType?: "MANUAL" | "WEBHOOK" | "CRON";
  provider?: "OPENAI" | "ANTHROPIC" | "GEMINI";
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  language?: "javascript" | "python";
  code?: string;
  service?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  format?: string;
}

export type CustomNode = Node<{
  label: string;
  type: "TRIGGER" | "AI_ENGINE" | "DATA_PROCESSOR" | "INTEGRATION" | "OUTPUT";
  config: NodeConfig;
}>;

export interface NodeRunResult {
  id: string;
  nodeId: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
}

interface CanvasState {
  nodes: CustomNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  nodeRunResults: Map<string, NodeRunResult>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  setNodes: (nodes: CustomNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setNodeRunResults: (results: Map<string, NodeRunResult>) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: CustomNode["data"]["type"], position: XYPosition) => void;
  updateNodeConfig: (nodeId: string, config: NodeConfig) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  loadWorkflow: (workflowId: string) => Promise<void>;
  saveWorkflow: (workflowId: string) => Promise<void>;
}

const getDefaultConfig = (type: CustomNode["data"]["type"]): NodeConfig => {
  switch (type) {
    case "TRIGGER":
      return { triggerType: "MANUAL" };
    case "AI_ENGINE":
      return { provider: "OPENAI", model: "gpt-4o", systemPrompt: "You are a helpful assistant.", temperature: 0.7 };
    case "DATA_PROCESSOR":
      return { language: "javascript", code: "// Process inputs here\nreturn input;" };
    case "INTEGRATION":
      return { service: "webhook", endpoint: "https://api.example.com", method: "POST" };
    case "OUTPUT":
      return { format: "json" };
  }
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  nodeRunResults: new Map(),
  isLoading: false,
  isSaving: false,
  error: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setNodeRunResults: (nodeRunResults) => set({ nodeRunResults }),

  onNodesChange: (changes) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes) as CustomNode[],
    }),

  onEdgesChange: (changes) =>
    set({
      edges: applyEdgeChanges(changes, get().edges),
    }),

  onConnect: (connection) =>
    set({
      edges: addEdge(connection, get().edges),
    }),

  addNode: (type, position) => {
    const id = `${type.toLowerCase()}_${Date.now()}`;
    const newNode: CustomNode = {
      id,
      type: "customNode",
      position,
      data: {
        label: `${type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")} Node`,
        type,
        config: getDefaultConfig(type),
      },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...node.data.config,
                ...config,
              },
            },
          };
        }
        return node;
      }),
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label,
            },
          };
        }
        return node;
      }),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  loadWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/workflows/${workflowId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch workflow");
      }
      const data = await res.json();
      
      let parsedCanvas = { nodes: [], edges: [] };
      if (data.canvasJson) {
        parsedCanvas = typeof data.canvasJson === "string" 
          ? JSON.parse(data.canvasJson) 
          : data.canvasJson;
      }

      set({
        nodes: parsedCanvas.nodes || [],
        edges: parsedCanvas.edges || [],
        isLoading: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg || "Error loading workflow", isLoading: false });
    }
  },

  saveWorkflow: async (workflowId) => {
    set({ isSaving: true, error: null });
    try {
      const canvasJson = {
        nodes: get().nodes,
        edges: get().edges,
      };

      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canvasJson,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save workflow");
      }
      set({ isSaving: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg || "Error saving workflow", isSaving: false });
    }
  },
}));
