"use client";

import { useSession, signOut } from "next-auth/react";

export default function WorkflowsListPage() {
  const { data: session, status } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Workflows Dashboard
        </h1>

        {status === "loading" ? (
          <p className="text-sm text-zinc-400">Loading session...</p>
        ) : session ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Logged in as: <span className="font-semibold text-zinc-200">{session.user?.email}</span>
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full rounded-lg bg-red-600 hover:bg-red-500 py-2 px-4 text-sm font-medium text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <p className="text-sm text-red-400">Not authenticated</p>
        )}

        <div className="pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            Workflows dashboard list & editor connections will be built in Phase 3.
          </p>
        </div>
      </div>
    </main>
  );
}

