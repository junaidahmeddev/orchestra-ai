"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FileText,
  LogOut,
  Loader2,
  Calendar,
  Key,
  Trash2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingWorkflowId, setDeletingWorkflowId] = useState<string | null>(null);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchWorkflows = async () => {
    try {
      setError(null);
      const res = await fetch("/api/workflows");
      if (!res.ok) {
        throw new Error("Failed to fetch workflows");
      }
      const data = await res.json();
      setWorkflows(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Something went wrong while loading workflows.");
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchWorkflows();
    }
  }, [status]);

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Untitled Workflow",
          description: "New visual AI automation pipeline",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create workflow");
      }

      const newWorkflow = await res.json();
      router.push(`/workflows/${newWorkflow.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to create workflow.");
      setIsCreating(false);
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!workflowToDelete) return;
    setDeletingWorkflowId(workflowToDelete.id);
    setError(null);

    try {
      const res = await fetch(`/api/workflows/${workflowToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete workflow");
      }

      setWorkflows((prev) => prev.filter((w) => w.id !== workflowToDelete.id));
      setWorkflowToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to delete workflow.");
    } finally {
      setDeletingWorkflowId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Dashboard Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/40 px-8 py-4 backdrop-blur flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <span className="text-sm font-black text-teal-400">O</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              orchestra.ai
            </h1>
            <p className="text-xs text-zinc-500">
              Logged in as: {session?.user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/settings/api-keys"
            className="inline-flex items-center space-x-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <Key className="h-3.5 w-3.5 text-teal-400" />
            <span>API Keys</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center space-x-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Workflows
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Create and manage your visual AI automation pipelines.
            </p>
          </div>

          <button
            onClick={handleCreateWorkflow}
            disabled={isCreating}
            className="inline-flex items-center space-x-2 rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors disabled:opacity-50 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{isCreating ? "Creating Workflow..." : "New Workflow"}</span>
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Workflows List Grid */}
        {isLoadingWorkflows ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <p className="text-xs text-zinc-500">Fetching your workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-zinc-800 border-dashed rounded-2xl p-16 text-center space-y-4 bg-zinc-900/10">
            <div className="rounded-full bg-zinc-900 border border-zinc-800 p-4 text-teal-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-zinc-200">
                No workflows created yet
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Get started by creating your first visual node-based AI workflow canvas.
              </p>
            </div>
            <button
              onClick={handleCreateWorkflow}
              disabled={isCreating}
              className="inline-flex items-center space-x-2 rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span>Create Your First Workflow</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group relative border border-zinc-800 bg-zinc-900/20 rounded-2xl p-6 hover:border-zinc-700 transition-all flex flex-col justify-between hover:shadow-md hover:bg-zinc-900/30"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="font-semibold text-zinc-200 group-hover:text-teal-400 transition-colors line-clamp-1 flex-1 mr-2"
                    >
                      {workflow.name}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setWorkflowToDelete(workflow);
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                      title="Delete Workflow"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {workflow.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-zinc-600 mt-6 pt-4 border-t border-zinc-800/60 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    href={`/workflows/${workflow.id}`}
                    className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Open Canvas →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {workflowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="rounded-xl bg-red-500/10 p-2.5 border border-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  Delete Workflow?
                </h3>
                <p className="text-xs text-zinc-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-teal-400">
                "{workflowToDelete.name}"
              </span>
              ? All saved nodes, edges, and execution history will be removed.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setWorkflowToDelete(null)}
                disabled={deletingWorkflowId === workflowToDelete.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWorkflow}
                disabled={deletingWorkflowId === workflowToDelete.id}
                className="inline-flex items-center space-x-2 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                {deletingWorkflowId === workflowToDelete.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Workflow</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
