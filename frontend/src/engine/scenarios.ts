import { ScenarioDefinition, NormalizedEvent } from './types';

export const SCENARIO_DEFINITIONS: Record<string, ScenarioDefinition> = {
  'database-saturation': {
    scenario_id: 'database-saturation',
    title: 'PostgreSQL Connection Pool Exhaustion',
    description: 'Surge in checkout traffic exhausts the primary database connection pool (100/100 connections). Downstream ledger writes timeout, causing cascading 504 errors across Payment and Auth services up to the API Gateway.',
    initiating_service: 'database',
    initiating_fault: 'Connection pool saturation: 100/100 active connections with 84 waiting threads',
    affected_services: ['database', 'transaction-service', 'payment-service', 'auth-service', 'api-gateway'],
    event_templates: [
      {
        offset_seconds: 0,
        service: 'database',
        event_type: 'resource_saturation',
        severity: 'critical',
        message: 'PostgreSQL connection pool reached 100% capacity (100/100 active connections)',
        correlation_id: 'corr-checkout-891',
        metric_name: 'db_pool_utilization',
        metric_value: 1.0,
        attributes: { pool_size: 100, active_connections: 100, wait_queue_length: 84, max_wait_ms: 5000 }
      },
      {
        offset_seconds: 4,
        service: 'transaction-service',
        event_type: 'service_timeout',
        severity: 'error',
        message: 'Connection acquisition timed out after 3000ms during reserve_balance_hold()',
        correlation_id: 'corr-checkout-891',
        metric_name: 'db_timeout_rate',
        metric_value: 0.42,
        attributes: { timeout_ms: 3000, failed_queries: 52, query_table: 'ledger_entries' }
      },
      {
        offset_seconds: 8,
        service: 'payment-service',
        event_type: 'service_timeout',
        severity: 'error',
        message: 'Payment authorization blocked waiting on ledger transaction lock',
        correlation_id: 'corr-checkout-891',
        metric_name: 'payment_latency_ms',
        metric_value: 2950.0,
        attributes: { http_status: 504, endpoint: '/v1/charges/authorize', p99_latency_ms: 3200 }
      },
      {
        offset_seconds: 12,
        service: 'auth-service',
        event_type: 'error_spike',
        severity: 'warning',
        message: 'User session verification latency degraded due to auth DB connection queue',
        correlation_id: 'corr-checkout-891',
        metric_name: 'session_lookup_latency_ms',
        metric_value: 1250.0,
        attributes: { cache_miss_rate: 0.38, db_lookup_delay_ms: 1210 }
      },
      {
        offset_seconds: 16,
        service: 'api-gateway',
        event_type: 'error_spike',
        severity: 'critical',
        message: 'Elevated 504 Gateway Timeouts on /api/v1/checkout and /api/v1/login (Error Rate: 48%)',
        correlation_id: 'corr-checkout-891',
        metric_name: 'http_5xx_rate',
        metric_value: 0.48,
        attributes: { route: '/api/v1/checkout', status_504_count: 142, dropped_rps: 85 }
      }
    ],
    recovery_action: {
      title: 'Dynamically Scale Database Connection Pool',
      description: 'Increase PostgreSQL pool size from 100 to 250 connections and flush idle client sessions.',
      target_service: 'database'
    }
  },
  'faulty-deployment': {
    scenario_id: 'faulty-deployment',
    title: 'Faulty Payment Service Deployment (v2.4.1)',
    description: 'Deployment of payment-service:v2.4.1 introduces an unhandled NullPointerException in payment tokenization, resulting in instant 500 crashes and transaction rollbacks.',
    initiating_service: 'payment-service',
    initiating_fault: 'Deployment rollout of version v2.4.1 with unhandled exception in StripeWebhookHandler',
    affected_services: ['payment-service', 'transaction-service', 'api-gateway'],
    event_templates: [
      {
        offset_seconds: 0,
        service: 'payment-service',
        event_type: 'deployment',
        severity: 'info',
        message: 'Deployment payment-service:v2.4.1 finished rolling rollout across cluster pods',
        correlation_id: 'corr-deploy-994',
        metric_name: 'deployment_version',
        metric_value: 2.41,
        attributes: { commit_sha: 'a7e1f42', pods_updated: 8, image: 'payment-service:v2.4.1' }
      },
      {
        offset_seconds: 3,
        service: 'payment-service',
        event_type: 'error_spike',
        severity: 'critical',
        message: 'NullPointerException in StripeWebhookHandler.tokenize() on customer charge requests',
        correlation_id: 'corr-deploy-994',
        metric_name: 'unhandled_exception_rate',
        metric_value: 0.68,
        attributes: { exception_type: 'NullPointerException', stack_frame: 'StripeWebhookHandler.java:142' }
      },
      {
        offset_seconds: 7,
        service: 'transaction-service',
        event_type: 'error_spike',
        severity: 'warning',
        message: 'Abnormal rollback spike: payment authorizations aborted by payment engine',
        correlation_id: 'corr-deploy-994',
        metric_name: 'transaction_rollback_rate',
        metric_value: 0.55,
        attributes: { aborted_count: 94, reason: 'UPSTREAM_PAYMENT_FAILED' }
      },
      {
        offset_seconds: 11,
        service: 'api-gateway',
        event_type: 'error_spike',
        severity: 'error',
        message: 'High 500 Internal Server Error rate on /api/v1/payments/process (Error Rate: 36%)',
        correlation_id: 'corr-deploy-994',
        metric_name: 'http_500_rate',
        metric_value: 0.36,
        attributes: { route: '/api/v1/payments/process', status_500_count: 88 }
      }
    ],
    recovery_action: {
      title: 'Rollback Payment Service to v2.4.0',
      description: 'Trigger immediate canary rollback to previous stable release image payment-service:v2.4.0.',
      target_service: 'payment-service'
    }
  },
  'network-latency': {
    scenario_id: 'network-latency',
    title: 'Inter-Service Network Interface Packet Loss',
    description: 'Switch port degradation induces 14% packet drops and +1800ms link latency to the database, filling in-flight connection queues and triggering cascading timeouts.',
    initiating_service: 'database',
    initiating_fault: 'Network switch port buffer drop: +1800ms interface latency and 14% packet drop',
    affected_services: ['database', 'payment-service', 'api-gateway'],
    event_templates: [
      {
        offset_seconds: 0,
        service: 'database',
        event_type: 'network_latency',
        severity: 'warning',
        message: 'Network switch port eth0 dropped packet rate exceeded threshold; roundtrip latency +1850ms',
        correlation_id: 'corr-net-712',
        metric_name: 'network_packet_latency_ms',
        metric_value: 1850.0,
        attributes: { interface: 'eth0', packet_loss_pct: 14.2, jitter_ms: 120 }
      },
      {
        offset_seconds: 4,
        service: 'payment-service',
        event_type: 'service_timeout',
        severity: 'warning',
        message: 'Database query keepalive roundtrip exceeded 1900ms',
        correlation_id: 'corr-net-712',
        metric_name: 'db_query_time_ms',
        metric_value: 1920.0,
        attributes: { expected_ms: 8, observed_ms: 1920, slow_queries: 67 }
      },
      {
        offset_seconds: 8,
        service: 'payment-service',
        event_type: 'resource_saturation',
        severity: 'warning',
        message: 'In-flight payment request queue depth exceeded critical threshold (460/500)',
        correlation_id: 'corr-net-712',
        metric_name: 'request_queue_depth',
        metric_value: 460.0,
        attributes: { max_queue: 500, current: 460, rejected_rps: 24 }
      },
      {
        offset_seconds: 12,
        service: 'api-gateway',
        event_type: 'service_timeout',
        severity: 'error',
        message: 'Client request timeout limit breached (P99 latency > 2200ms on /checkout)',
        correlation_id: 'corr-net-712',
        metric_name: 'p99_latency_ms',
        metric_value: 2200.0,
        attributes: { endpoint: '/checkout', sla_limit_ms: 500, p99_observed_ms: 2200 }
      }
    ],
    recovery_action: {
      title: 'Reroute Traffic to Redundant Secondary Network Interface',
      description: 'Switch database interface eth0 to redundant VLAN trunk eth1 and reset TCP connections.',
      target_service: 'database'
    }
  }
};

export function generateScenarioEvents(scenarioId: string, baseTime: Date = new Date()): NormalizedEvent[] {
  const scenario = SCENARIO_DEFINITIONS[scenarioId];
  if (!scenario) return [];

  return scenario.event_templates.map((tmpl, idx) => {
    const eventTime = new Date(baseTime.getTime() + tmpl.offset_seconds * 1000);
    return {
      event_id: `evt-${scenarioId.slice(0, 3)}-${String(idx + 1).padStart(3, '0')}`,
      timestamp: eventTime.toISOString(),
      service: tmpl.service,
      event_type: tmpl.event_type,
      severity: tmpl.severity,
      message: tmpl.message,
      correlation_id: tmpl.correlation_id,
      metric_name: tmpl.metric_name || null,
      metric_value: tmpl.metric_value !== undefined ? tmpl.metric_value : null,
      attributes: tmpl.attributes,
    };
  });
}

