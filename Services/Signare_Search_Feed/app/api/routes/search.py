"""
Routes API pour la Search
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.search import SearchRequest, SearchResponse
from app.services.search_service import SearchService
from app.core.database import get_db

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
def search(request: SearchRequest, db: Session = Depends(get_db)):
    """
    Recherche hybride (sémantique + mots-clés) orientée conversion

    Le ranking favorise:
    - Récence des modèles (30%)
    - Qualité/talent du tailleur (20%)
    - Performance historique (20%)
    - Disponibilité (15%)
    - Cohérence du prix (15%)

    La similarité sémantique (40%) n'est pas dominante.
    Les signaux business (60%) priment pour maximiser la conversion.
    """
    try:
        search_service = SearchService(db)
        result = search_service.search(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erreur lors de la recherche: {str(e)}"
        )


@router.get("/suggestions")
def get_suggestions(query: str, db: Session = Depends(get_db)):
    """Récupère des suggestions de recherche"""
    try:
        search_service = SearchService(db)
        suggestions = search_service.generate_suggestions(query)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erreur lors de la génération de suggestions: {str(e)}"
        )

