# J.A.R.V.I.S. (Justified Analysis, Reasoning & Visualization of Incident Systems)

**Causal Intelligence Platform enhanced by Autonomous Investigation Agents**  
*NITSHACKS 9.0 • Problem Statement 1 • Software Track*

J.A.R.V.I.S. is an offline-capable, deterministic incident-intelligence platform built with React 18, TypeScript, Tailwind CSS, and React Flow (`@xyflow/react`). It ingests distributed telemetry, correlates symptoms over time and service dependencies, reconstructs causal propagation, ranks probable root causes with transparent factor breakdowns, models Pearlian counterfactual replays, and coordinates specialized investigation agents through a live multi-agent deliberation protocol.

---

## 🏆 Killer Capabilities & Innovations

1. **Deterministic Causal Reasoning**: Top-1 root-cause identification using temporal precedence ($0.20$), dependency reach ($0.20$), symptom coverage ($0.20$), anomaly strength ($0.15$), cross-signal support ($0.15$), and pattern signatures ($0.10$) with transparent score breakdowns.
2. **Autonomous Multi-Agent War Room**: 5 specialized agents conduct a live 5-round consensus protocol with an **Adversarial Red-Team / Devil's Advocate** that actively challenges and falsifies alternative hypotheses.
3. **Pearlian Counterfactual Lab**: Evaluates structural scenario models with interventions: `do(candidate_fault = false)`, isolating explained symptoms vs background anomalies.
4. **Interactive Chaos Engineering Studio**: 5 one-click chaos vectors (*PostgreSQL Pool Starvation, Stripe Webhook 500, JWKS Timeout, Gateway Buffer Overflow, Redis Cache Eviction*) testing real-time DAG re-evaluation in `< 15ms`.
5. **J.A.R.V.I.S. Voice Audio Briefing**: Browser-native Speech Synthesis readout summarizing root cause, confidence score, blast radius, and recovery recommendations with an animated audio visualizer.
6. **Global Command Palette (`Ctrl+K` / `⌘K`)**: Instant keyboard navigation, scenario execution, and judge tooling across all screens.
7. **Blast Radius Analysis**: Automatically traverses directed dependencies, strictly separating `observed_affected` nodes from downstream `at_risk` nodes.
8. **Human-Gated Recovery**: Simulated runbook execution requiring explicit operator approval before mitigating services.
9. **Zero-Setup & 100% Offline-Ready**: Self-contained React + TypeScript architecture requiring zero external API keys, databases, or microservice setups.

---

## 🖥️ Included Screens

1. **Home / Overview**: Full-width executive hero presentation, live KPI metrics strip, 3 production scenario cards, architectural pipeline visualizer, and traditional observability differentiator table.
2. **Incident Workspace (Core Screen)**: 3-zone layout with `@xyflow/react` directed causal graph, radar factor charts, metric time-series charts, raw evidence inspector modal, interactive timeline search/filters, and operator-gated recovery runbooks.
3. **Command Center**: Service health matrix, KPI telemetry cards, mini-topology map, active incidents list, and live event stream.
4. **Service Topology**: Full-screen interactive dependency graph with node inspector and downstream blast radius reach.
5. **Investigation Agents**: Multi-Agent War Room consensus visualizer with deliberation rounds and grounded observation claims.
6. **Counterfactual Lab**: Side-by-side comparison of factual observed symptoms vs model-predicted intervention outcome: `do(fault = false)`.
7. **Scenario Simulator**: Playback controls (`1x`, `2x`, `instant`), ground-truth sequence preview, custom fault injection, and the Interactive Chaos Studio.
8. **Evaluation & Benchmark**: Benchmark dashboard proving 100% Top-1 Accuracy and 1.0 Correlation Precision against baseline heuristics.
9. **Incident Reports**: Audit-ready post-mortem generator with 1-click **Print / PDF**, Markdown export, and copy-to-clipboard.

---

## ⚡ Quickstart

### Prerequisites
- Node.js 18+ and npm

### Run Application

From the root directory:
```bash
npm run dev
```

Or from inside `frontend/`:
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Verification Tests

```bash
npm test
```

Runs the Vitest suite covering:
- `TopologyGraph` directed dependency reachability & downstream traversal
- Deterministic scenario event generator & timestamp cadence
- Correlation engine multi-signal grouping & explicit reasons
- Causal engine Top-1 root cause accuracy (Database saturation)
- Causal engine Top-1 root cause accuracy (Faulty deployment)
- Counterfactual engine Pearlian symptom elimination
- Benchmark Suite (100% Top-1 accuracy across all 3 benchmark test scenarios)

---

## 📦 Production Build

```bash
npm run build
```
Compiles a production-ready bundle into `frontend/dist/` with zero errors.
