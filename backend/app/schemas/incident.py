from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class IncidentStatus(str, Enum):
    ACTIVE = "active"
    INVESTIGATING = "investigating"
    MITIGATED = "mitigated"
    RESOLVED = "resolved"

class Incident(BaseModel):
    incident_id: str
    title: str
    status: IncidentStatus = IncidentStatus.ACTIVE
    started_at: str  # ISO-8601 UTC
    last_updated_at: str  # ISO-8601 UTC
    event_ids: List[str] = Field(default_factory=list)
    affected_services: List[str] = Field(default_factory=list)
    severity: str = "critical"
    scenario_id: Optional[str] = None
    correlation_reasons: List[str] = Field(default_factory=list)

class IncidentTimelineItem(BaseModel):
    event_id: str
    timestamp: str
    service: str
    event_type: str
    severity: str
    message: str
    is_initiating_candidate: bool = False

