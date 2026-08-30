// ============================================================
// Pre-Built Workflow Templates Data Structure
// ============================================================

import { CustomNode } from "@/store/canvasStore";
import { Edge } from "reactflow";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "Customer Support" | "Productivity";
  nodeCount: number;
  iconName: "MessageSquare" | "FileText";
  canvasJson: {
    nodes: CustomNode[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  };
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "template-customer-complaint",
    name: "Customer Complaint Auto-Responder",
    description:
      "Draft an empathetic, professional reply to customer complaints and post the generated draft directly to your support webhook.",
    category: "Customer Support",
    nodeCount: 4,
    iconName: "MessageSquare",
    canvasJson: {
      viewport: { x: 0, y: 0, zoom: 0.9 },
      nodes: [
        {
          id: "node-trigger-1",
          type: "customNode",
          position: { x: 80, y: 180 },
          data: {
            label: "Incoming Complaint Trigger",
            type: "TRIGGER",
            config: {
              triggerType: "MANUAL",
            },
          },
        },
        {
          id: "node-ai-2",
          type: "customNode",
          position: { x: 420, y: 180 },
          data: {
            label: "AI Empathy Draft Assistant",
            type: "AI_ENGINE",
            config: {
              provider: "GEMINI",
              model: "gemini-3.6-flash",
              systemPrompt:
                "You are a senior customer success manager. Draft an empathetic, polite, and actionable email response to this customer complaint. Acknowledge their issue clearly, offer an apology for their frustration, and outline realistic next steps to resolve it.",
              userPrompt: "Customer Message:\n{{previous_output}}",
              temperature: 0.7,
            },
          },
        },
        {
          id: "node-integration-3",
          type: "customNode",
          position: { x: 760, y: 180 },
          data: {
            label: "Dispatch to Support Webhook",
            type: "INTEGRATION",
            config: {
              service: "Webhook",
              endpoint: "https://httpbin.org/post",
              method: "POST",
              body: JSON.stringify(
                {
                  channel: "customer-support-escalations",
                  action: "draft_reply",
                  payload: "{{previous_output}}",
                },
                null,
                2
              ),
            },
          },
        },
        {
          id: "node-output-4",
          type: "customNode",
          position: { x: 1100, y: 180 },
          data: {
            label: "Execution Summary Output",
            type: "OUTPUT",
            config: {
              format: "json",
            },
          },
        },
      ],
      edges: [
        {
          id: "edge-1-2",
          source: "node-trigger-1",
          target: "node-ai-2",
          animated: true,
        },
        {
          id: "edge-2-3",
          source: "node-ai-2",
          target: "node-integration-3",
          animated: true,
        },
        {
          id: "edge-3-4",
          source: "node-integration-3",
          target: "node-output-4",
          animated: true,
        },
      ],
    },
  },
  {
    id: "template-meeting-notes",
    name: "Meeting Notes to Action Items",
    description:
      "Parse raw meeting transcripts or notes, extract structured action items with assignees and priorities, and format output.",
    category: "Productivity",
    nodeCount: 3,
    iconName: "FileText",
    canvasJson: {
      viewport: { x: 0, y: 0, zoom: 0.95 },
      nodes: [
        {
          id: "node-trigger-1",
          type: "customNode",
          position: { x: 100, y: 180 },
          data: {
            label: "Raw Meeting Notes Input",
            type: "TRIGGER",
            config: {
              triggerType: "MANUAL",
            },
          },
        },
        {
          id: "node-ai-2",
          type: "customNode",
          position: { x: 460, y: 180 },
          data: {
            label: "AI Action Items Extractor",
            type: "AI_ENGINE",
            config: {
              provider: "GEMINI",
              model: "gemini-3.6-flash",
              systemPrompt:
                "You are an executive assistant. Review the provided raw meeting notes and extract: 1. Key Decisions Made, 2. Action Items (with assigned owner and priority: High/Medium/Low), 3. Next Follow-up Date. Format the output as a clean, structured list.",
              userPrompt: "Meeting Notes Transcript:\n{{previous_output}}",
              temperature: 0.3,
            },
          },
        },
        {
          id: "node-output-3",
          type: "customNode",
          position: { x: 820, y: 180 },
          data: {
            label: "Formatted Action Items",
            type: "OUTPUT",
            config: {
              format: "json",
            },
          },
        },
      ],
      edges: [
        {
          id: "edge-1-2",
          source: "node-trigger-1",
          target: "node-ai-2",
          animated: true,
        },
        {
          id: "edge-2-3",
          source: "node-ai-2",
          target: "node-output-3",
          animated: true,
        },
      ],
    },
  },
];
