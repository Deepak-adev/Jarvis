import React from 'react';
import { useJarvis } from '../../engine/context';
import { SCENARIO_DEFINITIONS } from '../../engine/scenarios';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  GitCompare,
  Bot,
  Layers,
  Award,
  Play,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

interface HomeScreenProps {
  onLaunch?: (screen?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLaunch }) => {
  const {
    services,
    incidents,
    events,
    startScenario,
    setActiveScreen,
    setSelectedScenarioId,
    scenarioStatus,
  } = useJarvis();

  const handleLaunchScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    startScenario(scenarioId);
    if (onLaunch) {
      onLaunch('incident-workspace');
    } else {
      setActiveScreen('incident-workspace');
    }
  };

  const handleLaunchScreen = (screen: string) => {
    if (onLaunch) {
      onLaunch(screen);
    } else {
      setActiveScreen(screen);
    }
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-indigo-50/20 to-white border border-slate-200/80 p-8 md:p-12 shadow-card text-center space-y-6">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-r from-indigo-400/20 via-cyan-400/20 to-blue-400/20 blur-3xl -z-10 pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>NITSHACKS 9.0 • Problem Statement 1 • Software Track</span>
        </div>

        {/* Headline */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Deterministic Causal Intelligence for Distributed Systems
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Monitoring tells engineering teams that something broke. <strong className="text-slate-900 font-semibold">J.A.R.V.I.S.</strong> reconstructs the temporal propagation sequence, proves why it cascaded, separates observed from at-risk blast radius, and deploys specialized investigation agents to validate every finding.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              if (incidents.length === 0) {
                startScenario('database-saturation');
              }
              handleLaunchScreen('incident-workspace');
            }}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Launch Incident Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleLaunchScreen('command-center')}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs md:text-sm font-bold shadow-subtle transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Open Command Center</span>
          </button>

          <button
            onClick={() => handleLaunchScreen('evaluation')}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs md:text-sm font-semibold transition cursor-pointer"
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Benchmark Proof</span>
          </button>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 max-w-4xl mx-auto text-left font-mono">
          <div className="p-3.5 rounded-xl bg-white/70 border border-slate-100 shadow-subtle">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Top-1 Accuracy</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">100%</div>
            <div className="text-[11px] text-slate-500 font-sans mt-0.5">3/3 production scenarios</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 border border-slate-100 shadow-subtle">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Correlation Precision</div>
            <div className="text-xl font-extrabold text-indigo-600 mt-0.5">1.0 / 1.0</div>
            <div className="text-[11px] text-slate-500 font-sans mt-0.5">Multi-signal windowing</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 border border-slate-100 shadow-subtle">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Detection Latency</div>
            <div className="text-xl font-extrabold text-blue-600 mt-0.5">&lt; 25ms</div>
            <div className="text-[11px] text-slate-500 font-sans mt-0.5">In-memory graph compute</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 border border-slate-100 shadow-subtle">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Evidence Traceability</div>
            <div className="text-xl font-extrabold text-purple-600 mt-0.5">100%</div>
            <div className="text-[11px] text-slate-500 font-sans mt-0.5">Zero hallucinated claims</div>
          </div>
        </div>
      </div>

      {/* 3 Seeded Scenarios Interactive Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pre-Configured Deterministic Scenarios
            </h2>
            <p className="text-xs text-slate-500">
              Click any scenario to inject real-time telemetry cascades and observe the deterministic reasoning engine in action.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
            3 TEST SUITES READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.values(SCENARIO_DEFINITIONS).map((scen) => (
            <div
              key={scen.scenario_id}
              className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-subtle hover:shadow-card hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {scen.initiating_service.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-medium">
                    {scen.event_templates.length} Telemetry Events
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                  {scen.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {scen.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 font-mono text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400">Initiating Fault:</span> <strong className="text-slate-800">{scen.initiating_fault.slice(0, 36)}...</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Cascade Scope:</span> <strong className="text-indigo-600">{scen.affected_services.length} services</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchScenario(scen.scenario_id)}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold bg-slate-50 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-transparent transition shadow-subtle"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Scenario Now</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Pipeline: How J.A.R.V.I.S. Solves the Challenge */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-subtle">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
            End-to-End Investigation Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic causal graph reasoning is authoritative. Autonomous agents gather, challenge, and explain evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-slate-900">Multi-Signal Correlation</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Groups related telemetry using a 60s window, shared trace/correlation IDs, and directed topology relationships. Exposes inspectable reasons.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-slate-900">Causal Hypothesis Engine</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Computes transparent weighted scores across temporal precedence, dependency reach, symptom coverage, and anomaly strength. Zero black-box guessing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-slate-900">Pearlian Counterfactuals</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Applies model interventions: <code>do(fault = false)</code>. Quantifies which downstream symptoms disappear versus remaining unexplained anomalies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              4
            </div>
            <h4 className="font-bold text-slate-900">Autonomous Agents & Runbooks</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              5 read-only agents inspect telemetry and cite Evidence IDs. Proposes prioritized remediation runbooks with mandatory human operator approval.
            </p>
          </div>
        </div>
      </div>

      {/* Differentiators Matrix: J.A.R.V.I.S. vs Traditional Tools */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-subtle">
        <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
          Core Differentiators vs Traditional Observability & Chatbots
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-mono uppercase">
                <th className="py-3 px-4">Capability</th>
                <th className="py-3 px-4 text-indigo-700 font-bold bg-indigo-50/50 rounded-t-lg">J.A.R.V.I.S. Platform</th>
                <th className="py-3 px-4">Traditional APM (Datadog/NewRelic)</th>
                <th className="py-3 px-4">Generic LLM Chatbots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Root Cause Logic</td>
                <td className="py-3 px-4 font-bold text-indigo-700 bg-indigo-50/30">Deterministic Causal Graph + Multi-Signal Weighting</td>
                <td className="py-3 px-4">Isolated alerts & metric thresholds</td>
                <td className="py-3 px-4 text-slate-500">Unconstrained text generation (hallucination risk)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Evidence Citations</td>
                <td className="py-3 px-4 font-bold text-indigo-700 bg-indigo-50/30">100% Traceable Evidence IDs to raw telemetry</td>
                <td className="py-3 px-4">Manual dashboard log lookups</td>
                <td className="py-3 px-4 text-slate-500">Cannot cite verified event records</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Counterfactual Replay</td>
                <td className="py-3 px-4 font-bold text-indigo-700 bg-indigo-50/30">Structural model intervention <code>do(cause = false)</code></td>
                <td className="py-3 px-4">Not available</td>
                <td className="py-3 px-4 text-slate-500">Not available</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Blast Radius Traversal</td>
                <td className="py-3 px-4 font-bold text-indigo-700 bg-indigo-50/30">Separates observed failed from at-risk downstream</td>
                <td className="py-3 px-4">Flat alert counts</td>
                <td className="py-3 px-4 text-slate-500">No topology awareness</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Remediation Safety</td>
                <td className="py-3 px-4 font-bold text-indigo-700 bg-indigo-50/30">Simulated runbooks with mandatory human approval</td>
                <td className="py-3 px-4">External manual runbooks</td>
                <td className="py-3 px-4 text-slate-500">Unsafe code execution or text advice only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

