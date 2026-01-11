"""
Routes API pour la Search
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.search import SearchRequest, SearchResponse
from app.core.database import get_db

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
def search(request: SearchRequest, db: Session = Depends(get_db)):
    """
    Recherche hybride (sémantique + mots-clés) orientée conversion

    Le ranking favorise:
    - Récence des modèles
    - Qualité/talent du tailleur
    - Performance historique
    - Disponibilité
    - Cohérence du prix

    La similarité sémantique n'est pas dominante.
    """
    # TODO: Implémenter la logique de recherche
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


@router.post("/suggestions")
def get_suggestions(query: str, db: Session = Depends(get_db)):
    """Récupère des suggestions de recherche"""
    # TODO: Implémenter les suggestions
    return {"suggestions": []}

