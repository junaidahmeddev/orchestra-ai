"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowLeft,
  Save,
  Play,
  Loader2,
  Key,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useCanvasStore, NodeRunResult } from "@/store/canvasStore";
import FlowCanvas from "@/components/canvas/FlowCanvas";
import { LeftSidebar, RightSidebar } from "@/components/canvas/Sidebar";
import { topologicalSort } from "@/lib/engine/topologicalSort";
import { EngineNode, EngineEdge, NodeType } from "@/lib/engine/types";

interface RunPollResponse {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
  errorMessage: string | null;
  nodeRuns: NodeRunResult[];
}

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session, status: authStatus } = useSession();

  const [saveStatus, setSaveStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [runState, setRunState] = React.useState<"idle" | "running" | "success" | "failed">("idle");
  const [nodeStatuses, setNodeStatuses] = React.useState<Map<string, string>>(new Map());
  const [runError, setRunError] = React.useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    nodes,
    edges,
    loadWorkflow,
    saveWorkflow,
    setNodeRunResults,
    isLoading,
    isSaving,
    error,
  } = useCanvasStore();

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (id && authStatus === "authenticated") {
      loadWorkflow(id);
    }
  }, [id, authStatus, loadWorkflow]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Pre-Run Graph Validation helper
  const getGraphValidation = (): { valid: boolean; reason?: string } => {
    if (nodes.length === 0) {
      return { valid: false, reason: "Canvas is empty. Add nodes to execute." };
    }

    const hasTriggerNode = nodes.some((n) => n.data.type === "TRIGGER");
    if (!hasTriggerNode) {
      return {
        valid: false,
        reason: "Workflow must contain at least one Trigger node.",
      };
    }

    try {
      const engineNodes: EngineNode[] = nodes.map((n) => ({
        id: n.id,
        type: n.data.type as NodeType,
        label: n.data.label,
        config: n.data.config,
      }));
      const engineEdges: EngineEdge[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      }));

      topologicalSort(engineNodes, engineEdges);
      return { valid: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Circular loop detected";
      return { valid: false, reason: msg };
    }
  };

  const validation = getGraphValidation();

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

  const pollRunStatus = useCallback(
    (runId: string) => {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/runs/${runId}`);
          if (!res.ok) return;

          const data: RunPollResponse = await res.json();

          // Update node statuses and full node run results in state/store
          const statusMap = new Map<string, string>();
          const resultsMap = new Map<string, NodeRunResult>();

          for (const nr of data.nodeRuns) {
            statusMap.set(nr.nodeId, nr.status);
            resultsMap.set(nr.nodeId, nr);
          }

          setNodeStatuses(statusMap);
          setNodeRunResults(resultsMap);

          // Check if run is finished
          if (
            data.status === "SUCCESS" ||
            data.status === "FAILED" ||
            data.status === "CANCELLED"
          ) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            if (data.status === "SUCCESS") {
              setRunState("success");
              setTimeout(() => setRunState("idle"), 4000);
            } else {
              setRunState("failed");
              setRunError(data.errorMessage || "Workflow run failed");
              setTimeout(() => {
                setRunState("idle");
                setRunError(null);
              }, 6000);
            }
          }
        } catch {
          // Silently ignore polling errors — retry next tick
        }
      }, 1500);
    },
    [setNodeRunResults]
  );

  const handleRun = async () => {
    if (!validation.valid || runState === "running") return;

    // Save current canvas state before running
    await saveWorkflow(id);

    setRunState("running");
    setRunError(null);
    setNodeStatuses(new Map());
    setNodeRunResults(new Map());

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

  if (isLoading || authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm text-zinc-400">Loading your workflow canvas...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 p-4">
        <div className="max-w-md w-full space-y-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-red-400">Unable to Load Workflow</h2>
          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-red-500/20">
            {error}
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push("/workflows")}
              className="inline-flex items-center space-x-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Workflows Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Universal Header */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-6 backdrop-blur shrink-0">
        <div className="flex items-center space-x-4">
          <Link
            href="/workflows"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all"
            title="Back to Workflows Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-zinc-950">
                <span className="text-xs font-black text-teal-400">O</span>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                orchestra.ai
              </h1>
              <p className="text-[10px] text-zinc-500">ID: {id}</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center space-x-3">
          {/* Validation Tooltip Pill */}
          {!validation.valid && (
            <span
              className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md max-w-xs truncate"
              title={validation.reason}
            >
              ⚠️ {validation.reason}
            </span>
          )}

          {/* Status Messages */}
          {saveStatus === "success" && (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="h-3 w-3" />
              <span>Saved!</span>
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">
              Save failed
            </span>
          )}
          {runState === "success" && (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="h-3 w-3" />
              <span>Run complete!</span>
            </span>
          )}
          {runState === "failed" && (
            <span
              className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md"
              title={runError || undefined}
            >
              Run failed
            </span>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || runState === "running"}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={!validation.valid || runState === "running"}
            title={!validation.valid ? validation.reason : "Execute DAG workflow"}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-md"
          >
            {runState === "running" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-white" />
            )}
            <span>{runState === "running" ? "Running..." : "Run Workflow"}</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Global Nav Links & Sign Out */}
          <Link
            href="/settings/api-keys"
            className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 px-3 py-2 text-xs font-semibold transition-colors"
            title="API Key Settings"
          >
            <Key className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">API Keys</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 px-3 py-2 text-xs font-semibold transition-colors"
            title={`Logged in as ${session?.user?.email}`}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Sign Out</span>
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
