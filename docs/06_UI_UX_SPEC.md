# 06 — UI/UX Specification

## 1. Visual identity

**Product feel:** Premium engineering command center, not a sci-fi movie prop.

- Dark-first interface.
- Deep navy / charcoal surfaces.
- Restrained cyan or electric-blue accents.
- Red only for critical failures; amber for warnings; green for healthy/recovered.
- Clear typography, dense but readable information.
- Subtle motion only when it communicates live state changes.
- Avoid excessive glow, glassmorphism, tiny text and decorative animations.

## 2. Main navigation

Left sidebar:
- Overview
- Incidents
- Service Topology
- Investigation
- Counterfactual Lab
- Scenario Simulator
- Reports

Top bar:
- J.A.R.V.I.S. logo/wordmark
- Environment badge: `DEMO / SIMULATED`
- Live connection state
- Scenario selector
- User menu placeholder

## 3. Screen A — Command Center

Purpose: show current state at a glance.

Layout:
- Header: `Incident Command Center`
- KPI cards: healthy services, active incidents, critical alerts, events/minute.
- Main area: service topology preview.
- Side panel: active incidents ordered by severity.
- Bottom: live event stream with timestamp, service, severity and message.
- Prominent `Run Scenario` action.

## 4. Screen B — Incident Workspace (most important screen)

Use a clear three-zone layout:
- Left: incident summary, severity, time window, affected services.
- Center: interactive causal/dependency graph.
- Right: ranked root-cause hypotheses and evidence summary.

Below:
- Timeline with event markers.
- Evidence explorer.
- Agent investigation trace.
- Recommendations.

The top hypothesis must show:
- Candidate cause.
- Support score and label.
- Why it ranks highly.
- Supporting and contradicting evidence counts.
- Factor breakdown.
- Button to inspect evidence.
- Button to run counterfactual.

## 5. Screen C — Counterfactual Lab

Show a side-by-side comparison:
- Observed incident.
- Baseline model prediction.
- Counterfactual intervention.
- Predicted symptoms after intervention.
- Symptoms removed / remaining / unexplained.

Include a visible label: `MODEL-BASED SIMULATION — NOT A PRODUCTION GUARANTEE`.

## 6. Screen D — Investigation Agents

Show agent cards or a vertical activity trace:
- Agent name and objective.
- Status.
- Tools invoked.
- Findings.
- Evidence IDs.
- Limitations.

Avoid fake terminal output. Every displayed activity should correspond to a real backend task or be clearly labelled as a demo simulation.

## 7. Screen E — Scenario Simulator

- Scenario cards: database saturation, faulty deployment, network latency.
- Start / pause / reset.
- Inject fault control.
- Timeline playback speed.
- Simulated recovery action.
- Event generation status.

## 8. Interaction requirements

- Clicking a graph node filters timeline and evidence to that service.
- Clicking an evidence item opens the source event/metric.
- Clicking a hypothesis highlights its candidate service and causal path.
- Counterfactual run shows loading, result and caveats.
- Agent statuses update live.
- Empty, loading and error states must be designed.
- Provide a `Reset demo` action that restores deterministic initial state.

## 9. Responsive behavior

Desktop is the primary hackathon demo target (1366×768 or above). At smaller widths, stack panels and allow graph/timeline to scroll horizontally. Do not hide core evidence behind hover-only interactions.

## 10. Design quality bar

The application should feel like a credible observability product:
- Consistent spacing and component sizes.
- No emoji-heavy enterprise UI.
- No generic landing-page hero as the main application.
- Use realistic event data and meaningful labels.
- Keep visual hierarchy focused on incident, cause, evidence and impact.
