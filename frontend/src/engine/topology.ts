import { Service, Dependency, BlastRadiusResult } from './types';

export const INITIAL_SERVICES: Service[] = [
  {
    service_id: 'database',
    name: 'PostgreSQL Cluster',
    service_type: 'database',
    criticality: 1.0,
    description: 'Primary relational transactional store & connection pool manager',
    health_status: 'healthy',
  },
  {
    service_id: 'transaction-service',
    name: 'Transaction Engine',
    service_type: 'service',
    criticality: 0.85,
    description: 'Manages ledger allocations, authorization holds & balance checks',
    health_status: 'healthy',
  },
  {
    service_id: 'payment-service',
    name: 'Payment Processor',
    service_type: 'service',
    criticality: 0.95,
    description: 'Handles checkout auth, merchant webhooks & 3DS verification',
    health_status: 'healthy',
  },
  {
    service_id: 'user-service',
    name: 'User Profile Service',
    service_type: 'service',
    criticality: 0.80,
    description: 'Stores customer billing profiles, KYC flags & access rights',
    health_status: 'healthy',
  },
  {
    service_id: 'auth-service',
    name: 'Authentication Service',
    service_type: 'auth',
    criticality: 0.90,
    description: 'OAuth2/JWT token signing, session verification & MFA',
    health_status: 'healthy',
  },
  {
    service_id: 'api-gateway',
    name: 'API Edge Gateway',
    service_type: 'gateway',
    criticality: 1.0,
    description: 'Public ingress, SSL termination, rate limiter & route proxy',
    health_status: 'healthy',
  },
];

// Directed edges: source is upstream dependency; target depends on source
// Failures propagate along the direction of the edge (source -> target)
export const INITIAL_DEPENDENCIES: Dependency[] = [
  { source_service_id: 'database', target_service_id: 'transaction-service', dependency_type: 'database', expected_latency_ms: 5 },
  { source_service_id: 'database', target_service_id: 'payment-service', dependency_type: 'database', expected_latency_ms: 8 },
  { source_service_id: 'database', target_service_id: 'auth-service', dependency_type: 'database', expected_latency_ms: 5 },
  { source_service_id: 'database', target_service_id: 'user-service', dependency_type: 'database', expected_latency_ms: 6 },
  { source_service_id: 'transaction-service', target_service_id: 'payment-service', dependency_type: 'sync_api', expected_latency_ms: 30 },
  { source_service_id: 'user-service', target_service_id: 'payment-service', dependency_type: 'sync_api', expected_latency_ms: 25 },
  { source_service_id: 'user-service', target_service_id: 'auth-service', dependency_type: 'sync_api', expected_latency_ms: 20 },
  { source_service_id: 'auth-service', target_service_id: 'api-gateway', dependency_type: 'sync_api', expected_latency_ms: 15 },
  { source_service_id: 'user-service', target_service_id: 'api-gateway', dependency_type: 'sync_api', expected_latency_ms: 20 },
  { source_service_id: 'payment-service', target_service_id: 'api-gateway', dependency_type: 'sync_api', expected_latency_ms: 45 },
];

export class TopologyGraph {
  services: Map<string, Service>;
  dependencies: Dependency[];
  private adjacency: Map<string, string[]>; // source -> list of targets (downstream dependents)
  private reverseAdjacency: Map<string, string[]>; // target -> list of sources (upstream dependencies)

  constructor(services: Service[] = INITIAL_SERVICES, dependencies: Dependency[] = INITIAL_DEPENDENCIES) {
    this.services = new Map();
    this.dependencies = [...dependencies];
    this.adjacency = new Map();
    this.reverseAdjacency = new Map();

    services.forEach(s => {
      this.services.set(s.service_id, { ...s });
      this.adjacency.set(s.service_id, []);
      this.reverseAdjacency.set(s.service_id, []);
    });

    dependencies.forEach(d => {
      if (!this.adjacency.has(d.source_service_id)) this.adjacency.set(d.source_service_id, []);
      if (!this.reverseAdjacency.has(d.target_service_id)) this.reverseAdjacency.set(d.target_service_id, []);

      this.adjacency.get(d.source_service_id)!.push(d.target_service_id);
      this.reverseAdjacency.get(d.target_service_id)!.push(d.source_service_id);
    });
  }

  getServicesList(): Service[] {
    return Array.from(this.services.values());
  }

  getService(serviceId: string): Service | undefined {
    return this.services.get(serviceId);
  }

  // Traverse all downstream dependents reachable from a service
  getDownstreamDependents(serviceId: string): string[] {
    const visited = new Set<string>();
    const queue = [...(this.adjacency.get(serviceId) || [])];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!visited.has(current)) {
        visited.add(current);
        const next = this.adjacency.get(current) || [];
        for (const n of next) {
          if (!visited.has(n)) queue.push(n);
        }
      }
    }

    return Array.from(visited);
  }

  // Find all simple paths between source and target
  findAllPaths(source: string, target: string, maxDepth: number = 6): string[][] {
    const paths: string[][] = [];

    const dfs = (current: string, currentPath: string[]) => {
      if (current === target) {
        paths.push([...currentPath]);
        return;
      }
      if (currentPath.length >= maxDepth) return;

      const neighbors = this.adjacency.get(current) || [];
      for (const neighbor of neighbors) {
        if (!currentPath.includes(neighbor)) {
          currentPath.push(neighbor);
          dfs(neighbor, currentPath);
          currentPath.pop();
        }
      }
    };

    dfs(source, [source]);
    return paths;
  }

  // Compute blast radius: observed affected vs at-risk
  computeBlastRadius(candidateServiceId: string, observedFailedServices: string[]): BlastRadiusResult {
    const downstream = this.getDownstreamDependents(candidateServiceId);
    const observedSet = new Set(observedFailedServices);

    const observed_affected: string[] = [];
    const at_risk: string[] = [];

    // Candidate service itself
    if (observedSet.has(candidateServiceId)) {
      observed_affected.push(candidateServiceId);
    } else {
      at_risk.push(candidateServiceId);
    }

    for (const svcId of downstream) {
      if (observedSet.has(svcId)) {
        observed_affected.push(svcId);
      } else {
        at_risk.push(svcId);
      }
    }

    // Impact score weighted by service criticality
    let totalScore = 0;
    let maxPossibleScore = 0;

    this.services.forEach(svc => {
      maxPossibleScore += svc.criticality;
      if (observed_affected.includes(svc.service_id)) {
        totalScore += svc.criticality * 1.0;
      } else if (at_risk.includes(svc.service_id)) {
        totalScore += svc.criticality * 0.4; // At-risk weighted lower than observed
      }
    });

    const impactScore = maxPossibleScore > 0 ? Math.min(1.0, totalScore / maxPossibleScore) : 0;

    // Collect propagation paths
    const paths: { path: string[]; description: string }[] = [];
    for (const target of observed_affected) {
      if (target !== candidateServiceId) {
        const foundPaths = this.findAllPaths(candidateServiceId, target);
        if (foundPaths.length > 0) {
          paths.push({
            path: foundPaths[0],
            description: `${candidateServiceId} → ${foundPaths[0].slice(1).join(' → ')}`,
          });
        }
      }
    }

    return {
      candidate_service_id: candidateServiceId,
      observed_affected,
      at_risk,
      impact_score: Number(impactScore.toFixed(2)),
      paths,
    };
  }
}

