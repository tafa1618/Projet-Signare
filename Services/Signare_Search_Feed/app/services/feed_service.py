"""
Service de génération de Feed
"""

from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.schemas.feed import (
    FeedRequest,
    FeedResponse,
    FeedSection,
    ItemSummary,
    UserContext,
)
from app.repositories.item_repository import ItemRepository
from app.core.config import settings


class FeedService:
    """Service de génération de feed"""

    def __init__(self, db: Session):
        self.db = db
        self.item_repo = ItemRepository()

    def generate_feed(self, request: FeedRequest) -> FeedResponse:
        """Génère un feed structuré par sections"""

        user_context = request.user_context or UserContext()
        max_sections = min(request.max_sections, settings.feed_max_sections)
        items_per_section = request.items_per_section

        sections: List[FeedSection] = []
        seen_item_ids: set[str] = set()

        # Détection du cold start
        is_cold_start = (
            user_context.interaction_count < settings.feed_personalization_threshold
        )

        if is_cold_start:
            # Stratégie cold start
            sections = self._generate_cold_start_feed(
                user_context, items_per_section, seen_item_ids
            )
        else:
            # Stratégie personnalisée
            sections = self._generate_personalized_feed(
                user_context, items_per_section, seen_item_ids
            )

        # S'assurer qu'on a au moins une section (fallback)
        if not sections:
            sections.append(
                FeedSection(
                    type="fallback",
                    title="Découvrez nos créations",
                    strategy="default",
                    items=[
                        self.item_repo.to_item_summary(item)
                        for item in self.item_repo.get_fallback(self.db, items_per_section)
                    ],
                )
            )

        # Limiter le nombre de sections
        sections = sections[:max_sections]

        # Calculer le total d'items
        total_items = sum(len(section.items) for section in sections)

        return FeedResponse(
            feed_id=str(uuid.uuid4()),
            generated_at=datetime.utcnow(),
            sections=sections,
            total_items=total_items,
        )

    def _generate_cold_start_feed(
        self,
        user_context: UserContext,
        items_per_section: int,
        seen_item_ids: set[str],
    ) -> List[FeedSection]:
        """Génère un feed pour utilisateur cold start"""

        sections: List[FeedSection] = []

        # Section Trending
        trending_items = self.item_repo.get_trending(
            self.db,
            limit=items_per_section,
            exclude_ids=list(seen_item_ids),
        )
        if trending_items:
            seen_item_ids.update(item.id for item in trending_items)
            sections.append(
                FeedSection(
                    type="trending",
                    title="Tendances du moment",
                    strategy="popularity_and_recency",
                    items=[
                        self.item_repo.to_item_summary(item) for item in trending_items
                    ],
                )
            )

        # Section New Arrivals
        new_items = self.item_repo.get_new_arrivals(
            self.db,
            limit=items_per_section,
            exclude_ids=list(seen_item_ids),
        )
        if new_items:
            seen_item_ids.update(item.id for item in new_items)
            sections.append(
                FeedSection(
                    type="new_arrivals",
                    title="Nouveautés",
                    strategy="recency",
                    items=[self.item_repo.to_item_summary(item) for item in new_items],
                )
            )

        # Section Budget (si gamme de prix préférée)
        if user_context.preferred_price_range:
            min_price, max_price = user_context.preferred_price_range
            budget_items = self.item_repo.get_by_price_range(
                self.db,
                min_price=min_price,
                max_price=max_price,
                limit=items_per_section,
                exclude_ids=list(seen_item_ids),
            )
            if budget_items:
                seen_item_ids.update(item.id for item in budget_items)
                sections.append(
                    FeedSection(
                        type="budget_based",
                        title="Dans votre budget",
                        strategy="price_range",
                        items=[
                            self.item_repo.to_item_summary(item) for item in budget_items
                        ],
                    )
                )

        return sections

    def _generate_personalized_feed(
        self,
        user_context: UserContext,
        items_per_section: int,
        seen_item_ids: set[str],
    ) -> List[FeedSection]:
        """Génère un feed personnalisé pour utilisateur actif"""

        sections: List[FeedSection] = []

        # Section Personalized (basée sur similarité)
        # TODO: Implémenter la logique de similarité avec embeddings
        personalized_items = self.item_repo.get_trending(
            self.db,
            limit=items_per_section,
            exclude_ids=list(seen_item_ids),
        )
        if personalized_items:
            seen_item_ids.update(item.id for item in personalized_items)
            sections.append(
                FeedSection(
                    type="personalized",
                    title="Pour vous",
                    strategy="content_similarity",
                    items=[
                        self.item_repo.to_item_summary(item) for item in personalized_items
                    ],
                )
            )

        # Section Similar Content (si items récents)
        if user_context.recent_item_ids:
            # TODO: Implémenter la logique de similarité
            similar_items = self.item_repo.get_trending(
                self.db,
                limit=items_per_section,
                exclude_ids=list(seen_item_ids) + user_context.recent_item_ids,
            )
            if similar_items:
                seen_item_ids.update(item.id for item in similar_items)
                sections.append(
                    FeedSection(
                        type="similar_content",
                        title="Vous pourriez aimer",
                        strategy="similarity",
                        items=[
                            self.item_repo.to_item_summary(item) for item in similar_items
                        ],
                    )
                )

        # Section Trending (exploration 20-30%)
        trending_items = self.item_repo.get_trending(
            self.db,
            limit=items_per_section,
            exclude_ids=list(seen_item_ids),
        )
        if trending_items:
            seen_item_ids.update(item.id for item in trending_items)
            sections.append(
                FeedSection(
                    type="trending",
                    title="Tendances",
                    strategy="popularity_and_recency",
                    items=[
                        self.item_repo.to_item_summary(item) for item in trending_items
                    ],
                )
            )

        # Section New Arrivals
        new_items = self.item_repo.get_new_arrivals(
            self.db,
            limit=items_per_section,
            exclude_ids=list(seen_item_ids),
        )
        if new_items:
            seen_item_ids.update(item.id for item in new_items)
            sections.append(
                FeedSection(
                    type="new_arrivals",
                    title="Nouveautés",
                    strategy="recency",
                    items=[self.item_repo.to_item_summary(item) for item in new_items],
                )
            )

        return sections

