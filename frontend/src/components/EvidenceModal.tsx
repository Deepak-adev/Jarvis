import React from 'react';
import { EvidenceObject, NormalizedEvent } from '../engine/types';
import { X, FileSearch, ShieldCheck, Tag, Clock, Database, Layers } from 'lucide-react';

interface EvidenceModalProps {
  evidence: EvidenceObject | null;
  sourceEvent: NormalizedEvent | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  evidence,
  sourceEvent,
  onClose,
}) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileSearch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Evidence Record: {evidence.evidence_id}
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Verified Telemetry Citation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Evidence Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Direction</span>
            <div className="text-emerald-700 font-bold mt-0.5 uppercase">
              {evidence.direction}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Relevance Weight</span>
            <div className="text-indigo-600 font-bold mt-0.5">
              {Math.round(evidence.relevance * 100)}%
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Observation Summary</span>
          <p className="text-slate-800 leading-relaxed font-sans font-medium">{evidence.summary}</p>
        </div>

        {/* Underlying Event Details */}
        {sourceEvent && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 font-medium">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Source Event: {sourceEvent.event_id}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Service: <strong className="text-cyan-300">{sourceEvent.service}</strong></span>
                <span className="text-slate-400">Severity: <strong className="text-rose-400 uppercase">{sourceEvent.severity}</strong></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Timestamp: {sourceEvent.timestamp}
              </div>
              {sourceEvent.metric_name && (
                <div className="text-[11px] text-indigo-300 font-semibold">
                  Metric: {sourceEvent.metric_name} = {sourceEvent.metric_value}
                </div>
              )}

              {sourceEvent.attributes && Object.keys(sourceEvent.attributes).length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Payload Attributes:</span>
                  <pre className="text-[11px] text-slate-300 mt-1 overflow-x-auto p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {JSON.stringify(sourceEvent.attributes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
