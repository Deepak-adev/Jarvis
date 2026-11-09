from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ScenarioStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"

class ScenarioInfo(BaseModel):
    scenario_id: str
    title: str
    description: str
    initiating_fault: str
    affected_services: List[str]
    status: ScenarioStatus = ScenarioStatus.IDLE
    total_events: int = 0
    injected_events: int = 0

class ScenarioActionResponse(BaseModel):
    scenario_id: str
    status: ScenarioStatus
    message: str
    events_generated: int = 0

