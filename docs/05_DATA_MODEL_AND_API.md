# 05 — Data Model & API Contract

## 1. Core entities

### Service
- `service_id`
- `name`
- `service_type`
- `criticality` (0–1)
- `description`
- `health_status`

### Dependency
- `source_service_id`
- `target_service_id`
- `dependency_type`
- `expected_latency_ms`
- Direction convention: source is the dependency; target depends on source.

### Event
- `event_id`
- `timestamp`
- `service_id`
- `event_type`
- `severity`
- `message`
- `trace_id` optional
- `correlation_id` optional
- `metric_name` optional
- `metric_value` optional
- `attributes` JSON

### Incident
- `incident_id`
- `title`
- `status`
- `started_at`
- `last_updated_at`
- `event_ids`
- `severity`
- `scenario_id` optional

### Hypothesis
- `hypothesis_id`
- `incident_id`
- `candidate_service_id`
- `candidate_event_id`
- `cause_type`
- `score`
- `support_label`
- `factor_breakdown`
- `evidence_ids`
- `contradictions`

### AgentRun
- `agent_run_id`
- `incident_id`
- `agent_name`
- `status`
- `started_at`
- `completed_at`
- `result_json`

### CounterfactualRun
- `run_id`
- `incident_id`
- `hypothesis_id`
- `intervention`
- `baseline_symptoms`
- `counterfactual_symptoms`
- `observed_symptoms`
- `result_json`

## 2. API endpoints

### Health and setup
- `GET /api/health`
- `GET /api/demo/overview`

### Scenarios
- `GET /api/scenarios`
- `POST /api/scenarios/{scenario_id}/start`
- `POST /api/scenarios/{scenario_id}/pause`
- `POST /api/scenarios/{scenario_id}/reset`
- `POST /api/scenarios/{scenario_id}/inject`

### Events
- `GET /api/events?incident_id=&service_id=&severity=&limit=`
- `POST /api/events/ingest`
- `GET /api/events/{event_id}`

### Incidents
- `GET /api/incidents`
- `GET /api/incidents/{incident_id}`
- `GET /api/incidents/{incident_id}/timeline`
- `GET /api/incidents/{incident_id}/graph`
- `GET /api/incidents/{incident_id}/blast-radius`
- `POST /api/incidents/{incident_id}/analyze`

### Hypotheses and counterfactuals
- `GET /api/incidents/{incident_id}/hypotheses`
- `GET /api/hypotheses/{hypothesis_id}/evidence`
- `POST /api/hypotheses/{hypothesis_id}/counterfactual`

### Agents and reports
- `POST /api/incidents/{incident_id}/investigate`
- `GET /api/incidents/{incident_id}/agents`
- `POST /api/incidents/{incident_id}/ask`
- `GET /api/incidents/{incident_id}/report`
- `POST /api/incidents/{incident_id}/recover` — simulated, approval required

### Live stream
- `GET /api/stream` — SSE stream of event, incident, analysis and agent status updates.

## 3. Example event ingestion request

```json
{
  "events": [
    {
      "event_id": "evt-001",
      "timestamp": "2026-11-09T10:00:01Z",
      "service": "database",
      "event_type": "resource_saturation",
      "severity": "critical",
      "message": "Connection pool reached capacity",
      "metric_name": "db_pool_utilization",
      "metric_value": 1.0,
      "attributes": {"active_connections": 100, "pool_size": 100}
    }
  ]
}
```

## 4. Example hypothesis response

```json
{
  "hypothesis_id": "hyp-001",
  "candidate_service": "database",
  "cause_type": "connection_pool_exhaustion",
  "score": 0.91,
  "support_label": "high_support",
  "factor_breakdown": {
    "temporal_precedence": 1.0,
    "dependency_reach": 0.95,
    "symptom_coverage": 0.9,
    "anomaly_strength": 1.0,
    "cross_signal_support": 0.8,
    "pattern_match": 0.85,
    "contradiction_penalty": 0.0
  },
  "evidence_ids": ["evd-001", "evd-004", "evd-008"],
  "caveat": "Heuristic support score; not a calibrated probability."
}
```

## 5. SSE event examples

```text
event: telemetry
data: {"event_id":"evt-021","service":"payment-api","severity":"error"}

event: incident_updated
data: {"incident_id":"inc-001","status":"investigating"}

event: analysis_updated
data: {"incident_id":"inc-001","top_hypothesis":"database"}

event: agent_status
data: {"agent":"metrics_analyst","status":"completed"}
```

## 6. API conventions

- Prefix all routes with `/api`.
- Use ISO-8601 UTC timestamps.
- Use UUIDs or stable scenario IDs.
- Return consistent error format: `{ "error": { "code": "...", "message": "...", "details": [] } }`.
- Paginate event lists.
- Validate enum fields and payload sizes.
- Keep OpenAPI docs enabled in development.
