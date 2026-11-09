import { CounterfactualRun, Hypothesis, NormalizedEvent } from './types';
import { TopologyGraph } from './topology';

export class CounterfactualEngine {
  runIntervention(
    hypothesis: Hypothesis,
    observedEvents: NormalizedEvent[],
    topology: TopologyGraph
  ): CounterfactualRun {
    const candidateService = hypothesis.candidate_service_id;
    const downstream = topology.getDownstreamDependents(candidateService);

    // List of observed symptoms
    const observed_symptoms = observedEvents.map(
      e => `[${e.service}] ${e.message}`
    );

    // Baseline predicted symptoms assuming the candidate fault propagated normally
    const baseline_symptoms = [...observed_symptoms];

    // Determine intervention details based on candidate service & cause type
    let intervention_name = '';
    let intervention_description = '';

    if (candidateService === 'database') {
      intervention_name = 'Revert Database Pool Saturation (Intervention: do(db_pool_utilization = 0.45))';
      intervention_description = 'Simulate scaling connection pool from 100 to 250 connections and releasing idle worker locks.';
    } else if (candidateService === 'payment-service') {
      intervention_name = 'Rollback Payment Service Version (Intervention: do(deployment_version = v2.4.0))';
      intervention_description = 'Simulate canary rollback to stable release v2.4.0, removing the NullPointerException bug.';
    } else {
      intervention_name = `Mitigate Fault on ${candidateService} (Intervention: do(fault_${candidateService} = false))`;
      intervention_description = `Simulate isolating and restoring normal operation for ${candidateService}.`;
    }

    // When the initiating candidate fault is intervened on:
    // Symptoms on candidateService and all its downstream dependents should disappear in the simulation!
    const removed_symptoms: string[] = [];
    const remaining_symptoms: string[] = [];

    observedEvents.forEach(evt => {
      const isCandidateOrDownstream = evt.service === candidateService || downstream.includes(evt.service);
      const symptomDesc = `[${evt.service}] ${evt.message}`;

      if (isCandidateOrDownstream) {
        removed_symptoms.push(symptomDesc);
      } else {
        remaining_symptoms.push(symptomDesc);
      }
    });

    const counterfactual_symptoms = [...remaining_symptoms];

    return {
      run_id: `cf-${Math.random().toString(36).substring(2, 8)}`,
      incident_id: hypothesis.incident_id,
      hypothesis_id: hypothesis.hypothesis_id,
      intervention_name,
      intervention_description,
      baseline_symptoms,
      counterfactual_symptoms,
      observed_symptoms,
      removed_symptoms,
      remaining_symptoms,
      caveat: 'MODEL-BASED SIMULATION: Computed using structural scenario topology and deterministic propagation rules. This is not a production guarantee.',
    };
  }
}

export const counterfactualEngine = new CounterfactualEngine();
