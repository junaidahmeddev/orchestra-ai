import { describe, it, expect } from "vitest";
import { topologicalSort, CycleDetectedError } from "./topologicalSort";
import { EngineNode, EngineEdge } from "./types";

describe("topologicalSort (Unit Tests)", () => {
  it("should correctly sort a linear workflow DAG (Trigger -> AI Engine -> Output)", () => {
    const nodes: EngineNode[] = [
      { id: "node-2", type: "AI_ENGINE", label: "Gemini AI", config: {} },
      { id: "node-1", type: "TRIGGER", label: "Manual Trigger", config: {} },
      { id: "node-3", type: "OUTPUT", label: "Output Node", config: {} },
    ];

    const edges: EngineEdge[] = [
      { id: "e1-2", source: "node-1", target: "node-2" },
      { id: "e2-3", source: "node-2", target: "node-3" },
    ];

    const sorted = topologicalSort(nodes, edges);

    // Topological order must be node-1, node-2, node-3
    expect(sorted.map((n) => n.id)).toEqual(["node-1", "node-2", "node-3"]);
  });

  it("should correctly sort a branching and merging workflow DAG", () => {
    const nodes: EngineNode[] = [
      { id: "trigger", type: "TRIGGER", label: "Trigger", config: {} },
      { id: "ai", type: "AI_ENGINE", label: "AI Engine", config: {} },
      { id: "code", type: "DATA_PROCESSOR", label: "Code", config: {} },
      { id: "output", type: "OUTPUT", label: "Output", config: {} },
    ];

    const edges: EngineEdge[] = [
      { id: "e-t-ai", source: "trigger", target: "ai" },
      { id: "e-t-code", source: "trigger", target: "code" },
      { id: "e-ai-out", source: "ai", target: "output" },
      { id: "e-code-out", source: "code", target: "output" },
    ];

    const sorted = topologicalSort(nodes, edges);
    const order = sorted.map((n) => n.id);

    // Trigger must come before AI, Code, and Output
    expect(order.indexOf("trigger")).toBeLessThan(order.indexOf("ai"));
    expect(order.indexOf("trigger")).toBeLessThan(order.indexOf("code"));

    // AI and Code must come before Output
    expect(order.indexOf("ai")).toBeLessThan(order.indexOf("output"));
    expect(order.indexOf("code")).toBeLessThan(order.indexOf("output"));
  });

  it("should throw CycleDetectedError when a circular dependency exists (A -> B -> C -> A)", () => {
    const nodes: EngineNode[] = [
      { id: "node-A", type: "TRIGGER", label: "Node A", config: {} },
      { id: "node-B", type: "AI_ENGINE", label: "Node B", config: {} },
      { id: "node-C", type: "DATA_PROCESSOR", label: "Node C", config: {} },
    ];

    const cyclicEdges: EngineEdge[] = [
      { id: "e-ab", source: "node-A", target: "node-B" },
      { id: "e-bc", source: "node-B", target: "node-C" },
      { id: "e-ca", source: "node-C", target: "node-A" }, // Creates cycle!
    ];

    expect(() => topologicalSort(nodes, cyclicEdges)).toThrowError(
      CycleDetectedError
    );

    expect(() => topologicalSort(nodes, cyclicEdges)).toThrowError(
      /Cycle detected involving node\(s\):/
    );
  });

  it("should safely ignore dangling edges referencing deleted or non-existent node IDs", () => {
    const nodes: EngineNode[] = [
      { id: "node-1", type: "TRIGGER", label: "Trigger", config: {} },
      { id: "node-2", type: "OUTPUT", label: "Output", config: {} },
    ];

    const edges: EngineEdge[] = [
      { id: "e-dangling-1", source: "deleted-node", target: "node-2" },
      { id: "e-dangling-2", source: "node-1", target: "non-existent-target" },
      { id: "e-valid", source: "node-1", target: "node-2" },
    ];

    const sorted = topologicalSort(nodes, edges);
    expect(sorted.map((n) => n.id)).toEqual(["node-1", "node-2"]);
  });
});
