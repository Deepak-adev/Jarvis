from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class InterventionRequest(BaseModel):
    hypothesis_id: str
    action: str  # e.g., "disable_fault", "rollback_deployment", "reset_pool"
    parameters: Dict[str, Any] = Field(default_factory=dict)

class CounterfactualRun(BaseModel):
    run_id: str
    incident_id: str
    hypothesis_id: str
    intervention_description: str
    baseline_symptoms: List[str]
    counterfactual_symptoms: List[str]
    observed_symptoms: List[str]
    removed_symptoms: List[str]
    remaining_symptoms: List[str]
    caveat: str = "Model-based simulation; not a guarantee of real-world outcome."

