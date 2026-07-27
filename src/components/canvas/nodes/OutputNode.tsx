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
      className={`relative w-48 rounded-xl border bg-zinc-900/95 p-2.5 transition-all ${
        selected
          ? "border-rose-500 ring-2 ring-rose-500/30 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]"
          : "border-rose-500/40 shadow-[0_0_10px_-3px_rgba(244,63,94,0.1)] hover:border-rose-500/70"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-rose-500 border-2 border-zinc-950 hover:scale-125 transition-transform cursor-crosshair shadow-md"
      />

      <div className="flex items-center space-x-1.5 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded bg-rose-500/10 p-1 text-rose-400 border border-rose-500/20 shadow-sm">
          <ArrowRightToLine className="h-3 w-3" />
        </div>
        <span className="text-[11px] font-bold text-zinc-100 tracking-tight truncate">{data.label}</span>
      </div>

      <div className="mt-1.5 space-y-1 text-[10px] text-zinc-400">
        <div className="flex justify-between items-center">
          <span className="font-medium text-zinc-400">Format:</span>
          <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 text-rose-300 font-mono text-[9px] font-bold">
            {data.config.format || "json"}
          </span>
        </div>

        {runResult?.status === "SUCCESS" && previewText && (
          <div className="pt-1.5 mt-1.5 border-t border-zinc-800/80 space-y-0.5 rounded border border-emerald-500/30 bg-zinc-950/80 p-1.5 shadow-inner">
            <div className="flex items-center space-x-1 text-[8px] font-bold text-emerald-400 uppercase tracking-widest">
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
              <span>Final Output</span>
            </div>
            <p className="font-mono text-[9px] leading-relaxed text-zinc-300 line-clamp-2">
              {previewText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
