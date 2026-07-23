// ============================================================
// Workflow Run Job Function (Inngest)
//
// This is the heart of the execution engine. When triggered:
// 1. Loads the workflow's canvasJson from the database
// 2. Converts canvas nodes/edges → engine types
// 3. Runs topological sort (with cycle detection)
// 4. Executes each node in order using the Phase 5 handlers
// 5. Persists status updates (WorkflowRun + NodeRun) at each step
// ============================================================

import { inngest } from "./inngestClient";
import { db } from "@/lib/db";
import { topologicalSort } from "@/lib/engine/topologicalSort";
import { nodeHandlerRegistry } from "@/lib/engine/nodeHandlers";
import { EngineNode, EngineEdge, NodeType } from "@/lib/engine/types";

interface CanvasNode {
  id: string;
  data: {
    type: string;
    label: string;
    config: Record<string, unknown>;
  };
}

interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

interface CanvasJson {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export const runWorkflow = inngest.createFunction(
  { id: "run-workflow", name: "Run Workflow DAG" },
  { event: "workflow/run.requested" },
  async ({ event }) => {
    const { workflowRunId, workflowId } = event.data as {
      workflowRunId: string;
      workflowId: string;
    };

    try {
      // ── Step 1: Mark the WorkflowRun as RUNNING ──
      await db.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: "RUNNING" },
      });

      // ── Step 2: Load the workflow's canvasJson ──
      const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const canvas = workflow.canvasJson as unknown as CanvasJson;

      if (!canvas || !canvas.nodes || canvas.nodes.length === 0) {
        throw new Error("Workflow has no nodes to execute");
      }

      // ── Step 3: Convert canvas shapes → engine types ──
      const engineNodes: EngineNode[] = canvas.nodes.map((n) => ({
        id: n.id,
        type: n.data.type as NodeType,
        label: n.data.label,
        config: n.data.config,
      }));

      const engineEdges: EngineEdge[] = canvas.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }));

      // ── Step 4: Topological sort (detects cycles) ──
      const sortedNodes = topologicalSort(engineNodes, engineEdges);

      // ── Step 5: Upsert WorkflowNode entries & Create NodeRun rows ──
      const nodeRunMap = new Map<string, string>();
      for (const node of sortedNodes) {
        // Ensure WorkflowNode row exists in DB to satisfy foreign key constraint
        await db.workflowNode.upsert({
          where: { id: node.id },
          update: {
            type: node.type,
            label: node.label,
            config: node.config as any,
          },
          create: {
            id: node.id,
            workflowId,
            type: node.type,
            label: node.label,
            config: node.config as any,
            positionX: 0,
            positionY: 0,
          },
        });

        const nodeRun = await db.nodeRun.create({
          data: {
            workflowRunId,
            nodeId: node.id,
            status: "PENDING",
          },
        });
        nodeRunMap.set(node.id, nodeRun.id);
      }

      // ── Step 6: Execute each node in topological order ──
      // The output of each node becomes the input of downstream nodes.
      const nodeOutputs = new Map<string, Record<string, unknown>>();

      // Build a reverse adjacency: for each node, which nodes feed INTO it?
      const incomingEdges = new Map<string, string[]>();
      for (const edge of engineEdges) {
        const existing = incomingEdges.get(edge.target) || [];
        existing.push(edge.source);
        incomingEdges.set(edge.target, existing);
      }

      for (const node of sortedNodes) {
        const nodeRunId = nodeRunMap.get(node.id)!;

        // Mark as RUNNING
        await db.nodeRun.update({
          where: { id: nodeRunId },
          data: { status: "RUNNING", startedAt: new Date() },
        });

        try {
          // Gather upstream data: merge outputs from all parents
          const upstreamNodeIds = incomingEdges.get(node.id) || [];
          const mergedInput: Record<string, unknown> = {};
          for (const parentId of upstreamNodeIds) {
            const parentOutput = nodeOutputs.get(parentId);
            if (parentOutput) {
              Object.assign(mergedInput, parentOutput);
            }
          }

          // Look up the handler for this node type
          const handler = nodeHandlerRegistry[node.type];

          // Execute the handler
          const result = await handler({
            nodeId: node.id,
            config: node.config,
            data: mergedInput,
          });

          // Store output for downstream nodes
          nodeOutputs.set(node.id, result.output);

          // Mark as SUCCESS
          await db.nodeRun.update({
            where: { id: nodeRunId },
            data: {
              status: "SUCCESS",
              input: mergedInput as any,
              output: result.output as any,
              finishedAt: new Date(),
            },
          });
        } catch (nodeError: unknown) {
          const errorMsg =
            nodeError instanceof Error ? nodeError.message : String(nodeError);

          // Mark this node as FAILED
          await db.nodeRun.update({
            where: { id: nodeRunId },
            data: {
              status: "FAILED",
              errorMessage: errorMsg,
              finishedAt: new Date(),
            },
          });

          // Mark the overall run as FAILED (per PRD: error contained to the node)
          await db.workflowRun.update({
            where: { id: workflowRunId },
            data: {
              status: "FAILED",
              errorMessage: `Node "${node.label}" (${node.id}) failed: ${errorMsg}`,
              finishedAt: new Date(),
            },
          });

          return { success: false, failedNode: node.id, error: errorMsg };
        }
      }

      // ── Step 7: All nodes succeeded — mark run as SUCCESS ──
      await db.workflowRun.update({
        where: { id: workflowRunId },
        data: {
          status: "SUCCESS",
          finishedAt: new Date(),
        },
      });

      return { success: true, nodesExecuted: sortedNodes.length };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Mark the overall run as FAILED
      await db.workflowRun.update({
        where: { id: workflowRunId },
        data: {
          status: "FAILED",
          errorMessage: errorMsg,
          finishedAt: new Date(),
        },
      });

      throw error; // Re-throw so Inngest can log/retry
    }
  }
);
