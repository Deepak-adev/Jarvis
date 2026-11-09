export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';
export type ServiceType = 'gateway' | 'auth' | 'service' | 'database' | 'queue' | 'cache';
export type DependencyType = 'sync_api' | 'database' | 'async_queue' | 'cache';
export type Severity = 'info' | 'warning' | 'error' | 'critical';
export type IncidentStatus = 'active' | 'investigating' | 'mitigated' | 'resolved';
export type SupportLabel = 'high_support' | 'medium_support' | 'low_support';
export type EvidenceDirection = 'supports' | 'contradicts' | 'context';
export type AgentStatus = 'queued' | 'running' | 'completed' | 'failed';
export type ScenarioStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface Service {
  service_id: string;
  name: string;
  service_type: ServiceType;
  criticality: number; // 0.0 to 1.0
  description: string;
  health_status: HealthStatus;
}

export interface Dependency {
  source_service_id: string; // Upstream dependency
  target_service_id: string; // Downstream dependent (depends on source)
  dependency_type: DependencyType;
  expected_latency_ms?: number;
}

export interface NormalizedEvent {
  event_id: string;
  timestamp: string; // ISO-8601 UTC
  service: string;
  event_type: string;
  severity: Severity;
  message: string;
  trace_id?: string | null;
  correlation_id?: string | null;
  metric_name?: string | null;
  metric_value?: number | null;
  attributes: Record<string, any>;
}

export interface Incident {
  incident_id: string;
  title: string;
  status: IncidentStatus;
  started_at: string;
  last_updated_at: string;
  event_ids: string[];
  affected_services: string[];
  severity: Severity;
  scenario_id?: string | null;
  correlation_reasons: string[];
}

export interface EvidenceObject {
  evidence_id: string;
  source_type: 'event' | 'metric' | 'topology';
  source_id: string;
  observed_at: string;
  summary: string;
  direction: EvidenceDirection;
  relevance: number; // 0.0 to 1.0
}

export interface FactorBreakdown {
  temporal_precedence: number;
  dependency_reach: number;
  symptom_coverage: number;
  anomaly_strength: number;
  cross_signal_support: number;
  pattern_match: number;
  contradiction_penalty: number;
}

export interface Hypothesis {
  hypothesis_id: string;
  incident_id: string;
  candidate_service_id: string;
  candidate_event_id?: string | null;
  cause_type: string;
  score: number; // 0.0 to 1.0
  support_label: SupportLabel;
  factor_breakdown: FactorBreakdown;
  evidence_ids: string[];
  contradictions: string[];
  caveat: string;
}

export interface BlastRadiusResult {
  candidate_service_id: string;
  observed_affected: string[];
  at_risk: string[];
  impact_score: number;
  paths: { path: string[]; description: string }[];
}

export interface CounterfactualRun {
  run_id: string;
  incident_id: string;
  hypothesis_id: string;
  intervention_name: string;
  intervention_description: string;
  baseline_symptoms: string[];
  counterfactual_symptoms: string[];
  observed_symptoms: string[];
  removed_symptoms: string[];
  remaining_symptoms: string[];
  caveat: string;
}

export interface AgentObservation {
  claim: string;
  evidence_ids: string[];
}

export interface AgentResult {
  agent_name: string;
  role: string;
  status: AgentStatus;
  summary: string;
  evidence_ids: string[];
  observations: AgentObservation[];
  limitations: string[];
  tools_called: string[];
}

export interface Recommendation {
  recommendation_id: string;
  title: string;
  action_type: string;
  target_service: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  requires_approval: boolean;
  is_applied: boolean;
  expected_outcome: string;
}

export interface ScenarioEventTemplate {
  offset_seconds: number;
  service: string;
  event_type: string;
  severity: Severity;
  message: string;
  correlation_id: string;
  metric_name?: string;
  metric_value?: number;
  attributes: Record<string, any>;
}

export interface ScenarioDefinition {
  scenario_id: string;
  title: string;
  description: string;
  initiating_service: string;
  initiating_fault: string;
  affected_services: string[];
  event_templates: ScenarioEventTemplate[];
  recovery_action: {
    title: string;
    description: string;
    target_service: string;
  };
}

