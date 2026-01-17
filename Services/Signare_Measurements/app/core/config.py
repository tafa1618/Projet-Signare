"""
Configuration du microservice Measurements
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # Mode IA
    AI_MODE: str = "mock"  # "mock" ou "replicate"
    
    # Replicate (production)
    REPLICATE_API_TOKEN: str = ""
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Logs
    LOG_LEVEL: str = "INFO"
    
    # Business Rules
    FREE_SCAN_LIMIT: int = 1  # 1 scan gratuit par utilisateur
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()

