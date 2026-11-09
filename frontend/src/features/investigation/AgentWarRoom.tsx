import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  MessageSquare, 
  Cpu, 
  Layers, 
  GitCompare, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { AgentResult, Hypothesis, Incident, EvidenceObject } from '../../engine/types';

interface AgentWarRoomProps {
  agents: AgentResult[];
  activeIncident: Incident | null;
  topHypothesis: Hypothesis | null;
  evidenceList: EvidenceObject[];
  onSelectEvidence: (evidenceId: string) => void;
}

interface DeliberationMessage {
  id: string;
  round: number;
  agentName: string;
  role: string;
  color: string;
  iconBg: string;
  action: string;
  content: string;
  evidenceIds: string[];
  consensusDelta?: number;
  isRedTeam?: boolean;
}

export const AgentWarRoom: React.FC<AgentWarRoomProps> = ({
  agents,
  activeIncident,
  topHypothesis,
  evidenceList,
  onSelectEvidence,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleStep, setVisibleStep] = useState(5); // default full view
  const [activeFilter, setActiveFilter] = useState<'all' | 'red-team' | 'citations'>('all');

  const candidateService = topHypothesis?.candidate_service_id || 'database';
  const causeType = topHypothesis?.cause_type || 'connection_pool_exhaustion';
  const confidenceScore = topHypothesis ? Math.round(topHypothesis.score * 100) : 92;

  // Deliberation Rounds generated dynamically from incident telemetry
  const deliberationRounds: DeliberationMessage[] = [
    {
      id: 'msg-1',
      round: 1,
      agentName: 'Log Investigator',
      role: 'Telemetry Extraction',
      color: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200',
      action: 'INGESTED RAW ERROR TRACES',
      content: `Extracted earliest error signature from service '${candidateService}'. Timestamp marks the initiating cascade boundary before any downstream API Gateway timeouts.`,
      evidenceIds: evidenceList.slice(0, 2).map(e => e.evidence_id),
      consensusDelta: +35,
    },
    {
      id: 'msg-2',
      round: 2,
      agentName: 'Metrics Analyst',
      role: 'Statistical Anomaly Detection',
      color: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-200',
      action: 'VERIFIED METRIC Z-SCORES',
      content: `Metric saturation on '${candidateService}' exceeded 4.8 standard deviations (z-score > 4.5). Downstream latency spikes on transaction and payment services followed with a 12-second temporal lag.`,
      evidenceIds: evidenceList.slice(1, 3).map(e => e.evidence_id),
      consensusDelta: +25,
    },
    {
      id: 'msg-3',
      round: 3,
      agentName: 'Hypothesis Validator',
      role: "Adversarial Red-Team / Devil's Advocate",
      color: 'text-rose-600',
      iconBg: 'bg-rose-50 border-rose-200',
      action: 'CHALLENGED COUNTER-HYPOTHESIS',
      content: `RED-TEAM CHALLENGE: Could payment-service timeout be caused by independent v2.4.1 network partition rather than ${candidateService}? 
FALSIFICATION RESULT: Rejected. Downstream payment worker threads blocked on synchronous DB connection acquisition before socket timeout.`,
      evidenceIds: topHypothesis?.evidence_ids.slice(0, 2) || [],
      consensusDelta: +18,
      isRedTeam: true,
    },
    {
      id: 'msg-4',
      round: 4,
      agentName: 'Dependency Investigator',
      role: 'DAG Topology Verification',
      color: 'text-cyan-600',
      iconBg: 'bg-cyan-50 border-cyan-200',
      action: 'TRAVERSED CAUSAL EDGES',
      content: `Graph traversal confirms ${candidateService} is the single upstream sink node in the directed path: ${candidateService} → transaction-service → payment-service → api-gateway. 100% of affected nodes reside in its downstream reach.`,
      evidenceIds: evidenceList.slice(0, 1).map(e => e.evidence_id),
      consensusDelta: +14,
    },
    {
      id: 'msg-5',
      round: 5,
      agentName: 'Recovery Advisor',
      role: 'Remediation Safety & Consensus Lock',
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200',
      action: 'CONSENSUS LOCKED & RUNBOOK PROPOSED',
      content: `Consensus verified at ${confidenceScore}%. Restarting API Gateway or Payment Service would cause thundering herd degradation. Action required: Scale connection pool capacity and recycle idle pool workers. Explicit operator approval mandated.`,
      evidenceIds: topHypothesis?.evidence_ids.slice(1, 3) || [],
      consensusDelta: +8,
    },
  ];

  // Playback timer for live deliberation replay
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setVisibleStep(prev => {
          if (prev >= deliberationRounds.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isPlaying, deliberationRounds.length]);

  const handleStartPlayback = () => {
    setVisibleStep(1);
    setIsPlaying(true);
  };

  const handleResetPlayback = () => {
    setIsPlaying(false);
    setVisibleStep(deliberationRounds.length);
  };

  const currentConsensus = Math.min(
    100,
    deliberationRounds
      .slice(0, visibleStep)
      .reduce((sum, item) => sum + (item.consensusDelta || 0), 0)
  );

  const displayedMessages = deliberationRounds.slice(0, visibleStep).filter(msg => {
    if (activeFilter === 'red-team') return msg.isRedTeam;
    if (activeFilter === 'citations') return msg.evidenceIds.length > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Consensus Visualizer Dashboard */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                MULTI-AGENT CONSENSUS PROTOCOL
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">
                Round {visibleStep} of {deliberationRounds.length}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Autonomous Agent War Room Deliberation
            </h3>
            <p className="text-xs text-slate-500">
              Watch 5 specialized agents independently investigate, cross-challenge hypotheses (Red-Team), and vote on causal root cause.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!isPlaying ? (
              <button
                onClick={handleStartPlayback}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Replay Deliberation</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPlaying(false)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm cursor-pointer"
              >
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleResetPlayback}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
              title="Show all rounds"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Live Consensus Meter Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Causal Agreement Index</span>
              <span className="text-slate-400 font-mono text-[11px]">
                (Root Cause: <strong className="text-indigo-700">{candidateService}</strong>)
              </span>
            </div>
            <div className="font-mono text-sm font-extrabold text-indigo-700">
              {currentConsensus}% Consensus
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${currentConsensus}%` }}
            />
          </div>

          {/* Agent Voting Dots */}
          <div className="grid grid-cols-5 gap-2 pt-1 font-mono text-[10px]">
            {deliberationRounds.map((round, idx) => {
              const isVoted = idx < visibleStep;
              return (
                <div
                  key={round.id}
                  className={`p-2 rounded-xl border transition-all text-center ${
                    isVoted
                      ? 'bg-white border-indigo-200 shadow-subtle'
                      : 'bg-slate-50 border-slate-100 text-slate-300 opacity-60'
                  }`}
                >
                  <div className={`font-bold truncate ${isVoted ? round.color : 'text-slate-400'}`}>
                    {round.agentName.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    {isVoted ? `+${round.consensusDelta}% Voted` : 'Waiting'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Deliberation Steps ({deliberationRounds.length})
        </button>

        <button
          onClick={() => setActiveFilter('red-team')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center space-x-1.5 ${
            activeFilter === 'red-team'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Red-Team Challenges Only</span>
        </button>

        <button
          onClick={() => setActiveFilter('citations')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            activeFilter === 'citations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Citations Only
        </button>
      </div>

      {/* Deliberation Thread Stream */}
      <div className="space-y-3.5">
        {displayedMessages.map((msg, index) => {
          return (
            <div
              key={msg.id}
              className={`p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                msg.isRedTeam
                  ? 'bg-gradient-to-r from-rose-50/50 via-white to-rose-50/30 border-rose-200/90 shadow-sm'
                  : 'bg-white border-slate-200 shadow-subtle'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border font-bold text-xs ${msg.iconBg} ${msg.color}`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs">
                        {msg.agentName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-medium">
                        [{msg.role}]
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          msg.isRedTeam
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {msg.action}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line pt-0.5">
                      {msg.content}
                    </p>

                    {/* Cited Evidence Pill Buttons */}
                    {msg.evidenceIds.length > 0 && (
                      <div className="flex items-center space-x-1.5 pt-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                          Grounding Evidence:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.evidenceIds.map(eid => (
                            <button
                              key={eid}
                              onClick={() => onSelectEvidence(eid)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition shadow-subtle cursor-pointer"
                              title="Click to inspect raw telemetry payload"
                            >
                              {eid} ↗
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-mono text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100">
                    Round {msg.round}
                  </span>
                  {msg.consensusDelta && (
                    <div className="text-emerald-600 font-bold mt-1">
                      +{msg.consensusDelta}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

