import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MdOutlineMessage } from "react-icons/md";

let id = 0;
const getId = () => `node_${id++}`;

// Message Node component
const MessageNode = ({ data }) => (
  <div className="message-node">
    <Handle type="target" position={Position.Left} />
    <div className="message-title"><span><MdOutlineMessage />Send Message</span></div>
    <div className="message-label">{data.label}</div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const nodeTypes = { message: MessageNode };

export default function FlowBuilder() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const { fitView } = useReactFlow();

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleAddMessageNode = () => {
    const newNode = {
      id: getId(),
      type: 'message',
      position: { x: 100 + id * 50, y: 100 },
      data: { label: 'Test message' },
    };
    setNodes((nds) => {
      const updated = [...nds, newNode];
      setTimeout(() => fitView({ nodes: updated }), 0);
      return updated;
    });
  };

  const onConnect = useCallback(
    (params) => {
      const sourceHasEdge = edges.some((e) => e.source === params.source);
      if (sourceHasEdge) return;
      setEdges((eds) => addEdge(params, eds));
    },
    [edges]
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  const updateNodeLabel = (label) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, label } }
          : node
      )
    );
    setSelectedNode((n) => ({ ...n, data: { ...n.data, label } }));
  };

  const handleSave = () => {
    const nodeMap = new Map();
    nodes.forEach((node) => nodeMap.set(node.id, 0));
    edges.forEach((e) => {
      if (nodeMap.has(e.source)) nodeMap.set(e.source, 1);
    });

    const openNodes = [...nodeMap.entries()].filter(([_, v]) => v === 0);

    if (nodes.length > 1 && openNodes.length > 1) {
      alert('More than one node has no outgoing connection!');
      return;
    }

    console.log('Saved Flow:', { nodes, edges });
    alert('Flow saved successfully!');

    setSelectedNode(null); // ✅ Deselect after saving
  };

  return (
    <div className="app-container">
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNode(null)} // ✅ Deselect on background click
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      <div className="side-panel">
        {!selectedNode ? (
          <>
            <h2>Nodes Panel</h2>
            <button className="add-button" onClick={handleAddMessageNode}>
              Message
            </button>
          </>
        ) : (
          <>
            <h2>Settings Panel</h2>
            <textarea
              className="text-area"
              value={selectedNode.data.label}
              onChange={(e) => updateNodeLabel(e.target.value)}
            />
          </>
        )}

        <button className="save-button" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
