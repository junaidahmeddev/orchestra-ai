"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Zap,
  Bot,
  FileCode2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Workflow as WorkflowIcon,
  Layers,
  Activity,
  CheckCircle2,
  Lock,
  Terminal,
  Play,
  ArrowRightToLine,
  Code2,
} from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-teal-500/20 selection:text-teal-300 relative overflow-x-hidden">
      {/* Background Radial Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-sm shadow-teal-500/10">
              <WorkflowIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-zinc-100 tracking-tight">
                orchestra<span className="text-teal-400">.ai</span>
              </span>
              <span className="ml-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-400 uppercase tracking-wider">
                v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-900" />
            ) : session ? (
              <Link
                href="/workflows"
                className="inline-flex items-center space-x-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-bold text-zinc-950 shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-all hover:scale-[1.02]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-bold text-zinc-950 shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-all hover:scale-[1.02]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="relative px-6 pt-16 pb-10 text-center">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[140px]" />

          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>Zapier & n8n Simplicity — Built for Multi-Agent AI</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-6xl sm:leading-tight">
              Orchestrate AI Workflows <br />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Without Writing Code
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed">
              Construct visual node-based automation pipelines. Connect manual triggers,
              encrypted LLM prompts (Google Gemini, OpenAI), sandboxed code transformers,
              and external REST integrations in a live DAG execution canvas.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
              {session ? (
                <Link
                  href="/workflows"
                  className="inline-flex items-center space-x-2 rounded-xl bg-teal-500 px-7 py-3.5 text-base font-bold text-zinc-950 shadow-xl shadow-teal-500/25 border border-teal-400/40 hover:bg-teal-400 hover:scale-[1.02] transition-all"
                >
                  <span>Open Workflow Canvas</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center space-x-2 rounded-xl bg-teal-500 px-7 py-3.5 text-base font-bold text-zinc-950 shadow-xl shadow-teal-500/25 border border-teal-400/40 hover:bg-teal-400 hover:scale-[1.02] transition-all"
                  >
                    <span>Start Building Free</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-7 py-3.5 text-base font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700 transition-all shadow-md"
                  >
                    <span>Sign In to Account</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* HERO VISUAL — SIMULATED LIVE CANVAS PREVIEW */}
          <div className="mx-auto mt-12 max-w-6xl">
            <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/90 shadow-2xl shadow-zinc-950/90 backdrop-blur-md">
              {/* Window Titlebar */}
              <div className="flex h-11 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 font-mono text-xs text-zinc-400">
                    orchestra.ai — Visual Canvas Preview
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="inline-flex items-center space-x-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live DAG Active</span>
                  </span>
                </div>
              </div>

              {/* Window Body — Simulated Node Grid & Edges */}
              <div className="relative min-h-[380px] p-8 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px]">
                {/* SVG Flow Edges */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  {/* Path 1: Trigger -> AI Engine */}
                  <path
                    d="M 230 140 C 280 140, 290 140, 340 140"
                    fill="none"
                    stroke="url(#edge-gradient)"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  {/* Path 2: AI Engine -> Data Processor */}
                  <path
                    d="M 580 140 C 630 140, 640 140, 690 140"
                    fill="none"
                    stroke="url(#edge-gradient)"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  {/* Path 3: Data Processor -> Output */}
                  <path
                    d="M 930 140 C 970 140, 980 140, 1020 140"
                    fill="none"
                    stroke="url(#edge-gradient)"
                    strokeWidth="2.5"
                  />
                </svg>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  {/* Node 1: Trigger */}
                  <div className="rounded-xl border border-amber-500/40 bg-zinc-900/90 p-4 text-left shadow-lg backdrop-blur-md">
                    <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800/80">
                      <div className="rounded-lg bg-amber-500/20 p-1.5 text-amber-400">
                        <Play className="h-4 w-4 fill-amber-400/20" />
                      </div>
                      <span className="text-xs font-bold text-zinc-100">Manual Trigger</span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Source:</span>
                        <span className="font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          MANUAL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Status:</span>
                        <span className="font-semibold text-emerald-400">READY</span>
                      </div>
                    </div>
                  </div>

                  {/* Node 2: AI Engine */}
                  <div className="rounded-xl border border-purple-500/40 bg-zinc-900/90 p-4 text-left shadow-lg backdrop-blur-md">
                    <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800/80">
                      <div className="rounded-lg bg-purple-500/20 p-1.5 text-purple-400">
                        <Sparkles className="h-4 w-4 fill-purple-400/20" />
                      </div>
                      <span className="text-xs font-bold text-zinc-100">Gemini AI Engine</span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Model:</span>
                        <span className="font-mono text-purple-300">gemini-3.6-flash</span>
                      </div>
                      <div className="rounded bg-zinc-950 p-2 font-mono text-[10px] text-zinc-300 line-clamp-2 border border-zinc-800">
                        "Analyze ticket & generate summary"
                      </div>
                    </div>
                  </div>

                  {/* Node 3: Data Processor */}
                  <div className="rounded-xl border border-cyan-500/40 bg-zinc-900/90 p-4 text-left shadow-lg backdrop-blur-md">
                    <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800/80">
                      <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-400">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-zinc-100">JS Transformer</span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Sandbox:</span>
                        <span className="font-mono text-cyan-300">isolated-vm</span>
                      </div>
                      <div className="rounded bg-zinc-950 p-2 font-mono text-[10px] text-cyan-300 border border-zinc-800">
                        return &#123; summary: input &#125;;
                      </div>
                    </div>
                  </div>

                  {/* Node 4: Output */}
                  <div className="rounded-xl border border-rose-500/40 bg-zinc-900/90 p-4 text-left shadow-lg backdrop-blur-md">
                    <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800/80">
                      <div className="rounded-lg bg-rose-500/20 p-1.5 text-rose-400">
                        <ArrowRightToLine className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-zinc-100">JSON Output</span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Execution Complete</span>
                      </div>
                      <div className="rounded bg-zinc-950 p-2 font-mono text-[10px] text-emerald-300 border border-zinc-800">
                        &#123; status: 200, ok: true &#125;
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION (CONNECTED FLOW) */}
        <section className="relative mx-auto max-w-6xl px-6 py-16 border-t border-zinc-800/60">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Architecture & Execution Model
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-zinc-100 sm:text-4xl">
              How orchestra.ai Pipeline Runs Work
            </h2>
            <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
              Every workflow runs as an isolated Directed Acyclic Graph (DAG) with automatic topological sorting.
            </p>
          </div>

          {/* 5-Column Flex Layout for Cards & Identical Centered Arrows */}
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-3">
            {/* Step 1: Trigger */}
            <div className="flex-1 flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-zinc-900/60 p-6 text-left shadow-xl backdrop-blur-md transition-all hover:border-amber-500/60 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Zap className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                  Step 1
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">1. Trigger Signal</h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Start execution manually via the dashboard or trigger asynchronously using external API event payloads.
                </p>
              </div>
            </div>

            {/* Connector Arrow 1 (Centered in gap) */}
            <div className="hidden md:flex flex-col items-center justify-center self-center shrink-0 px-1 py-4">
              <div className="flex items-center space-x-1">
                <div className="h-0.5 w-6 lg:w-8 bg-gradient-to-r from-amber-500/60 to-purple-500/60 rounded-full" />
                <ArrowRight className="h-4 w-4 text-purple-400 shrink-0 -ml-1.5" />
              </div>
            </div>

            {/* Step 2: AI Engine */}
            <div className="flex-1 flex flex-col justify-between rounded-2xl border border-purple-500/30 bg-zinc-900/60 p-6 text-left shadow-xl backdrop-blur-md transition-all hover:border-purple-500/60 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Bot className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-purple-300 uppercase tracking-wider">
                  Step 2
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">2. Multi-Agent LLM Prompt</h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Execute AI prompts using encrypted provider keys (Google Gemini, OpenAI) sorted in topological dependency order.
                </p>
              </div>
            </div>

            {/* Connector Arrow 2 (Centered in gap) */}
            <div className="hidden md:flex flex-col items-center justify-center self-center shrink-0 px-1 py-4">
              <div className="flex items-center space-x-1">
                <div className="h-0.5 w-6 lg:w-8 bg-gradient-to-r from-purple-500/60 to-rose-500/60 rounded-full" />
                <ArrowRight className="h-4 w-4 text-rose-400 shrink-0 -ml-1.5" />
              </div>
            </div>

            {/* Step 3: Output */}
            <div className="flex-1 flex flex-col justify-between rounded-2xl border border-rose-500/30 bg-zinc-900/60 p-6 text-left shadow-xl backdrop-blur-md transition-all hover:border-rose-500/60 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <FileCode2 className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-300 uppercase tracking-wider">
                  Step 3
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">3. Structured Response</h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Format final output, inspect run history logs, or forward results to external REST webhooks and endpoints.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXPANDED 6-FEATURE GRID */}
        <section className="relative mx-auto max-w-7xl px-6 py-24 border-t border-zinc-800/60">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-96 w-[500px] rounded-full bg-teal-500/5 blur-[140px]" />

          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Enterprise Features
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-zinc-100 sm:text-4xl">
              Built for Production-Grade Developer Automation
            </h2>
            <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
              Everything required to orchestrate production AI pipelines with complete security and zero HTTP timeouts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: Visual Canvas */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-zinc-700 transition-all hover:bg-zinc-900/60">
              <div className="space-y-3">
                <div className="inline-flex rounded-xl bg-teal-500/10 p-3 text-teal-400 border border-teal-500/20">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-100">Visual Node Canvas</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Interactive React Flow drag-and-drop editor with zoom, pan, minimap, and instant state persistence.
                </p>
              </div>
            </div>

            {/* Feature 2: 5 Core Node Types */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-zinc-700 transition-all hover:bg-zinc-900/60">
              <div className="space-y-3">
                <div className="inline-flex rounded-xl bg-purple-500/10 p-3 text-purple-400 border border-purple-500/20">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-100">5 Core Node Types</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Trigger, AI Engine (Gemini/OpenAI), Data Processor (JS), Integration (REST), and Output nodes out of the box.
                </p>
              </div>
            </div>

            {/* Feature 3: AES-256 Key Security */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-zinc-700 transition-all hover:bg-zinc-900/60">
              <div className="space-y-3">
                <div className="inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-100">AES-256 Encryption at Rest</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  BYO LLM provider keys are stored encrypted at rest using AES-256-CBC with per-key IV initialization vectors.
                </p>
              </div>
            </div>

            {/* Feature 4: Isolated JS Sandbox */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-zinc-700 transition-all hover:bg-zinc-900/60">
              <div className="space-y-3">
                <div className="inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-400 border border-cyan-500/20">
                  <Terminal className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-100">Isolated JS Sandbox</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Safely execute custom JavaScript transformations in 128MB, 5-second V8 isolates (`isolated-vm`).
                </p>
              </div>
            </div>

            {/* Feature 5: Inngest Background Queue */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-zinc-700 transition-all hover:bg-zinc-900/60">
              <div className="space-y-3">
                <div className="inline-flex rounded-xl bg-amber-500/10 p-3 text-amber-400 border border-amber-500/20">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-100">Inngest Job Queue</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Durable async background step queue architecture eliminates serverless 10-second HTTP timeouts.
                </p>
              </div>
            </div>

            {/* Feature 6: Real-Time Execution Tracking */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-zinc-700 transition-all hover:bg-zinc-900/60">
              <div className="space-y-3">
                <div className="inline-flex rounded-xl bg-rose-500/10 p-3 text-rose-400 border border-rose-500/20">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-100">Real-Time DAG Tracking</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Live status overlays (PENDING, RUNNING, SUCCESS, FAILED) with inspectable node inputs and output results.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-zinc-950 py-10 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <WorkflowIcon className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-zinc-200">
              orchestra<span className="text-teal-400">.ai</span>
            </span>
          </div>

          <p>© {new Date().getFullYear()} orchestra.ai — Open Source Visual Automation Tool</p>

          <div className="flex items-center space-x-6 text-xs">
            <Link href="/login" className="hover:text-zinc-300 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-zinc-300 transition-colors">
              Register
            </Link>
            <Link href="/workflows" className="hover:text-zinc-300 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
