import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listWorkflows, POST as createWorkflow } from "./route";
import {
  GET as getWorkflow,
  PUT as updateWorkflow,
  DELETE as deleteWorkflow,
} from "./[id]/route";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";

// Mock next-auth getServerSession
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

// Mock Prisma client singleton
vi.mock("@/lib/db", () => ({
  db: {
    workflow: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
    nodeRun: { deleteMany: vi.fn() },
    workflowRun: { deleteMany: vi.fn() },
    workflowEdge: { deleteMany: vi.fn() },
    workflowNode: { deleteMany: vi.fn() },
  },
}));

describe("Workflow CRUD API Routes (Integration Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Checks (401 Unauthorized)", () => {
    it("should return 401 for GET /api/workflows when unauthenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      const res = await listWorkflows();
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 401 for POST /api/workflows when unauthenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      const req = new Request("http://localhost:3000/api/workflows", {
        method: "POST",
        body: JSON.stringify({ name: "Unauthenticated Workflow" }),
      });

      const res = await createWorkflow(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("Workflow Ownership Authorization (403 Forbidden)", () => {
    it("should return 403 when a user tries to GET a workflow owned by another user", async () => {
      // User 1 is logged in
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: "user-1", email: "user1@orchestra.ai" },
        expires: "2099-01-01",
      });

      // Workflow belongs to User 2
      vi.mocked(db.workflow.findUnique).mockResolvedValueOnce({
        id: "wf-user2-123",
        name: "User 2 Secrets",
        description: null,
        canvasJson: {},
        isActive: true,
        userId: "user-2", // Different owner!
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req = new Request("http://localhost:3000/api/workflows/wf-user2-123");
      const res = await getWorkflow(req, { params: { id: "wf-user2-123" } });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain("Forbidden");
    });

    it("should return 403 when a user tries to UPDATE a workflow owned by another user", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: "user-1", email: "user1@orchestra.ai" },
        expires: "2099-01-01",
      });

      vi.mocked(db.workflow.findUnique).mockResolvedValueOnce({
        id: "wf-user2-123",
        name: "User 2 Secrets",
        description: null,
        canvasJson: {},
        isActive: true,
        userId: "user-2",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req = new Request("http://localhost:3000/api/workflows/wf-user2-123", {
        method: "PUT",
        body: JSON.stringify({ name: "Hacked Title" }),
      });

      const res = await updateWorkflow(req, { params: { id: "wf-user2-123" } });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain("Forbidden");
    });
  });

  describe("Owner Workflow Lifecycle (Create -> Read -> Update -> Delete)", () => {
    const mockSession = {
      user: { id: "owner-user-777", email: "owner@orchestra.ai" },
      expires: "2099-01-01",
    };

    it("1. CREATE: should create a new workflow for the owner", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);
      vi.mocked(db.workflow.create).mockResolvedValueOnce({
        id: "wf-new-777",
        name: "AI Summarizer",
        description: "Summarize text",
        canvasJson: { nodes: [], edges: [] },
        isActive: true,
        userId: "owner-user-777",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req = new Request("http://localhost:3000/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          name: "AI Summarizer",
          description: "Summarize text",
        }),
      });

      const res = await createWorkflow(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.id).toBe("wf-new-777");
      expect(data.name).toBe("AI Summarizer");
    });

    it("2. READ: should retrieve the single workflow for the owner", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);
      vi.mocked(db.workflow.findUnique).mockResolvedValueOnce({
        id: "wf-new-777",
        name: "AI Summarizer",
        description: "Summarize text",
        canvasJson: { nodes: [], edges: [] },
        isActive: true,
        userId: "owner-user-777",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req = new Request("http://localhost:3000/api/workflows/wf-new-777");
      const res = await getWorkflow(req, { params: { id: "wf-new-777" } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe("wf-new-777");
    });

    it("3. UPDATE: should update workflow canvasJson and title", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);
      vi.mocked(db.workflow.findUnique).mockResolvedValueOnce({
        id: "wf-new-777",
        name: "AI Summarizer",
        description: null,
        canvasJson: {},
        isActive: true,
        userId: "owner-user-777",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.workflow.update).mockResolvedValueOnce({
        id: "wf-new-777",
        name: "Updated AI Summarizer",
        description: null,
        canvasJson: { nodes: [{ id: "n1" }], edges: [] },
        isActive: true,
        userId: "owner-user-777",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req = new Request("http://localhost:3000/api/workflows/wf-new-777", {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated AI Summarizer",
          canvasJson: { nodes: [{ id: "n1" }], edges: [] },
        }),
      });

      const res = await updateWorkflow(req, { params: { id: "wf-new-777" } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe("Updated AI Summarizer");
    });

    it("4. DELETE: should delete the workflow and cascade transaction", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);
      vi.mocked(db.workflow.findUnique).mockResolvedValueOnce({
        id: "wf-new-777",
        name: "Updated AI Summarizer",
        description: null,
        canvasJson: {},
        isActive: true,
        userId: "owner-user-777",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.$transaction).mockResolvedValueOnce([]);

      const req = new Request("http://localhost:3000/api/workflows/wf-new-777", {
        method: "DELETE",
      });

      const res = await deleteWorkflow(req, { params: { id: "wf-new-777" } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe("Workflow deleted successfully");
      expect(db.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
