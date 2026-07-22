import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const updateWorkflowSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  canvasJson: z.record(z.any()).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const workflow = await db.workflow.findUnique({
      where: { id },
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

    return NextResponse.json(workflow);
  } catch (error) {
    console.error(`GET /api/workflows/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const workflow = await db.workflow.findUnique({
      where: { id },
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

    const body = await req.json();
    const result = updateWorkflowSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid inputs" },
        { status: 400 }
      );
    }

    const dataToUpdate = result.data;

    const updatedWorkflow = await db.workflow.update({
      where: { id },
      data: {
        ...dataToUpdate,
        canvasJson: dataToUpdate.canvasJson ? (dataToUpdate.canvasJson as any) : undefined,
      },
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error(`PUT /api/workflows/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const workflow = await db.workflow.findUnique({
      where: { id },
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

    await db.workflow.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Workflow deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/workflows/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
