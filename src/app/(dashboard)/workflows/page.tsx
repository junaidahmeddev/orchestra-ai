"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, LogOut, Loader2, Calendar } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await fetch("/api/workflows");
        if (!res.ok) {
          throw new Error("Failed to fetch workflows");
        }
        const data = await res.json();
        setWorkflows(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong while loading workflows.");
      } finally {
        setIsLoadingWorkflows(false);
      }
    };

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
    } catch (err: any) {
      setError(err.message || "Failed to create workflow.");
      setIsCreating(false);
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
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <span className="text-sm font-black text-teal-400">O</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              orchestra.ai
            </h1>
            <p className="text-xs text-zinc-500">Logged in as: {session?.user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center space-x-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-50 px-4 py-2 text-sm text-zinc-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Workflows</h2>
            <p className="text-sm text-zinc-400 mt-1">Create and manage your AI workflow integrations.</p>
          </div>

          <button
            onClick={handleCreateWorkflow}
            disabled={isCreating}
            className="inline-flex items-center space-x-2 rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{isCreating ? "Creating..." : "New Workflow"}</span>
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Workflows List Grid */}
        {isLoadingWorkflows ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-zinc-800 border-dashed rounded-2xl p-16 text-center space-y-4 bg-zinc-900/10">
            <div className="rounded-full bg-zinc-900 border border-zinc-800 p-4 text-zinc-500">
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">No workflows found</h3>
              <p className="text-xs text-zinc-500 max-w-xs">
                Create a new workflow canvas to get started with automation pipelines.
              </p>
            </div>
            <button
              onClick={handleCreateWorkflow}
              className="rounded-lg border border-zinc-800 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Link
                key={workflow.id}
                href={`/workflows/${workflow.id}`}
                className="group relative border border-zinc-800 bg-zinc-900/20 rounded-2xl p-6 hover:border-zinc-700 transition-all flex flex-col justify-between hover:shadow-md hover:bg-zinc-900/30"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-zinc-200 group-hover:text-teal-400 transition-colors">
                      {workflow.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium border ${
                        workflow.isActive
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}
                    >
                      {workflow.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {workflow.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-zinc-600 mt-6 pt-4 border-t border-zinc-800/60 text-[10px]">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
