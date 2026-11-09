import sqlite3
import json
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from app.schemas.service import Service, Dependency, HealthStatus, ServiceType, DependencyType
from app.schemas.event import NormalizedEvent, Severity
from app.schemas.incident import Incident

class EventRepository:
    """Repository for storing and querying services, dependencies, and normalized events."""

    def __init__(self, db_path: str = ":memory:"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Services
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS services (
                    service_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    service_type TEXT NOT NULL,
                    criticality REAL NOT NULL,
                    description TEXT,
                    health_status TEXT NOT NULL
                )
            """)
            # Dependencies (source is upstream, target depends on source)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dependencies (
                    source_service_id TEXT NOT NULL,
                    target_service_id TEXT NOT NULL,
                    dependency_type TEXT NOT NULL,
                    expected_latency_ms INTEGER,
                    PRIMARY KEY (source_service_id, target_service_id)
                )
            """)
            # Events
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    event_id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    service TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    message TEXT NOT NULL,
                    trace_id TEXT,
                    correlation_id TEXT,
                    metric_name TEXT,
                    metric_value REAL,
                    attributes_json TEXT NOT NULL
                )
            """)
            conn.commit()

    def save_service(self, service: Service):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO services (service_id, name, service_type, criticality, description, health_status)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(service_id) DO UPDATE SET
                    name=excluded.name,
                    service_type=excluded.service_type,
                    criticality=excluded.criticality,
                    description=excluded.description,
                    health_status=excluded.health_status
            """, (
                service.service_id,
                service.name,
                service.service_type.value,
                service.criticality,
                service.description,
                service.health_status.value
            ))
            conn.commit()

    def get_services(self) -> List[Service]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM services")
            rows = cursor.fetchall()
            return [
                Service(
                    service_id=row["service_id"],
                    name=row["name"],
                    service_type=ServiceType(row["service_type"]),
                    criticality=row["criticality"],
                    description=row["description"],
                    health_status=HealthStatus(row["health_status"])
                )
                for row in rows
            ]

    def get_service(self, service_id: str) -> Optional[Service]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM services WHERE service_id = ?", (service_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return Service(
                service_id=row["service_id"],
                name=row["name"],
                service_type=ServiceType(row["service_type"]),
                criticality=row["criticality"],
                description=row["description"],
                health_status=HealthStatus(row["health_status"])
            )

    def save_dependency(self, dep: Dependency):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO dependencies (source_service_id, target_service_id, dependency_type, expected_latency_ms)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(source_service_id, target_service_id) DO UPDATE SET
                    dependency_type=excluded.dependency_type,
                    expected_latency_ms=excluded.expected_latency_ms
            """, (
                dep.source_service_id,
                dep.target_service_id,
                dep.dependency_type.value,
                dep.expected_latency_ms
            ))
            conn.commit()

    def get_dependencies(self) -> List[Dependency]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM dependencies")
            rows = cursor.fetchall()
            return [
                Dependency(
                    source_service_id=row["source_service_id"],
                    target_service_id=row["target_service_id"],
                    dependency_type=DependencyType(row["dependency_type"]),
                    expected_latency_ms=row["expected_latency_ms"]
                )
                for row in rows
            ]

    def save_event(self, event: NormalizedEvent):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO events (
                    event_id, timestamp, service, event_type, severity, message,
                    trace_id, correlation_id, metric_name, metric_value, attributes_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(event_id) DO UPDATE SET
                    timestamp=excluded.timestamp,
                    service=excluded.service,
                    event_type=excluded.event_type,
                    severity=excluded.severity,
                    message=excluded.message,
                    trace_id=excluded.trace_id,
                    correlation_id=excluded.correlation_id,
                    metric_name=excluded.metric_name,
                    metric_value=excluded.metric_value,
                    attributes_json=excluded.attributes_json
            """, (
                event.event_id,
                event.timestamp,
                event.service,
                event.event_type,
                event.severity.value,
                event.message,
                event.trace_id,
                event.correlation_id,
                event.metric_name,
                event.metric_value,
                json.dumps(event.attributes or {})
            ))
            conn.commit()

    def get_events(
        self,
        service: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 100
    ) -> List[NormalizedEvent]:
        query = "SELECT * FROM events WHERE 1=1"
        params: List[Any] = []
        if service:
            query += " AND service = ?"
            params.append(service)
        if severity:
            query += " AND severity = ?"
            params.append(severity)
        query += " ORDER BY timestamp ASC LIMIT ?"
        params.append(limit)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [
                NormalizedEvent(
                    event_id=row["event_id"],
                    timestamp=row["timestamp"],
                    service=row["service"],
                    event_type=row["event_type"],
                    severity=Severity(row["severity"]),
                    message=row["message"],
                    trace_id=row["trace_id"],
                    correlation_id=row["correlation_id"],
                    metric_name=row["metric_name"],
                    metric_value=row["metric_value"],
                    attributes=json.loads(row["attributes_json"] or "{}")
                )
                for row in rows
            ]

    def get_event(self, event_id: str) -> Optional[NormalizedEvent]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM events WHERE event_id = ?", (event_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return NormalizedEvent(
                event_id=row["event_id"],
                timestamp=row["timestamp"],
                service=row["service"],
                event_type=row["event_type"],
                severity=Severity(row["severity"]),
                message=row["message"],
                trace_id=row["trace_id"],
                correlation_id=row["correlation_id"],
                metric_name=row["metric_name"],
                metric_value=row["metric_value"],
                attributes=json.loads(row["attributes_json"] or "{}")
            )

    def clear_all(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM events")
            cursor.execute("DELETE FROM services")
            cursor.execute("DELETE FROM dependencies")
            conn.commit()

# Singleton repository instance using sqlite file
repository = EventRepository("jarvis.db")

