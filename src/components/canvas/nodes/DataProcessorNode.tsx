import React from "react";
import { Handle, Position } from "reactflow";
import { Code2 } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function DataProcessorNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative w-44 rounded-xl border bg-slate-900/80 backdrop-blur-md p-2.5 transition-all duration-200 ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500/40 shadow-[0_0_20px_-3px_rgba(59,130,246,0.45)]"
          : "border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.25)] hover:border-blue-400 hover:shadow-[0_0_25px_-2px_rgba(59,130,246,0.4)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-400 border-2 border-slate-950 hover:scale-150 transition-transform cursor-crosshair shadow-[0_0_10px_rgba(59,130,246,0.8)]"
      />

      <div className="flex items-center space-x-1.5 pb-1.5 border-b border-slate-800/80">
        <div className="rounded-lg bg-blue-500/10 p-1 text-blue-400 border border-blue-500/30 shadow-sm">
          <Code2 className="h-3 w-3" />
        </div>
        <span className="text-[11px] font-bold text-slate-100 tracking-tight truncate">{data.label}</span>
      </div>

      <div className="mt-1.5 space-y-1 text-[10px] text-slate-400">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-400">Language:</span>
          <span className="rounded-md bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.5 text-blue-300 font-mono text-[9px] font-bold">
            {data.config.language || "javascript"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-400 border-2 border-slate-950 hover:scale-150 transition-transform cursor-crosshair shadow-[0_0_10px_rgba(59,130,246,0.8)]"
      />
    </div>
  );
}
