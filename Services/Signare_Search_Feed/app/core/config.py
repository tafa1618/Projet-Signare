"""
Configuration du microservice
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuration via variables d'environnement"""

    # Database
    database_url: str
    redis_url: Optional[str] = None

    # Service
    service_name: str = "signare-search-feed"
    service_version: str = "1.0.0"
    log_level: str = "INFO"

    # FAISS
    faiss_index_path: str = "./data/faiss_index.bin"
    embedding_dimension: int = 384

    # Feed Configuration
    feed_max_sections: int = 6
    feed_items_per_section: int = 10
    feed_personalization_threshold: int = 5

    # Search Configuration
    search_max_results: int = 50
    search_semantic_weight: float = 0.4
    search_business_weight: float = 0.6

    # Cold Start
    cold_start_trending_weight: float = 0.5
    cold_start_new_arrivals_weight: float = 0.3
    cold_start_budget_weight: float = 0.2

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

