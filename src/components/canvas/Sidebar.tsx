"use client";

import React from "react";
import { useCanvasStore, NodeConfig } from "@/store/canvasStore";
import { Play, Sparkles, Code2, Link2, ArrowRightToLine, Trash2 } from "lucide-react";

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
    updateNodeConfig,
    updateNodeLabel,
    deleteNode,
  } = useCanvasStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-zinc-800 bg-zinc-900/40 p-5 flex flex-col h-full items-center justify-center text-zinc-500 text-center">
        <p className="text-sm">Select a node on the canvas to configure its settings.</p>
      </aside>
    );
  }

  const { type, config, label } = selectedNode.data;

  const handleConfigChange = (key: keyof NodeConfig, value: any) => {
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-900/40 p-5 flex flex-col h-full overflow-y-auto">
      <div className="pb-4 border-b border-zinc-800 flex justify-between items-center mb-6">
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
    </aside>
  );
}
