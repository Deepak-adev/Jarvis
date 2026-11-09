from typing import Any, List, Optional
from pydantic import BaseModel, Field

class APIErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[List[Any]] = None

class ErrorResponse(BaseModel):
    error: APIErrorDetail

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "JARVIS Backend"
    version: str = "0.1.0"
    mode: str = "deterministic"
    timestamp: str

