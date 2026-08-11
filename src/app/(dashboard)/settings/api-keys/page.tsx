"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Key,
  Trash2,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  LogOut,
  AlertTriangle,
} from "lucide-react";

interface StoredApiKey {
  id: string;
  provider: "GEMINI" | "OPENAI" | "ANTHROPIC";
  label: string;
  createdAt: string;
}

export default function ApiKeysSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [keys, setKeys] = useState<StoredApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);

  // Form State
  const [provider, setProvider] = useState<"GEMINI" | "OPENAI" | "ANTHROPIC">("GEMINI");
  const [label, setLabel] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showRawKey, setShowRawKey] = useState(false);

  // UI Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<StoredApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchKeys = async () => {
    try {
      setError(null);
      const res = await fetch("/api/api-keys");
      if (!res.ok) {
        throw new Error("Failed to fetch API keys");
      }
      const data = await res.json();
      setKeys(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load keys";
      setError(msg);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchKeys();
    }
  }, [status]);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setError("Please enter a valid API key.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const defaultLabel =
        label.trim() || `${provider === "GEMINI" ? "Google Gemini" : provider} Key`;

      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          key: apiKeyInput.trim(),
          label: defaultLabel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save API key");
      }

      setSuccessMessage(`Successfully saved encrypted ${provider} key!`);
      setApiKeyInput("");
      setLabel("");
      await fetchKeys();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save key";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    setDeletingId(keyToDelete.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/api-keys/${keyToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete API key");
      }

      setSuccessMessage("API key deleted successfully.");
      setKeys((prev) => prev.filter((k) => k.id !== keyToDelete.id));
      setKeyToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete key";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm text-zinc-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Universal Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/40 px-8 py-4 backdrop-blur flex items-center justify-between">
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
              <p className="text-[10px] text-zinc-500">API Key Settings</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/workflows"
            className="inline-flex items-center space-x-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-all"
          >
            <span>Workflows</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center space-x-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-400 transition-all"
            title={`Logged in as ${session?.user?.email}`}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              LLM Provider Credentials
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Store your personal Google Gemini API key to execute AI Engine nodes in your workflows. Your keys are encrypted using AES-256 and never logged or exposed.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
            <span>AES-256 Encrypted</span>
          </div>
        </div>

        {/* Status Banners */}
        {error && (
          <div className="flex items-center space-x-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center space-x-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Add API Key Form Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-zinc-800/80 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Add New Provider Key
              </h3>
              <p className="text-xs text-zinc-400">
                Select your provider and paste your API key below.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  AI Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) =>
                    setProvider(
                      e.target.value as "GEMINI" | "OPENAI" | "ANTHROPIC"
                    )
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  <option value="GEMINI">Google Gemini (Recommended / Free Tier)</option>
                  <option value="OPENAI">OpenAI (GPT-4 / GPT-3.5)</option>
                  <option value="ANTHROPIC">Anthropic (Claude)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Label / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Personal Gemini Key"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showRawKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-3 pr-10 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowRawKey(!showRawKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showRawKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Encrypting & Saving...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Save Key</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Keys Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-200">
              Configured API Keys
            </h3>
            <span className="text-xs text-zinc-500">
              {keys.length} key{keys.length === 1 ? "" : "s"} saved
            </span>
          </div>

          {isLoadingKeys ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center space-y-3">
              <Key className="h-8 w-8 text-zinc-600" />
              <p className="text-sm font-medium text-zinc-300">
                No API keys configured yet
              </p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Add your Google Gemini API key above to start running AI nodes in your visual workflows.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/20">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs font-medium text-zinc-400">
                  <tr>
                    <th className="px-6 py-3">Provider</th>
                    <th className="px-6 py-3">Label</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date Added</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {keys.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/40">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1.5 rounded-md bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
                          <Sparkles className="h-3 w-3" />
                          <span>{item.provider}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-200">
                        {item.label}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                        Encrypted (AES-256)
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setKeyToDelete(item)}
                          className="inline-flex items-center space-x-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Key Modal */}
      {keyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="rounded-xl bg-red-500/10 p-2.5 border border-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  Delete API Key?
                </h3>
                <p className="text-xs text-zinc-400">
                  This key will be permanently removed.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-teal-400">
                &quot;{keyToDelete.label}&quot;
              </span>
              ? Workflows relying on this {keyToDelete.provider} key will fail until a new key is added.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setKeyToDelete(null)}
                disabled={deletingId === keyToDelete.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteKey}
                disabled={deletingId === keyToDelete.id}
                className="inline-flex items-center space-x-2 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                {deletingId === keyToDelete.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Key</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
