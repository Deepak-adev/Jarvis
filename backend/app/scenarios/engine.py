from typing import List, Dict, Optional, Any
from datetime import datetime, timezone, timedelta
import uuid
from app.schemas.event import NormalizedEvent, Severity, EventType
from app.schemas.scenario import ScenarioInfo, ScenarioStatus, ScenarioActionResponse
from app.schemas.service import HealthStatus
from app.persistence.repository import repository
from app.topology.service_graph import topology_manager

SCENARIOS: Dict[str, Dict[str, Any]] = {
    "database-saturation": {
        "scenario_id": "database-saturation",
        "title": "Database Connection Pool Exhaustion",
        "description": "Connection pool hits 100% capacity in the PostgreSQL cluster, cascading timeouts through transaction, payment, and auth services to the API gateway.",
        "initiating_service": "database",
        "initiating_fault": "PostgreSQL connection pool capacity reached (100/100 active connections)",
        "affected_services": ["database", "transaction-service", "payment-service", "auth-service", "api-gateway"],
        "event_templates": [
            {
                "offset_seconds": 0,
                "service": "database",
                "event_type": EventType.RESOURCE_SATURATION.value,
                "severity": Severity.CRITICAL,
                "message": "PostgreSQL connection pool reached capacity (100/100 active connections)",
                "correlation_id": "checkout-storm-01",
                "metric_name": "db_pool_utilization",
                "metric_value": 1.0,
                "attributes": {"pool_size": 100, "active_connections": 100, "wait_queue_length": 84}
            },
            {
                "offset_seconds": 3,
                "service": "transaction-service",
                "event_type": EventType.SERVICE_TIMEOUT.value,
                "severity": Severity.ERROR,
                "message": "Connection pool acquisition timed out after 3000ms in ledger_reserve()",
                "correlation_id": "checkout-storm-01",
                "metric_name": "db_timeout_rate",
                "metric_value": 0.38,
                "attributes": {"timeout_ms": 3000, "failed_queries": 45}
            },
            {
                "offset_seconds": 6,
                "service": "payment-service",
                "event_type": EventType.SERVICE_TIMEOUT.value,
                "severity": Severity.ERROR,
                "message": "Charge authorization request blocked on downstream ledger update",
                "correlation_id": "checkout-storm-01",
                "metric_name": "payment_latency_ms",
                "metric_value": 2850.0,
                "attributes": {"http_status": 504, "endpoint": "/v1/charges/authorize"}
            },
            {
                "offset_seconds": 9,
                "service": "auth-service",
                "event_type": EventType.ERROR_SPIKE.value,
                "severity": Severity.WARNING,
                "message": "User session token verification delayed due to database auth query latency",
                "correlation_id": "checkout-storm-01",
                "metric_name": "session_lookup_latency_ms",
                "metric_value": 1200.0,
                "attributes": {"cache_miss_rate": 0.40, "db_lookup_delay_ms": 1180}
            },
            {
                "offset_seconds": 12,
                "service": "api-gateway",
                "event_type": EventType.ERROR_SPIKE.value,
                "severity": Severity.CRITICAL,
                "message": "Elevated 504 Gateway Timeouts on /api/v1/checkout and /api/v1/login",
                "correlation_id": "checkout-storm-01",
                "metric_name": "http_5xx_rate",
                "metric_value": 0.48,
                "attributes": {"route": "/api/v1/checkout", "status_504_count": 128}
            }
        ]
    },
    "faulty-deployment": {
        "scenario_id": "faulty-deployment",
        "title": "Faulty Payment Service Deployment",
        "description": "Deployment v2.4.1 introduces an unhandled NullPointerException in payment tokenization, causing rapid payment failures and gateway 500 errors.",
        "initiating_service": "payment-service",
        "initiating_fault": "Payment Service v2.4.1 rollout with unhandled exception bug",
        "affected_services": ["payment-service", "transaction-service", "api-gateway"],
        "event_templates": [
            {
                "offset_seconds": 0,
                "service": "payment-service",
                "event_type": EventType.DEPLOYMENT.value,
                "severity": Severity.INFO,
                "message": "Deployment payment-service-v2.4.1 completed across all pods",
                "correlation_id": "deploy-pay-v241",
                "metric_name": "deployment_version",
                "metric_value": 2.41,
                "attributes": {"commit_sha": "a7e1f42", "replica_count": 6}
            },
            {
                "offset_seconds": 2,
                "service": "payment-service",
                "event_type": EventType.ERROR_SPIKE.value,
                "severity": Severity.CRITICAL,
                "message": "NullPointerException in StripeWebhookHandler after v2.4.1 initialization",
                "correlation_id": "deploy-pay-v241",
                "metric_name": "unhandled_exception_rate",
                "metric_value": 0.65,
                "attributes": {"exception": "NullPointerException", "method": "tokenize()"}
            },
            {
                "offset_seconds": 5,
                "service": "transaction-service",
                "event_type": EventType.ERROR_SPIKE.value,
                "severity": Severity.WARNING,
                "message": "High transaction rollback rate due to upstream payment processor aborts",
                "correlation_id": "deploy-pay-v241",
                "metric_name": "transaction_rollback_rate",
                "metric_value": 0.52,
                "attributes": {"aborted_transactions": 86}
            },
            {
                "offset_seconds": 8,
                "service": "api-gateway",
                "event_type": EventType.ERROR_SPIKE.value,
                "severity": Severity.ERROR,
                "message": "API gateway returning HTTP 500 on /api/v1/payments/process",
                "correlation_id": "deploy-pay-v241",
                "metric_name": "http_500_rate",
                "metric_value": 0.35,
                "attributes": {"endpoint": "/api/v1/payments/process", "status": 500}
            }
        ]
    },
    "network-latency": {
        "scenario_id": "network-latency",
        "title": "Database Inter-Service Network Degradation",
        "description": "Network switch packet drop causes +1800ms latency on database links, backing up queues and triggering client request timeouts.",
        "initiating_service": "database",
        "initiating_fault": "Interface eth0 dropped packets causing +1800ms link latency",
        "affected_services": ["database", "payment-service", "api-gateway"],
        "event_templates": [
            {
                "offset_seconds": 0,
                "service": "database",
                "event_type": EventType.NETWORK_LATENCY.value,
                "severity": Severity.WARNING,
                "message": "Interface eth0 dropped packets: link latency increased by 1800ms",
                "correlation_id": "net-degrade-99",
                "metric_name": "network_packet_latency_ms",
                "metric_value": 1850.0,
                "attributes": {"packet_loss_pct": 14.5, "interface": "eth0"}
            },
            {
                "offset_seconds": 3,
                "service": "payment-service",
                "event_type": EventType.SERVICE_TIMEOUT.value,
                "severity": Severity.WARNING,
                "message": "Database connection keepalive roundtrip exceeded 1800ms",
                "correlation_id": "net-degrade-99",
                "metric_name": "db_query_time_ms",
                "metric_value": 1920.0,
                "attributes": {"expected_ms": 10, "observed_ms": 1920}
            },
            {
                "offset_seconds": 6,
                "service": "payment-service",
                "event_type": EventType.RESOURCE_SATURATION.value,
                "severity": Severity.WARNING,
                "message": "In-flight payment request queue depth exceeded threshold (450/500)",
                "correlation_id": "net-degrade-99",
                "metric_name": "request_queue_depth",
                "metric_value": 450.0,
                "attributes": {"max_queue": 500, "current": 450}
            },
            {
                "offset_seconds": 9,
                "service": "api-gateway",
                "event_type": EventType.SERVICE_TIMEOUT.value,
                "severity": Severity.ERROR,
                "message": "P99 latency threshold breached on /checkout endpoint (>2000ms)",
                "correlation_id": "net-degrade-99",
                "metric_name": "p99_latency_ms",
                "metric_value": 2200.0,
                "attributes": {"p99_ms": 2200, "sla_limit_ms": 500}
            }
        ]
    }
}

class ScenarioEngine:
    """Manages deterministic scenario simulations, event generation, and control states."""

    def __init__(self):
        self.scenario_states: Dict[str, ScenarioStatus] = {
            s_id: ScenarioStatus.IDLE for s_id in SCENARIOS
        }
        self.active_scenario_id: Optional[str] = None
        self.generated_events_count: Dict[str, int] = {
            s_id: 0 for s_id in SCENARIOS
        }

    def list_scenarios(self) -> List[ScenarioInfo]:
        res = []
        for s_id, s_data in SCENARIOS.items():
            res.append(ScenarioInfo(
                scenario_id=s_id,
                title=s_data["title"],
                description=s_data["description"],
                initiating_fault=s_data["initiating_fault"],
                affected_services=s_data["affected_services"],
                status=self.scenario_states.get(s_id, ScenarioStatus.IDLE),
                total_events=len(s_data["event_templates"]),
                injected_events=self.generated_events_count.get(s_id, 0),
            ))
        return res

    def get_scenario(self, scenario_id: str) -> Optional[ScenarioInfo]:
        s_data = SCENARIOS.get(scenario_id)
        if not s_data:
            return None
        return ScenarioInfo(
            scenario_id=scenario_id,
            title=s_data["title"],
            description=s_data["description"],
            initiating_fault=s_data["initiating_fault"],
            affected_services=s_data["affected_services"],
            status=self.scenario_states.get(scenario_id, ScenarioStatus.IDLE),
            total_events=len(s_data["event_templates"]),
            injected_events=self.generated_events_count.get(scenario_id, 0),
        )

    def start_scenario(self, scenario_id: str) -> ScenarioActionResponse:
        s_data = SCENARIOS.get(scenario_id)
        if not s_data:
            raise ValueError(f"Unknown scenario: {scenario_id}")

        self.active_scenario_id = scenario_id
        self.scenario_states[scenario_id] = ScenarioStatus.RUNNING

        # Generate deterministic events anchored to the current UTC timestamp
        base_time = datetime.now(timezone.utc)
        events_generated = 0

        for tmpl in s_data["event_templates"]:
            event_time = base_time + timedelta(seconds=tmpl["offset_seconds"])
            event_id = f"evt-{scenario_id[:3]}-{uuid.uuid4().hex[:6]}"
            event = NormalizedEvent(
                event_id=event_id,
                timestamp=event_time.isoformat(),
                service=tmpl["service"],
                event_type=tmpl["event_type"],
                severity=tmpl["severity"],
                message=tmpl["message"],
                correlation_id=tmpl["correlation_id"],
                metric_name=tmpl.get("metric_name"),
                metric_value=tmpl.get("metric_value"),
                attributes=tmpl.get("attributes", {})
            )
            repository.save_event(event)
            events_generated += 1

            # Update service health based on event severity
            if tmpl["severity"] == Severity.CRITICAL:
                topology_manager.update_service_health(tmpl["service"], HealthStatus.CRITICAL)
            elif tmpl["severity"] in (Severity.ERROR, Severity.WARNING):
                current_svc = repository.get_service(tmpl["service"])
                if current_svc and current_svc.health_status != HealthStatus.CRITICAL:
                    topology_manager.update_service_health(tmpl["service"], HealthStatus.DEGRADED)

        self.generated_events_count[scenario_id] = events_generated
        self.scenario_states[scenario_id] = ScenarioStatus.COMPLETED

        return ScenarioActionResponse(
            scenario_id=scenario_id,
            status=ScenarioStatus.COMPLETED,
            message=f"Scenario '{s_data['title']}' executed. Injected {events_generated} correlated events.",
            events_generated=events_generated,
        )

    def pause_scenario(self, scenario_id: str) -> ScenarioActionResponse:
        if scenario_id not in SCENARIOS:
            raise ValueError(f"Unknown scenario: {scenario_id}")
        self.scenario_states[scenario_id] = ScenarioStatus.PAUSED
        return ScenarioActionResponse(
            scenario_id=scenario_id,
            status=ScenarioStatus.PAUSED,
            message=f"Scenario '{scenario_id}' paused.",
            events_generated=self.generated_events_count.get(scenario_id, 0),
        )

    def reset_scenario(self, scenario_id: Optional[str] = None) -> ScenarioActionResponse:
        # Clear events and reset service graph
        repository.clear_all()
        topology_manager.initialize_default_topology()

        for s_id in self.scenario_states:
            self.scenario_states[s_id] = ScenarioStatus.IDLE
            self.generated_events_count[s_id] = 0

        self.active_scenario_id = None
        target_id = scenario_id or "all"

        return ScenarioActionResponse(
            scenario_id=target_id,
            status=ScenarioStatus.IDLE,
            message="Simulator state, telemetry events, and service topology reset to baseline.",
            events_generated=0,
        )

    def inject_fault(
        self,
        scenario_id: str,
        custom_event: Optional[Dict[str, Any]] = None
    ) -> ScenarioActionResponse:
        s_data = SCENARIOS.get(scenario_id)
        if not s_data:
            raise ValueError(f"Unknown scenario: {scenario_id}")

        now = datetime.now(timezone.utc).isoformat()
        if custom_event:
            event = NormalizedEvent(
                event_id=custom_event.get("event_id") or f"inj-{uuid.uuid4().hex[:6]}",
                timestamp=custom_event.get("timestamp") or now,
                service=custom_event["service"],
                event_type=custom_event.get("event_type", EventType.RESOURCE_SATURATION.value),
                severity=Severity(custom_event.get("severity", "critical")),
                message=custom_event["message"],
                correlation_id=custom_event.get("correlation_id", f"inj-{scenario_id}"),
                metric_name=custom_event.get("metric_name"),
                metric_value=custom_event.get("metric_value"),
                attributes=custom_event.get("attributes", {})
            )
        else:
            # Inject primary initiating fault from the template
            primary_tmpl = s_data["event_templates"][0]
            event = NormalizedEvent(
                event_id=f"inj-{uuid.uuid4().hex[:6]}",
                timestamp=now,
                service=primary_tmpl["service"],
                event_type=primary_tmpl["event_type"],
                severity=primary_tmpl["severity"],
                message=f"[MANUALLY INJECTED] {primary_tmpl['message']}",
                correlation_id=f"inj-{scenario_id}",
                metric_name=primary_tmpl.get("metric_name"),
                metric_value=primary_tmpl.get("metric_value"),
                attributes=primary_tmpl.get("attributes", {})
            )

        repository.save_event(event)
        topology_manager.update_service_health(event.service, HealthStatus.CRITICAL)
        self.generated_events_count[scenario_id] = self.generated_events_count.get(scenario_id, 0) + 1

        return ScenarioActionResponse(
            scenario_id=scenario_id,
            status=ScenarioStatus.RUNNING,
            message=f"Injected fault into service '{event.service}': {event.message}",
            events_generated=1,
        )

scenario_engine = ScenarioEngine()

