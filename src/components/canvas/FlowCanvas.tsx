"use client";

import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowInstance,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { useCanvasStore } from "@/store/canvasStore";
import TriggerNode from "./nodes/TriggerNode";
import AIEngineNode from "./nodes/AIEngineNode";
import DataProcessorNode from "./nodes/DataProcessorNode";
import IntegrationNode from "./nodes/IntegrationNode";
import OutputNode from "./nodes/OutputNode";

const CustomNodeComponent = (props: any) => {
  const { data } = props;
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

const nodeTypes = {
  customNode: CustomNodeComponent,
};

export default function FlowCanvas() {
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

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type as any, position);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
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
          Tip: Drag nodes from the left side onto the grid. Select a node to configure it.
        </Panel>
      </ReactFlow>
    </div>
  );
}
