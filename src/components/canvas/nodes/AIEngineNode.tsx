import React from "react";
import { Handle, Position } from "reactflow";
import { Sparkles } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function AIEngineNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative min-w-[220px] rounded-xl border bg-zinc-900 px-4 py-3 shadow-lg transition-all ${
        selected ? "border-violet-500 ring-1 ring-violet-500" : "border-zinc-800"
      }`}
    >
      <div className="absolute inset-x-0 -top-px h-1 rounded-t-xl bg-gradient-to-r from-violet-500 to-purple-500" />

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-violet-500 border-2 border-zinc-900"
      />

      <div className="flex items-center space-x-2 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded-lg bg-violet-500/10 p-1.5 text-violet-500">
          <Sparkles className="h-4 w-4 fill-violet-500/20" />
        </div>
        <span className="text-sm font-semibold text-zinc-100">{data.label}</span>
      </div>

      <div className="mt-2.5 space-y-1.5 text-xs text-zinc-400">
        <div className="flex justify-between">
          <span className="text-zinc-500">LLM Provider:</span>
          <span className="font-mono text-zinc-300">{data.config.provider || "OPENAI"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Model:</span>
          <span className="font-mono text-zinc-300">{data.config.model || "gpt-4o"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Temperature:</span>
          <span className="font-mono text-zinc-300">{data.config.temperature ?? 0.7}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-violet-500 border-2 border-zinc-900"
      />
    </div>
  );
}
