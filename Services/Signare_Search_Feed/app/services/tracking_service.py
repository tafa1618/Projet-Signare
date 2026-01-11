"""
Service de tracking et mise à jour des signaux business
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from datetime import datetime, timedelta
import uuid

from app.models.feed import Item, UserEvent, Tailor
from app.schemas.tracking import TrackingEvent


class TrackingService:
    """Service pour gérer le tracking et mettre à jour les signaux business"""

    def __init__(self, db: Session):
        self.db = db

    def track_events(self, events: List[TrackingEvent]) -> int:
        """
        Enregistre les événements et met à jour les signaux business

        Retourne le nombre d'événements traités
        """

        events_to_save = []
        item_updates = {}  # {item_id: {view_count: +1, click_count: +1, ...}}

        for event in events:
            # Enregistrer l'événement
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

            # Mettre à jour les compteurs d'items si l'événement concerne un item
            if event.entity_id and event.event_type in [
                "view_item",
                "click",
                "add_to_cart",
                "purchase",
            ]:
                self._prepare_item_counter_update(event, item_updates)

        # Sauvegarder les événements
        self.db.add_all(events_to_save)

        # Mettre à jour les compteurs d'items
        self._update_item_counters(item_updates)

        # Commit toutes les modifications
        self.db.commit()

        return len(events_to_save)

    def _prepare_item_counter_update(
        self, event: TrackingEvent, item_updates: dict
    ):
        """Prépare les mises à jour de compteurs pour un événement"""

        item_id = event.entity_id

        if item_id not in item_updates:
            item_updates[item_id] = {
                "view_count": 0,
                "click_count": 0,
                "purchase_count": 0,
            }

        # Mapper les types d'événements aux compteurs
        if event.event_type == "view_item":
            item_updates[item_id]["view_count"] += 1
        elif event.event_type == "click":
            item_updates[item_id]["click_count"] += 1
        elif event.event_type == "add_to_cart":
            # Un add_to_cart compte aussi comme un click
            item_updates[item_id]["click_count"] += 1
        elif event.event_type == "purchase":
            item_updates[item_id]["purchase_count"] += 1

    def _update_item_counters(self, item_updates: dict):
        """
        Met à jour les compteurs des items de manière atomique

        Utilise des mises à jour SQL directes pour la performance
        """

        for item_id, counters in item_updates.items():
            if not any(counters.values()):
                continue  # Pas de mise à jour nécessaire

            # Récupérer l'item
            item = self.db.query(Item).filter(Item.id == item_id).first()
            if not item:
                continue

            # Mise à jour atomique avec expressions SQLAlchemy
            update_dict = {"updated_at": datetime.utcnow()}
            
            if counters["view_count"] > 0:
                update_dict["view_count"] = Item.view_count + counters["view_count"]
            if counters["click_count"] > 0:
                update_dict["click_count"] = Item.click_count + counters["click_count"]
            if counters["purchase_count"] > 0:
                update_dict["purchase_count"] = (
                    Item.purchase_count + counters["purchase_count"]
                )

            # Mise à jour atomique avec SQL
            self.db.query(Item).filter(Item.id == item_id).update(
                update_dict,
                synchronize_session="evaluate",
            )

    def get_item_statistics(self, item_id: str) -> dict:
        """Récupère les statistiques d'un item"""

        item = self.db.query(Item).filter(Item.id == item_id).first()

        if not item:
            return {}

        return {
            "view_count": item.view_count or 0,
            "click_count": item.click_count or 0,
            "purchase_count": item.purchase_count or 0,
            "conversion_rate": (
                (item.purchase_count / item.view_count * 100)
                if item.view_count > 0
                else 0
            ),
        }

    def update_tailor_performance_from_events(self, tailor_id: str, days: int = 30):
        """
        Recalcule le performance_score d'un tailleur basé sur les événements récents

        À utiliser dans un script de synchronisation périodique
        """

        since = datetime.utcnow() - timedelta(days=days)

        # Récupérer les items du tailleur
        items = self.db.query(Item).filter(Item.tailor_id == tailor_id).all()
        item_ids = [item.id for item in items]

        if not item_ids:
            return

        # Calculer les métriques depuis les événements
        events = (
            self.db.query(UserEvent)
            .filter(
                and_(
                    UserEvent.entity_id.in_(item_ids),
                    UserEvent.timestamp >= since,
                )
            )
            .all()
        )

        # Agréger les métriques
        total_views = sum(1 for e in events if e.event_type == "view_item")
        total_clicks = sum(1 for e in events if e.event_type == "click")
        total_purchases = sum(1 for e in events if e.event_type == "purchase")

        # Calculer le performance_score (exemple simplifié)
        # TODO: Implémenter une logique plus sophistiquée
        if total_views > 0:
            click_rate = total_clicks / total_views
            conversion_rate = total_purchases / total_views
            performance_score = (click_rate * 0.4 + conversion_rate * 0.6)

            # Mettre à jour le tailleur
            tailor = (
                self.db.query(Tailor)
                .filter(Tailor.id == tailor_id)
                .first()
            )
            if tailor:
                tailor.performance_score = min(performance_score, 1.0)
                tailor.updated_at = datetime.utcnow()
                self.db.commit()


