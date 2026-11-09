from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class Severity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class EventType(str, Enum):
    RESOURCE_SATURATION = "resource_saturation"
    DEPLOYMENT = "deployment"
    NETWORK_LATENCY = "network_latency"
    ERROR_SPIKE = "error_spike"
    SERVICE_TIMEOUT = "service_timeout"
    STATUS_CHECK = "status_check"
    CONFIGURATION = "configuration"

class NormalizedEvent(BaseModel):
    event_id: str
    timestamp: str  # ISO-8601 UTC
    service: str
    event_type: str
    severity: Severity
    message: str
    trace_id: Optional[str] = None
    correlation_id: Optional[str] = None
    metric_name: Optional[str] = None
    metric_value: Optional[float] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)

class EventIngestRequest(BaseModel):
    events: List[NormalizedEvent]

class EventIngestResponse(BaseModel):
    ingested_count: int
    rejected_count: int = 0
    event_ids: List[str]

