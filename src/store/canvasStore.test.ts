import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCanvasStore } from "./canvasStore";

// Mock global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe("canvasStore (Zustand Unit Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCanvasStore.setState({
      nodes: [],
      edges: [],
      workflowName: "Untitled Workflow",
      selectedNodeId: null,
      nodeRunResults: new Map(),
      isLoading: false,
      isSaving: false,
      error: null,
    });
  });

  it("should add a node to the canvas store with default config", () => {
    useCanvasStore.getState().addNode("AI_ENGINE", { x: 100, y: 100 });
    const nodes = useCanvasStore.getState().nodes;

    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.type).toBe("AI_ENGINE");
    expect(nodes[0]!.data.config.provider).toBe("GEMINI");
    expect(useCanvasStore.getState().selectedNodeId).toBe(nodes[0]!.id);
  });

  it("should update node config and label", () => {
    useCanvasStore.getState().addNode("INTEGRATION", { x: 0, y: 0 });
    const nodeId = useCanvasStore.getState().nodes[0]!.id;

    useCanvasStore.getState().updateNodeConfig(nodeId, {
      endpoint: "https://api.example.com/webhook",
      method: "POST",
    });
    useCanvasStore.getState().updateNodeLabel(nodeId, "My Webhook Node");

    const updatedNode = useCanvasStore.getState().nodes[0]!;
    expect(updatedNode.data.label).toBe("My Webhook Node");
    expect(updatedNode.data.config.endpoint).toBe("https://api.example.com/webhook");
  });

  it("should delete node and remove associated edges", () => {
    useCanvasStore.getState().addNode("TRIGGER", { x: 0, y: 0 });
    useCanvasStore.getState().addNode("OUTPUT", { x: 200, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    const n1 = nodes[0]!;
    const n2 = nodes[1]!;
    useCanvasStore.setState({
      edges: [{ id: "e1", source: n1.id, target: n2.id }],
    });

    useCanvasStore.getState().deleteNode(n1.id);

    expect(useCanvasStore.getState().nodes).toHaveLength(1);
    expect(useCanvasStore.getState().edges).toHaveLength(0);
  });

  it("should throw error and update error state when saveWorkflow fails", async () => {
    globalFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Database transaction error" }),
    });

    await expect(
      useCanvasStore.getState().saveWorkflow("wf-123")
    ).rejects.toThrow("Database transaction error");

    expect(useCanvasStore.getState().error).toBe("Database transaction error");
    expect(useCanvasStore.getState().isSaving).toBe(false);
  });
});
