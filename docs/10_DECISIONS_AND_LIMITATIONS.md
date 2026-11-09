# 10 — Decisions, Assumptions & Limitations

## 1. Decisions

- J.A.R.V.I.S. combines causal intelligence (primary) and autonomous agents (supporting).
- Deterministic analysis is authoritative; LLMs support investigation and explanation.
- Modular monolith over microservices for hackathon speed.
- SQLite and NetworkX over PostgreSQL/Neo4j as mandatory dependencies for first demo.
- SSE over WebSockets for server-to-browser event updates.
- Seeded simulator over real infrastructure integrations for a repeatable judge demo.
- Simulated, approval-gated recovery over production automation.

## 2. Important terminology

- **Event correlation:** determining that events are related based on shared context, time, topology and patterns.
- **Dependency graph:** representation of service dependencies.
- **Causal hypothesis:** a candidate explanation supported by temporal, topology and signal evidence.
- **Root-cause ranking:** ordering candidate explanations by heuristic support.
- **Counterfactual replay:** model-based comparison after applying an intervention in a simulated scenario.
- **Blast radius:** observed and potentially affected downstream services.

## 3. Claims we must not make

Do not claim:
- The system proves causality in arbitrary production environments.
- A heuristic score is a calibrated probability.
- Counterfactual simulation proves what would happen in the real world.
- The agents autonomously fix production.
- Benchmark performance is measured until tests have actually run.
- The application integrates with Kafka, Kubernetes, Neo4j or OpenTelemetry unless implemented and verified.

## 4. Assumptions

- The hackathon demo can use synthetic but realistic telemetry.
- A known service topology is available for each seeded scenario.
- Scenario definitions can encode propagation rules for repeatable simulation.
- LLM API access may be unavailable or rate-limited; deterministic fallback is required.
- The team will prioritize a working vertical slice over breadth.

## 5. Risks and mitigations

| Risk | Mitigation |
|---|---|
| LLM latency or outage | Deterministic fallback |
| False root cause | Show alternatives, evidence and uncertainty |
| Correlation over-groups events | Require multiple relationship signals and expose reasons |
| Counterfactual overclaim | Label as model-based and show assumptions |
| Too much infrastructure | Modular monolith, SQLite, NetworkX |
| Demo randomness | Fixed seeds and reset |
| Agent hallucination | Tool-only evidence and evidence IDs |
| UI polish consumes time | Build incident workspace first |

## 6. Definition of innovation

The project's differentiator is not the use of an LLM by itself. It is the integrated workflow:
1. Temporal and topology-aware event correlation.
2. Transparent evidence-weighted causal hypothesis ranking.
3. Model-based counterfactual incident replay.
4. Specialized agents that investigate and challenge hypotheses using tools.
5. Evidence-linked impact analysis and recommendations.
