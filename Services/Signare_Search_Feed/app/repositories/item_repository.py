"""
Repository pour l'accès aux items
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta

from app.models.feed import Item
from app.schemas.feed import ItemSummary


class ItemRepository:
    """Repository pour les items"""

    @staticmethod
    def get_by_ids(db: Session, item_ids: List[str]) -> List[Item]:
        """Récupérer des items par leurs IDs"""
        return db.query(Item).filter(Item.id.in_(item_ids)).all()

    @staticmethod
    def get_trending(
        db: Session,
        limit: int = 10,
        days: int = 7,
        exclude_ids: Optional[List[str]] = None,
    ) -> List[Item]:
        """Récupérer les items tendance (popularité + récence)"""
        since = datetime.utcnow() - timedelta(days=days)
        query = (
            db.query(Item)
            .filter(
                and_(
                    Item.availability == True,
                    Item.created_at >= since,
                )
            )
            .order_by(
                desc(Item.popularity_score),
                desc(Item.recency_score),
                desc(Item.created_at),
            )
        )

        if exclude_ids:
            query = query.filter(~Item.id.in_(exclude_ids))

        return query.limit(limit).all()

    @staticmethod
    def get_new_arrivals(
        db: Session,
        limit: int = 10,
        days: int = 30,
        exclude_ids: Optional[List[str]] = None,
    ) -> List[Item]:
        """Récupérer les nouveautés"""
        since = datetime.utcnow() - timedelta(days=days)
        query = (
            db.query(Item)
            .filter(
                and_(
                    Item.availability == True,
                    Item.created_at >= since,
                )
            )
            .order_by(desc(Item.created_at))
        )

        if exclude_ids:
            query = query.filter(~Item.id.in_(exclude_ids))

        return query.limit(limit).all()

    @staticmethod
    def get_by_price_range(
        db: Session,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        limit: int = 10,
        exclude_ids: Optional[List[str]] = None,
    ) -> List[Item]:
        """Récupérer les items dans une gamme de prix"""
        query = db.query(Item).filter(Item.availability == True)

        if min_price is not None:
            query = query.filter(Item.price >= min_price)
        if max_price is not None:
            query = query.filter(Item.price <= max_price)

        query = query.order_by(desc(Item.popularity_score), desc(Item.created_at))

        if exclude_ids:
            query = query.filter(~Item.id.in_(exclude_ids))

        return query.limit(limit).all()

    @staticmethod
    def get_fallback(db: Session, limit: int = 10) -> List[Item]:
        """Récupérer des items par défaut (fallback)"""
        return (
            db.query(Item)
            .filter(Item.availability == True)
            .order_by(desc(Item.created_at))
            .limit(limit)
            .all()
        )

    @staticmethod
    def to_item_summary(item: Item) -> ItemSummary:
        """Convertir un Item en ItemSummary"""
        return ItemSummary(
            id=item.id,
            title=item.title,
            image_url=item.image_url or "",
            price=item.price,
            tailor_id=item.tailor_id,
            tailor_name=item.tailor_name or "Tailleur",
            rating=item.rating,
            availability=item.availability,
            created_at=item.created_at,
        )

