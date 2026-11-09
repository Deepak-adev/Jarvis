# J.A.R.V.I.S. — Antigravity Starter Kit

**Project:** Justified Analysis, Reasoning & Visualization of Incident Systems  
**Direction:** Causal Intelligence + Autonomous Investigation  
**Hackathon track:** NITSHACKS 9.0 Software Track — Problem Statement 1

## What this project is

J.A.R.V.I.S. is an incident-intelligence prototype for distributed applications. It ingests logs, metrics and service events, correlates related symptoms over time, builds an evidence-backed service/event graph, ranks probable root-cause hypotheses, estimates blast radius, and coordinates specialized AI agents to investigate and explain findings.

It is not just an alert dashboard or a chatbot. Its core is a deterministic, inspectable analysis pipeline. LLM agents help gather, challenge and communicate evidence; they do not invent the root cause.

## Documents in this kit

1. `01_PRODUCT_BRIEF_PRD.md` — problem, users, scope, product requirements and success criteria.
2. `02_SYSTEM_ARCHITECTURE.md` — architecture, components, data flow and design decisions.
3. `03_CAUSAL_ENGINE_DESIGN.md` — event model, temporal correlation, graph reasoning, root-cause ranking and counterfactual analysis.
4. `04_AGENT_ORCHESTRATION.md` — agent roles, tools, contracts, guardrails and orchestration.
5. `05_DATA_MODEL_AND_API.md` — entities, example payloads and API contract.
6. `06_UI_UX_SPEC.md` — screens, interactions, visual direction and component requirements.
7. `07_IMPLEMENTATION_PLAN.md` — phased build plan, task breakdown and acceptance criteria.
8. `08_EVALUATION_AND_DEMO.md` — test scenarios, metrics, demo script and judge-facing proof.
9. `09_ANTIGRAVITY_BASE_PROMPT.md` — paste this into Antigravity to start implementation.
10. `10_DECISIONS_AND_LIMITATIONS.md` — assumptions, scope boundaries and honest claims.
11. `JARVIS_Project_Blueprint.docx` — consolidated readable blueprint.

## Recommended hackathon implementation stack

- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui (or an equivalent component library)
- Graph visualization: React Flow
- Charts: Recharts
- Backend: Python + FastAPI + Pydantic
- Analysis: Python, NetworkX, Pandas / NumPy where useful
- Persistence: SQLite for the first working prototype; PostgreSQL if time and deployment setup permit
- Live updates: Server-Sent Events (SSE) initially
- AI: provider-agnostic LLM adapter; deterministic fallback so the demo works without an API key
- Testing: Pytest + frontend tests where practical
- Deployment: one frontend and one backend service; Docker Compose optional

**Do not start with Kafka, Neo4j, Kubernetes or multiple microservices.** They add setup risk without proving the central innovation. Keep adapters/interfaces so they can be introduced later if justified.

## First build milestone

Before adding AI agents, make this end-to-end path work:

1. Load a known scenario.
2. Generate timestamped events and metrics.
3. Correlate events.
4. Build a service dependency graph.
5. Rank root-cause candidates with visible evidence.
6. Show timeline, graph, blast radius and incident report.
7. Run a counterfactual replay.
8. Only then add agents to investigate and explain the deterministic findings.

## Source alignment

The supplied problem statement describes multiple data sources, event correlation using timestamps/services/patterns, root-cause detection, impact analysis, incident timeline, smart recommendations and an interactive dashboard. This blueprint is designed to implement those requirements while adding clearly identified differentiators: evidence-backed causal hypothesis ranking, counterfactual scenario replay, specialized investigation agents and a repeatable incident simulator.
