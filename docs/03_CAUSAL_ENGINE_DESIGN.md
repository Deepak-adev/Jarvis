# 03 — Temporal Causal Reasoning Engine

## 1. Purpose

The causal engine is J.A.R.V.I.S.'s technical center. It must produce inspectable root-cause hypotheses from events, metrics and a service dependency model. It must never silently equate correlation with causation.

## 2. Input model

A normalized event should contain:

```json
{
  "event_id": "evt-001",
  "timestamp": "2026-11-09T10:00:01Z",
  "service": "database",
  "event_type": "resource_saturation",
  "severity": "critical",
  "message": "Database connection pool at capacity",
  "trace_id": null,
  "correlation_id": "checkout-flow-17",
  "metric_name": "db_pool_utilization",
  "metric_value": 1.0,
  "attributes": {
    "pool_size": 100,
    "active_connections": 100
  }
}
```

Required fields: `event_id`, `timestamp`, `service`, `event_type`, `severity`, `message`. Other fields are optional.

## 3. Topology model

Represent services as directed graph nodes. An edge `A -> B` means B depends on A (document this direction consistently). Include:
- service ID and display name
- service type
- criticality weight
- owner/team (optional)
- dependency edges
- edge type (sync API, database, queue, cache)
- optional expected latency / SLO

The graph is a dependency model, not causal proof.

## 4. Temporal correlation

Build incident candidates from a sliding time window and shared context.

Suggested MVP approach:
1. Normalize event timestamps to UTC.
2. Identify severity and metric anomaly events.
3. Find events inside configurable time window (e.g. 60 seconds).
4. Add relationship evidence for same trace/correlation ID.
5. Add topology proximity evidence for services connected in the dependency graph.
6. Add pattern evidence for known event sequences in seeded scenarios.
7. Group events when combined score crosses a threshold.
8. Save correlation reasons for UI inspection.

Avoid using timestamp proximity alone. Expose correlation reasons such as:
- same trace ID
- within temporal window
- dependency path exists
- known event pattern matched

## 5. Candidate root causes

Generate candidate causes from:
- earliest high-severity anomaly in a connected dependency region
- resource saturation / component failure events
- deployment/configuration change events
- network fault events
- service-level error spikes

Each candidate is a candidate event or service-level fault, not merely a text label.

## 6. Explainable root-cause score

Use a transparent weighted score for the MVP. Example features normalized to [0,1]:

- `temporal_precedence`: candidate occurs before downstream symptoms.
- `dependency_reach`: candidate service has dependency paths to affected services.
- `symptom_coverage`: candidate explains a larger proportion of observed symptoms.
- `anomaly_strength`: severity and deviation from baseline.
- `cross_signal_support`: independent log/metric/trace signals support candidate.
- `pattern_match`: matches a known failure signature.
- `contradiction_penalty`: evidence conflicts with the hypothesis.

Example:

```text
score =
  0.20 * temporal_precedence +
  0.20 * dependency_reach +
  0.20 * symptom_coverage +
  0.15 * anomaly_strength +
  0.15 * cross_signal_support +
  0.10 * pattern_match
  - contradiction_penalty
```

Clamp final score to [0,1]. Weights are initial heuristic parameters, not scientifically universal. Tune them against seeded scenarios and report evaluation results.

Show a factor breakdown for each candidate. Label scores as `High / Medium / Low support`, not calibrated probability unless calibration has actually been performed.

## 7. Evidence object

Every hypothesis should reference evidence objects:

```json
{
  "evidence_id": "evd-004",
  "source_type": "event",
  "source_id": "evt-001",
  "observed_at": "2026-11-09T10:00:01Z",
  "summary": "Database pool utilization reached 100%",
  "direction": "supports",
  "relevance": 0.95
}
```

Evidence directions: `supports`, `contradicts`, `context`. UI must let the user inspect the original event or metric.

## 8. Counterfactual analysis

Counterfactuals are model-based interventions over the known scenario model.

MVP procedure:
1. Select a root-cause candidate.
2. Clone scenario state / event sequence.
3. Apply an intervention such as `set database_pool_saturation = false` or `remove injected network latency`.
4. Recompute expected downstream propagation using dependency and scenario rules.
5. Compare predicted symptom set against observed symptom set.
6. Report which symptoms disappear, remain or are unexplained.

Return:
- intervention description
- baseline predicted symptoms
- counterfactual predicted symptoms
- observed symptoms
- matched / removed / remaining symptom counts
- caveat: simulation result depends on the scenario model and is not proof of real-world causality.

Do not simply delete an event and claim causality. Model downstream effects explicitly.

## 9. Blast radius

For candidate service S:
- Traverse directed dependency edges from S to downstream dependents.
- Mark services with observed failure events as `observed_affected`.
- Mark reachable services without observed failure as `at_risk`.
- Calculate impact score from criticality, dependency distance and observed symptoms.
- Explain how each service was included.

Do not present predicted services as confirmed outages.

## 10. Confidence and uncertainty

Use support labels:
- High support: multiple independent evidence types, strong temporal and topology fit, few contradictions.
- Medium support: plausible temporal/topology fit but incomplete independent evidence.
- Low support: weak or conflicting evidence.

Show missing evidence and alternative candidates. Never use 99.9% certainty from a heuristic score.

## 11. Engine outputs

A root-cause analysis response should include:
- incident ID
- analysis timestamp
- ranked hypotheses
- factor breakdown
- evidence references
- contradicting evidence
- affected and at-risk services
- event sequence
- assumptions and caveats

## 12. Test cases

- Root cause occurs before symptoms and is upstream: should rank highly.
- Downstream symptom occurs first: should reduce candidate support.
- Unrelated event happens in same time window: should not be grouped solely due to time.
- Two simultaneous independent failures: should create two incidents or competing clusters.
- Missing topology edge: engine should lower dependency support and expose uncertainty.
- Conflicting metric and log signals: contradiction must be visible.
