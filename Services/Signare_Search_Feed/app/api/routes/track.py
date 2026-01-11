"""
Routes API pour le Tracking
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.schemas.tracking import TrackingRequest, TrackingResponse
from app.core.database import get_db
from app.models.feed import UserEvent

router = APIRouter(prefix="/track", tags=["tracking"])


@router.post("", response_model=TrackingResponse)
def track_events(request: TrackingRequest, db: Session = Depends(get_db)):
    """
    Enregistre des événements utilisateur (append-only)

    Types d'événements:
    - view_item
    - search
    - click
    - add_to_cart
    - purchase
    """
    try:
        events_to_save = []
        for event in request.events:
            db_event = UserEvent(
                id=str(uuid.uuid4()),
                event_type=event.event_type,
                entity_id=event.entity_id,
                user_id=event.user_id,
                session_id=event.session_id,
                timestamp=event.timestamp,
                context=event.context,
            )
            events_to_save.append(db_event)

        db.add_all(events_to_save)
        db.commit()

        return TrackingResponse(
            events_processed=len(events_to_save),
            status="success",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement: {str(e)}")

