from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class AgentStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentObservation(BaseModel):
    claim: str
    evidence_ids: List[str] = Field(default_factory=list)

class AgentResult(BaseModel):
    agent: str
    status: AgentStatus = AgentStatus.COMPLETED
    summary: str
    evidence_ids: List[str] = Field(default_factory=list)
    observations: List[AgentObservation] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AgentRun(BaseModel):
    agent_run_id: str
    incident_id: str
    agent_name: str
    status: AgentStatus
    started_at: str
    completed_at: Optional[str] = None
    result: Optional[AgentResult] = None

