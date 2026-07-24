import React from "react";
import { Handle, Position } from "reactflow";
import { ArrowRightToLine, CheckCircle2, AlertTriangle } from "lucide-react";
import { CustomNode, useCanvasStore } from "@/store/canvasStore";

export default function OutputNode({
  id,
  data,
  selected,
}: {
  id: string;
  data: CustomNode["data"];
  selected: boolean;
}) {
  const nodeRunResults = useCanvasStore((state) => state.nodeRunResults);
  const runResult = nodeRunResults.get(id);

  // Extract preview text from output object
  const getPreviewText = () => {
    if (!runResult?.output) return "";
    const out = runResult.output as Record<string, unknown>;

    let text = "";
    if (typeof out.result === "string") text = out.result;
    else if (typeof out.text === "string") text = out.text;
    else if (typeof out.output === "string") text = out.output;
    else text = JSON.stringify(out);

    if (text.length > 120) {
      return text.slice(0, 120) + "...";
    }
    return text;
  };

  const previewText = getPreviewText();

  return (
    <div
      className={`relative min-w-[220px] max-w-[280px] rounded-xl border bg-zinc-900 px-4 py-3 shadow-lg transition-all ${
        selected ? "border-red-500 ring-1 ring-red-500" : "border-zinc-800"
      }`}
    >
      <div className="absolute inset-x-0 -top-px h-1 rounded-t-xl bg-gradient-to-r from-red-500 to-rose-500" />

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-red-500 border-2 border-zinc-900"
      />

      <div className="flex items-center space-x-2 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded-lg bg-red-500/10 p-1.5 text-red-500">
          <ArrowRightToLine className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-zinc-100">{data.label}</span>
      </div>

      <div className="mt-2 space-y-2 text-xs text-zinc-400">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-500">Format:</span>
          <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-400 font-mono text-[10px]">
            {data.config.format || "json"}
          </span>
        </div>

        {/* Live Execution Output Preview Card */}
        {runResult?.status === "SUCCESS" && previewText && (
          <div className="mt-2 space-y-1 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5">
            <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span>Final Output</span>
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-zinc-200 line-clamp-3 whitespace-pre-wrap">
              {previewText}
            </p>
          </div>
        )}

        {/* Live Execution Error Banner */}
        {runResult?.status === "FAILED" && (
          <div className="mt-2 space-y-1 rounded-lg border border-red-500/40 bg-red-950/40 p-2.5">
            <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-red-400 uppercase tracking-wider">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>Error</span>
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-red-300 line-clamp-2">
              {runResult.errorMessage || "Node failed during execution"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
