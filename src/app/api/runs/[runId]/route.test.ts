import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getRun } from "./route";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    workflowRun: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GET /api/runs/[runId] (Integration Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 Unauthorized if user is not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/runs/run-123");
    const res = await getRun(req, { params: { runId: "run-123" } });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 Not Found if workflow run does not exist", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-123", email: "user@orchestra.ai" },
      expires: "2099-01-01",
    });

    vi.mocked(db.workflowRun.findUnique).mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/runs/run-missing");
    const res = await getRun(req, { params: { runId: "run-missing" } });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Run not found");
  });

  it("should return 403 Forbidden if user does not own the parent workflow", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-attacker", email: "attacker@orchestra.ai" },
      expires: "2099-01-01",
    });

    vi.mocked(db.workflowRun.findUnique).mockResolvedValueOnce({
      id: "run-secret",
      status: "SUCCESS",
      triggeredBy: "MANUAL",
      startedAt: new Date(),
      finishedAt: new Date(),
      errorMessage: null,
      workflowId: "wf-other-user",
      nodeRuns: [],
      workflow: { userId: "user-victim" },
    } as any);

    const req = new Request("http://localhost:3000/api/runs/run-secret");
    const res = await getRun(req, { params: { runId: "run-secret" } });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return run status and nodeRuns payload for workflow owner", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-owner", email: "owner@orchestra.ai" },
      expires: "2099-01-01",
    });

    const now = new Date();
    vi.mocked(db.workflowRun.findUnique).mockResolvedValueOnce({
      id: "run-owner-1",
      status: "SUCCESS",
      triggeredBy: "MANUAL",
      startedAt: now,
      finishedAt: now,
      errorMessage: null,
      workflowId: "wf-owner",
      nodeRuns: [
        {
          id: "nr-1",
          workflowRunId: "run-owner-1",
          nodeId: "node-trigger",
          status: "SUCCESS",
          input: {},
          output: { result: "Hello" },
          errorMessage: null,
          startedAt: now,
          finishedAt: now,
        },
      ],
      workflow: { userId: "user-owner" },
    } as any);

    const req = new Request("http://localhost:3000/api/runs/run-owner-1");
    const res = await getRun(req, { params: { runId: "run-owner-1" } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("run-owner-1");
    expect(data.status).toBe("SUCCESS");
    expect(data.nodeRuns).toHaveLength(1);
    expect(data.nodeRuns[0].nodeId).toBe("node-trigger");
    expect(data.nodeRuns[0].output).toEqual({ result: "Hello" });
  });
});
