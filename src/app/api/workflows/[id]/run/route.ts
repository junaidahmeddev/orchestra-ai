// ============================================================
// POST /api/workflows/:id/run — Trigger a workflow execution
//
// 1. Validates the user is logged in and owns the workflow
// 2. Creates a WorkflowRun row (PENDING) in the database
// 3. Sends an event to Inngest to start the background job
// 4. Returns the runId immediately (doesn't wait for completion)
// ============================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "@/lib/jobs/inngestClient";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workflowId } = params;

    // Verify the workflow exists and belongs to this user
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    if (workflow.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this workflow" },
        { status: 403 }
      );
    }

    // Create a WorkflowRun row in PENDING state
    const workflowRun = await db.workflowRun.create({
      data: {
        workflowId,
        status: "PENDING",
        triggeredBy: "MANUAL",
      },
    });

    // Fire an event to Inngest — wrapped in specific try/catch for queue resilience
    try {
      await inngest.send({
        name: "workflow/run.requested",
        data: {
          workflowRunId: workflowRun.id,
          workflowId,
        },
      });
    } catch (inngestErr: unknown) {
      const errorMsg =
        inngestErr instanceof Error ? inngestErr.message : String(inngestErr);

      console.error("Failed to dispatch job to Inngest queue:", errorMsg);

      // Immediately mark the WorkflowRun as FAILED so it does not hang in PENDING
      await db.workflowRun.update({
        where: { id: workflowRun.id },
        data: {
          status: "FAILED",
          errorMessage: `Background job queue (Inngest) is unreachable: ${errorMsg}`,
          finishedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          error:
            "Background job queue service is currently unavailable. Please ensure Inngest dev server is running and try again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { runId: workflowRun.id, status: "PENDING" },
      { status: 201 }
    );
  } catch (error) {
    console.error(`POST /api/workflows/${params.id}/run error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
