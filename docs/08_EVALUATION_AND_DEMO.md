# 08 — Evaluation, Test Scenarios & Judge Demo

## 1. Evaluation philosophy

The project must demonstrate measurable behavior. Use seeded ground truth and report the actual measured results. Do not claim accuracy numbers before running the evaluation.

## 2. Seeded scenarios

### Scenario A — Database connection pool exhaustion
Expected initiating fault: database connection pool saturation.
Expected downstream symptoms:
- Authentication latency increase.
- Payment API timeouts.
- Transaction failures.
- Possibly user-service request delays.

### Scenario B — Faulty payment deployment
Expected initiating fault: new payment-service version introduces elevated errors.
Expected downstream symptoms:
- Payment API 5xx increase.
- Transaction failures.
- Retry volume increase.
- Possible queue backlog.

### Scenario C — Network latency between services
Expected initiating fault: network latency on a dependency edge.
Expected downstream symptoms:
- Dependent service latency.
- Request timeouts.
- Retry amplification.
- Possible partial service degradation.

Each scenario must have a ground-truth initiating fault and a known expected propagation sequence.

## 3. Metrics

- **Root Cause Top-1 Accuracy:** fraction of incidents where true cause is ranked first.
- **Root Cause Top-3 Accuracy:** fraction where true cause appears in first three.
- **Event Correlation Precision:** relevant grouped event pairs / all grouped event pairs.
- **Event Correlation Recall:** relevant grouped event pairs / all truly related event pairs.
- **Detection Latency:** incident creation time minus first ground-truth fault time.
- **Blast Radius Precision:** correctly identified affected services / all services predicted affected.
- **Evidence Traceability:** proportion of claims whose evidence IDs resolve to stored records.
- **Agent Grounding Rate:** proportion of factual agent claims supported by cited evidence.

## 4. Baselines

Compare against:
- Time-window-only grouping.
- Earliest-error heuristic.
- Dependency reachability without metric evidence.

The purpose is to show why combining temporal, topology and multi-signal evidence improves diagnosis on the seeded scenarios.

## 5. Judge demo script (4–6 minutes)

### 0:00–0:30 — Problem
Show fragmented telemetry and explain that independent alerts hide shared failures.

### 0:30–1:00 — Healthy system
Show six services and normal metrics.

### 1:00–1:40 — Inject fault
Judge selects `Database connection pool exhaustion`. Events begin appearing.

### 1:40–2:20 — Correlate
Show multiple symptoms grouped into one incident with correlation reasons.

### 2:20–3:10 — Investigate
Show causal graph, ranked hypotheses, factor breakdown and evidence references. Trigger the investigation agents.

### 3:10–4:00 — Counterfactual
Select database saturation and run the intervention. Show which model-predicted symptoms disappear and which remain.

### 4:00–4:40 — Impact and recommendation
Show observed vs at-risk services and a human-approved simulated recovery plan.

### 4:40–5:30 — Proof
Show benchmark metrics and explain limitations honestly.

## 6. Questions judges may ask

**Q: How is this different from monitoring tools?**  
A: The prototype focuses on cross-signal incident reconstruction, transparent root-cause hypothesis ranking, evidence traceability and model-based counterfactual replay rather than only displaying alerts.

**Q: Is this real causal inference?**  
A: It is an evidence-weighted causal hypothesis engine operating over temporal observations and an explicit dependency/scenario model. It does not claim universal causal discovery or certainty.

**Q: Why use LLM agents?**  
A: Agents gather and challenge evidence and generate explanations. Deterministic analysis remains the source of truth for scoring and graph computation.

**Q: What if the LLM is unavailable?**  
A: Core detection, correlation, ranking, graph, counterfactual and demo functions work through deterministic logic. The agent layer has a labelled fallback mode.

**Q: Can it fix production incidents?**  
A: The hackathon prototype provides recommendations and simulated recovery with human approval. Production remediation requires integrations, authorization, audit and safety controls.

**Q: How do you know it works?**  
A: We run seeded scenarios with known initiating faults and evaluate top-k root cause accuracy, correlation precision/recall, detection latency, blast-radius accuracy and evidence traceability.

## 7. Demo reliability

- Use fixed scenario seeds.
- Preload topology and scenario data.
- Provide a reset button.
- Ensure no network call is required for the main demo.
- Keep an offline deterministic agent mode.
- Prepare a short screen recording as backup.
