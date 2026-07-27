import React from "react";
import { Handle, Position } from "reactflow";
import { Code2 } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function DataProcessorNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative w-44 rounded-xl border bg-zinc-900/95 p-2.5 transition-all ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
          : "border-blue-500/40 shadow-[0_0_10px_-3px_rgba(59,130,246,0.1)] hover:border-blue-500/70"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-blue-500 border-2 border-zinc-950 hover:scale-125 transition-transform cursor-crosshair shadow-md"
      />

      <div className="flex items-center space-x-1.5 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded bg-blue-500/10 p-1 text-blue-400 border border-blue-500/20 shadow-sm">
          <Code2 className="h-3 w-3" />
        </div>
        <span className="text-[11px] font-bold text-zinc-100 tracking-tight truncate">{data.label}</span>
      </div>

      <div className="mt-1.5 space-y-1 text-[10px] text-zinc-400">
        <div className="flex justify-between items-center">
          <span className="font-medium text-zinc-400">Language:</span>
          <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1 py-0.5 text-blue-300 font-mono text-[9px] font-bold">
            {data.config.language || "javascript"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-blue-500 border-2 border-zinc-950 hover:scale-125 transition-transform cursor-crosshair shadow-md"
      />
    </div>
  );
}
