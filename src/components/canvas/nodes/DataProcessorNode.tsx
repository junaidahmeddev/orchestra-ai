import React from "react";
import { Handle, Position } from "reactflow";
import { Code2 } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function DataProcessorNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative min-w-[200px] rounded-xl border bg-zinc-900 px-4 py-3 shadow-lg transition-all ${
        selected ? "border-blue-500 ring-1 ring-blue-500" : "border-zinc-800"
      }`}
    >
      <div className="absolute inset-x-0 -top-px h-1 rounded-t-xl bg-gradient-to-r from-blue-500 to-indigo-500" />

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 border-2 border-zinc-900"
      />

      <div className="flex items-center space-x-2 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-500">
          <Code2 className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-zinc-100">{data.label}</span>
      </div>

      <div className="mt-2.5 space-y-1 text-xs text-zinc-400">
        <div>
          <span className="font-medium text-zinc-500">Language:</span>{" "}
          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-400 font-mono">
            {data.config.language || "javascript"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 border-2 border-zinc-900"
      />
    </div>
  );
}
