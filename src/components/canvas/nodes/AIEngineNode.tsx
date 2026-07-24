import React from "react";
import { Handle, Position } from "reactflow";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { CustomNode, useCanvasStore } from "@/store/canvasStore";

export default function AIEngineNode({
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

    if (text.length > 100) {
      return text.slice(0, 100) + "...";
    }
    return text;
  };

  const previewText = getPreviewText();

  return (
    <div
      className={`relative min-w-[220px] max-w-[280px] rounded-xl border bg-zinc-900 px-4 py-3 shadow-lg transition-all ${
        selected ? "border-violet-500 ring-1 ring-violet-500" : "border-zinc-800"
      }`}
    >
      <div className="absolute inset-x-0 -top-px h-1 rounded-t-xl bg-gradient-to-r from-violet-500 to-purple-500" />

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-violet-500 border-2 border-zinc-900"
      />

      <div className="flex items-center space-x-2 pb-1.5 border-b border-zinc-800/80">
        <div className="rounded-lg bg-violet-500/10 p-1.5 text-violet-500">
          <Sparkles className="h-4 w-4 fill-violet-500/20" />
        </div>
        <span className="text-sm font-semibold text-zinc-100">{data.label}</span>
      </div>

      <div className="mt-2.5 space-y-1.5 text-xs text-zinc-400">
        <div className="flex justify-between">
          <span className="text-zinc-500">LLM Provider:</span>
          <span className="font-mono text-zinc-300">
            {data.config.provider || "GEMINI"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Model:</span>
          <span className="font-mono text-zinc-300">
            {data.config.model || "gemini-3.6-flash"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Temperature:</span>
          <span className="font-mono text-zinc-300">
            {data.config.temperature ?? 0.7}
          </span>
        </div>

        {/* Live Gemini Response Preview Card */}
        {runResult?.status === "SUCCESS" && previewText && (
          <div className="mt-2 space-y-1 rounded-lg border border-violet-500/30 bg-violet-950/20 p-2.5">
            <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
              <span>AI Response Preview</span>
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-zinc-200 line-clamp-3 whitespace-pre-wrap">
              {previewText}
            </p>
          </div>
        )}

        {/* Live Error Banner */}
        {runResult?.status === "FAILED" && (
          <div className="mt-2 space-y-1 rounded-lg border border-red-500/40 bg-red-950/40 p-2.5">
            <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-red-400 uppercase tracking-wider">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>Error</span>
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-red-300 line-clamp-2">
              {runResult.errorMessage || "Node execution failed"}
            </p>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-violet-500 border-2 border-zinc-900"
      />
    </div>
  );
}
