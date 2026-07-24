// ============================================================
// GET /api/runs/:runId — Poll execution status
//
// Returns the WorkflowRun's status plus all its NodeRun rows.
// The frontend polls this every 1-2 seconds during execution
// to update the canvas with live node statuses.
// ============================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    runId: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { runId } = params;

    const workflowRun = await db.workflowRun.findUnique({
      where: { id: runId },
      include: {
        nodeRuns: {
          orderBy: { startedAt: "asc" },
        },
        workflow: {
          select: { userId: true },
        },
      },
    });

    if (!workflowRun) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    // Verify the user owns the workflow this run belongs to
    if (workflowRun.workflow.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: workflowRun.id,
      status: workflowRun.status,
      triggeredBy: workflowRun.triggeredBy,
      startedAt: workflowRun.startedAt,
      finishedAt: workflowRun.finishedAt,
      errorMessage: workflowRun.errorMessage,
      nodeRuns: workflowRun.nodeRuns.map((nr) => ({
        id: nr.id,
        nodeId: nr.nodeId,
        status: nr.status,
        input: nr.input,
        output: nr.output,
        errorMessage: nr.errorMessage,
        startedAt: nr.startedAt,
        finishedAt: nr.finishedAt,
      })),
    });
  } catch (error) {
    console.error(`GET /api/runs/${params.runId} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
