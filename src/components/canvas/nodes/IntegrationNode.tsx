import React from "react";
import { Handle, Position } from "reactflow";
import { Link2 } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function IntegrationNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative w-48 rounded-xl border bg-slate-900/80 backdrop-blur-md p-2.5 transition-all duration-200 ${
        selected
          ? "border-teal-500 ring-2 ring-teal-500/40 shadow-[0_0_20px_-3px_rgba(20,184,166,0.45)]"
          : "border-teal-500/50 shadow-[0_0_15px_-3px_rgba(20,184,166,0.25)] hover:border-teal-400 hover:shadow-[0_0_25px_-2px_rgba(20,184,166,0.4)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-teal-400 border-2 border-slate-950 hover:scale-150 transition-transform cursor-crosshair shadow-[0_0_10px_rgba(20,184,166,0.8)]"
      />

      <div className="flex items-center space-x-1.5 pb-1.5 border-b border-slate-800/80">
        <div className="rounded-lg bg-teal-500/10 p-1 text-teal-400 border border-teal-500/30 shadow-sm">
          <Link2 className="h-3 w-3" />
        </div>
        <span className="text-[11px] font-bold text-slate-100 tracking-tight truncate">{data.label}</span>
      </div>

      <div className="mt-1.5 space-y-1 text-[10px] text-slate-400">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-400">Method:</span>
          <span className="rounded-md bg-teal-500/10 border border-teal-500/30 px-1.5 py-0.5 text-teal-300 font-mono text-[9px] font-bold">
            {data.config.method || "POST"}
          </span>
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap pt-0.5">
          <span className="font-medium text-slate-400">URL:</span>{" "}
          <span className="font-mono text-slate-200 font-medium text-[9px]">{data.config.endpoint || "N/A"}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-teal-400 border-2 border-slate-950 hover:scale-150 transition-transform cursor-crosshair shadow-[0_0_10px_rgba(20,184,166,0.8)]"
      />
    </div>
  );
}
