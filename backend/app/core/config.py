import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "J.A.R.V.I.S."
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    HOST: str = os.getenv("JARVIS_HOST", "127.0.0.1")
    PORT: int = int(os.getenv("JARVIS_PORT", "8000"))
    DEBUG: bool = os.getenv("JARVIS_DEBUG", "true").lower() in ("true", "1", "t")
    DATABASE_URL: str = os.getenv("JARVIS_DATABASE_URL", "sqlite:///./jarvis.db")
    AI_PROVIDER: str = os.getenv("JARVIS_AI_PROVIDER", "deterministic")

settings = Settings()

