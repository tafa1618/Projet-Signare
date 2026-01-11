"""
Routes API pour les Recommandations
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import RecommendationService
from app.core.database import get_db

router = APIRouter(prefix="/recommend", tags=["recommendation"])


@router.post("", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest, db: Session = Depends(get_db)):
    """
    Génère des recommandations contextuelles

    Stratégies:
    - Content-based (prioritaire) : Basé sur l'historique utilisateur
    - Similarity : Items similaires à un item donné
    - Fallback anti-cold-start : Trending + New Arrivals si contexte insuffisant

    Le système diversifie automatiquement les résultats pour éviter la redondance.
    """
    try:
        recommendation_service = RecommendationService(db)
        result = recommendation_service.recommend(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erreur lors de la génération de recommandations: {str(e)}"
        )

