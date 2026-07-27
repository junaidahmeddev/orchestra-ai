import React from "react";
import { Handle, Position } from "reactflow";
import { Link2 } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function IntegrationNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative w-48 rounded-xl border bg-zinc-900/95 p-2.5 transition-all ${
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
          : "border-emerald-500/40 shadow-[0_0_10px_-3px_rgba(16,185,129,0.1)] hover:border-emerald-500/70"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-emerald-500 border-2 border-zinc-950 hover:scale-125 transition-transform cursor-crosshair shadow-md"
      />

      <div className="flex items-center space-x-1.5 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded bg-emerald-500/10 p-1 text-emerald-400 border border-emerald-500/20 shadow-sm">
          <Link2 className="h-3 w-3" />
        </div>
        <span className="text-[11px] font-bold text-zinc-100 tracking-tight truncate">{data.label}</span>
      </div>

      <div className="mt-1.5 space-y-1 text-[10px] text-zinc-400">
        <div className="flex justify-between items-center">
          <span className="font-medium text-zinc-400">Method:</span>
          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 text-emerald-300 font-mono text-[9px] font-bold">
            {data.config.method || "POST"}
          </span>
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap pt-0.5">
          <span className="font-medium text-zinc-400">URL:</span>{" "}
          <span className="font-mono text-zinc-200 font-medium text-[9px]">{data.config.endpoint || "N/A"}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-emerald-500 border-2 border-zinc-950 hover:scale-125 transition-transform cursor-crosshair shadow-md"
      />
    </div>
  );
}
