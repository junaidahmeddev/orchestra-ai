// ============================================================
// Topological Sort — Kahn's Algorithm (BFS-based)
//
// WHY THIS EXISTS:
// A workflow is a Directed Acyclic Graph (DAG). To execute it,
// we need to know which node to run FIRST, SECOND, etc. A node
// can only run after ALL its upstream dependencies have finished.
// Topological sort gives us exactly that ordering.
//
// If the graph has a CYCLE (A → B → C → A), no valid ordering
// exists — every node in the cycle is waiting for another one
// to finish first, creating a deadlock. We must detect and
// reject this before execution even starts.
// ============================================================

import { EngineNode, EngineEdge } from "./types";

export class CycleDetectedError extends Error {
  constructor(message = "Cycle detected in workflow graph — cannot execute.") {
    super(message);
    this.name = "CycleDetectedError";
  }
}

/**
 * Returns the nodes in a valid execution order using Kahn's algorithm.
 *
 * Algorithm walkthrough (for the learner):
 * 1. Build an adjacency list (who points to whom) and count each node's
 *    "in-degree" (how many edges point INTO it).
 * 2. Start with all nodes that have in-degree 0 — these have no
 *    dependencies, so they can run immediately (e.g. a Trigger node).
 * 3. Process each of those nodes: for every edge going OUT of it,
 *    decrease the target's in-degree by 1 (we've "resolved" that
 *    dependency). If a target's in-degree drops to 0, it's now ready.
 * 4. Repeat until the queue is empty.
 * 5. If we processed fewer nodes than exist in the graph, the remaining
 *    nodes are trapped in a cycle — throw an error.
 *
 * @param nodes - Array of engine nodes
 * @param edges - Array of engine edges (directed connections)
 * @returns Nodes sorted in valid execution order
 * @throws CycleDetectedError if the graph contains a cycle
 */
export function topologicalSort(
  nodes: EngineNode[],
  edges: EngineEdge[]
): EngineNode[] {
  // Step 1: Build adjacency list and in-degree map
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize every node with in-degree 0 and an empty adjacency list
  for (const node of nodes) {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  // Populate from edges
  for (const edge of edges) {
    const neighbors = adjacencyList.get(edge.source);
    if (neighbors) {
      neighbors.push(edge.target);
    }

    const currentInDegree = inDegree.get(edge.target);
    if (currentInDegree !== undefined) {
      inDegree.set(edge.target, currentInDegree + 1);
    }
  }

  // Step 2: Seed the queue with all zero-in-degree nodes
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  // Step 3–4: Process the queue (BFS)
  const sortedIds: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    sortedIds.push(currentId);

    const neighbors = adjacencyList.get(currentId) || [];
    for (const neighborId of neighbors) {
      const newDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newDegree);

      if (newDegree === 0) {
        queue.push(neighborId);
      }
    }
  }

  // Step 5: Cycle detection
  if (sortedIds.length !== nodes.length) {
    const nodesInCycle = nodes
      .filter((n) => !sortedIds.includes(n.id))
      .map((n) => n.label || n.id);

    throw new CycleDetectedError(
      `Cycle detected involving node(s): ${nodesInCycle.join(", ")}. ` +
      `A workflow cannot have circular dependencies.`
    );
  }

  // Build a lookup map for O(1) access and return nodes in sorted order
  const nodeMap = new Map<string, EngineNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  return sortedIds.map((id) => nodeMap.get(id)!);
}
