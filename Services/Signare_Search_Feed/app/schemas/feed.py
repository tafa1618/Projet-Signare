"""
Schemas Pydantic pour le Feed
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class ItemSummary(BaseModel):
    """Résumé d'un item pour le feed"""

    id: str
    title: str
    image_url: str
    price: Optional[float] = None
    tailor_id: str
    tailor_name: str
    rating: Optional[float] = None
    availability: bool = True
    created_at: datetime


class FeedSection(BaseModel):
    """Section du feed"""

    type: Literal[
        "personalized",
        "trending",
        "similar_content",
        "new_arrivals",
        "budget_based",
        "fallback",
    ]
    title: str
    strategy: str
    items: List[ItemSummary]
    cursor: Optional[str] = None  # Pour pagination


class UserContext(BaseModel):
    """Contexte utilisateur anonymisé"""

    user_id: Optional[str] = None
    interaction_count: int = 0  # Nombre d'interactions (pour cold start)
    preferred_price_range: Optional[tuple[float, float]] = None
    preferred_categories: List[str] = Field(default_factory=list)
    recent_item_ids: List[str] = Field(default_factory=list)


class DeviceContext(BaseModel):
    """Contexte device"""

    device_type: Literal["mobile", "desktop", "tablet"] = "mobile"
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None


class LocationContext(BaseModel):
    """Contexte géographique"""

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    country: str = "SN"  # Sénégal par défaut


class FeedRequest(BaseModel):
    """Requête pour générer un feed"""

    user_context: Optional[UserContext] = None
    device_context: DeviceContext = DeviceContext()
    location_context: Optional[LocationContext] = None
    max_sections: int = 6
    items_per_section: int = 10


class FeedResponse(BaseModel):
    """Réponse avec le feed structuré"""

    feed_id: str
    generated_at: datetime
    sections: List[FeedSection]
    total_items: int

