from typing import List, Dict, Any, Optional
import networkx as nx
from app.schemas.service import Service, Dependency, HealthStatus, ServiceType, DependencyType
from app.persistence.repository import repository

# The 6 core services for the digital payment platform
DEFAULT_SERVICES = [
    Service(
        service_id="database",
        name="Postgres Cluster",
        service_type=ServiceType.DATABASE,
        criticality=1.0,
        description="Primary transactional relational database and connection pool",
        health_status=HealthStatus.HEALTHY,
    ),
    Service(
        service_id="transaction-service",
        name="Transaction Engine",
        service_type=ServiceType.SERVICE,
        criticality=0.85,
        description="Processes payment ledgers, charge states and ledger updates",
        health_status=HealthStatus.HEALTHY,
    ),
    Service(
        service_id="payment-service",
        name="Payment Processor",
        service_type=ServiceType.SERVICE,
        criticality=0.95,
        description="Handles payment authorization, merchant checkouts and settlement",
        health_status=HealthStatus.HEALTHY,
    ),
    Service(
        service_id="user-service",
        name="User Profile Service",
        service_type=ServiceType.SERVICE,
        criticality=0.8,
        description="Maintains customer identity, payment methods and preferences",
        health_status=HealthStatus.HEALTHY,
    ),
    Service(
        service_id="auth-service",
        name="Authentication Service",
        service_type=ServiceType.AUTH,
        criticality=0.9,
        description="Validates tokens, SSO sessions and API keys",
        health_status=HealthStatus.HEALTHY,
    ),
    Service(
        service_id="api-gateway",
        name="API Edge Gateway",
        service_type=ServiceType.GATEWAY,
        criticality=1.0,
        description="Reverse proxy, rate limiting, routing and SSL termination",
        health_status=HealthStatus.HEALTHY,
    ),
]

# Dependency edges: source is the dependency (upstream), target depends on source (downstream)
DEFAULT_DEPENDENCIES = [
    Dependency(source_service_id="database", target_service_id="transaction-service", dependency_type=DependencyType.DATABASE, expected_latency_ms=5),
    Dependency(source_service_id="database", target_service_id="payment-service", dependency_type=DependencyType.DATABASE, expected_latency_ms=10),
    Dependency(source_service_id="database", target_service_id="auth-service", dependency_type=DependencyType.DATABASE, expected_latency_ms=5),
    Dependency(source_service_id="database", target_service_id="user-service", dependency_type=DependencyType.DATABASE, expected_latency_ms=8),
    Dependency(source_service_id="transaction-service", target_service_id="payment-service", dependency_type=DependencyType.SYNC_API, expected_latency_ms=30),
    Dependency(source_service_id="user-service", target_service_id="payment-service", dependency_type=DependencyType.SYNC_API, expected_latency_ms=25),
    Dependency(source_service_id="user-service", target_service_id="auth-service", dependency_type=DependencyType.SYNC_API, expected_latency_ms=20),
    Dependency(source_service_id="auth-service", target_service_id="api-gateway", dependency_type=DependencyType.SYNC_API, expected_latency_ms=15),
    Dependency(source_service_id="user-service", target_service_id="api-gateway", dependency_type=DependencyType.SYNC_API, expected_latency_ms=20),
    Dependency(source_service_id="payment-service", target_service_id="api-gateway", dependency_type=DependencyType.SYNC_API, expected_latency_ms=45),
]

class TopologyManager:
    """Manages the directed dependency graph using NetworkX."""

    def __init__(self):
        self.graph = nx.DiGraph()
        self.initialize_default_topology()

    def initialize_default_topology(self):
        self.graph.clear()
        for service in DEFAULT_SERVICES:
            self.graph.add_node(
                service.service_id,
                name=service.name,
                service_type=service.service_type.value,
                criticality=service.criticality,
                description=service.description,
                health_status=service.health_status.value
            )
            repository.save_service(service)

        for dep in DEFAULT_DEPENDENCIES:
            self.graph.add_edge(
                dep.source_service_id,
                dep.target_service_id,
                dependency_type=dep.dependency_type.value,
                expected_latency_ms=dep.expected_latency_ms
            )
            repository.save_dependency(dep)

    def get_services(self) -> List[Service]:
        return repository.get_services()

    def get_dependencies(self) -> List[Dependency]:
        return repository.get_dependencies()

    def update_service_health(self, service_id: str, status: HealthStatus):
        if self.graph.has_node(service_id):
            self.graph.nodes[service_id]["health_status"] = status.value
            svc = repository.get_service(service_id)
            if svc:
                svc.health_status = status
                repository.save_service(svc)

    def get_downstream_dependents(self, service_id: str) -> List[str]:
        """Returns all services that directly or indirectly depend on this service."""
        if not self.graph.has_node(service_id):
            return []
        # In our convention, edges go from upstream dependency to downstream dependent
        return list(nx.descendants(self.graph, service_id))

    def get_upstream_dependencies(self, service_id: str) -> List[str]:
        """Returns all services that this service depends on."""
        if not self.graph.has_node(service_id):
            return []
        return list(nx.ancestors(self.graph, service_id))

    def get_dependency_paths(self, source: str, target: str) -> List[List[str]]:
        if not self.graph.has_node(source) or not self.graph.has_node(target):
            return []
        try:
            return list(nx.all_simple_paths(self.graph, source=source, target=target))
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

    def to_dict(self) -> Dict[str, Any]:
        nodes = []
        for node_id, data in self.graph.nodes(data=True):
            nodes.append({
                "id": node_id,
                "label": data.get("name", node_id),
                "service_type": data.get("service_type", "service"),
                "criticality": data.get("criticality", 0.5),
                "health_status": data.get("health_status", "healthy"),
            })

        edges = []
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                "source": u,
                "target": v,
                "dependency_type": data.get("dependency_type", "sync_api"),
                "expected_latency_ms": data.get("expected_latency_ms", 10),
            })

        return {"nodes": nodes, "edges": edges}

topology_manager = TopologyManager()

