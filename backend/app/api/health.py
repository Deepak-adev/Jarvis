from datetime import datetime, timezone
from fastapi import APIRouter
from app.schemas.common import HealthResponse
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return backend health and operational status."""
    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        mode=settings.AI_PROVIDER,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

