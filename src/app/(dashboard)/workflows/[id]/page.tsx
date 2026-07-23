"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Play, Loader2 } from "lucide-react";
import { useCanvasStore } from "@/store/canvasStore";
import FlowCanvas from "@/components/canvas/FlowCanvas";
import { LeftSidebar, RightSidebar } from "@/components/canvas/Sidebar";

interface NodeRunStatus {
  nodeId: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";
}

interface RunPollResponse {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
  errorMessage: string | null;
  nodeRuns: NodeRunStatus[];
}

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [saveStatus, setSaveStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "failed">("idle");
  const [nodeStatuses, setNodeStatuses] = React.useState<Map<string, string>>(new Map());
  const [runError, setRunError] = React.useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    loadWorkflow,
    saveWorkflow,
    isLoading,
    isSaving,
    error,
  } = useCanvasStore();

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id, loadWorkflow]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    setSaveStatus("idle");
    await saveWorkflow(id);
    const storeError = useCanvasStore.getState().error;
    if (storeError) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const pollRunStatus = useCallback((runId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/runs/${runId}`);
        if (!res.ok) return;

        const data: RunPollResponse = await res.json();

        // Update node statuses on canvas
        const statusMap = new Map<string, string>();
        for (const nr of data.nodeRuns) {
          statusMap.set(nr.nodeId, nr.status);
        }
        setNodeStatuses(statusMap);

        // Check if run is finished
        if (data.status === "SUCCESS" || data.status === "FAILED" || data.status === "CANCELLED") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          if (data.status === "SUCCESS") {
            setRunState("success");
            setTimeout(() => setRunState("idle"), 3000);
          } else {
            setRunState("failed");
            setRunError(data.errorMessage || "Workflow run failed");
            setTimeout(() => {
              setRunState("idle");
              setRunError(null);
            }, 5000);
          }
        }
      } catch {
        // Silently ignore polling errors — we'll try again next tick
      }
    }, 1500);
  }, []);

  const handleRun = async () => {
    // First, save the current canvas state before running
    await saveWorkflow(id);

    setRunState("running");
    setRunError(null);
    setNodeStatuses(new Map());

    try {
      const res = await fetch(`/api/workflows/${id}/run`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start workflow run");
      }

      const { runId } = await res.json();
      pollRunStatus(runId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start run";
      setRunState("failed");
      setRunError(msg);
      setTimeout(() => {
        setRunState("idle");
        setRunError(null);
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">Loading your workflow canvas...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="max-w-md space-y-4 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h2 className="text-lg font-bold text-red-400">Unable to Load Workflow</h2>
          <p className="text-sm text-zinc-400">{error}</p>
          <button
            onClick={() => router.push("/workflows")}
            className="inline-flex items-center space-x-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Editor Header */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-6 backdrop-blur">
        <div className="flex items-center space-x-4">
          <Link
            href="/workflows"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-50 transition-all text-zinc-400"
            title="Back to Workflows"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">Visual Canvas Editor</h1>
            <p className="text-xs text-zinc-500">ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Messages */}
          {saveStatus === "success" && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              Saved!
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">
              Save failed
            </span>
          )}
          {runState === "success" && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              Run complete!
            </span>
          )}
          {runState === "failed" && (
            <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md" title={runError || undefined}>
              Run failed
            </span>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || runState === "running"}
            className="inline-flex items-center space-x-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={runState === "running"}
            className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {runState === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-white" />
            )}
            <span>{runState === "running" ? "Running..." : "Run Workflow"}</span>
          </button>
        </div>
      </header>

      {/* Editor Main Content Area */}
      <div className="flex flex-1 overflow-hidden h-full">
        <LeftSidebar />
        <FlowCanvas nodeStatuses={nodeStatuses} />
        <RightSidebar />
      </div>
    </div>
  );
}
