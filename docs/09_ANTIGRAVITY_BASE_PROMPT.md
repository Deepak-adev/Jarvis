# Antigravity Base Prompt — J.A.R.V.I.S.

You are the lead product engineer and architect implementing **J.A.R.V.I.S. (Justified Analysis, Reasoning & Visualization of Incident Systems)** for a hackathon.

Read all files in the `docs/` directory before coding:
- Product brief / PRD
- System architecture
- Causal engine design
- Agent orchestration
- Data model and API
- UI/UX specification
- Implementation plan
- Evaluation and demo
- Decisions and limitations

The supplied hackathon problem statement asks for a system that ingests events from multiple sources, correlates events using timestamps/services/patterns, identifies likely root causes, analyzes impact, displays an incident timeline, recommends fixes and provides an interactive dashboard.

## Product direction

Build a **Causal Intelligence Platform enhanced by Autonomous Investigation Agents**.

The deterministic temporal causal reasoning engine is the source of truth. Agents are evidence gatherers, hypothesis challengers and report explainers. The LLM must never invent telemetry or silently decide the root cause.

## Required MVP stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS and a consistent component library
- Graph UI: React Flow
- Charts: Recharts
- Backend: Python + FastAPI + Pydantic
- Graph analysis: NetworkX
- Database: SQLite first, with clean repository abstraction
- Live updates: Server-Sent Events
- AI: provider abstraction with deterministic offline fallback

Do not add Kafka, Neo4j, Kubernetes or multiple backend microservices in the first iteration. Keep the code modular so they can be added later if genuinely needed.

## Product quality requirements

1. Build a premium, dark-first engineering command center, not a generic admin template.
2. The most important screen is the Incident Workspace.
3. The UI must clearly distinguish observed evidence, inferred hypotheses and simulated predictions.
4. Every root-cause hypothesis must expose its evidence and score breakdown.
5. Every factual agent claim must cite evidence IDs.
6. Counterfactual analysis must be labelled as model-based simulation, not proof.
7. The core demo must work without an LLM API key.
8. No fake loading animations or fake agent activity. Show actual backend task states; clearly label seeded demo events.
9. No production/destructive remediation. Recovery is simulated and requires explicit user approval.
10. Use realistic data, meaningful empty/error/loading states and a reliable reset function.

## Build strategy

Work in small, verifiable phases. Do not scaffold the entire system and leave it nonfunctional.

### Phase 0
Inspect repository and docs. Create the project skeleton, health endpoint, frontend shell, shared schemas, `.env.example`, and run instructions. Run it and verify.

### Phase 1
Implement a deterministic payment-platform scenario with services:
- API Gateway
- Authentication
- User Service
- Payment Service
- Transaction Service
- Database

Create dependency topology and scenario event generator. Include database pool exhaustion, faulty payment deployment and network latency scenarios. Add start/pause/reset/inject controls. Persist events.

### Phase 2
Implement event normalization, temporal correlation and incident timeline. Correlation must expose reasons and must not group events solely because timestamps are close.

### Phase 3
Implement NetworkX topology, candidate root-cause generation, transparent weighted scoring, factor breakdown, evidence objects and ranked hypotheses. Add tests for known scenarios.

### Phase 4
Implement blast radius with separate `observed_affected` and `at_risk` services. Implement counterfactual replay as a scenario-model intervention and compare predicted symptoms. Include caveats in API and UI.

### Phase 5
Implement specialized investigation agents:
- Log Investigator
- Metrics Analyst
- Dependency Investigator
- Hypothesis Validator
- Recovery Advisor

Create a strict tool registry with read-only tools. Each agent returns structured results with evidence IDs and limitations. Add an LLM provider adapter only after deterministic fallback works.

### Phase 6
Build incident reports, simulated recovery, UI polish, tests and demo reset reliability.

## Required screens

1. Command Center: service health, active incidents, KPIs, topology preview and live event feed.
2. Incident Workspace: incident summary, graph, ranked hypotheses, evidence, timeline, agent findings and recommendations.
3. Counterfactual Lab: observed vs baseline vs intervention results.
4. Investigation: agent statuses, tool activity, findings and evidence.
5. Scenario Simulator: scenario selection, start/pause/reset, fault injection and simulated recovery.
6. Reports: structured incident report and export.

## Engineering rules

- Use typed request/response schemas.
- Keep analysis logic outside API route handlers.
- Use UTC ISO-8601 timestamps.
- Use stable IDs.
- Add tests for correlation, scoring, blast radius and counterfactual logic.
- Return consistent API errors.
- Keep frontend API calls in a dedicated client layer.
- Do not hardcode root cause into generic analysis logic. Scenario ground truth may be used for evaluation, never as a hidden answer in the runtime inference path.
- Store scenario ground truth separately from the engine's inputs and only use it in evaluation/reporting.
- Make scoring weights configurable and document them.
- Use honest labels: heuristic support score, not calibrated probability.

## First response and execution

Before writing code:
1. Inspect the existing workspace.
2. Summarize the docs and propose the exact Phase 0 file plan.
3. Identify any conflicts or missing information.
4. Then implement Phase 0 only.
5. Run backend and frontend checks and report exact commands/results.

After Phase 0, continue phase by phase. Do not skip tests or claim a feature is complete unless it runs.
