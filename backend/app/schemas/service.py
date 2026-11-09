from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

class ServiceType(str, Enum):
    GATEWAY = "gateway"
    AUTH = "auth"
    SERVICE = "service"
    DATABASE = "database"
    QUEUE = "queue"
    CACHE = "cache"

class DependencyType(str, Enum):
    SYNC_API = "sync_api"
    DATABASE = "database"
    ASYNC_QUEUE = "async_queue"
    CACHE = "cache"

class Service(BaseModel):
    service_id: str
    name: str
    service_type: ServiceType
    criticality: float = Field(default=0.5, ge=0.0, le=1.0)
    description: Optional[str] = None
    health_status: HealthStatus = HealthStatus.HEALTHY

class Dependency(BaseModel):
    source_service_id: str = Field(description="Dependency service that is called/depended upon")
    target_service_id: str = Field(description="Service that depends on the source")
    dependency_type: DependencyType = DependencyType.SYNC_API
    expected_latency_ms: Optional[int] = None

