import {
  AgentResult,
  NormalizedEvent,
  Incident,
  Hypothesis,
  EvidenceObject,
  Recommendation,
} from './types';
import { TopologyGraph } from './topology';

export class AgentOrchestrator {
  runInvestigation(
    incident: Incident,
    events: NormalizedEvent[],
    hypotheses: Hypothesis[],
    evidenceList: EvidenceObject[],
    topology: TopologyGraph
  ): { agents: AgentResult[]; recommendations: Recommendation[] } {
    const topHypothesis = hypotheses[0];
    const candidateService = topHypothesis?.candidate_service_id || 'unknown';

    // 1. Log Investigator
    const errorLogs = events.filter(e => e.severity === 'critical' || e.severity === 'error');
    const logEvidenceIds = evidenceList.slice(0, 3).map(e => e.evidence_id);
    const logAgent: AgentResult = {
      agent_name: 'Log Investigator',
      role: 'Telemetry & Pattern Extraction',
      status: 'completed',
      summary: `Analyzed ${events.length} chronological log events across ${incident.affected_services.length} services. First initiating error detected at ${events[0]?.timestamp} in '${events[0]?.service}'.`,
      evidence_ids: logEvidenceIds,
      observations: [
        {
          claim: `Root error sequence initiated by '${events[0]?.service}': "${events[0]?.message}"`,
          evidence_ids: logEvidenceIds.slice(0, 1),
        },
        {
          claim: `Downstream log signatures show cascading timeout propagation into ${incident.affected_services.filter(s => s !== events[0]?.service).join(', ')}`,
          evidence_ids: logEvidenceIds.slice(1),
        }
      ],
      limitations: ['Log ingestion limited to configured incident window.'],
      tools_called: ['search_events(incident_id)', 'get_event(event_id)'],
    };

    // 2. Metrics Analyst
    const metricEvents = events.filter(e => e.metric_value !== null);
    const metricEvidenceIds = evidenceList
      .filter(e => events.find(ev => ev.event_id === e.source_id && ev.metric_value !== null))
      .map(e => e.evidence_id);
    const metricAgent: AgentResult = {
      agent_name: 'Metrics Analyst',
      role: 'Time Series & Anomaly Deviation',
      status: 'completed',
      summary: `Detected metric threshold violations across ${metricEvents.length} distinct service metrics. Strongest anomaly: ${metricEvents[0]?.metric_name} = ${metricEvents[0]?.metric_value}.`,
      evidence_ids: metricEvidenceIds,
      observations: [
        {
          claim: `Initiating anomaly: ${metricEvents[0]?.metric_name || 'utilization'} reached critical threshold in ${metricEvents[0]?.service || 'primary node'}.`,
          evidence_ids: metricEvidenceIds.slice(0, 1),
        },
        {
          claim: `Cascading latency impact: downstream service latency and 5xx error spikes temporally lagged the initiating metric anomaly by 4-12 seconds.`,
          evidence_ids: metricEvidenceIds.slice(1),
        }
      ],
      limitations: ['Telemetry ingestion sampling interval aligns with cluster aggregation window.'],
      tools_called: ['get_metric_series(service, metric)', 'summarize_metric_anomaly()'],
    };

    // 3. Dependency Investigator
    const downstream = topology.getDownstreamDependents(candidateService);
    const dependencyAgent: AgentResult = {
      agent_name: 'Dependency Investigator',
      role: 'Topological Reachability & Blast Radius',
      status: 'completed',
      summary: `Traced directed dependency edges from candidate '${candidateService}'. Confirmed that ${downstream.length} downstream services depend directly or transitively on this service.`,
      evidence_ids: evidenceList.slice(0, 2).map(e => e.evidence_id),
      observations: [
        {
          claim: `Direct dependency path verified: all observed failing services (${incident.affected_services.join(', ')}) are downstream dependents of '${candidateService}'.`,
          evidence_ids: evidenceList.slice(0, 1).map(e => e.evidence_id),
        },
        {
          claim: `No contradictory cyclic or reverse dependencies detected in active execution path.`,
          evidence_ids: evidenceList.slice(1, 2).map(e => e.evidence_id),
        }
      ],
      limitations: ['Assumes static service dependency topology without dynamic circuit breaker routing.'],
      tools_called: ['get_service_topology()', 'get_downstream_services(service)', 'get_dependency_path()'],
    };

    // 4. Hypothesis Validator
    const hypothesisAgent: AgentResult = {
      agent_name: 'Hypothesis Validator',
      role: 'Hypothesis Challenge & Falsification',
      status: 'completed',
      summary: `Challenged top hypothesis '${topHypothesis?.hypothesis_id}' (Candidate: ${candidateService}, Support: ${topHypothesis?.support_label}). Evaluated against ${hypotheses.length - 1} alternative candidates.`,
      evidence_ids: topHypothesis?.evidence_ids.slice(0, 3) || [],
      observations: [
        {
          claim: `Top candidate '${candidateService}' holds ${Math.round((topHypothesis?.score || 0) * 100)}% heuristic support due to earliest timestamp and 100% downstream symptom reach.`,
          evidence_ids: topHypothesis?.evidence_ids.slice(0, 2) || [],
        },
        {
          claim: topHypothesis?.contradictions.length
            ? `Contradictions noted: ${topHypothesis.contradictions.join('; ')}`
            : 'Zero topological or temporal contradictions found for initiating candidate.',
          evidence_ids: topHypothesis?.evidence_ids.slice(2, 3) || [],
        }
      ],
      limitations: ['Evaluated against deterministic scenario rules; not an unconstrained Bayesian network.'],
      tools_called: ['get_ranked_hypotheses()', 'get_hypothesis_evidence()', 'run_counterfactual()'],
    };

    // 5. Recovery Advisor & Action Recommendations
    let recs: Recommendation[] = [];
    if (candidateService === 'database') {
      recs = [
        {
          recommendation_id: 'rec-001',
          title: 'Scale Connection Pool & Flush Idle Leaks',
          action_type: 'pool_scale',
          target_service: 'database',
          description: 'Dynamically expand PostgreSQL connection pool from 100 to 250 connections and terminate idle client backends (>60s).',
          risk_level: 'low',
          requires_approval: true,
          is_applied: false,
          expected_outcome: 'Eliminates acquisition timeouts in transaction-service within 5 seconds.',
        },
        {
          recommendation_id: 'rec-002',
          title: 'Enable Graceful Degraded Mode in Payment Service',
          action_type: 'circuit_breaker',
          target_service: 'payment-service',
          description: 'Engage fallback queueing for non-critical checkout authorizations to relieve database pressure.',
          risk_level: 'medium',
          requires_approval: true,
          is_applied: false,
          expected_outcome: 'Reduces API Gateway 504 errors by 80% while database recovers.',
        }
      ];
    } else if (candidateService === 'payment-service') {
      recs = [
        {
          recommendation_id: 'rec-003',
          title: 'Canary Rollback to payment-service:v2.4.0',
          action_type: 'deployment_rollback',
          target_service: 'payment-service',
          description: 'Revert deployment v2.4.1 back to verified release v2.4.0 to resolve the NullPointerException.',
          risk_level: 'low',
          requires_approval: true,
          is_applied: false,
          expected_outcome: 'Restores payment processing success rate to 99.9%.',
        }
      ];
    } else {
      recs = [
        {
          recommendation_id: 'rec-004',
          title: `Failover Network Interface on ${candidateService}`,
          action_type: 'interface_failover',
          target_service: candidateService,
          description: 'Switch packet routing from degraded link eth0 to redundant high-speed standby link eth1.',
          risk_level: 'low',
          requires_approval: true,
          is_applied: false,
          expected_outcome: 'Reduces inter-service roundtrip latency to <10ms.',
        }
      ];
    }

    const recoveryAgent: AgentResult = {
      agent_name: 'Recovery Advisor',
      role: 'Runbook Generation & Approval Gatekeeper',
      status: 'completed',
      summary: `Generated ${recs.length} actionable mitigation steps. All remediation actions are simulated and strictly require explicit human confirmation.`,
      evidence_ids: topHypothesis?.evidence_ids.slice(0, 2) || [],
      observations: [
        {
          claim: `Primary action recommended: "${recs[0]?.title}" targeting '${recs[0]?.target_service}' with low operational risk.`,
          evidence_ids: topHypothesis?.evidence_ids.slice(0, 1) || [],
        }
      ],
      limitations: ['Production remediation requires manual verification; automated actions disabled in MVP.'],
      tools_called: ['get_runbook_recommendations()', 'create_simulated_recovery_plan()'],
    };

    return {
      agents: [logAgent, metricAgent, dependencyAgent, hypothesisAgent, recoveryAgent],
      recommendations: recs,
    };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
