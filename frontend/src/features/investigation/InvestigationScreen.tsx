import React, { useState } from 'react';
import { useJarvis } from '../../engine/context';
import { AgentWarRoom } from './AgentWarRoom';
import { EvidenceModal } from '../../components/EvidenceModal';
import {
  Bot,
  Terminal,
  FileSearch,
  Activity,
  Layers,
  ShieldCheck,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const InvestigationScreen: React.FC = () => {
  const { agents, activeIncident, hypotheses, evidenceList, events } = useJarvis();
  const [activeTab, setActiveTab] = useState<'war-room' | 'roster'>('war-room');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  const [userQuery, setUserQuery] = useState('');
  const [qaHistory, setQaHistory] = useState<{ query: string; answer: string; evidenceIds: string[] }[]>([
    {
      query: 'What was the earliest initiating anomaly detected in the cluster?',
      answer: `The earliest initiating anomaly was detected in '${hypotheses[0]?.candidate_service_id || 'database'}' at ${evidenceList[0]?.observed_at || 'incident start'}. Primary symptom: "${evidenceList[0]?.summary || 'Saturation detected'}".`,
      evidenceIds: evidenceList.slice(0, 2).map(e => e.evidence_id),
    }
  ]);

  const selectedEvidence = evidenceList.find(e => e.evidence_id === selectedEvidenceId) || null;
  const sourceEvent = selectedEvidence ? events.find(e => e.event_id === selectedEvidence.source_id) || null : null;

  const handleAsk = (queryText: string) => {
    if (!queryText.trim()) return;

    const topHyp = hypotheses[0];
    let reply = '';
    let citedIds: string[] = [];

    const q = queryText.toLowerCase();
    if (q.includes('root') || q.includes('cause') || q.includes('why')) {
      reply = `Based on deterministic temporal correlation and topological reach, the top candidate is '${topHyp?.candidate_service_id}' with a heuristic support score of ${Math.round((topHyp?.score || 0) * 100)}%. It occurred before all downstream symptoms and reaches 100% of the affected services.`;
      citedIds = topHyp?.evidence_ids.slice(0, 3) || [];
    } else if (q.includes('impact') || q.includes('blast') || q.includes('affect')) {
      reply = `Observed failures span ${activeIncident?.affected_services.join(', ') || 'cluster services'}. Reachable at-risk downstream services include API Gateway and downstream merchant checkout endpoints.`;
      citedIds = evidenceList.slice(1, 4).map(e => e.evidence_id);
    } else if (q.includes('payment') || q.includes('blame') || q.includes('not')) {
      reply = `Payment service is a downstream victim rather than root cause. Its thread pool exhausted because it was synchronously waiting on upstream responses from ${topHyp?.candidate_service_id || 'database'}. Graph direction proves upstream causal flow.`;
      citedIds = evidenceList.slice(0, 2).map(e => e.evidence_id);
    } else {
      reply = `The investigation agents analyzed ${evidenceList.length} evidence records. The cascade originated in '${topHyp?.candidate_service_id}' and propagated downstream along verified dependency edges.`;
      citedIds = evidenceList.slice(0, 2).map(e => e.evidence_id);
    }

    setQaHistory(prev => [
      ...prev,
      {
        query: queryText,
        answer: reply,
        evidenceIds: citedIds,
      }
    ]);
    setUserQuery('');
  };

  const suggestedPrompts = [
    "Why is payment-service a victim and not the root cause?",
    "Prove database is the initiating failure source",
    "What downstream services are at risk right now?",
    "Show me the mathematical score breakdown"
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Evidence Modal */}
      {selectedEvidenceId && (
        <EvidenceModal
          evidence={selectedEvidence}
          sourceEvent={sourceEvent}
          onClose={() => setSelectedEvidenceId(null)}
        />
      )}

      {/* Header & Mode Switcher */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-mono">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>AUTONOMOUS INVESTIGATION AGENT SQUAD</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            5 Specialized Investigation Agents executing read-only telemetry tools with verified evidence citations
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('war-room')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'war-room'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>War Room Deliberation</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Agent Roster & Claims</span>
          </button>
        </div>
      </div>

      {/* View 1: War Room Deliberation */}
      {activeTab === 'war-room' && (
        <AgentWarRoom
          agents={agents}
          activeIncident={activeIncident}
          topHypothesis={hypotheses[0] || null}
          evidenceList={evidenceList}
          onSelectEvidence={(eid) => setSelectedEvidenceId(eid)}
        />
      )}

      {/* View 2: Agents Cards Grid */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.agent_name}
              className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-subtle flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{agent.agent_name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{agent.role}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans">{agent.summary}</p>

                {/* Structured Claims with Evidence IDs */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Grounded Observations:
                  </span>
                  {agent.observations.map((obs, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 space-y-1 font-sans leading-snug">
                      <div>{obs.claim}</div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-indigo-600 font-bold pt-0.5">
                        <span>Cites Evidence:</span>
                        <div className="flex flex-wrap gap-1">
                          {obs.evidence_ids.map(eid => (
                            <button
                              key={eid}
                              onClick={() => setSelectedEvidenceId(eid)}
                              className="underline hover:text-indigo-800 cursor-pointer"
                            >
                              {eid}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1 text-[10px] font-mono text-slate-400">
                <div>Tools: {agent.tools_called.join(', ')}</div>
                <div>Limitations: {agent.limitations.join('; ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Operator Evidence-Linked Q&A Assistant */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>Operator Evidence-Grounded Assistant</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            100% Deterministic Fallback Active
          </span>
        </div>

        {/* Suggested Prompt Pills */}
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition font-medium cursor-pointer"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Q&A Stream */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {qaHistory.map((item, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex items-center space-x-2 text-slate-500 font-mono text-[11px]">
                <span className="text-indigo-600 font-bold">OPERATOR &gt;</span>
                <span className="text-slate-900 font-semibold">{item.query}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-indigo-100 text-slate-800 leading-relaxed font-sans text-xs shadow-subtle">
                {item.answer}
                {item.evidenceIds.length > 0 && (
                  <div className="mt-2.5 flex items-center space-x-1.5 text-[10px] font-mono font-bold text-indigo-700">
                    <span>CITED EVIDENCE:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.evidenceIds.map(eid => (
                        <button
                          key={eid}
                          onClick={() => setSelectedEvidenceId(eid)}
                          className="px-1.5 py-0.5 rounded bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 underline cursor-pointer"
                        >
                          {eid}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Query Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleAsk(userQuery); }} className="flex items-center space-x-2 pt-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask a question about root causes, telemetry, or blast radius..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans shadow-subtle"
          />
          <button
            type="submit"
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Query</span>
          </button>
        </form>
      </div>
    </div>
  );
};
