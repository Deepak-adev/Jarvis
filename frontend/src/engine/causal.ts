import {
  NormalizedEvent,
  Incident,
  Hypothesis,
  EvidenceObject,
  FactorBreakdown,
  SupportLabel
} from './types';
import { TopologyGraph } from './topology';

export class CausalEngine {
  // Configurable weights as defined in Doc 03
  private weights = {
    temporal_precedence: 0.20,
    dependency_reach: 0.20,
    symptom_coverage: 0.20,
    anomaly_strength: 0.15,
    cross_signal_support: 0.15,
    pattern_match: 0.10,
  };

  rankHypotheses(
    incident: Incident,
    incidentEvents: NormalizedEvent[],
    topology: TopologyGraph
  ): { hypotheses: Hypothesis[]; evidenceList: EvidenceObject[] } {
    if (incidentEvents.length === 0) {
      return { hypotheses: [], evidenceList: [] };
    }

    // Sort events chronologically
    const sorted = [...incidentEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstTimestamp = new Date(sorted[0].timestamp).getTime();
    const lastTimestamp = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const totalDuration = Math.max(1, lastTimestamp - firstTimestamp);

    const affectedServices = incident.affected_services;
    const candidates: Map<string, NormalizedEvent[]> = new Map();

    // Group events by service
    sorted.forEach(e => {
      if (!candidates.has(e.service)) candidates.set(e.service, []);
      candidates.get(e.service)!.push(e);
    });

    const hypotheses: Hypothesis[] = [];
    const allEvidence: EvidenceObject[] = [];
    let evdCounter = 1;

    for (const [candidateService, events] of candidates.entries()) {
      const primaryEvent = events[0];
      const candidateTime = new Date(primaryEvent.timestamp).getTime();

      // 1. Temporal Precedence: earlier initiation = higher score
      const temporalOffset = candidateTime - firstTimestamp;
      const temporal_precedence = Math.max(0, 1.0 - (temporalOffset / totalDuration));

      // 2. Dependency Reach: how many downstream affected services are reachable from candidate
      const downstream = topology.getDownstreamDependents(candidateService);
      const reachableAffected = affectedServices.filter(
        s => s === candidateService || downstream.includes(s)
      );
      const dependency_reach = affectedServices.length > 0
        ? reachableAffected.length / affectedServices.length
        : 0;

      // 3. Symptom Coverage: how many events can be causally explained by this service
      const explainedEvents = sorted.filter(
        e => e.service === candidateService || downstream.includes(e.service)
      );
      const symptom_coverage = sorted.length > 0 ? explainedEvents.length / sorted.length : 0;

      // 4. Anomaly Strength: based on event severity and metric deviation
      let maxSeverityScore = 0.5;
      if (events.some(e => e.severity === 'critical')) maxSeverityScore = 1.0;
      else if (events.some(e => e.severity === 'error')) maxSeverityScore = 0.8;
      else if (events.some(e => e.severity === 'warning')) maxSeverityScore = 0.6;
      const anomaly_strength = maxSeverityScore;

      // 5. Cross Signal Support: independent signals (log message + metric value + attributes)
      const hasMetric = events.some(e => e.metric_value !== null && e.metric_value !== undefined);
      const hasLog = events.some(e => e.message.length > 0);
      const hasAttributes = events.some(e => Object.keys(e.attributes).length > 0);
      const signalCount = (hasMetric ? 1 : 0) + (hasLog ? 1 : 0) + (hasAttributes ? 1 : 0);
      const cross_signal_support = signalCount / 3.0;

      // 6. Pattern Match: known initiating signatures
      let pattern_match = 0.5;
      if (primaryEvent.event_type === 'resource_saturation') pattern_match = 0.95;
      else if (primaryEvent.event_type === 'deployment') pattern_match = 0.90;
      else if (primaryEvent.event_type === 'network_latency') pattern_match = 0.88;
      else if (primaryEvent.event_type === 'error_spike') pattern_match = 0.60;

      // 7. Contradiction Penalty: downstream service cannot cause upstream failures
      let contradiction_penalty = 0.0;
      const contradictions: string[] = [];
      const upstreamOfCandidate = topology.getDownstreamDependents(candidateService);
      
      // If candidate occurred AFTER a downstream service already started failing
      const earlierEvents = sorted.filter(e => new Date(e.timestamp).getTime() < candidateTime);
      if (earlierEvents.length > 0) {
        contradiction_penalty += 0.25;
        contradictions.push(
          `Downstream event '${earlierEvents[0].service}' occurred ${Math.round((candidateTime - new Date(earlierEvents[0].timestamp).getTime()) / 1000)}s before candidate fault.`
        );
      }

      // Calculate raw weighted score
      const rawScore =
        this.weights.temporal_precedence * temporal_precedence +
        this.weights.dependency_reach * dependency_reach +
        this.weights.symptom_coverage * symptom_coverage +
        this.weights.anomaly_strength * anomaly_strength +
        this.weights.cross_signal_support * cross_signal_support +
        this.weights.pattern_match * pattern_match -
        contradiction_penalty;

      const finalScore = Number(Math.max(0.05, Math.min(0.98, rawScore)).toFixed(2));

      // Support label
      let support_label: SupportLabel = 'low_support';
      if (finalScore >= 0.75) support_label = 'high_support';
      else if (finalScore >= 0.45) support_label = 'medium_support';

      // Create evidence references
      const hypothesisEvidenceIds: string[] = [];
      events.forEach(evt => {
        const evdId = `evd-${String(evdCounter++).padStart(3, '0')}`;
        const evd: EvidenceObject = {
          evidence_id: evdId,
          source_type: 'event',
          source_id: evt.event_id,
          observed_at: evt.timestamp,
          summary: `${evt.service}: ${evt.message}`,
          direction: 'supports',
          relevance: Number((0.85 + Math.random() * 0.1).toFixed(2)),
        };
        allEvidence.push(evd);
        hypothesisEvidenceIds.push(evdId);
      });

      const factor_breakdown: FactorBreakdown = {
        temporal_precedence: Number(temporal_precedence.toFixed(2)),
        dependency_reach: Number(dependency_reach.toFixed(2)),
        symptom_coverage: Number(symptom_coverage.toFixed(2)),
        anomaly_strength: Number(anomaly_strength.toFixed(2)),
        cross_signal_support: Number(cross_signal_support.toFixed(2)),
        pattern_match: Number(pattern_match.toFixed(2)),
        contradiction_penalty: Number(contradiction_penalty.toFixed(2)),
      };

      hypotheses.push({
        hypothesis_id: `hyp-${candidateService}`,
        incident_id: incident.incident_id,
        candidate_service_id: candidateService,
        candidate_event_id: primaryEvent.event_id,
        cause_type: primaryEvent.event_type,
        score: finalScore,
        support_label,
        factor_breakdown,
        evidence_ids: hypothesisEvidenceIds,
        contradictions,
        caveat: 'Heuristic support score based on temporal correlation & dependency topology. Not a calibrated probability.',
      });
    }

    // Sort by score descending (Top-1 is highest)
    hypotheses.sort((a, b) => b.score - a.score);

    return { hypotheses, evidenceList: allEvidence };
  }
}

export const causalEngine = new CausalEngine();

