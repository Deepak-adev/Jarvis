import React, { useState } from 'react';
import { useJarvis } from '../../engine/context';
import { ServiceFlowGraph } from './ServiceFlowGraph';
import { Network, Server, ArrowRight, Layers, ShieldCheck, Activity } from 'lucide-react';

export const TopologyScreen: React.FC = () => {
  const { services, dependencies, topology, blastRadius } = useJarvis();
  const [selectedNode, setSelectedNode] = useState<string>('database');

  const selectedService = services.find(s => s.service_id === selectedNode) || services[0];
  const downstream = topology.getDownstreamDependents(selectedService.service_id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-mono">
            <Network className="w-4 h-4 text-indigo-600" />
            <span>DISTRIBUTED SERVICE DEPENDENCY TOPOLOGY</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Directed dependency graph: Source is upstream dependency; target depends on source.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold">
            {services.length} SERVICES • {dependencies.length} DIRECTED EDGES
          </span>
        </div>
      </div>

      {/* Main Flow Graph */}
      <ServiceFlowGraph onNodeClick={(id) => setSelectedNode(id)} className="h-[460px]" />

      {/* Node Inspection & Blast Radius Drawer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selected Service Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-subtle">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <Server className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-900">
                Selected Node: {selectedService.name}
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase font-bold ${
                selectedService.health_status === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : selectedService.health_status === 'degraded'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {selectedService.health_status}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-sans">{selectedService.description}</p>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-100">
            <div>Type: <strong className="text-slate-800 uppercase">{selectedService.service_type}</strong></div>
            <div>Criticality: <strong className="text-indigo-600">{Math.round(selectedService.criticality * 100)}%</strong></div>
          </div>
        </div>

        {/* Downstream Reach & Blast Radius */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-subtle">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-amber-800">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Downstream Dependent Services ({downstream.length})</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            If <code>{selectedService.service_id}</code> experiences failure, faults will propagate along directed dependency edges to:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {downstream.length === 0 ? (
              <span className="text-xs text-slate-400 font-mono">Edge node — no downstream dependencies.</span>
            ) : (
              downstream.map(d => (
                <span
                  key={d}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {d}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
