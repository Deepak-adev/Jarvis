# 07 — Implementation Plan for Fast Antigravity Development

## 1. Execution strategy

Build a thin vertical slice first. Keep the application runnable after every phase. Prefer working functionality over broad scaffolding.

## Phase 0 — Project skeleton
- Create frontend and backend.
- Add health endpoint.
- Add shared types / Pydantic schemas.
- Add environment configuration and `.env.example`.
- Add README with exact run instructions.

**Done when:** frontend loads and backend health check succeeds.

## Phase 1 — Deterministic demo scenario
- Define payment-platform topology.
- Create database saturation scenario.
- Generate timestamped events and metrics deterministically.
- Add start, pause, reset and inject controls.
- Persist scenario events.

**Done when:** user can trigger a failure and see events appear in the UI.

## Phase 2 — Correlation and incident timeline
- Normalize and sort events.
- Implement time-window grouping plus trace/topology/pattern evidence.
- Create incident object.
- Render event timeline and incident list.
- Show correlation reasons.

**Done when:** multiple symptoms become one incident with inspectable grouping reasons.

## Phase 3 — Causal graph and root-cause ranking
- Build NetworkX dependency graph.
- Compute candidate features.
- Rank hypotheses with transparent weights.
- Return factor breakdown and evidence IDs.
- Render React Flow graph with observed and at-risk states.

**Done when:** seeded root cause ranks Top-1 or Top-3 and user can inspect why.

## Phase 4 — Blast radius and counterfactual replay
- Traverse downstream dependencies.
- Separate observed affected from at-risk.
- Implement scenario intervention and replay.
- Compare symptoms before and after intervention.
- Render Counterfactual Lab.

**Done when:** a user can select a hypothesis, run an intervention and inspect changed predictions.

## Phase 5 — Investigation agents
- Implement tool registry.
- Add log, metrics, dependency and hypothesis validator agents.
- Add provider abstraction and deterministic fallback.
- Add evidence references to every agent claim.
- Add investigation trace UI.

**Done when:** an investigation run returns evidence-linked structured findings even without an LLM key.

## Phase 6 — Reports and polish
- Generate incident report.
- Add simulated recovery.
- Add reset/repeatability.
- Add error/loading states.
- Add tests and demo seed data.
- Verify clean setup on another machine.

**Done when:** full demo can be repeated reliably.

## 2. Suggested parallel workstreams

If multiple contributors:
- Workstream A: frontend shell, command center and incident workspace.
- Workstream B: backend ingestion, scenarios and API.
- Workstream C: causal graph, scoring and counterfactual engine.
- Workstream D: agent orchestration, report and evaluation.

For a single vibe-coding driver, ask Antigravity to complete one phase at a time and run tests before moving on.

## 3. Build order rules

- Do not implement agent orchestration before deterministic RCA works.
- Do not add Kafka or Neo4j for the MVP.
- Do not make the LLM the source of truth.
- Do not build a generic chat interface before incident workspace.
- Do not add real remediation; simulate it with approval.
- Do not fabricate evaluation results.

## 4. Definition of done for each feature

Every feature must include:
1. Backend behavior.
2. API schema.
3. Frontend interaction.
4. Loading / empty / error states where relevant.
5. At least one test or reproducible manual verification.
6. Evidence that the feature works with the seeded scenario.

## 5. Final readiness checklist

- [ ] Fresh install works.
- [ ] No secret keys required for core demo.
- [ ] Scenario can reset to deterministic initial state.
- [ ] Events are timestamped and persisted.
- [ ] Correlation reasons are visible.
- [ ] Root cause score is explainable.
- [ ] Evidence IDs resolve to actual records.
- [ ] Graph distinguishes dependency from causal evidence.
- [ ] Observed vs at-risk blast radius is clear.
- [ ] Counterfactual output includes caveat.
- [ ] Agents cite evidence.
- [ ] Recovery is simulated and approval-gated.
- [ ] Demo script completed twice without manual database cleanup.
