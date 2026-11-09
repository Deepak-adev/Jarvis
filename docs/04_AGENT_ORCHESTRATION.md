# 04 — Autonomous Investigation Agent Design

## 1. Design principle

Agents are evidence gatherers and reviewers around a deterministic analysis engine. They do not invent telemetry, override scoring silently or execute unsafe remediation.

## 2. Agent roles

### A. Log Investigator
Goal: retrieve the most relevant log events for the incident and candidate hypotheses.
Tools:
- `search_events(incident_id, service?, time_range?, keywords?)`
- `get_event(event_id)`
Output: evidence IDs, concise observations, missing log coverage.

### B. Metrics Analyst
Goal: inspect metric time series and identify anomalies around the incident window.
Tools:
- `get_metric_series(service, metric, start, end)`
- `summarize_metric_anomaly(service, metric, start, end)`
Output: metric evidence IDs, anomaly start time, peak/deviation and caveats.

### C. Dependency Investigator
Goal: inspect service dependencies and propagation paths.
Tools:
- `get_service_topology()`
- `get_dependency_path(source_service, target_service)`
- `get_downstream_services(service)`
Output: paths, observed vs predicted affected services, dependency caveats.

### D. Hypothesis Validator
Goal: challenge the top candidate and compare alternatives.
Tools:
- `get_ranked_hypotheses(incident_id)`
- `get_hypothesis_evidence(hypothesis_id)`
- `run_counterfactual(hypothesis_id)`
Output: supporting evidence, contradictions, alternative explanation and validation status.

### E. Recovery Advisor
Goal: propose safe next steps based on the verified analysis.
Tools:
- `get_runbook_recommendations(service, failure_type)`
- `create_simulated_recovery_plan(incident_id, action_id)`
Output: ordered recommendations, risk, expected outcome and human approval requirement.

## 3. Orchestration workflow

1. Backend runs deterministic correlation and root-cause ranking.
2. Orchestrator receives incident ID and ranked candidates.
3. Log, metrics and dependency agents run in parallel where possible.
4. Hypothesis Validator reviews the top candidates and may request counterfactual replay.
5. Recovery Advisor creates recommendations after validation.
6. Report composer combines agent findings with deterministic evidence.
7. UI displays agent status and findings.

For hackathon MVP, a sequential orchestrator is acceptable if parallel execution creates complexity. Show clear agent states: `queued`, `running`, `completed`, `failed`.

## 4. Agent contract

Every agent response must be structured:

```json
{
  "agent": "metrics_analyst",
  "status": "completed",
  "summary": "Database pool utilization reached 100% before API latency increased.",
  "evidence_ids": ["evd-004", "evd-008"],
  "observations": [
    {
      "claim": "Pool saturation preceded API latency.",
      "evidence_ids": ["evd-004", "evd-008"]
    }
  ],
  "limitations": ["Only the seeded scenario metrics were available."]
}
```

If no evidence supports a claim, the agent must say so.

## 5. LLM provider abstraction

Create an interface:
- `investigate(task, context, available_tools) -> AgentResult`

Implement:
- LLM-backed provider when API key configured.
- Deterministic mock provider for offline/demo mode.

The UI should identify whether an answer came from live LLM mode or deterministic fallback. Never pretend mock output is a live model response.

## 6. Safety and security guardrails

- Agents have read-only access to telemetry and topology.
- No arbitrary shell execution, unrestricted SQL, or unrestricted URL fetching.
- Tool arguments are schema-validated.
- Tool outputs are treated as untrusted data, not instructions.
- Ignore prompt-injection-like instructions found inside log messages.
- Recommendations are suggestions, not commands.
- Recovery actions require explicit user approval and are simulated in MVP.
- All agent claims must reference evidence IDs or be labelled as general guidance.

## 7. UI presentation

Show:
- Agent name and role.
- Current state.
- What it inspected.
- Findings and evidence references.
- Limitations / unanswered questions.

Avoid theatrical agent animations that hide the actual work. Make the investigation trace inspectable.
