"use client";

import React from "react";
import { useCanvasStore, NodeConfig, CustomNode } from "@/store/canvasStore";
import {
  Play,
  Sparkles,
  Code2,
  Link2,
  ArrowRightToLine,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

export function LeftSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const paletteItems = [
    {
      type: "TRIGGER",
      label: "Trigger Node",
      description: "Start workflow manually, via webhook, or on a schedule.",
      icon: Play,
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      hoverBorder: "hover:border-amber-500/60 hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]",
    },
    {
      type: "AI_ENGINE",
      label: "AI Engine Node",
      description: "Execute a prompt with OpenAI, Anthropic, or Gemini.",
      icon: Sparkles,
      colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
      hoverBorder: "hover:border-indigo-500/60 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)]",
    },
    {
      type: "DATA_PROCESSOR",
      label: "Data Processor Node",
      description: "Run custom JavaScript or Python code snippets.",
      icon: Code2,
      colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      hoverBorder: "hover:border-blue-500/60 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.25)]",
    },
    {
      type: "INTEGRATION",
      label: "Integration Node",
      description: "Trigger external webhooks or REST API calls.",
      icon: Link2,
      colorClass: "text-teal-400 bg-teal-500/10 border-teal-500/30",
      hoverBorder: "hover:border-teal-500/60 hover:shadow-[0_0_15px_-3px_rgba(20,184,166,0.25)]",
    },
    {
      type: "OUTPUT",
      label: "Output Node",
      description: "Render the final result in custom formatting.",
      icon: ArrowRightToLine,
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      hoverBorder: "hover:border-emerald-500/60 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]",
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0F172A]/40 p-4 flex flex-col h-full overflow-y-auto shrink-0 z-10 backdrop-blur-xl custom-scrollbar">
      <div className="mb-6">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Node Palette
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Drag nodes onto the canvas to construct your AI workflow.
        </p>
      </div>

      <div className="space-y-3">
        {paletteItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              className={`group cursor-grab border border-slate-800/90 bg-slate-900/60 p-3 rounded-xl hover:bg-slate-800/80 active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] relative ${item.hoverBorder}`}
              onDragStart={(event) => onDragStart(event, item.type)}
              draggable
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded-lg border shadow-sm ${item.colorClass}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                    {item.label}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center space-x-1 text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 shadow-sm">
                  <GripVertical className="h-3 w-3" />
                  <span>+ Drag</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function RightSidebar() {
  const {
    nodes,
    selectedNodeId,
    nodeRunResults,
    updateNodeConfig,
    updateNodeLabel,
    deleteNode,
  } = useCanvasStore();

  const [activeTab, setActiveTab] = React.useState<"config" | "result">("config");
  const [showRawJson, setShowRawJson] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const selectedNode = nodes.find((n: CustomNode) => n.id === selectedNodeId);
  const runResult = selectedNode ? nodeRunResults.get(selectedNode.id) : undefined;

  if (!selectedNode) {
    return (
      <aside className="w-64 border-l border-slate-800/80 bg-[#0F172A]/40 p-4 flex flex-col h-full items-center justify-center text-slate-500 text-center shrink-0 z-10 backdrop-blur-xl">
        <div className="rounded-2xl border border-dashed border-slate-800 p-6 max-w-xs bg-slate-950/60 shadow-xl">
          <p className="text-xs leading-relaxed text-slate-400">
            Select a node on the canvas to configure its settings or inspect live output results.
          </p>
        </div>
      </aside>
    );
  }

  const { type, config, label } = selectedNode.data;

  const handleConfigChange = (key: keyof NodeConfig, value: unknown) => {
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  const handleCopyOutput = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format node output for display
  const getFormattedOutput = () => {
    if (!runResult?.output) return null;
    const outputObj = runResult.output as Record<string, unknown>;

    if (typeof outputObj.result === "string") return outputObj.result;
    if (typeof outputObj.text === "string") return outputObj.text;
    if (typeof outputObj.output === "string") return outputObj.output;
    return JSON.stringify(outputObj, null, 2);
  };

  const formattedOutputText = getFormattedOutput();

  return (
    <aside className="w-64 border-l border-slate-800/80 bg-[#0F172A]/40 p-4 flex flex-col h-full overflow-y-auto shrink-0 z-10 backdrop-blur-xl custom-scrollbar">
      {/* Sidebar Header */}
      <div className="pb-4 border-b border-zinc-800/80 flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Properties
          </h3>
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
            {type.replace("_", " ")}
          </span>
        </div>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="p-2 rounded-xl bg-red-950/30 text-red-400 hover:bg-red-900/40 border border-red-800/40 hover:border-red-700/60 transition-all shadow-sm"
          title="Delete Node"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Modern Segmented Control Tab Switcher */}
      <div className="flex rounded-2xl bg-zinc-950 p-1.5 border border-zinc-800/80 mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex-1 py-2 text-xs rounded-xl transition-all ${
            activeTab === "config"
              ? "bg-zinc-800 text-zinc-100 font-bold shadow-md border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200 font-semibold"
          }`}
        >
          Config
        </button>
        <button
          onClick={() => setActiveTab("result")}
          className={`flex-1 py-2 text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === "result"
              ? "bg-zinc-800 text-zinc-100 font-bold shadow-md border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200 font-semibold"
          }`}
        >
          <span>Result</span>
          {runResult?.status === "SUCCESS" && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
          {runResult?.status === "FAILED" && (
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab 1: Node Config */}
      {activeTab === "config" && (
        <div className="space-y-5">
          {/* Node Label */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              Node Name
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-200 placeholder-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
              value={label}
              onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
            />
          </div>

          {/* Dynamic configuration options based on Node Type */}
          {type === "TRIGGER" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Source Type
                </label>
                <select
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
                  value={config.triggerType || "MANUAL"}
                  onChange={(e) => handleConfigChange("triggerType", e.target.value)}
                >
                  <option value="MANUAL">Manual Trigger</option>
                  <option value="WEBHOOK">Webhook URL</option>
                  <option value="CRON">Cron Scheduler</option>
                </select>
              </div>
            </div>
          )}

          {type === "AI_ENGINE" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Provider
                </label>
                <select
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
                  value={config.provider || "GEMINI"}
                  onChange={(e) => handleConfigChange("provider", e.target.value)}
                >
                  <option value="OPENAI">OpenAI</option>
                  <option value="ANTHROPIC">Anthropic</option>
                  <option value="GEMINI">Gemini</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Model
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm font-mono text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
                  value={config.model || "gemini-3.6-flash"}
                  onChange={(e) => handleConfigChange("model", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  System Prompt
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 p-3.5 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all resize-none leading-relaxed"
                  value={config.systemPrompt || ""}
                  onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    Temperature
                  </label>
                  <span className="text-xs text-teal-400 font-mono font-bold">
                    {config.temperature ?? 0.7}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full accent-teal-500"
                  value={config.temperature ?? 0.7}
                  onChange={(e) => handleConfigChange("temperature", parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          {type === "DATA_PROCESSOR" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Language
                </label>
                <select
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
                  value={config.language || "javascript"}
                  onChange={(e) => handleConfigChange("language", e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Code Snippet
                </label>
                <textarea
                  rows={10}
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 p-3.5 text-xs font-mono text-cyan-300 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all resize-none leading-relaxed"
                  value={config.code || ""}
                  onChange={(e) => handleConfigChange("code", e.target.value)}
                />
              </div>
            </div>
          )}

          {type === "INTEGRATION" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Method
                </label>
                <select
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
                  value={config.method || "POST"}
                  onChange={(e) => handleConfigChange("method", e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Endpoint URL
                </label>
                <input
                  type="text"
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm font-mono text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
                  value={config.endpoint || ""}
                  onChange={(e) => handleConfigChange("endpoint", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    Body Template (JSON)
                  </label>
                  <span className="text-[10px] text-teal-400 font-mono">Variables allowed</span>
                </div>
                <textarea
                  rows={5}
                  placeholder='{"content": "{{previous_output}}"}'
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 p-3.5 text-xs font-mono text-cyan-300 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all resize-none leading-relaxed"
                  value={config.body || ""}
                  onChange={(e) => handleConfigChange("body", e.target.value)}
                />
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Use <code className="text-teal-400 font-mono">{"{{previous_output}}"}</code> or <code className="text-teal-400 font-mono">{"{{result}}"}</code> to insert data from upstream AI/Processor nodes.
                </p>
              </div>
            </div>
          )}

          {type === "OUTPUT" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Response Format
                </label>
                <select
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
                  value={config.format || "json"}
                  onChange={(e) => handleConfigChange("format", e.target.value)}
                >
                  <option value="json">JSON Object</option>
                  <option value="markdown">Markdown Text</option>
                  <option value="plain_text">Plain Text</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Execution Result */}
      {activeTab === "result" && (
        <div className="space-y-5">
          {!runResult ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-8 text-center space-y-3 bg-zinc-950/40">
              <Code2 className="h-8 w-8 text-zinc-600" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-300">No execution data yet</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Click <span className="text-teal-400 font-semibold">&quot;Run Workflow&quot;</span> in the header to execute this node and view live outputs.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Execution Status Banner */}
              <div className="flex items-center justify-between border border-zinc-800/80 bg-zinc-950 rounded-2xl p-3.5 shadow-sm">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Status
                </span>
                {runResult.status === "SUCCESS" && (
                  <span className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>SUCCESS</span>
                  </span>
                )}
                {runResult.status === "FAILED" && (
                  <span className="inline-flex items-center space-x-1.5 rounded-lg bg-red-500/10 border border-red-500/30 px-2.5 py-1 text-xs font-bold text-red-400">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>FAILED</span>
                  </span>
                )}
                {runResult.status === "RUNNING" && (
                  <span className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 text-xs font-bold text-blue-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>RUNNING</span>
                  </span>
                )}
                {runResult.status === "PENDING" && (
                  <span className="inline-flex items-center space-x-1.5 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
                    PENDING
                  </span>
                )}
              </div>

              {/* SUCCESS State Output Viewer */}
              {runResult.status === "SUCCESS" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Node Output Result
                    </span>
                    {formattedOutputText && (
                      <button
                        onClick={() => handleCopyOutput(formattedOutputText)}
                        className="inline-flex items-center space-x-1 text-xs text-zinc-400 hover:text-teal-400 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {formattedOutputText ? (
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-3.5 space-y-3 shadow-inner">
                      <div className="max-h-72 overflow-y-auto font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap selection:bg-teal-500 selection:text-zinc-950">
                        {formattedOutputText}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      Node executed successfully but returned empty output.
                    </p>
                  )}

                  {/* Toggle Raw JSON payload */}
                  <div className="pt-1">
                    <button
                      onClick={() => setShowRawJson(!showRawJson)}
                      className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showRawJson ? "▲ Hide Raw JSON Payload" : "▼ View Raw JSON Payload"}
                    </button>

                    {showRawJson && (
                      <div className="mt-2 rounded-xl border border-zinc-800/80 bg-zinc-950 p-3 max-h-48 overflow-y-auto font-mono text-[11px] text-teal-400">
                        <pre>{JSON.stringify(runResult.output, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FAILED State Error Container */}
              {runResult.status === "FAILED" && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Node Execution Error</span>
                  </div>
                  <p className="text-xs text-red-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {runResult.errorMessage || "An unknown error occurred during node execution."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
