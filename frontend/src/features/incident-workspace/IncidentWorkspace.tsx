import React, { useState } from 'react';
import { useJarvis } from '../../engine/context';
import { ServiceFlowGraph } from '../topology/ServiceFlowGraph';
import { EvidenceModal } from '../../components/EvidenceModal';
import { AudioBriefing } from '../../components/AudioBriefing';
import { FactorRadarChart, MetricTimeSeriesChart } from '../../components/TelemetryCharts';
import {
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  FileSearch,
  Bot,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Zap,
  Info,
  Activity,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

export const IncidentWorkspace: React.FC = () => {
  const {
    activeIncident,
    events,
    hypotheses,
    activeHypothesis,
    setActiveHypothesisId,
    evidenceList,
    blastRadius,
    agents,
    recommendations,
    approveRecovery,
    runCounterfactualSimulation,
    setActiveScreen,
    startScenario,
  } = useJarvis();

  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'agents' | 'remediation'>('timeline');
  const [timelineSearch, setTimelineSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'error' | 'warning'>('all');

  if (!activeIncident) {
    return (
      <div className="py-24 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-subtle">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Incidents Detected</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The telemetry pipeline is operational with zero detected faults. Start a deterministic scenario from the top bar to observe real-time causal reconstruction.
        </p>
        <button
          onClick={() => startScenario()}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition cursor-pointer"
        >
          Initialize Incident Scenario
        </button>
      </div>
    );
  }

  const incidentEvents = events.filter(e => activeIncident.event_ids.includes(e.event_id));
  const selectedEvidence = evidenceList.find(e => e.evidence_id === selectedEvidenceId) || null;
  const sourceEvent = selectedEvidence ? events.find(e => e.event_id === selectedEvidence.source_id) || null : null;

  const filteredEvents = incidentEvents.filter(e => {
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (timelineSearch.trim()) {
      const q = timelineSearch.toLowerCase();
      return (
        e.service.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q) ||
        e.event_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Evidence Inspection Modal */}
      {selectedEvidenceId && (
        <EvidenceModal
          evidence={selectedEvidence}
          sourceEvent={sourceEvent}
          onClose={() => setSelectedEvidenceId(null)}
        />
      )}

      {/* J.A.R.V.I.S. Audio Voice Briefing Banner */}
      <AudioBriefing
        incident={activeIncident}
        topHypothesis={activeHypothesis || hypotheses[0]}
        blastRadius={blastRadius}
        recommendations={recommendations}
      />

      {/* 3-Zone Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Incident Summary & Correlation Reasons (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase font-extrabold tracking-wide">
                {activeIncident.severity}
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                {activeIncident.incident_id}
              </span>
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                {activeIncident.title}
              </h2>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Started: {new Date(activeIncident.started_at).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                AFFECTED SERVICES ({activeIncident.affected_services.length})
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeIncident.affected_services.map(svc => (
                  <span
                    key={svc}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium bg-slate-50 text-slate-700 border border-slate-200"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            {/* Why events were grouped (Correlation Reasons) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-700">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>Correlation Logic</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                {activeIncident.correlation_reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Blast Radius Summary Card */}
          {blastRadius && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Blast Radius</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Impact: {Math.round(blastRadius.impact_score * 100)}%
                </span>
              </div>

              <div className="text-[11px] text-slate-600 space-y-2">
                <div>
                  <span className="text-rose-700 font-semibold font-mono">Observed Failed:</span>{' '}
                  <span className="text-slate-900 font-medium">{blastRadius.observed_affected.join(', ') || 'None'}</span>
                </div>
                <div>
                  <span className="text-amber-700 font-semibold font-mono">At-Risk Downstream:</span>{' '}
                  <span className="text-slate-900 font-medium">{blastRadius.at_risk.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Zone: Interactive Dependency & Causal Graph (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-800 font-mono">CAUSAL PROPAGATION GRAPH</span>
            <span className="text-[11px] text-slate-400 font-mono">
              Directed Dependency Model
            </span>
          </div>
          <ServiceFlowGraph className="h-[440px]" />
        </div>

        {/* Right Zone: Ranked Hypotheses & Evidence Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
                  Ranked Root Causes
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{hypotheses.length} evaluated</span>
            </div>

            {/* Hypotheses List */}
            <div className="space-y-2.5">
              {hypotheses.map((hyp, idx) => {
                const isSelected = hyp.hypothesis_id === activeHypothesis?.hypothesis_id;
                const scorePct = Math.round(hyp.score * 100);

                return (
                  <div
                    key={hyp.hypothesis_id}
                    onClick={() => setActiveHypothesisId(hyp.hypothesis_id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-extrabold text-slate-400">#{idx + 1}</span>
                        <span className="font-bold text-slate-900 text-xs">
                          {hyp.candidate_service_id}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          hyp.support_label === 'high_support'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {scorePct}% Support
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      Initiating pattern: <code className="text-indigo-600 font-semibold">{hyp.cause_type}</code>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3">
                        {/* Radar Chart */}
                        <FactorRadarChart factors={hyp.factor_breakdown} />

                        {/* Factor Breakdown Bars */}
                        <div className="space-y-1.5 text-[10px] font-mono">
                          <div className="flex justify-between text-slate-600 font-medium">
                            <span>Temporal Precedence</span>
                            <span className="font-bold">{Math.round(hyp.factor_breakdown.temporal_precedence * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${hyp.factor_breakdown.temporal_precedence * 100}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-slate-600 font-medium pt-1">
                            <span>Downstream Reach</span>
                            <span className="font-bold">{Math.round(hyp.factor_breakdown.dependency_reach * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${hyp.factor_breakdown.dependency_reach * 100}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-slate-600 font-medium pt-1">
                            <span>Symptom Coverage</span>
                            <span className="font-bold">{Math.round(hyp.factor_breakdown.symptom_coverage * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-cyan-600 rounded-full"
                              style={{ width: `${hyp.factor_breakdown.symptom_coverage * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Evidence badges (Clickable to open EvidenceModal!) */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Supporting Evidence:</span>
                          <div className="flex flex-wrap gap-1">
                            {hyp.evidence_ids.map(eid => (
                              <button
                                key={eid}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvidenceId(eid);
                                }}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 transition shadow-subtle"
                              >
                                {eid} ↗
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Contradictions */}
                        {hyp.contradictions.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[10px] text-rose-800 leading-snug">
                            <span className="font-bold">Contradiction:</span> {hyp.contradictions[0]}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 italic">
                          {hyp.caveat}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              runCounterfactualSimulation(hyp.hypothesis_id);
                              setActiveScreen('counterfactual-lab');
                            }}
                            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                            <span>Simulate Replay</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Tabs for Timeline, Evidence, Agents & Recovery */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-subtle">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-6 border-b border-slate-100 pb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center space-x-1.5 pb-2 transition border-b-2 ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Incident Chronology ({incidentEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center space-x-1.5 pb-2 transition border-b-2 ${
              activeTab === 'evidence'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Evidence Objects ({evidenceList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center space-x-1.5 pb-2 transition border-b-2 ${
              activeTab === 'agents'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Agent Findings ({agents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('remediation')}
            className={`flex items-center space-x-1.5 pb-2 transition border-b-2 ${
              activeTab === 'remediation'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Remediation Runbooks ({recommendations.length})</span>
          </button>
        </div>

        {/* Tab 1: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                CASCADE ANOMALY PROGRESSION CURVE
              </span>
              <MetricTimeSeriesChart events={incidentEvents} />
            </div>

            {/* Timeline Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-subtle text-xs">
              <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  placeholder="Filter timeline by service or keyword..."
                  className="flex-1 bg-transparent border-0 text-slate-800 placeholder:text-slate-400 focus:outline-none text-xs font-medium"
                />
              </div>

              <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                <span className="text-slate-400 font-semibold mr-1">Severity:</span>
                {(['all', 'critical', 'error', 'warning'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-lg font-bold uppercase transition cursor-pointer ${
                      severityFilter === sev
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
                <span className="text-slate-400 pl-2">
                  ({filteredEvents.length}/{incidentEvents.length})
                </span>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {filteredEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                  No telemetry events match the filter criteria.
                </div>
              ) : (
                filteredEvents.map((evt, idx) => {
                  const isInitiating = incidentEvents[0]?.event_id === evt.event_id;
                  return (
                    <div
                      key={evt.event_id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between space-x-4 transition ${
                        isInitiating
                          ? 'bg-rose-50/40 border-rose-200 ring-1 ring-rose-200'
                          : 'bg-white border-slate-200 shadow-subtle'
                      }`}
                    >
                      <div className="flex items-start space-x-3.5">
                        <span className="text-slate-400 font-bold">{idx + 1}.</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-900 font-bold">{evt.service}</span>
                            {isInitiating && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-600 text-white font-bold shadow-sm">
                                INITIATING FAULT
                              </span>
                            )}
                            <span className="text-slate-500 text-[11px]">[{evt.event_type}]</span>
                          </div>
                          <p className="text-slate-700 text-xs mt-1 font-sans leading-relaxed">{evt.message}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 text-[11px] text-slate-500">
                        <div>{new Date(evt.timestamp).toLocaleTimeString()}</div>
                        {evt.metric_name && (
                          <div className="text-indigo-600 font-semibold text-[10px] mt-0.5">
                            {evt.metric_name}: {evt.metric_value}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Evidence Explorer */}
        {activeTab === 'evidence' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {evidenceList.map((evd) => (
              <div
                key={evd.evidence_id}
                onClick={() => setSelectedEvidenceId(evd.evidence_id)}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer space-y-2 font-mono text-xs transition shadow-subtle group"
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="text-indigo-600 font-bold group-hover:underline">{evd.evidence_id} ↗</span>
                  <span className="text-emerald-700 font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    Direction: {evd.direction}
                  </span>
                </div>
                <div className="text-slate-800 text-xs font-sans leading-relaxed">{evd.summary}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Relevance: <strong>{Math.round(evd.relevance * 100)}%</strong></span>
                  <span>Observed: {new Date(evd.observed_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Autonomous Investigation Agents */}
        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.agent_name}
                className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-subtle"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{agent.agent_name}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{agent.role}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans">{agent.summary}</p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Grounded Observations:</span>
                  {agent.observations.map((obs, oIdx) => (
                    <div key={oIdx} className="text-xs text-slate-800 pl-3 border-l-2 border-indigo-500/60 font-sans leading-relaxed">
                      <div>{obs.claim}</div>
                      <div className="flex flex-wrap gap-1 mt-1 font-mono">
                        {obs.evidence_ids.map(eid => (
                          <button
                            key={eid}
                            onClick={() => setSelectedEvidenceId(eid)}
                            className="text-[10px] font-mono text-indigo-600 hover:underline bg-slate-100 px-1.5 py-0.5 rounded"
                          >
                            {eid}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Tools: {agent.tools_called.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Remediation */}
        {activeTab === 'remediation' && (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.recommendation_id}
                className="p-5 rounded-xl bg-white border border-slate-200 flex items-start justify-between space-x-4 shadow-subtle"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                      Risk: {rec.risk_level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">{rec.description}</p>
                  <div className="text-[11px] text-emerald-700 font-mono font-medium">
                    Expected Outcome: {rec.expected_outcome}
                  </div>
                </div>

                <button
                  onClick={() => approveRecovery(rec.recommendation_id)}
                  disabled={rec.is_applied}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition shadow-sm ${
                    rec.is_applied
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {rec.is_applied ? '✓ Recovery Applied' : 'Approve & Execute (Simulated)'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
