"""
Routes API pour les Recommandations
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.core.database import get_db

router = APIRouter(prefix="/recommend", tags=["recommendation"])


@router.post("", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest, db: Session = Depends(get_db)):
    """
    Génère des recommandations contextuelles

    Stratégies:
    - Content-based (prioritaire)
    - Fallback anti-cold-start
    - Prise en compte du contexte (temps, localisation, budget)
    """
    # TODO: Implémenter la logique de recommandation
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")

