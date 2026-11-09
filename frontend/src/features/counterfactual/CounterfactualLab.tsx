import React from 'react';
import { useJarvis } from '../../engine/context';
import { 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  RotateCcw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const CounterfactualLab: React.FC = () => {
  const {
    activeCounterfactual,
    counterfactualRuns,
    hypotheses,
    activeHypothesis,
    runCounterfactualSimulation,
    startScenario,
  } = useJarvis();

  const currentRun = activeCounterfactual || counterfactualRuns[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Simulation Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3.5 text-xs leading-relaxed shadow-subtle">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold tracking-wide uppercase text-amber-950">
            Model-Based Simulation — Not a Production Guarantee:
          </span>
          <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed font-sans">
            Counterfactual replays evaluate structural scenario models via Pearlian interventions: <code>do(candidate_fault = false)</code>. They isolate which downstream symptoms are explained by the selected candidate versus independent background anomalies.
          </p>
        </div>
      </div>

      {/* Controller / Hypothesis Selection */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-mono">
            <GitCompare className="w-4 h-4 text-indigo-600" />
            <span>COUNTERFACTUAL REPLAY ENGINE</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Select a candidate root cause to simulate hypothetical removal of the initiating fault
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {hypotheses.map(hyp => (
            <button
              key={hyp.hypothesis_id}
              onClick={() => runCounterfactualSimulation(hyp.hypothesis_id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shadow-subtle ${
                currentRun?.hypothesis_id === hyp.hypothesis_id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Intervene: {hyp.candidate_service_id}
            </button>
          ))}
        </div>
      </div>

      {!currentRun ? (
        <div className="py-20 text-center space-y-3 bg-white border border-slate-200 rounded-2xl p-8 shadow-subtle">
          <GitCompare className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Counterfactual Run Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Run an incident scenario from the Command Center, then trigger an intervention above to compare predicted symptoms.
          </p>
          <button
            onClick={() => {
              startScenario();
              setTimeout(() => runCounterfactualSimulation(), 1000);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition"
          >
            Launch Scenario & Replay
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Intervention Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-600">
                {currentRun.intervention_name}
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                RUN ID: {currentRun.run_id}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-sans">{currentRun.intervention_description}</p>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Observed Incident (Factual Baseline) */}
            <div className="p-6 rounded-2xl bg-white border border-rose-200 space-y-3.5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-700 font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>FACTUAL OBSERVED SYMPTOMS ({currentRun.observed_symptoms.length})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-semibold">WITHOUT INTERVENTION</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {currentRun.observed_symptoms.map((symptom, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-50/40 border border-rose-100 text-slate-800 flex items-start space-x-2.5"
                  >
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Counterfactual Simulation (Intervention) */}
            <div className="p-6 rounded-2xl bg-white border border-emerald-200 space-y-3.5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PREDICTED OUTCOME WITH INTERVENTION</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-semibold">MODEL-SIMULATED</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Symptoms Removed */}
                <div className="space-y-2">
                  <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
                    Resolved Symptoms ({currentRun.removed_symptoms.length}):
                  </span>
                  {currentRun.removed_symptoms.map((symptom, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 flex items-start space-x-2.5"
                    >
                      <span className="text-emerald-600 font-bold">✓</span>
                      <div>
                        <span>{symptom}</span>
                        <div className="text-[10px] text-emerald-700 mt-0.5 font-sans font-medium">
                          Predicted to disappear when root cause is intervened on
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Remaining Symptoms */}
                {currentRun.remaining_symptoms.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">
                      Unexplained / Remaining ({currentRun.remaining_symptoms.length}):
                    </span>
                    {currentRun.remaining_symptoms.map((symptom, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-amber-950"
                      >
                        {symptom}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
