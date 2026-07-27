"use client";

import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowInstance,
  Panel,
  NodeProps,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { useCanvasStore, CustomNode } from "@/store/canvasStore";
import TriggerNode from "./nodes/TriggerNode";
import AIEngineNode from "./nodes/AIEngineNode";
import DataProcessorNode from "./nodes/DataProcessorNode";
import IntegrationNode from "./nodes/IntegrationNode";
import OutputNode from "./nodes/OutputNode";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";

interface FlowCanvasProps {
  nodeStatuses?: Map<string, string>;
}

type CustomNodeProps = NodeProps<CustomNode["data"]> & {
  nodeStatuses?: Map<string, string>;
};

const CustomNodeComponent = (props: CustomNodeProps) => {
  const { data, id } = props;
  const status = props.nodeStatuses?.get(id);

  let statusOverlay = null;
  let statusBorderClass = "";

  if (status === "RUNNING") {
    statusBorderClass = "ring-2 ring-blue-500 animate-pulse";
    statusOverlay = (
      <div className="absolute -top-2.5 -right-2.5 flex items-center justify-center rounded-full bg-blue-950 p-1 text-blue-400 border border-blue-500 shadow-lg z-20">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </div>
    );
  } else if (status === "SUCCESS") {
    statusBorderClass = "ring-2 ring-emerald-500";
    statusOverlay = (
      <div className="absolute -top-2.5 -right-2.5 flex items-center justify-center rounded-full bg-emerald-950 p-1 text-emerald-400 border border-emerald-500 shadow-lg z-20">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>
    );
  } else if (status === "FAILED") {
    statusBorderClass = "ring-2 ring-red-500";
    statusOverlay = (
      <div className="absolute -top-2.5 -right-2.5 flex items-center justify-center rounded-full bg-red-950 p-1 text-red-400 border border-red-500 shadow-lg z-20">
        <XCircle className="h-3.5 w-3.5" />
      </div>
    );
  }

  const renderNode = () => {
    const rawType = data?.type || props.type || "";
    const nodeType = String(rawType).toUpperCase();
    switch (nodeType) {
      case "TRIGGER":
        return <TriggerNode {...props} />;
      case "AI_ENGINE":
        return <AIEngineNode {...props} />;
      case "DATA_PROCESSOR":
        return <DataProcessorNode {...props} />;
      case "INTEGRATION":
        return <IntegrationNode {...props} />;
      case "OUTPUT":
        return <OutputNode {...props} />;
      default:
        return <div className="p-3 bg-red-800 text-white rounded font-mono text-xs">Unknown Node Type: {nodeType}</div>;
    }
  };

  return (
    <div className="relative">
      {statusOverlay}
      {renderNode()}
    </div>
  );
};

export default function FlowCanvas({ nodeStatuses }: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
  } = useCanvasStore();

  // Create nodeTypes with nodeStatuses injected for all node type variants
  const nodeTypes = React.useMemo(() => {
    const renderCustom = (nodeProps: NodeProps<CustomNode["data"]>) => (
      <CustomNodeComponent {...nodeProps} nodeStatuses={nodeStatuses} />
    );
    return {
      customNode: renderCustom,
      TRIGGER: renderCustom,
      AI_ENGINE: renderCustom,
      DATA_PROCESSOR: renderCustom,
      INTEGRATION: renderCustom,
      OUTPUT: renderCustom,
      trigger: renderCustom,
      ai_engine: renderCustom,
      data_processor: renderCustom,
      integration: renderCustom,
      output: renderCustom,
    };
  }, [nodeStatuses]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type as CustomNode["data"]["type"], position);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="relative flex-1 h-full bg-zinc-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#14b8a6", strokeWidth: 2 },
        }}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.25 }}
        className="w-full h-full"
      >
        {/* Intentional Figma-style Dot Grid */}
        <Background
          variant={BackgroundVariant.Dots}
          color="#3f3f46"
          gap={20}
          size={1.2}
        />

        {/* Polished Controls */}
        <Controls className="!bg-zinc-900/90 !border-zinc-800/80 !text-zinc-100 fill-zinc-100 [&>button]:!border-zinc-800/80 [&>button]:hover:!bg-zinc-800 !rounded-xl !shadow-xl overflow-hidden backdrop-blur-md" />

        {/* Styled Minimap with Label */}
        <MiniMap
          nodeColor={(n) => {
            const type = n.data?.type;
            if (type === "TRIGGER") return "#f59e0b";
            if (type === "AI_ENGINE") return "#8b5cf6";
            if (type === "DATA_PROCESSOR") return "#3b82f6";
            if (type === "INTEGRATION") return "#10b981";
            if (type === "OUTPUT") return "#ef4444";
            return "#3f3f46";
          }}
          maskColor="rgba(9, 9, 11, 0.75)"
          className="!bg-zinc-900/90 !border !border-zinc-800/80 !rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
        />

        {/* Top-Left Instructions Panel */}
        <Panel position="top-left" className="bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-zinc-300 shadow-xl flex items-center space-x-2">
          <Info className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          <span>Drag nodes from palette, connect handles, and click <strong className="text-teal-400">Run Workflow</strong> to execute live.</span>
        </Panel>
      </ReactFlow>
    </div>
  );
}
