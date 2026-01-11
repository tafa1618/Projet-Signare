"""
Schemas Pydantic pour la Search
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class SearchFilter(BaseModel):
    """Filtres de recherche"""

    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    color: Optional[str] = None
    region: Optional[str] = None
    availability: Optional[bool] = None
    tailor_id: Optional[str] = None


class SearchContext(BaseModel):
    """Contexte de recherche"""

    user_id: Optional[str] = None
    device_type: Literal["mobile", "desktop", "tablet"] = "mobile"
    location: Optional[dict] = None  # {latitude, longitude, city}


class SearchRequest(BaseModel):
    """Requête de recherche"""

    query: str = Field(..., min_length=1, max_length=200)
    filters: Optional[SearchFilter] = None
    context: Optional[SearchContext] = None
    max_results: int = 50
    offset: int = 0


class SearchItem(BaseModel):
    """Item de résultat de recherche"""

    id: str
    title: str
    description: Optional[str] = None
    image_url: str
    price: Optional[float] = None
    tailor_id: str
    tailor_name: str
    tailor_rating: Optional[float] = None
    rating: Optional[float] = None
    availability: bool = True
    created_at: datetime
    relevance_score: float  # Score de pertinence (0-1)
    business_score: float  # Score business (0-1)
    final_score: float  # Score final combiné


class SearchResponse(BaseModel):
    """Réponse de recherche"""

    query: str
    total_results: int
    items: List[SearchItem]
    suggestions: List[str] = Field(default_factory=list)  # Suggestions de recherche
    filters_applied: SearchFilter
    search_id: str

