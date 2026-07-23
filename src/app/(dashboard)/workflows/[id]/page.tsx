"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useCanvasStore } from "@/store/canvasStore";
import FlowCanvas from "@/components/canvas/FlowCanvas";
import { LeftSidebar, RightSidebar } from "@/components/canvas/Sidebar";

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [saveStatus, setSaveStatus] = React.useState<"idle" | "success" | "error">("idle");

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

        <div className="flex items-center space-x-4">
          {saveStatus === "success" && (
            <span className="text-xs font-semibold text-emerald-400 animate-fade-in bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              Saved!
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs font-semibold text-red-400 animate-fade-in bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">
              Save failed
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Canvas"}</span>
          </button>
        </div>
      </header>


      {/* Editor Main Content Area */}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Left Side: Palette */}
        <LeftSidebar />

        {/* Center: Interactive Canvas */}
        <FlowCanvas />

        {/* Right Side: Property Editor */}
        <RightSidebar />
      </div>
    </div>
  );
}
