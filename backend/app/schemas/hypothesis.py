from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class SupportLabel(str, Enum):
    HIGH_SUPPORT = "high_support"
    MEDIUM_SUPPORT = "medium_support"
    LOW_SUPPORT = "low_support"

class EvidenceDirection(str, Enum):
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    CONTEXT = "context"

class EvidenceObject(BaseModel):
    evidence_id: str
    source_type: str  # event, metric, topology
    source_id: str
    observed_at: str
    summary: str
    direction: EvidenceDirection = EvidenceDirection.SUPPORTS
    relevance: float = Field(default=1.0, ge=0.0, le=1.0)

class FactorBreakdown(BaseModel):
    temporal_precedence: float = Field(default=0.0, ge=0.0, le=1.0)
    dependency_reach: float = Field(default=0.0, ge=0.0, le=1.0)
    symptom_coverage: float = Field(default=0.0, ge=0.0, le=1.0)
    anomaly_strength: float = Field(default=0.0, ge=0.0, le=1.0)
    cross_signal_support: float = Field(default=0.0, ge=0.0, le=1.0)
    pattern_match: float = Field(default=0.0, ge=0.0, le=1.0)
    contradiction_penalty: float = Field(default=0.0, ge=0.0, le=1.0)

class Hypothesis(BaseModel):
    hypothesis_id: str
    incident_id: str
    candidate_service_id: str
    candidate_event_id: Optional[str] = None
    cause_type: str
    score: float = Field(ge=0.0, le=1.0)
    support_label: SupportLabel
    factor_breakdown: FactorBreakdown
    evidence_ids: List[str] = Field(default_factory=list)
    contradictions: List[str] = Field(default_factory=list)
    caveat: str = "Heuristic support score; not a calibrated probability."

