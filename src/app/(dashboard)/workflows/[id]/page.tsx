"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
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
  Pencil,
  Workflow as WorkflowIcon,
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

  // Inline Title Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const {
    nodes,
    edges,
    workflowName,
    updateWorkflowName,
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

  useEffect(() => {
    setTitleInput(workflowName);
  }, [workflowName]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() !== workflowName) {
      updateWorkflowName(id, titleInput);
    }
  };

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

          const statusMap = new Map<string, string>();
          const resultsMap = new Map<string, NodeRunResult>();

          for (const nr of data.nodeRuns) {
            statusMap.set(nr.nodeId, nr.status);
            resultsMap.set(nr.nodeId, nr);
          }

          setNodeStatuses(statusMap);
          setNodeRunResults(resultsMap);

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
              setRunError(data.errorMessage || "Workflow execution failed");
              setTimeout(() => {
                setRunState("idle");
                setRunError(null);
              }, 5000);
            }
          }
        } catch {
          // Keep polling silently
        }
      }, 1000);
    },
    [setNodeRunResults]
  );

  const handleRunWorkflow = async () => {
    if (!validation.valid) return;

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
      {/* Canvas Header Bar */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-6 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <Link
            href="/workflows"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all shadow-sm"
            title="Back to Workflows Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="h-5 w-px bg-zinc-800/80 hidden sm:block" />

          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-sm shadow-teal-500/10">
              <WorkflowIcon className="h-5 w-5" />
            </div>

            {/* Prominent Workflow Title & Muted ID */}
            <div>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSubmit();
                  }}
                  autoFocus
                  className="rounded-lg border border-teal-500/60 bg-zinc-950 px-2.5 py-0.5 text-base font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="group flex items-center space-x-2 text-left hover:bg-zinc-800/50 px-2 py-0.5 rounded-lg transition-colors"
                  title="Click to rename workflow"
                >
                  <span className="text-base font-bold text-zinc-100 tracking-tight">
                    {workflowName}
                  </span>
                  <Pencil className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider px-2">ID: {id}</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center space-x-3">
          {/* Pre-Run Validation Tooltip Pill */}
          {!validation.valid && (
            <span
              className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl max-w-xs truncate"
              title={validation.reason}
            >
              ⚠️ {validation.reason}
            </span>
          )}

          {/* Execution & Save Status Messages */}
          {saveStatus === "success" && (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
              Save failed
            </span>
          )}
          {runState === "success" && (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Run complete</span>
            </span>
          )}
          {runState === "failed" && (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{runError || "Run failed"}</span>
            </span>
          )}

          {/* Grouped Primary Action Cluster (Save & Run) */}
          <div className="flex items-center space-x-2 bg-zinc-950/60 p-1 rounded-2xl border border-zinc-800/80">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || runState === "running"}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 text-zinc-400" />
              )}
              <span>Save</span>
            </button>

            {/* Run Button (Primary Standout CTA) */}
            <button
              onClick={handleRunWorkflow}
              disabled={!validation.valid || isSaving || runState === "running"}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-1.5 text-xs font-bold text-zinc-950 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 border border-teal-400/30"
            >
              {runState === "running" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Run Workflow</span>
                </>
              )}
            </button>
          </div>

          <div className="h-5 w-px bg-zinc-800/80 mx-1" />

          {/* Quick Settings Link */}
          <Link
            href="/settings/api-keys"
            className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 transition-all"
            title="API Keys Settings"
          >
            <Key className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">API Keys</span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        <div className="flex-1 relative">
          <FlowCanvas nodeStatuses={nodeStatuses} />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}
