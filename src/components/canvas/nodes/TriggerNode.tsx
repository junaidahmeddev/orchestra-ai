import React from "react";
import { Handle, Position } from "reactflow";
import { Play } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function TriggerNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative w-44 rounded-xl border bg-slate-900/80 backdrop-blur-md p-2.5 transition-all duration-200 ${
        selected
          ? "border-amber-500 ring-2 ring-amber-500/40 shadow-[0_0_20px_-3px_rgba(245,158,11,0.45)]"
          : "border-amber-500/50 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)] hover:border-amber-400 hover:shadow-[0_0_25px_-2px_rgba(245,158,11,0.4)]"
      }`}
    >
      <div className="flex items-center space-x-1.5 pb-1.5 border-b border-slate-800/80">
        <div className="rounded-lg bg-amber-500/10 p-1 text-amber-400 border border-amber-500/30 shadow-sm">
          <Play className="h-3 w-3 fill-amber-400/20" />
        </div>
        <span className="text-[11px] font-bold text-slate-100 tracking-tight truncate">{data.label}</span>
      </div>

      <div className="mt-1.5 space-y-1 text-[10px] text-slate-400">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-400">Trigger Type:</span>
          <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-amber-300 font-mono text-[9px] font-bold">
            {data.config.triggerType || "MANUAL"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-amber-400 border-2 border-slate-950 hover:scale-150 transition-transform cursor-crosshair shadow-[0_0_10px_rgba(245,158,11,0.8)]"
      />
    </div>
  );
}
