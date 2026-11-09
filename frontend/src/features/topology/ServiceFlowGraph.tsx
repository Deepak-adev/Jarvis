import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useJarvis } from '../../engine/context';

interface CustomNodeData extends Record<string, unknown> {
  serviceId: string;
  name: string;
  serviceType: string;
  healthStatus: string;
  isInitiatingCandidate: boolean;
  isObservedAffected: boolean;
  isAtRisk: boolean;
}

const CustomServiceNode: React.FC<{ data: CustomNodeData }> = ({ data }) => {
  const {
    name,
    serviceType,
    healthStatus,
    isInitiatingCandidate,
    isObservedAffected,
    isAtRisk,
  } = data;

  let borderColor = 'border-slate-200';
  let bgColor = 'bg-white';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (isInitiatingCandidate) {
    borderColor = 'border-rose-500 ring-4 ring-rose-100 shadow-lg shadow-rose-100';
    bgColor = 'bg-rose-50/40';
    badgeColor = 'bg-rose-600 text-white font-extrabold shadow-sm animate-pulse';
  } else if (isObservedAffected) {
    borderColor = 'border-rose-300 shadow-md shadow-rose-50';
    bgColor = 'bg-rose-50/20';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
  } else if (isAtRisk) {
    borderColor = 'border-amber-400 border-dashed shadow-sm';
    bgColor = 'bg-amber-50/20';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
  }

  return (
    <div className={`px-4 py-3.5 rounded-2xl border ${borderColor} ${bgColor} text-slate-900 min-w-[180px] shadow-card transition-all duration-200 select-none`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-indigo-500 border-2 border-white" />
      <div className="flex items-center justify-between space-x-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">{serviceType}</span>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {isInitiatingCandidate ? 'ROOT CAUSE' : isObservedAffected ? 'FAILED' : isAtRisk ? 'AT RISK' : healthStatus.toUpperCase()}
        </span>
      </div>
      <div className="font-bold text-xs text-slate-900 mt-2">{name}</div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-indigo-500 border-2 border-white" />
    </div>
  );
};

const nodeTypes = {
  serviceNode: CustomServiceNode,
};

export const ServiceFlowGraph: React.FC<{
  onNodeClick?: (serviceId: string) => void;
  className?: string;
}> = ({ onNodeClick, className = 'h-[360px]' }) => {
  const { services, dependencies, activeHypothesis, blastRadius } = useJarvis();

  // Coordinates for the 6 services in a clean hierarchical layout
  const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
    'database': { x: 40, y: 140 },
    'transaction-service': { x: 270, y: 50 },
    'user-service': { x: 270, y: 230 },
    'auth-service': { x: 520, y: 230 },
    'payment-service': { x: 520, y: 50 },
    'api-gateway': { x: 770, y: 140 },
  };

  const nodes: Node[] = useMemo(() => {
    return services.map((svc) => {
      const coords = NODE_COORDINATES[svc.service_id] || { x: 100, y: 100 };
      const isInitiating = activeHypothesis?.candidate_service_id === svc.service_id;
      const isObserved = blastRadius?.observed_affected.includes(svc.service_id) || false;
      const isAtRisk = blastRadius?.at_risk.includes(svc.service_id) || false;

      return {
        id: svc.service_id,
        type: 'serviceNode',
        position: coords,
        data: {
          serviceId: svc.service_id,
          name: svc.name,
          serviceType: svc.service_type,
          healthStatus: svc.health_status,
          isInitiatingCandidate: isInitiating,
          isObservedAffected: isObserved && !isInitiating,
          isAtRisk,
        },
      };
    });
  }, [services, activeHypothesis, blastRadius]);

  const edges: Edge[] = useMemo(() => {
    return dependencies.map((dep, idx) => {
      const isCandidateEdge =
        activeHypothesis?.candidate_service_id === dep.source_service_id;

      return {
        id: `e-${dep.source_service_id}-${dep.target_service_id}-${idx}`,
        source: dep.source_service_id,
        target: dep.target_service_id,
        animated: isCandidateEdge,
        style: {
          stroke: isCandidateEdge ? '#ef4444' : '#6366f1',
          strokeWidth: isCandidateEdge ? 2.5 : 1.5,
          opacity: 0.85,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCandidateEdge ? '#ef4444' : '#6366f1',
          width: 14,
          height: 14,
        },
      };
    });
  }, [dependencies, activeHypothesis]);

  return (
    <div className={`w-full rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden relative shadow-subtle ${className}`}>
      {/* Legend */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center space-x-3.5 text-[10px] font-mono px-3.5 py-1.5 rounded-xl bg-white/95 border border-slate-200/90 shadow-subtle backdrop-blur">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-rose-700 font-bold">Root Cause</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="text-slate-600 font-medium">Observed Failed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-slate-600 font-medium">At-Risk</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Healthy</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node.id)}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background color="#cbd5e1" gap={18} size={1} />
        <Controls className="bg-white text-slate-700 border-slate-200 shadow-subtle" />
      </ReactFlow>
    </div>
  );
};
