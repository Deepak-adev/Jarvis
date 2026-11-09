import React from 'react';
import { useJarvis } from '../../engine/context';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Server, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Layers,
  ArrowRight,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SCENARIO_DEFINITIONS } from '../../engine/scenarios';

export const CommandCenter: React.FC = () => {
  const {
    services,
    events,
    incidents,
    activeIncident,
    setActiveIncidentId,
    setActiveScreen,
    scenarioStatus,
    startScenario,
    pauseScenario,
    resetAll,
    selectedScenarioId,
    setSelectedScenarioId,
    injectCustomFault,
    selectedServiceFilter,
    setSelectedServiceFilter,
  } = useJarvis();

  const healthyCount = services.filter(s => s.health_status === 'healthy').length;
  const degradedCount = services.filter(s => s.health_status === 'degraded').length;
  const criticalCount = services.filter(s => s.health_status === 'critical').length;

  const filteredEvents = selectedServiceFilter
    ? events.filter(e => e.service === selectedServiceFilter)
    : events;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Simulator Control Toolbar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Incident Command Center</h2>
            <p className="text-xs text-slate-500">Live Telemetry Ingestion & Deterministic Analysis Stream</p>
          </div>
        </div>

        {/* Scenario Selection & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            disabled={scenarioStatus === 'running'}
            className="bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-subtle"
          >
            {Object.values(SCENARIO_DEFINITIONS).map(s => (
              <option key={s.scenario_id} value={s.scenario_id}>
                {s.title}
              </option>
            ))}
          </select>

          {scenarioStatus !== 'running' ? (
            <button
              onClick={() => startScenario()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{scenarioStatus === 'paused' ? 'Resume Playback' : 'Run Scenario'}</span>
            </button>
          ) : (
            <button
              onClick={pauseScenario}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={() => injectCustomFault('database', 'Manual Connection Pool Saturation Injection', 'critical')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>Inject Fault</span>
          </button>

          <button
            onClick={resetAll}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-subtle"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>TOTAL SERVICES</span>
            <Server className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">{services.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Payment Topology</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>HEALTHY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 mt-2">{healthyCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero anomalies</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>DEGRADED</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-600 mt-2">{degradedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Latency elevated</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>CRITICAL</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-600 mt-2">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Failing components</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between text-indigo-700 text-xs font-semibold">
            <span>TELEMETRY EVENTS</span>
            <Radio className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-indigo-600 mt-2">{events.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">In current window</div>
        </div>
      </div>

      {/* Main Grid: Topology Services + Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Health Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Distributed Services Health</h3>
            </div>
            <button
              onClick={() => setActiveScreen('topology')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Inspect Flow Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {services.map((svc) => {
              const isFiltered = selectedServiceFilter === svc.service_id;
              const isHealthy = svc.health_status === 'healthy';
              const isDegraded = svc.health_status === 'degraded';
              const isCritical = svc.health_status === 'critical';

              const badgeStyle = isHealthy
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isDegraded
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-bold';

              return (
                <div
                  key={svc.service_id}
                  onClick={() => setSelectedServiceFilter(isFiltered ? null : svc.service_id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isCritical
                      ? 'border-rose-300 bg-rose-50/30'
                      : isDegraded
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } ${isFiltered ? 'ring-2 ring-indigo-500 shadow-md' : 'shadow-subtle'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{svc.name}</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                      {svc.health_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{svc.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3 pt-2.5 border-t border-slate-100">
                    <span>Criticality: <strong>{Math.round(svc.criticality * 100)}%</strong></span>
                    <span className="uppercase text-[10px] text-slate-400">{svc.service_type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Incidents Panel */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Active Incidents ({incidents.length})</h3>
              </div>
              {activeIncident && (
                <button
                  onClick={() => setActiveScreen('incident-workspace')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {incidents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700">All Systems Operational</p>
                <p className="text-slate-400 text-[11px]">No active incidents detected.</p>
                <button
                  onClick={() => startScenario()}
                  className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                >
                  Simulate Incident Cascade
                </button>
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {incidents.map((inc) => (
                  <div
                    key={inc.incident_id}
                    onClick={() => {
                      setActiveIncidentId(inc.incident_id);
                      setActiveScreen('incident-workspace');
                    }}
                    className="p-4 rounded-xl bg-gradient-to-br from-rose-50/40 to-white border border-rose-200 hover:border-rose-400 transition cursor-pointer space-y-2.5 shadow-subtle group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 uppercase">
                        {inc.severity}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(inc.started_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                      {inc.title}
                    </h4>

                    <div className="text-[11px] text-slate-600">
                      Affected: <strong className="text-slate-800">{inc.affected_services.join(', ')}</strong>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-rose-100 font-mono">
                      <span>{inc.event_ids.length} Correlated Events</span>
                      <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition flex items-center">
                        Investigate <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Event Feed */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Live Ingested Telemetry Feed
              {selectedServiceFilter && (
                <span className="ml-2 text-xs font-semibold text-indigo-600">
                  (Filtered by: {selectedServiceFilter})
                </span>
              )}
            </h3>
          </div>
          {selectedServiceFilter && (
            <button
              onClick={() => setSelectedServiceFilter(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear Filter
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No telemetry events recorded yet. Run a scenario or inject a fault above to observe incoming signals.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
            {[...filteredEvents].reverse().map((evt) => {
              const sevBadge =
                evt.severity === 'critical'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : evt.severity === 'error'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : evt.severity === 'warning'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200';

              return (
                <div
                  key={evt.event_id}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start justify-between space-x-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sevBadge}`}>
                      {evt.severity}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-900 font-bold">{evt.service}</span>
                        <span className="text-slate-500 text-[11px]">[{evt.event_type}]</span>
                      </div>
                      <p className="text-slate-700 text-xs mt-0.5 font-sans leading-relaxed">{evt.message}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 text-[11px] text-slate-500">
                    <div>{new Date(evt.timestamp).toLocaleTimeString()}</div>
                    {evt.metric_name && (
                      <div className="text-indigo-600 font-bold text-[10px] mt-0.5">
                        {evt.metric_name} = {evt.metric_value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
