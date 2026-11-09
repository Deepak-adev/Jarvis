import { NormalizedEvent, Incident } from './types';
import { TopologyGraph } from './topology';

export interface CorrelationResult {
  incidents: Incident[];
  groupedEventMap: Map<string, NormalizedEvent[]>;
}

export class CorrelationEngine {
  private windowSeconds: number;

  constructor(windowSeconds: number = 60) {
    this.windowSeconds = windowSeconds;
  }

  correlate(events: NormalizedEvent[], topology: TopologyGraph): Incident[] {
    if (events.length === 0) return [];

    // Sort chronologically
    const sorted = [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Grouping criteria:
    // 1. Shared correlation_id or trace_id
    // 2. Temporal window proximity (< 60s)
    // 3. Topology connectivity (reachable in dependency graph)
    // 4. Pattern matching (e.g. resource_saturation -> timeout -> error_spike)

    const clusters: {
      events: NormalizedEvent[];
      reasons: Set<string>;
      scenarioId?: string;
    }[] = [];

    for (const evt of sorted) {
      let matchedCluster = null;

      for (const cluster of clusters) {
        const lastEvt = cluster.events[cluster.events.length - 1];
        const timeDiffSec = (new Date(evt.timestamp).getTime() - new Date(lastEvt.timestamp).getTime()) / 1000;

        // Check if inside time window
        if (timeDiffSec <= this.windowSeconds) {
          // Check shared correlation ID
          const hasSharedCorrId = evt.correlation_id && cluster.events.some(e => e.correlation_id === evt.correlation_id);
          // Check topology path between services
          const hasTopologyPath = cluster.events.some(e => {
            const pathForward = topology.findAllPaths(e.service, evt.service).length > 0;
            const pathReverse = topology.findAllPaths(evt.service, e.service).length > 0;
            return pathForward || pathReverse;
          });

          if (hasSharedCorrId || hasTopologyPath) {
            matchedCluster = cluster;
            if (hasSharedCorrId) {
              cluster.reasons.add(`Shared request/trace correlation identifier (${evt.correlation_id})`);
            }
            if (hasTopologyPath) {
              cluster.reasons.add(`Direct service dependency relationship between ${evt.service} and upstream telemetry`);
            }
            cluster.reasons.add(`Occurred within ${this.windowSeconds}s temporal window (dt = ${Math.round(timeDiffSec)}s)`);
            break;
          }
        }
      }

      if (matchedCluster) {
        matchedCluster.events.push(evt);
      } else {
        const reasons = new Set<string>();
        reasons.add('Initiating event detected');
        clusters.push({
          events: [evt],
          reasons,
        });
      }
    }

    // Convert clusters into Incident objects
    return clusters.map((cluster, idx) => {
      const firstEvent = cluster.events[0];
      const lastEvent = cluster.events[cluster.events.length - 1];
      const affectedServices = Array.from(new Set(cluster.events.map(e => e.service)));
      
      const hasCritical = cluster.events.some(e => e.severity === 'critical');
      const hasError = cluster.events.some(e => e.severity === 'error');
      const overallSeverity = hasCritical ? 'critical' : hasError ? 'error' : 'warning';

      // Title based on primary symptom / service
      const title = `${affectedServices.join(' → ')} Multi-Service Degradation`;

      return {
        incident_id: `inc-${String(idx + 1).padStart(3, '0')}`,
        title,
        status: 'active',
        started_at: firstEvent.timestamp,
        last_updated_at: lastEvent.timestamp,
        event_ids: cluster.events.map(e => e.event_id),
        affected_services: affectedServices,
        severity: overallSeverity,
        correlation_reasons: Array.from(cluster.reasons),
      };
    });
  }
}

export const correlationEngine = new CorrelationEngine(60);
