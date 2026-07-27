import React from "react";
import { Handle, Position } from "reactflow";
import { ArrowRightToLine, CheckCircle2 } from "lucide-react";
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

  const getPreviewText = () => {
    if (!runResult?.output) return "";
    const out = runResult.output as Record<string, unknown>;

    let text = "";
    if (typeof out.result === "string") text = out.result;
    else if (typeof out.text === "string") text = out.text;
    else if (typeof out.output === "string") text = out.output;
    else text = JSON.stringify(out);

    if (text.length > 60) {
      return text.slice(0, 60) + "...";
    }
    return text;
  };

  const previewText = getPreviewText();

  return (
    <div
      className={`relative w-48 rounded-xl border bg-slate-900/80 backdrop-blur-md p-2.5 transition-all duration-200 ${
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/40 shadow-[0_0_20px_-3px_rgba(16,185,129,0.45)]"
          : "border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)] hover:border-emerald-400 hover:shadow-[0_0_25px_-2px_rgba(16,185,129,0.4)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-emerald-400 border-2 border-slate-950 hover:scale-150 transition-transform cursor-crosshair shadow-[0_0_10px_rgba(16,185,129,0.8)]"
      />

      <div className="flex items-center space-x-1.5 pb-1.5 border-b border-slate-800/80">
        <div className="rounded-lg bg-emerald-500/10 p-1 text-emerald-400 border border-emerald-500/30 shadow-sm">
          <ArrowRightToLine className="h-3 w-3" />
        </div>
        <span className="text-[11px] font-bold text-slate-100 tracking-tight truncate">{data.label}</span>
      </div>

      <div className="mt-1.5 space-y-1 text-[10px] text-slate-400">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-400">Format:</span>
          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-emerald-300 font-mono text-[9px] font-bold">
            {data.config.format || "json"}
          </span>
        </div>

        {runResult?.status === "SUCCESS" && previewText && (
          <div className="pt-1.5 mt-1.5 border-t border-slate-800/80 space-y-0.5 rounded-lg border border-emerald-500/30 bg-slate-950/90 p-1.5 shadow-inner">
            <div className="flex items-center space-x-1 text-[8px] font-bold text-emerald-400 uppercase tracking-widest">
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
              <span>Final Output</span>
            </div>
            <p className="font-mono text-[9px] leading-relaxed text-slate-300 line-clamp-2">
              {previewText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
