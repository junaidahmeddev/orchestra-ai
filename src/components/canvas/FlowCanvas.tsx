"use client";

import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
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
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

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
      <div className="absolute -top-2.5 -right-2.5 flex items-center justify-center rounded-full bg-blue-950 p-1 text-blue-400 border border-blue-500 shadow-md">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </div>
    );
  } else if (status === "SUCCESS") {
    statusBorderClass = "ring-2 ring-emerald-500";
    statusOverlay = (
      <div className="absolute -top-2.5 -right-2.5 flex items-center justify-center rounded-full bg-emerald-950 p-1 text-emerald-400 border border-emerald-500 shadow-md">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>
    );
  } else if (status === "FAILED") {
    statusBorderClass = "ring-2 ring-red-500";
    statusOverlay = (
      <div className="absolute -top-2.5 -right-2.5 flex items-center justify-center rounded-full bg-red-950 p-1 text-red-400 border border-red-500 shadow-md">
        <XCircle className="h-3.5 w-3.5" />
      </div>
    );
  }

  const renderNode = () => {
    switch (data.type) {
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
        return <div className="p-3 bg-red-800 text-white rounded">Unknown Node Type</div>;
    }
  };

  return (
    <div className={`relative rounded-xl transition-all ${statusBorderClass}`}>
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

  // Create nodeTypes with nodeStatuses injected
  const nodeTypes = React.useMemo(
    () => ({
      customNode: (nodeProps: NodeProps<CustomNode["data"]>) => (
        <CustomNodeComponent {...nodeProps} nodeStatuses={nodeStatuses} />
      ),
    }),
    [nodeStatuses]
  );

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
    <div className="relative flex-1 h-full bg-zinc-950" ref={reactFlowWrapper}>
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
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        className="w-full h-full"
      >
        <Background color="#27272a" gap={16} size={1} />
        <Controls className="!bg-zinc-900 !border-zinc-800 !text-zinc-100 fill-zinc-100 [&>button]:!border-zinc-800 [&>button]:hover:!bg-zinc-800" />
        <MiniMap
          nodeColor={(n) => {
            const type = n.data?.type;
            if (type === "TRIGGER") return "#f59e0b";
            if (type === "AI_ENGINE") return "#8b5cf6";
            if (type === "DATA_PROCESSOR") return "#3b82f6";
            if (type === "INTEGRATION") return "#10b981";
            if (type === "OUTPUT") return "#ef4444";
            return "#27272a";
          }}
          maskColor="rgba(9, 9, 11, 0.7)"
          className="!bg-zinc-900 !border-zinc-800 !rounded-lg overflow-hidden"
        />
        <Panel position="top-left" className="bg-zinc-900/80 border border-zinc-800 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-zinc-400">
          Tip: Drag nodes onto the canvas, connect them, then click "Run Workflow" to execute live.
        </Panel>
      </ReactFlow>
    </div>
  );
}
