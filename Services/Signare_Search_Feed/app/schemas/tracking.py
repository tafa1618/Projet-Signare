"""
Schemas Pydantic pour le Tracking
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime


class TrackingEvent(BaseModel):
    """Événement de tracking"""

    event_type: Literal[
        "view_item",
        "search",
        "click",
        "add_to_cart",
        "purchase",
        "share",
        "like",
        "save",
    ]
    entity_id: str  # ID de l'item, query, etc.
    user_id: Optional[str] = None
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = Field(default_factory=dict)  # Contexte additionnel


class TrackingRequest(BaseModel):
    """Requête de tracking"""

    events: List[TrackingEvent]


class TrackingResponse(BaseModel):
    """Réponse de tracking"""

    events_processed: int
    status: str = "success"

