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
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      type: "AI_ENGINE",
      label: "AI Engine Node",
      description: "Execute a prompt with OpenAI, Anthropic, or Gemini.",
      icon: Sparkles,
      colorClass: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    },
    {
      type: "DATA_PROCESSOR",
      label: "Data Processor Node",
      description: "Run custom JavaScript or Python code snippets.",
      icon: Code2,
      colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      type: "INTEGRATION",
      label: "Integration Node",
      description: "Trigger external webhooks or REST API calls.",
      icon: Link2,
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      type: "OUTPUT",
      label: "Output Node",
      description: "Render the final result in custom formatting.",
      icon: ArrowRightToLine,
      colorClass: "text-red-500 bg-red-500/10 border-red-500/20",
    },
  ];

  return (
    <aside className="w-80 border-r border-zinc-800 bg-zinc-900/40 p-5 flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Node Palette</h3>
        <p className="text-xs text-zinc-500 mt-1">Drag nodes onto the canvas to construct your AI workflow.</p>
      </div>

      <div className="space-y-4">
        {paletteItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              className="group cursor-grab border border-zinc-800 bg-zinc-900/50 p-4 rounded-xl hover:border-zinc-700 active:cursor-grabbing transition-all hover:shadow-md"
              onDragStart={(event) => onDragStart(event, item.type)}
              draggable
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border ${item.colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
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

  // Auto-switch to result tab if runResult exists and status changed
  const runResult = selectedNode ? nodeRunResults.get(selectedNode.id) : undefined;

  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-zinc-800 bg-zinc-900/40 p-5 flex flex-col h-full items-center justify-center text-zinc-500 text-center">
        <p className="text-sm">Select a node on the canvas to configure its settings or inspect output results.</p>
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
    <aside className="w-80 border-l border-zinc-800 bg-zinc-900/40 p-5 flex flex-col h-full overflow-y-auto">
      {/* Sidebar Header */}
      <div className="pb-4 border-b border-zinc-800 flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Properties</h3>
          <span className="text-xs text-zinc-500 uppercase">{type.replace("_", " ")}</span>
        </div>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="p-2 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-950/50 border border-red-900/30 hover:border-red-800 transition-colors"
          title="Delete Node"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === "config"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Config
        </button>
        <button
          onClick={() => setActiveTab("result")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === "result"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span>Result</span>
          {runResult?.status === "SUCCESS" && (
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          )}
          {runResult?.status === "FAILED" && (
            <span className="h-2 w-2 rounded-full bg-red-400" />
          )}
        </button>
      </div>

      {/* Tab 1: Node Config */}
      {activeTab === "config" && (
        <div className="space-y-6">
          {/* Node Label */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Node Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-teal-500 focus:outline-none"
              value={label}
              onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
            />
          </div>

        {/* Dynamic configuration options based on Node Type */}
        {type === "TRIGGER" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source Type</label>
              <select
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none"
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
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Provider</label>
              <select
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none"
                value={config.provider || "OPENAI"}
                onChange={(e) => handleConfigChange("provider", e.target.value)}
              >
                <option value="OPENAI">OpenAI</option>
                <option value="ANTHROPIC">Anthropic</option>
                <option value="GEMINI">Gemini</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Model</label>
              <input
                type="text"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none"
                value={config.model || "gpt-4o"}
                onChange={(e) => handleConfigChange("model", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Prompt</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none resize-none"
                value={config.systemPrompt || ""}
                onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Temperature</label>
                <span className="text-xs text-teal-400 font-mono">{config.temperature ?? 0.7}</span>
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
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Language</label>
              <select
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none"
                value={config.language || "javascript"}
                onChange={(e) => handleConfigChange("language", e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Code Snippet</label>
              <textarea
                rows={10}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs font-mono text-zinc-200 focus:border-teal-500 focus:outline-none resize-none"
                value={config.code || ""}
                onChange={(e) => handleConfigChange("code", e.target.value)}
              />
            </div>
          </div>
        )}

        {type === "INTEGRATION" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Method</label>
              <select
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none"
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
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Endpoint URL</label>
              <input
                type="text"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none"
                value={config.endpoint || ""}
                onChange={(e) => handleConfigChange("endpoint", e.target.value)}
              />
            </div>
          </div>
        )}

        {type === "OUTPUT" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Response Format</label>
              <select
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500 focus:outline-none"
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
        <div className="space-y-6">
          {!runResult ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl p-8 text-center space-y-3 bg-zinc-950/40">
              <Code2 className="h-8 w-8 text-zinc-600" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-300">No execution data yet</p>
                <p className="text-[11px] text-zinc-500">
                  Click <span className="text-teal-400 font-semibold">"Run Workflow"</span> in the header to execute this node and view live outputs.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Execution Status Banner */}
              <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950 rounded-xl p-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Status
                </span>
                {runResult.status === "SUCCESS" && (
                  <span className="inline-flex items-center space-x-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>SUCCESS</span>
                  </span>
                )}
                {runResult.status === "FAILED" && (
                  <span className="inline-flex items-center space-x-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>FAILED</span>
                  </span>
                )}
                {runResult.status === "RUNNING" && (
                  <span className="inline-flex items-center space-x-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>RUNNING</span>
                  </span>
                )}
                {runResult.status === "PENDING" && (
                  <span className="inline-flex items-center space-x-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
                    PENDING
                  </span>
                )}
              </div>

              {/* SUCCESS State Output Viewer */}
              {runResult.status === "SUCCESS" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
                            <span className="text-emerald-400">Copied</span>
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
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-3">
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
                      <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 max-h-48 overflow-y-auto font-mono text-[11px] text-teal-400">
                        <pre>{JSON.stringify(runResult.output, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FAILED State Error Container */}
              {runResult.status === "FAILED" && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-red-400 font-semibold text-xs uppercase tracking-wider">
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
