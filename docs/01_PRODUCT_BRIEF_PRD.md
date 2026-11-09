# 01 — Product Brief & PRD

## 1. Product summary

**J.A.R.V.I.S. — Justified Analysis, Reasoning & Visualization of Incident Systems**

An AI-assisted incident investigation platform that turns fragmented telemetry into a unified, evidence-backed incident explanation. It correlates events across services and time, ranks probable root causes, reconstructs propagation, estimates blast radius, and coordinates investigation agents to validate and explain the result.

**One-line value proposition:** Monitoring tells teams that something is wrong; J.A.R.V.I.S. helps explain what likely happened, how it propagated, what is affected, and what to investigate or do next.

## 2. Problem

Modern platforms produce logs, alerts, metrics and events across multiple connected services. When these signals are isolated, operators may see many symptoms without understanding whether they share one underlying cause. This delays diagnosis and recovery.

The supplied challenge scenario is a digital payment platform experiencing login failures, slow API responses and failed transactions that may share a common cause.

## 3. Target users

- On-call engineers / Site Reliability Engineers
- Backend and platform engineers
- Incident commanders
- Engineering teams operating distributed applications

## 4. Product goals

1. Combine related telemetry into an incident rather than treating every alert independently.
2. Reconstruct the temporal sequence of an incident.
3. Rank plausible root-cause hypotheses using inspectable evidence.
4. Show affected services and likely propagation paths.
5. Use specialized agents to gather evidence, challenge hypotheses and produce a readable report.
6. Demonstrate counterfactual analysis through a replayable simulation.
7. Recommend safe next steps while keeping remediation human-approved.

## 5. Non-goals for the hackathon MVP

- Production-grade observability replacement.
- Guaranteed causal discovery from arbitrary logs.
- Unsupervised learning across every possible infrastructure.
- Real production access or automatic destructive remediation.
- Full Kubernetes / cloud provider integrations.
- Multi-tenant enterprise RBAC and billing.
- A general-purpose chatbot.

## 6. Primary user journey

1. User opens the command center.
2. User selects a scenario or uploads a supported event file.
3. J.A.R.V.I.S. ingests events and displays incoming telemetry.
4. Correlation engine groups related signals into an incident window.
5. Causal engine builds a temporal graph and ranks root-cause candidates.
6. Investigation agents retrieve logs, metrics and dependency evidence.
7. User inspects the graph, timeline, evidence and blast radius.
8. User runs a counterfactual replay against a candidate cause.
9. User reads recommendations and optionally approves a simulated recovery.
10. Incident report can be exported.

## 7. Functional requirements

### FR-01 — Event ingestion
Accept:
- Built-in synthetic scenario events.
- JSON event upload.
- Optional manual event injection for demo.

Each event must have an event ID, timestamp, service, event type/severity, message and optional trace/correlation identifiers, metric values and metadata.

### FR-02 — Event normalization
Normalize timestamps to UTC ISO-8601, service identifiers, severity, event type and attributes. Invalid records must return useful validation errors and must not crash ingestion.

### FR-03 — Event correlation
Group events using a configurable time window, service dependency relationships, shared trace/request identifiers when present, and event-pattern rules. Correlation must expose why events were grouped.

### FR-04 — Incident timeline
Display chronological events with severity, service, event type and key metric changes. Support filtering by service and severity.

### FR-05 — Dependency graph
Display services as nodes and known dependencies as directed edges. Overlay incident evidence and affected state. A graph edge means a configured or observed dependency, not proof of causation.

### FR-06 — Root-cause hypotheses
Generate and rank candidate causes. Each candidate must include:
- Score (0–1) and human-readable confidence label.
- Supporting evidence references.
- Contradicting or missing evidence where available.
- Reasoning factors (temporal precedence, dependency path, metric anomaly, symptom coverage).
- Explicit caveat that ranking is a hypothesis, not certainty.

### FR-07 — Blast radius
Identify downstream dependent services reachable from a candidate root service. Estimate impact using observed symptoms and configurable service criticality. Clearly separate observed failures from predicted/at-risk services.

### FR-08 — Investigation agents
Agents can use read-only tools to inspect event records, metric summaries, dependency paths and candidate hypotheses. Agent output must reference evidence IDs. No agent may fabricate event data.

### FR-09 — Counterfactual replay
Allow the user to select a candidate cause and simulate a model-level intervention that removes or mitigates the candidate initiating condition. Recompute expected downstream propagation and compare it with observed symptoms. Label results as simulated/model-based, not production proof.

### FR-10 — Recommendations
Generate prioritized, actionable recommendations with rationale, evidence references, risk and approval requirement. MVP actions are simulated only.

### FR-11 — Incident report
Produce a structured report: summary, time window, affected services, timeline, top hypotheses, evidence, uncertainty, blast radius and recommended next steps.

### FR-12 — Demo controls
Provide scenario selection, start/pause/reset, inject-failure and simulated recovery controls.

## 8. Non-functional requirements

- Local demo starts with one documented command or a small number of commands.
- Core analysis works without an LLM API key.
- Every displayed root-cause claim is traceable to evidence IDs and deterministic scoring factors.
- API errors are structured and understandable.
- UI supports a 1366×768 laptop screen and remains usable on smaller screens.
- No secrets are committed to source control.
- The demo dataset and scenario definitions are included in the repository.

## 9. MVP acceptance criteria

A judge can:
- Start a scenario without uploading data.
- Inject a known failure.
- See multiple downstream symptoms appear over time.
- See J.A.R.V.I.S. group symptoms into one incident.
- Open a top root-cause hypothesis and inspect its evidence.
- View the incident timeline and service graph.
- See observed vs predicted blast radius.
- Run a counterfactual replay and compare results.
- Ask the investigation agent a question and receive an answer with evidence references.
- Apply a simulated recovery and observe the scenario return toward healthy state.

## 10. Product success measures

- Root cause appears in Top-1 or Top-3 for the seeded scenarios.
- Every root-cause score has a visible factor breakdown.
- Correlation precision/recall can be calculated against scenario ground truth.
- Incident detection latency is measured from first injected event to incident creation.
- Agent responses cite valid evidence IDs.
- Demo can be repeated reliably from a clean reset.
