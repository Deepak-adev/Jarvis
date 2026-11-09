import { describe, it, expect } from 'vitest';
import { TopologyGraph } from '../topology';
import { SCENARIO_DEFINITIONS, generateScenarioEvents } from '../scenarios';
import { CorrelationEngine } from '../correlation';
import { CausalEngine } from '../causal';
import { CounterfactualEngine } from '../counterfactual';
import { runFullBenchmark } from '../benchmark';

describe('J.A.R.V.I.S. Causal Engine Verification', () => {
  it('TopologyGraph correctly models directed dependencies', () => {
    const topology = new TopologyGraph();
    const services = topology.getServicesList();
    expect(services.length).toBe(6);

    // Database is upstream; downstream dependents must include transaction-service, payment-service, api-gateway
    const downstream = topology.getDownstreamDependents('database');
    expect(downstream).toContain('transaction-service');
    expect(downstream).toContain('payment-service');
    expect(downstream).toContain('api-gateway');
  });

  it('Deterministic Scenario Generator produces expected event count and timestamps', () => {
    const events = generateScenarioEvents('database-saturation');
    expect(events.length).toBe(5);
    expect(events[0].service).toBe('database');
    expect(events[0].severity).toBe('critical');
    expect(events[4].service).toBe('api-gateway');
  });

  it('Correlation Engine groups related signals and exposes grouping reasons', () => {
    const topology = new TopologyGraph();
    const correlation = new CorrelationEngine(60);
    const events = generateScenarioEvents('database-saturation');

    const incidents = correlation.correlate(events, topology);
    expect(incidents.length).toBe(1);
    expect(incidents[0].affected_services.length).toBe(5);
    expect(incidents[0].correlation_reasons.length).toBeGreaterThan(0);
    // Verifies correlation reasons are explicit and not just timestamp
    expect(incidents[0].correlation_reasons.some(r => r.includes('dependency') || r.includes('correlation'))).toBe(true);
  });

  it('Causal Engine correctly identifies database as Top-1 root cause for pool saturation scenario', () => {
    const topology = new TopologyGraph();
    const correlation = new CorrelationEngine(60);
    const causal = new CausalEngine();
    const events = generateScenarioEvents('database-saturation');

    const incidents = correlation.correlate(events, topology);
    const { hypotheses } = causal.rankHypotheses(incidents[0], events, topology);

    expect(hypotheses.length).toBeGreaterThan(0);
    // TOP-1 Root Cause Accuracy
    expect(hypotheses[0].candidate_service_id).toBe('database');
    expect(hypotheses[0].score).toBeGreaterThan(0.7);
    expect(hypotheses[0].support_label).toBe('high_support');
    expect(hypotheses[0].factor_breakdown.temporal_precedence).toBe(1.0);
    expect(hypotheses[0].factor_breakdown.dependency_reach).toBe(1.0);

    // Blast Radius Verification
    const blastRadius = topology.computeBlastRadius(hypotheses[0].candidate_service_id, incidents[0].affected_services);
    expect(blastRadius.observed_affected).toContain('database');
    expect(blastRadius.observed_affected).toContain('transaction-service');
    expect(blastRadius.observed_affected).toContain('payment-service');
    expect(blastRadius.observed_affected).toContain('api-gateway');
  });

  it('Causal Engine correctly identifies payment-service as Top-1 root cause for deployment scenario', () => {
    const topology = new TopologyGraph();
    const correlation = new CorrelationEngine(60);
    const causal = new CausalEngine();
    const events = generateScenarioEvents('faulty-deployment');

    const incidents = correlation.correlate(events, topology);
    const { hypotheses } = causal.rankHypotheses(incidents[0], events, topology);

    expect(hypotheses[0].candidate_service_id).toBe('payment-service');
    expect(hypotheses[0].cause_type).toBe('deployment');
  });

  it('Counterfactual Engine simulates removal of downstream symptoms', () => {
    const topology = new TopologyGraph();
    const correlation = new CorrelationEngine(60);
    const causal = new CausalEngine();
    const cfEngine = new CounterfactualEngine();

    const events = generateScenarioEvents('database-saturation');
    const incidents = correlation.correlate(events, topology);
    const { hypotheses } = causal.rankHypotheses(incidents[0], events, topology);

    const cfRun = cfEngine.runIntervention(hypotheses[0], events, topology);

    expect(cfRun.observed_symptoms.length).toBe(5);
    expect(cfRun.removed_symptoms.length).toBe(5);
    expect(cfRun.remaining_symptoms.length).toBe(0);
    expect(cfRun.caveat).toContain('MODEL-BASED SIMULATION');
  });

  it('Benchmark Suite achieves 100% Top-1 Accuracy across all standard test scenarios', () => {
    const summary = runFullBenchmark();
    expect(summary.overallTop1Accuracy).toBe(100); // 100% accuracy
    expect(summary.avgCorrelationPrecision).toBe(1.0);
    expect(summary.evidenceTraceabilityPct).toBe(100);
    expect(summary.details.length).toBe(3);
  });
});


