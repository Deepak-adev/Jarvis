import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Service,
  Dependency,
  NormalizedEvent,
  Incident,
  Hypothesis,
  EvidenceObject,
  BlastRadiusResult,
  CounterfactualRun,
  AgentResult,
  Recommendation,
  ScenarioStatus,
  Severity,
} from './types';
import { INITIAL_SERVICES, INITIAL_DEPENDENCIES, TopologyGraph } from './topology';
import { SCENARIO_DEFINITIONS, generateScenarioEvents } from './scenarios';
import { correlationEngine } from './correlation';
import { causalEngine } from './causal';
import { counterfactualEngine } from './counterfactual';
import { agentOrchestrator } from './agents';

interface JarvisContextType {
  // Navigation & Screen
  activeScreen: string;
  setActiveScreen: (screen: string) => void;

  // Topology
  services: Service[];
  dependencies: Dependency[];
  topology: TopologyGraph;

  // Telemetry & Incidents
  events: NormalizedEvent[];
  incidents: Incident[];
  activeIncident: Incident | null;
  setActiveIncidentId: (incidentId: string) => void;

  // Causal Engine & Hypotheses
  hypotheses: Hypothesis[];
  evidenceList: EvidenceObject[];
  activeHypothesis: Hypothesis | null;
  setActiveHypothesisId: (hypothesisId: string) => void;

  // Blast Radius
  blastRadius: BlastRadiusResult | null;

  // Counterfactual Lab
  counterfactualRuns: CounterfactualRun[];
  activeCounterfactual: CounterfactualRun | null;
  runCounterfactualSimulation: (hypothesisId?: string) => CounterfactualRun | null;

  // Agents & Recommendations
  agents: AgentResult[];
  recommendations: Recommendation[];
  approveRecovery: (recId: string) => void;

  // Simulator Controls
  selectedScenarioId: string;
  setSelectedScenarioId: (id: string) => void;
  scenarioStatus: ScenarioStatus;
  playbackSpeed: '1x' | '2x' | 'instant';
  setPlaybackSpeed: (speed: '1x' | '2x' | 'instant') => void;
  startScenario: (scenarioId?: string, overrideSpeed?: '1x' | '2x' | 'instant') => void;
  pauseScenario: () => void;
  resetAll: () => void;
  injectCustomFault: (service: string, message: string, severity: Severity) => void;

  // Live filter
  selectedServiceFilter: string | null;
  setSelectedServiceFilter: (serviceId: string | null) => void;
}

const JarvisContext = createContext<JarvisContextType | undefined>(undefined);

export const JarvisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [topology, setTopology] = useState<TopologyGraph>(() => new TopologyGraph());
  const [services, setServices] = useState<Service[]>(() => topology.getServicesList());
  const [dependencies] = useState<Dependency[]>(INITIAL_DEPENDENCIES);

  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceObject[]>([]);
  const [activeHypothesisId, setActiveHypothesisId] = useState<string | null>(null);

  const [blastRadius, setBlastRadius] = useState<BlastRadiusResult | null>(null);
  const [counterfactualRuns, setCounterfactualRuns] = useState<CounterfactualRun[]>([]);
  const [activeCounterfactual, setActiveCounterfactual] = useState<CounterfactualRun | null>(null);

  const [agents, setAgents] = useState<AgentResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('database-saturation');
  const [scenarioStatus, setScenarioStatus] = useState<ScenarioStatus>('idle');
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '2x' | 'instant'>('1x');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string | null>(null);

  const playbackTimerRef = useRef<any>(null);

  // Update services state from topology graph
  const syncServicesFromTopology = (topo: TopologyGraph) => {
    setServices(topo.getServicesList());
  };

  // Re-run correlation and causal analysis whenever events update
  const runAnalysisPipeline = (currentEvents: NormalizedEvent[], topo: TopologyGraph) => {
    if (currentEvents.length === 0) {
      setIncidents([]);
      setActiveIncidentId(null);
      setHypotheses([]);
      setEvidenceList([]);
      setActiveHypothesisId(null);
      setBlastRadius(null);
      setAgents([]);
      setRecommendations([]);
      return;
    }

    // 1. Correlation
    const computedIncidents = correlationEngine.correlate(currentEvents, topo);
    setIncidents(computedIncidents);

    const primaryIncident = computedIncidents[0];
    if (primaryIncident) {
      setActiveIncidentId(primaryIncident.incident_id);

      // 2. Causal Hypothesis Ranking
      const incidentEvents = currentEvents.filter(e => primaryIncident.event_ids.includes(e.event_id));
      const { hypotheses: ranked, evidenceList: evd } = causalEngine.rankHypotheses(
        primaryIncident,
        incidentEvents,
        topo
      );

      setHypotheses(ranked);
      setEvidenceList(evd);

      if (ranked.length > 0) {
        const topHyp = ranked[0];
        setActiveHypothesisId(topHyp.hypothesis_id);

        // 3. Blast Radius
        const br = topo.computeBlastRadius(topHyp.candidate_service_id, primaryIncident.affected_services);
        setBlastRadius(br);

        // 4. Autonomous Agents & Recommendations
        const { agents: agentRuns, recommendations: recList } = agentOrchestrator.runInvestigation(
          primaryIncident,
          incidentEvents,
          ranked,
          evd,
          topo
        );
        setAgents(agentRuns);
        setRecommendations(recList);
      }
    }
  };

  // Start scenario playback
  const startScenario = (scenarioId?: string, overrideSpeed?: '1x' | '2x' | 'instant') => {
    const targetScenario = scenarioId || selectedScenarioId;
    const speed = overrideSpeed || playbackSpeed;
    setSelectedScenarioId(targetScenario);
    setScenarioStatus('running');

    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    // Reset baseline topology first
    const newTopo = new TopologyGraph();
    setTopology(newTopo);
    syncServicesFromTopology(newTopo);

    const scenarioEvents = generateScenarioEvents(targetScenario, new Date());

    if (speed === 'instant') {
      // Instant execution mode
      scenarioEvents.forEach(evt => {
        const svc = newTopo.getService(evt.service);
        if (svc) {
          if (evt.severity === 'critical') svc.health_status = 'critical';
          else if (evt.severity === 'error' && svc.health_status !== 'critical') svc.health_status = 'degraded';
          else if (evt.severity === 'warning' && svc.health_status === 'healthy') svc.health_status = 'degraded';
        }
      });
      setEvents([...scenarioEvents]);
      syncServicesFromTopology(newTopo);
      runAnalysisPipeline(scenarioEvents, newTopo);
      setScenarioStatus('completed');
      return;
    }

    let currentIdx = 0;
    const accumulated: NormalizedEvent[] = [];
    const intervalMs = speed === '2x' ? 400 : 900;

    // Progressive playback
    playbackTimerRef.current = setInterval(() => {
      if (currentIdx < scenarioEvents.length) {
        const nextEvt = scenarioEvents[currentIdx];
        accumulated.push(nextEvt);
        setEvents([...accumulated]);

        // Update service health in topology
        const svc = newTopo.getService(nextEvt.service);
        if (svc) {
          if (nextEvt.severity === 'critical') svc.health_status = 'critical';
          else if (nextEvt.severity === 'error' && svc.health_status !== 'critical') svc.health_status = 'degraded';
          else if (nextEvt.severity === 'warning' && svc.health_status === 'healthy') svc.health_status = 'degraded';
        }
        syncServicesFromTopology(newTopo);
        runAnalysisPipeline(accumulated, newTopo);

        currentIdx++;
      } else {
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        setScenarioStatus('completed');
      }
    }, intervalMs);
  };

  const pauseScenario = () => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setScenarioStatus('paused');
  };

  // Full clean reset restoring initial deterministic state
  const resetAll = () => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    const newTopo = new TopologyGraph();
    setTopology(newTopo);
    syncServicesFromTopology(newTopo);
    setEvents([]);
    setIncidents([]);
    setActiveIncidentId(null);
    setHypotheses([]);
    setEvidenceList([]);
    setActiveHypothesisId(null);
    setBlastRadius(null);
    setCounterfactualRuns([]);
    setActiveCounterfactual(null);
    setAgents([]);
    setRecommendations([]);
    setScenarioStatus('idle');
    setSelectedServiceFilter(null);
  };

  // Manual Fault Injection
  const injectCustomFault = (service: string, message: string, severity: Severity) => {
    const newTopo = topology;
    const svc = newTopo.getService(service);
    if (svc) {
      svc.health_status = severity === 'critical' ? 'critical' : 'degraded';
    }
    syncServicesFromTopology(newTopo);

    const newEvt: NormalizedEvent = {
      event_id: `inj-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      service,
      event_type: 'manual_fault_injection',
      severity,
      message: `[MANUAL INJECTION] ${message}`,
      correlation_id: `inj-${selectedScenarioId}`,
      metric_name: 'manual_override',
      metric_value: 1.0,
      attributes: { operator: 'On-Call Engineer', injected: true },
    };

    const nextEvents = [...events, newEvt];
    setEvents(nextEvents);
    runAnalysisPipeline(nextEvents, newTopo);
  };

  // Counterfactual Run
  const runCounterfactualSimulation = (hypId?: string): CounterfactualRun | null => {
    const targetHyp = hypId
      ? hypotheses.find(h => h.hypothesis_id === hypId)
      : hypotheses.find(h => h.hypothesis_id === activeHypothesisId) || hypotheses[0];

    if (!targetHyp) return null;

    const cfRun = counterfactualEngine.runIntervention(targetHyp, events, topology);
    setCounterfactualRuns(prev => [cfRun, ...prev]);
    setActiveCounterfactual(cfRun);
    return cfRun;
  };

  // Simulated Recovery Action Approval
  const approveRecovery = (recId: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.recommendation_id === recId ? { ...r, is_applied: true } : r))
    );

    // Simulated mitigation: restore affected services to healthy/degraded status
    const targetRec = recommendations.find(r => r.recommendation_id === recId);
    if (targetRec) {
      const newTopo = topology;
      const svc = newTopo.getService(targetRec.target_service);
      if (svc) {
        svc.health_status = 'healthy';
      }
      syncServicesFromTopology(newTopo);

      // Add recovery event to timeline
      const recoveryEvt: NormalizedEvent = {
        event_id: `rec-evt-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        service: targetRec.target_service,
        event_type: 'mitigation_applied',
        severity: 'info',
        message: `[SIMULATED RECOVERY APPLIED] ${targetRec.title} executed successfully with operator approval.`,
        correlation_id: 'remediation-flow',
        metric_name: 'remediation_status',
        metric_value: 0.0,
        attributes: { recommendation_id: recId, approval: 'granted' },
      };

      const updatedEvents = [...events, recoveryEvt];
      setEvents(updatedEvents);
      runAnalysisPipeline(updatedEvents, newTopo);
    }
  };

  const activeIncident = incidents.find(i => i.incident_id === activeIncidentId) || incidents[0] || null;
  const activeHypothesis = hypotheses.find(h => h.hypothesis_id === activeHypothesisId) || hypotheses[0] || null;

  return (
    <JarvisContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        services,
        dependencies,
        topology,
        events,
        incidents,
        activeIncident,
        setActiveIncidentId,
        hypotheses,
        evidenceList,
        activeHypothesis,
        setActiveHypothesisId,
        blastRadius,
        counterfactualRuns,
        activeCounterfactual,
        runCounterfactualSimulation,
        agents,
        recommendations,
        approveRecovery,
        selectedScenarioId,
        setSelectedScenarioId,
        scenarioStatus,
        playbackSpeed,
        setPlaybackSpeed,
        startScenario,
        pauseScenario,
        resetAll,
        injectCustomFault,
        selectedServiceFilter,
        setSelectedServiceFilter,
      }}
    >
      {children}
    </JarvisContext.Provider>
  );
};

export const useJarvis = () => {
  const context = useContext(JarvisContext);
  if (!context) {
    throw new Error('useJarvis must be used within a JarvisProvider');
  }
  return context;
};
