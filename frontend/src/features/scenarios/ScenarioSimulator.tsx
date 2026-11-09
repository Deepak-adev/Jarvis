import React, { useState } from 'react';
import { useJarvis } from '../../engine/context';
import { SCENARIO_DEFINITIONS } from '../../engine/scenarios';
import {
  PlaySquare,
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Severity } from '../../engine/types';

export const ScenarioSimulator: React.FC = () => {
  const {
    selectedScenarioId,
    setSelectedScenarioId,
    scenarioStatus,
    playbackSpeed,
    setPlaybackSpeed,
    startScenario,
    pauseScenario,
    resetAll,
    injectCustomFault,
    events,
    recommendations,
    approveRecovery,
  } = useJarvis();

  const [injectService, setInjectService] = useState('database');
  const [injectMessage, setInjectMessage] = useState('PostgreSQL write connection deadlocks detected on ledger updates');
  const [injectSeverity, setInjectSeverity] = useState<Severity>('critical');
  const [showInjectModal, setShowInjectModal] = useState(false);

  const activeDef = SCENARIO_DEFINITIONS[selectedScenarioId];

  const handleInjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    injectCustomFault(injectService, injectMessage, injectSeverity);
    setShowInjectModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-mono">
            <PlaySquare className="w-4 h-4 text-indigo-600" />
            <span>DETERMINISTIC INCIDENT SIMULATOR</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Reproducible fault injection scenarios for resilience testing and benchmark verification
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {scenarioStatus !== 'running' ? (
            <button
              onClick={() => startScenario()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{scenarioStatus === 'paused' ? 'Resume Playback' : 'Start Scenario'}</span>
            </button>
          ) : (
            <button
              onClick={pauseScenario}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Playback</span>
            </button>
          )}

          <button
            onClick={() => setShowInjectModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>Custom Inject</span>
          </button>

          <button
            onClick={resetAll}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-subtle"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clean Reset</span>
          </button>
        </div>
      </div>

      {/* 3 Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(SCENARIO_DEFINITIONS).map((scen) => {
          const isSelected = scen.scenario_id === selectedScenarioId;
          return (
            <div
              key={scen.scenario_id}
              onClick={() => {
                if (scenarioStatus !== 'running') {
                  setSelectedScenarioId(scen.scenario_id);
                }
              }}
              className={`p-6 rounded-2xl border cursor-pointer transition space-y-3.5 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-50/50 to-white border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-subtle'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {scen.scenario_id}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      ACTIVE SELECTION
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{scen.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{scen.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1 font-mono text-slate-500">
                <div>
                  <span className="text-indigo-600 font-semibold">Initiating Fault:</span> {scen.initiating_service}
                </div>
                <div>
                  <span className="text-slate-400">Cascade Depth:</span> {scen.affected_services.length} services
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Chaos Studio: One-Click Anomaly Injections */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Interactive Chaos Engineering Studio
              </h3>
              <p className="text-xs text-slate-500">
                Click any real-time fault injection card below to test J.A.R.V.I.S.'s live causal DAG reconstruction.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
            5 PRESET CHAOS VECTORS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {[
            {
              service: 'database',
              severity: 'critical' as Severity,
              title: 'PostgreSQL Pool Starvation',
              message: 'PostgreSQL connection pool exhausted: 100/100 connections acquired; 28 queries queued in waiting buffer',
              badge: 'Storage',
              accent: 'border-rose-200 hover:border-rose-300 bg-rose-50/20',
            },
            {
              service: 'payment-service',
              severity: 'critical' as Severity,
              title: 'Stripe Webhook 500 Spike',
              message: 'Stripe webhook handler unhandled rejection: gateway timed out on transaction ledger lock',
              badge: 'Payments',
              accent: 'border-amber-200 hover:border-amber-300 bg-amber-50/20',
            },
            {
              service: 'auth-service',
              severity: 'error' as Severity,
              title: 'JWKS Token Verification Timeout',
              message: 'JWT signature verification timeout: JWKS upstream endpoint latency exceeded 5000ms threshold',
              badge: 'Identity',
              accent: 'border-indigo-200 hover:border-indigo-300 bg-indigo-50/20',
            },
            {
              service: 'api-gateway',
              severity: 'critical' as Severity,
              title: 'Gateway Buffer Overflow',
              message: 'Upstream proxy buffer overflow: 504 Gateway Timeout returned for /v1/checkout requests',
              badge: 'Ingress',
              accent: 'border-purple-200 hover:border-purple-300 bg-purple-50/20',
            },
            {
              service: 'transaction-service',
              severity: 'warning' as Severity,
              title: 'Redis Cache Eviction Storm',
              message: 'Cache stampede on account ledger: miss rate spiked to 92.4% following memory eviction wave',
              badge: 'Ledger',
              accent: 'border-cyan-200 hover:border-cyan-300 bg-cyan-50/20',
            },
          ].map((preset, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 flex flex-col justify-between shadow-subtle ${preset.accent}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                    {preset.service}
                  </span>
                  <span className="uppercase font-bold text-rose-600">
                    {preset.severity}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-sans">
                  {preset.message}
                </p>
              </div>

              <button
                onClick={() => {
                  injectCustomFault(preset.service, preset.message, preset.severity);
                }}
                className="w-full mt-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-[11px] font-bold bg-white hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 hover:border-transparent transition shadow-subtle cursor-pointer"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Inject Fault Now</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Scenario Details & Sequence Preview */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-slate-900">
              Scenario Execution Plan: {activeDef.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Ground-truth initiating condition: <code className="text-indigo-600 font-semibold">{activeDef.initiating_fault}</code>
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {events.length} / {activeDef.event_templates.length} Events Injected
          </span>
        </div>

        {/* Expected Event Sequence */}
        <div className="space-y-2 font-mono text-xs">
          {activeDef.event_templates.map((tmpl, idx) => {
            const isEmitted = events.length > idx;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  isEmitted
                    ? 'bg-indigo-50/30 border-indigo-200 text-slate-900 shadow-subtle'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className="font-extrabold text-indigo-600">+{tmpl.offset_seconds}s</span>
                  <span className="font-bold text-slate-900">{tmpl.service}</span>
                  <span className="text-slate-500 text-[11px]">[{tmpl.event_type}]</span>
                  <span className="text-slate-600 text-xs hidden md:inline truncate max-w-md font-sans">
                    {tmpl.message}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isEmitted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isEmitted ? 'EMITTED' : 'PENDING'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recovery Approval Section */}
      {recommendations.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-emerald-200 space-y-3.5 shadow-subtle">
          <div className="flex items-center justify-between pb-2.5 border-b border-emerald-100">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Simulated Remediation & Recovery</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Requires User Confirmation</span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map(rec => (
              <div
                key={rec.recommendation_id}
                className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-200 flex items-center justify-between space-x-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-sans">{rec.description}</p>
                </div>

                <button
                  onClick={() => approveRecovery(rec.recommendation_id)}
                  disabled={rec.is_applied}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition shadow-sm ${
                    rec.is_applied
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {rec.is_applied ? '✓ Recovery Applied' : 'Approve & Execute'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Fault Injection Modal */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-rose-600" />
                <span>Inject Custom Telemetry Fault</span>
              </h3>
              <button
                onClick={() => setShowInjectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-mono text-[11px] font-semibold">TARGET SERVICE</label>
                <select
                  value={injectService}
                  onChange={(e) => setInjectService(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                >
                  <option value="database">PostgreSQL Database</option>
                  <option value="payment-service">Payment Service</option>
                  <option value="transaction-service">Transaction Engine</option>
                  <option value="auth-service">Authentication Service</option>
                  <option value="api-gateway">API Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-mono text-[11px] font-semibold">SEVERITY</label>
                <select
                  value={injectSeverity}
                  onChange={(e) => setInjectSeverity(e.target.value as Severity)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                >
                  <option value="critical">Critical</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-mono text-[11px] font-semibold">ERROR LOG MESSAGE</label>
                <textarea
                  value={injectMessage}
                  onChange={(e) => setInjectMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInjectModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Inject Fault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
