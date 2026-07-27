import React from "react";
import { Handle, Position } from "reactflow";
import { Play } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function TriggerNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative w-44 rounded-xl border bg-zinc-900/95 p-2.5 transition-all ${
        selected
          ? "border-amber-500 ring-2 ring-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]"
          : "border-amber-500/40 shadow-[0_0_10px_-3px_rgba(245,158,11,0.1)] hover:border-amber-500/70"
      }`}
    >
      <div className="flex items-center space-x-1.5 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded bg-amber-500/10 p-1 text-amber-400 border border-amber-500/20 shadow-sm">
          <Play className="h-3 w-3 fill-amber-400/20" />
        </div>
        <span className="text-[11px] font-bold text-zinc-100 tracking-tight truncate">{data.label}</span>
      </div>

      <div className="mt-1.5 space-y-1 text-[10px] text-zinc-400">
        <div className="flex justify-between items-center">
          <span className="font-medium text-zinc-400">Trigger Type:</span>
          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 text-amber-300 font-mono text-[9px] font-bold">
            {data.config.triggerType || "MANUAL"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-amber-500 border-2 border-zinc-950 hover:scale-125 transition-transform cursor-crosshair shadow-md"
      />
    </div>
  );
}
