"""
Routes API pour le Tracking
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.tracking import TrackingRequest, TrackingResponse
from app.services.tracking_service import TrackingService
from app.core.database import get_db

router = APIRouter(prefix="/track", tags=["tracking"])


@router.post("", response_model=TrackingResponse)
def track_events(request: TrackingRequest, db: Session = Depends(get_db)):
    """
    Enregistre des événements utilisateur et met à jour les signaux business

    Types d'événements supportés:
    - view_item : Incrémente view_count de l'item
    - click : Incrémente click_count de l'item
    - add_to_cart : Incrémente click_count de l'item
    - purchase : Incrémente purchase_count de l'item
    - search : Enregistré mais ne met pas à jour les compteurs
    - share, like, save : Enregistrés mais ne mettent pas à jour les compteurs

    Les compteurs sont mis à jour atomiquement pour garantir la cohérence.
    """
    try:
        tracking_service = TrackingService(db)
        events_processed = tracking_service.track_events(request.events)

        return TrackingResponse(
            events_processed=events_processed,
            status="success",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Erreur lors de l'enregistrement: {str(e)}"
        )


@router.get("/item/{item_id}/stats")
def get_item_stats(item_id: str, db: Session = Depends(get_db)):
    """
    Récupère les statistiques d'un item (view_count, click_count, purchase_count, conversion_rate)
    """
    try:
        tracking_service = TrackingService(db)
        stats = tracking_service.get_item_statistics(item_id)

        if not stats:
            raise HTTPException(status_code=404, detail="Item non trouvé")

        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erreur lors de la récupération: {str(e)}"
        )

