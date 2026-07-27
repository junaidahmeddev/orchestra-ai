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
  Workflow as WorkflowIcon,
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
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete Modal State
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

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    try {
      const finalName = newWorkflowName.trim() || "Untitled Workflow";
      const finalDesc = newWorkflowDesc.trim() || "New visual AI automation pipeline";

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          description: finalDesc,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create workflow");
      }

      const newWorkflow = await res.json();
      setIsCreateModalOpen(false);
      setNewWorkflowName("");
      setNewWorkflowDesc("");
      router.push(`/workflows/${newWorkflow.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to create workflow.");
    } finally {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-teal-500/20 selection:text-teal-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 transition-colors"
            >
              <WorkflowIcon className="h-5 w-5" />
            </Link>
            <div>
              <Link href="/" className="font-bold text-lg text-zinc-100 tracking-tight hover:opacity-90">
                orchestra<span className="text-teal-400">.ai</span>
              </Link>
              {session?.user?.email && (
                <p className="text-xs text-zinc-500 font-mono">
                  Logged in as: {session.user.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/settings/api-keys"
              className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition-all"
            >
              <Key className="h-3.5 w-3.5 text-teal-400" />
              <span>API Keys</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Title Section */}
        <div className="mb-8 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Workflows
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Create, configure, and execute your visual node-based AI pipelines.
            </p>
          </div>

          <button
            onClick={() => {
              setNewWorkflowName("");
              setNewWorkflowDesc("");
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-teal-500/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Workflow</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workflows List Grid / Empty State */}
        {isLoadingWorkflows ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 animate-pulse space-y-4"
              >
                <div className="h-5 w-2/3 bg-zinc-800 rounded-md" />
                <div className="h-3 w-5/6 bg-zinc-800/60 rounded-md" />
                <div className="h-3 w-1/2 bg-zinc-800/60 rounded-md pt-4" />
              </div>
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-zinc-800 border-dashed rounded-2xl p-16 text-center space-y-4 bg-zinc-900/10">
            <div className="rounded-2xl bg-teal-500/10 border border-teal-500/20 p-4 text-teal-400 shadow-lg shadow-teal-500/10">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-200">
                No workflows created yet
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Get started by creating your first visual node-based AI workflow canvas.
              </p>
            </div>
            <button
              onClick={() => {
                setNewWorkflowName("");
                setNewWorkflowDesc("");
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 rounded-xl bg-teal-500 hover:bg-teal-400 px-5 py-2.5 text-xs font-bold text-zinc-950 transition-all shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Workflow</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group relative border border-zinc-800/80 bg-zinc-900/30 rounded-2xl p-6 hover:border-teal-500/40 transition-all flex flex-col justify-between hover:shadow-lg hover:shadow-zinc-950/50 hover:bg-zinc-900/60"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="font-bold text-base text-zinc-100 group-hover:text-teal-300 transition-colors line-clamp-1 flex-1 mr-2"
                    >
                      {workflow.name}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setWorkflowToDelete(workflow);
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Delete Workflow"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {workflow.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-zinc-500 mt-6 pt-4 border-t border-zinc-800/80 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
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

      {/* Create Workflow Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-teal-500/10 p-2.5 border border-teal-500/30 text-teal-400">
                  <WorkflowIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Create New Workflow
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Name your visual AI automation pipeline
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Workflow Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer Support AI Agent"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Short description of what this workflow does..."
                  value={newWorkflowDesc}
                  onChange={(e) => setNewWorkflowDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center space-x-2 rounded-xl bg-teal-500 hover:bg-teal-400 px-5 py-2.5 text-xs font-bold text-zinc-950 transition-colors disabled:opacity-50 shadow-md"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create & Open Canvas</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {workflowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="rounded-xl bg-red-500/10 p-2.5 border border-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Delete Workflow?
                </h3>
                <p className="text-xs text-zinc-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
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
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWorkflow}
                disabled={deletingWorkflowId === workflowToDelete.id}
                className="inline-flex items-center space-x-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-md"
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
