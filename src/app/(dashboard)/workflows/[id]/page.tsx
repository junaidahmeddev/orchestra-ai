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

  // Mobile Workspace Navigation State
  const [mobileTab, setMobileTab] = useState<"palette" | "canvas" | "properties">("canvas");

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
      return { valid: false, reason: "Workflow must have a Trigger node." };
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
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }));

      topologicalSort(engineNodes, engineEdges);
      return { valid: true };
    } catch (cycleErr: unknown) {
      const msg = cycleErr instanceof Error ? cycleErr.message : String(cycleErr);
      return { valid: false, reason: msg };
    }
  };

  const validation = getGraphValidation();

  const handleSave = async () => {
    try {
      setSaveStatus("idle");
      await saveWorkflow(id);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
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

    try {
      const res = await fetch(`/api/workflows/${id}/run`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to trigger workflow run");
      }

      const data = await res.json();
      if (data.runId) {
        pollRunStatus(data.runId);
      }
    } catch (err: unknown) {
      setRunState("failed");
      const msg = err instanceof Error ? err.message : String(err);
      setRunError(msg);
      setTimeout(() => {
        setRunState("idle");
        setRunError(null);
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090D16] text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm font-medium text-slate-400">
            Loading workflow canvas...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090D16] text-slate-100 p-4">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Error Loading Workflow
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {error}
            </p>
          </div>
          <button
            onClick={() => router.push("/workflows")}
            className="inline-flex items-center space-x-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Workflows Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#090D16] text-slate-100 overflow-hidden">
      {/* Canvas Header Bar */}
      <header className="flex flex-wrap md:flex-nowrap min-h-[56px] md:h-16 items-center justify-between border-b border-slate-800/80 bg-[#0F172A]/60 px-3 sm:px-6 py-2 md:py-0 backdrop-blur-xl shrink-0 z-10 shadow-xl gap-2 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <Link
            href="/workflows"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 transition-all shadow-sm shrink-0"
            title="Back to Workflows Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/10 shrink-0">
              <WorkflowIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            {/* Prominent Workflow Title & Muted ID */}
            <div className="min-w-0 max-w-[130px] sm:max-w-xs md:max-w-md">
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
                  className="w-full rounded-lg border border-cyan-500/60 bg-slate-950 px-2 py-0.5 text-xs sm:text-base font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="group flex items-center space-x-1.5 text-left hover:bg-slate-800/50 px-1.5 py-0.5 rounded-lg transition-colors truncate w-full"
                  title="Click to rename workflow"
                >
                  <span className="text-xs sm:text-base font-bold text-slate-100 tracking-tight truncate">
                    {workflowName}
                  </span>
                  <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono tracking-wider px-1.5 truncate">ID: {id}</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Pre-Run Validation Tooltip Pill */}
          {!validation.valid && (
            <span
              className="text-[10px] sm:text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 sm:px-3 py-1 rounded-xl max-w-[120px] sm:max-w-xs truncate"
              title={validation.reason}
            >
              ⚠️ {validation.reason}
            </span>
          )}

          {/* Execution & Save Status Messages */}
          {saveStatus === "success" && (
            <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-3 py-1 rounded-xl">
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Saved</span>
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-[10px] sm:text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 sm:px-3 py-1 rounded-xl">
              Save failed
            </span>
          )}
          {runState === "success" && (
            <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-3 py-1 rounded-xl">
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Done</span>
            </span>
          )}
          {runState === "failed" && (
            <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 sm:px-3 py-1 rounded-xl max-w-[120px] sm:max-w-xs truncate">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">{runError || "Failed"}</span>
            </span>
          )}

          {/* Grouped Primary Action Cluster (Save & Run) */}
          <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || runState === "running"}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">Save</span>
            </button>

            {/* Run Button */}
            <button
              onClick={handleRunWorkflow}
              disabled={!validation.valid || isSaving || runState === "running"}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs font-extrabold text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_0_20px_-3px_rgba(20,184,166,0.5)] border border-cyan-400/40"
            >
              {runState === "running" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">Running...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Run</span>
                </>
              )}
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Quick Settings Link */}
          <Link
            href="/settings/api-keys"
            className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-950 p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all"
            title="API Keys Settings"
          >
            <Key className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">API Keys</span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-950 p-2 sm:px-3 sm:py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Workspace Navigation Tab Bar */}
      <div className="flex md:hidden items-center justify-around bg-slate-950 border-b border-slate-800/80 p-1.5 shrink-0 z-20 text-xs font-semibold text-slate-400">
        <button
          onClick={() => setMobileTab("palette")}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
            mobileTab === "palette"
              ? "bg-slate-800 text-teal-400 font-bold border border-slate-700/60 shadow-sm"
              : "hover:text-slate-200"
          }`}
        >
          <span>🧩 Palette</span>
        </button>
        <button
          onClick={() => setMobileTab("canvas")}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
            mobileTab === "canvas"
              ? "bg-slate-800 text-teal-400 font-bold border border-slate-700/60 shadow-sm"
              : "hover:text-slate-200"
          }`}
        >
          <span>🎨 Canvas</span>
        </button>
        <button
          onClick={() => setMobileTab("properties")}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
            mobileTab === "properties"
              ? "bg-slate-800 text-teal-400 font-bold border border-slate-700/60 shadow-sm"
              : "hover:text-slate-200"
          }`}
        >
          <span>⚙️ Properties</span>
        </button>
      </div>

      {/* Main Canvas Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebars + Canvas */}
        <div className="hidden md:flex flex-1 overflow-hidden relative">
          <LeftSidebar />
          <div className="flex-1 relative">
            <FlowCanvas nodeStatuses={nodeStatuses} />
          </div>
          <RightSidebar />
        </div>

        {/* Mobile Viewports */}
        <div className="flex md:hidden flex-1 overflow-hidden relative w-full">
          {mobileTab === "palette" && (
            <LeftSidebar onNodeAdded={() => setMobileTab("canvas")} />
          )}
          {mobileTab === "canvas" && (
            <FlowCanvas nodeStatuses={nodeStatuses} />
          )}
          {mobileTab === "properties" && (
            <RightSidebar />
          )}
        </div>
      </div>
    </div>
  );
}
