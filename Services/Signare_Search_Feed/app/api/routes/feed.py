"""
Routes API pour le Feed
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.feed import FeedRequest, FeedResponse
from app.services.feed_service import FeedService
from app.core.database import get_db

router = APIRouter(prefix="/feed", tags=["feed"])


@router.post("", response_model=FeedResponse)
def generate_feed(request: FeedRequest, db: Session = Depends(get_db)):
    """
    Génère un feed personnalisé structuré par sections

    Le feed est composé de sections déclaratives (personalized, trending, etc.)
    Chaque section contient une liste d'items classés selon une stratégie.
    """
    try:
        feed_service = FeedService(db)
        feed = feed_service.generate_feed(request)
        return feed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du feed: {str(e)}")

