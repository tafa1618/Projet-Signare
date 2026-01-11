"""
Schemas Pydantic pour les Recommandations
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class RecommendationItem(BaseModel):
    """Item recommandé"""

    id: str
    title: str
    image_url: str
    price: Optional[float] = None
    tailor_id: str
    tailor_name: str
    rating: Optional[float] = None
    relevance_score: float
    recommendation_reason: str  # Explication de la recommandation


class UserContextForRecommendation(BaseModel):
    """Contexte utilisateur pour recommandation"""

    user_id: Optional[str] = None
    recent_item_ids: List[str] = Field(default_factory=list)
    interaction_count: int = 0


class ItemContextForRecommendation(BaseModel):
    """Contexte item pour recommandation (similar items)"""

    item_id: str
    category: Optional[str] = None
    price_range: Optional[tuple[float, float]] = None


class RecommendationRequest(BaseModel):
    """Requête de recommandation"""

    user_context: Optional[UserContextForRecommendation] = None
    item_context: Optional[ItemContextForRecommendation] = None
    max_results: int = 20
    diversify: bool = True  # Diversifier les résultats


class RecommendationResponse(BaseModel):
    """Réponse de recommandation"""

    items: List[RecommendationItem]
    strategy_used: str  # "content-based", "collaborative", "fallback"
    total_results: int

