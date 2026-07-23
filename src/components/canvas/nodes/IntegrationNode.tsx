import React from "react";
import { Handle, Position } from "reactflow";
import { Link2 } from "lucide-react";
import { CustomNode } from "@/store/canvasStore";

export default function IntegrationNode({ data, selected }: { data: CustomNode["data"]; selected: boolean }) {
  return (
    <div
      className={`relative min-w-[220px] rounded-xl border bg-zinc-900 px-4 py-3 shadow-lg transition-all ${
        selected ? "border-emerald-500 ring-1 ring-emerald-500" : "border-zinc-800"
      }`}
    >
      <div className="absolute inset-x-0 -top-px h-1 rounded-t-xl bg-gradient-to-r from-emerald-500 to-teal-500" />

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-emerald-500 border-2 border-zinc-900"
      />

      <div className="flex items-center space-x-2 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500">
          <Link2 className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-zinc-100">{data.label}</span>
      </div>

      <div className="mt-2.5 space-y-1.5 text-xs text-zinc-400">
        <div className="flex justify-between">
          <span className="text-zinc-500">Method:</span>
          <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-emerald-400 font-mono font-semibold">
            {data.config.method || "POST"}
          </span>
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-zinc-500">URL:</span>{" "}
          <span className="font-mono text-zinc-300">{data.config.endpoint || "N/A"}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-emerald-500 border-2 border-zinc-900"
      />
    </div>
  );
}
