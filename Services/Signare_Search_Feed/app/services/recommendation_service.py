"""
Service de recommandation contextuelle
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    UserContextForRecommendation,
    ItemContextForRecommendation,
)
from app.models.feed import Item, Tailor
from app.repositories.item_repository import ItemRepository
from app.core.config import settings


class RecommendationService:
    """Service de génération de recommandations"""

    def __init__(self, db: Session):
        self.db = db
        self.item_repo = ItemRepository()

    def recommend(self, request: RecommendationRequest) -> RecommendationResponse:
        """
        Génère des recommandations contextuelles

        Stratégies:
        - Content-based (prioritaire)
        - Fallback anti-cold-start
        """

        items: List[Item] = []
        strategy = "fallback"

        # Stratégie 1: Recommandations basées sur l'utilisateur
        if request.user_context and request.user_context.user_id:
            user_items = self._recommend_for_user(request.user_context)
            if user_items:
                items = user_items
                strategy = "content-based"

        # Stratégie 2: Recommandations basées sur un item (similar items)
        if request.item_context:
            item_items = self._recommend_similar_items(request.item_context)
            if item_items:
                items = item_items
                strategy = "similarity"

        # Stratégie 3: Fallback si pas de contexte ou résultats insuffisants
        if not items or len(items) < request.max_results:
            fallback_items = self._get_fallback_recommendations(
                request.max_results - len(items),
                exclude_ids=[item.id for item in items],
            )
            items.extend(fallback_items)
            if strategy == "fallback" and fallback_items:
                strategy = "fallback"
            elif strategy != "fallback":
                strategy = f"{strategy}+fallback"

        # Diversifier si demandé
        if request.diversify and len(items) > request.max_results:
            items = self._diversify_items(items, request.max_results)

        # Limiter aux max_results
        items = items[: request.max_results]

        # Convertir en RecommendationItem
        recommendation_items = [
            self._to_recommendation_item(item, strategy) for item in items
        ]

        return RecommendationResponse(
            items=recommendation_items,
            strategy_used=strategy,
            total_results=len(recommendation_items),
        )

    def _recommend_for_user(
        self, user_context: UserContextForRecommendation
    ) -> List[Item]:
        """Recommandations basées sur l'historique utilisateur (content-based)"""

        items: List[Item] = []

        # Si l'utilisateur a des items récents, recommander des items similaires
        if user_context.recent_item_ids:
            # Récupérer les items récents pour analyser leurs caractéristiques
            recent_items = self.item_repo.get_by_ids(self.db, user_context.recent_item_ids)

            if recent_items:
                # Extraire les caractéristiques communes
                categories = list(set(item.category for item in recent_items if item.category))
                colors = list(set(item.color for item in recent_items if item.color))
                tailor_ids = list(set(item.tailor_id for item in recent_items))

                # Recommander des items avec caractéristiques similaires
                query = (
                    self.db.query(Item)
                    .filter(
                        and_(
                            Item.availability == True,
                            ~Item.id.in_(user_context.recent_item_ids),
                        )
                    )
                )

                # Prioriser les items de mêmes catégories
                if categories:
                    query = query.filter(Item.category.in_(categories))

                # Prioriser les items de mêmes tailleurs (si utilisateur suit certains tailleurs)
                if tailor_ids:
                    # On peut aussi recommander d'autres items de ces tailleurs
                    pass

                # Trier par popularité et récence
                items = (
                    query.order_by(
                        desc(Item.popularity_score),
                        desc(Item.recency_score),
                        desc(Item.created_at),
                    )
                    .limit(settings.search_max_results)
                    .all()
                )

        # Si utilisateur peu actif, utiliser trending
        if not items and user_context.interaction_count < settings.feed_personalization_threshold:
            items = self.item_repo.get_trending(
                self.db,
                limit=settings.search_max_results,
                exclude_ids=user_context.recent_item_ids,
            )

        return items

    def _recommend_similar_items(
        self, item_context: ItemContextForRecommendation
    ) -> List[Item]:
        """Recommandations d'items similaires à un item donné"""

        # Récupérer l'item de référence
        item = self.db.query(Item).filter(Item.id == item_context.item_id).first()

        if not item:
            return []

        # Construire la requête de similarité
        query = (
            self.db.query(Item)
            .filter(
                and_(
                    Item.availability == True,
                    Item.id != item_context.item_id,
                )
            )
        )

        # Filtrer par catégorie si disponible
        if item_context.category:
            query = query.filter(Item.category == item_context.category)
        elif item.category:
            query = query.filter(Item.category == item.category)

        # Filtrer par gamme de prix si disponible
        if item_context.price_range:
            min_price, max_price = item_context.price_range
            query = query.filter(
                and_(
                    Item.price >= min_price * 0.7,  # +/- 30% de tolérance
                    Item.price <= max_price * 1.3,
                )
            )
        elif item.price:
            # Utiliser le prix de l'item avec tolérance
            query = query.filter(
                and_(
                    Item.price >= item.price * 0.7,
                    Item.price <= item.price * 1.3,
                )
            )

        # Prioriser les items du même tailleur
        # Mais aussi diversifier avec d'autres tailleurs

        # Trier par similarité (catégorie + prix) puis popularité
        items = (
            query.order_by(
                desc(Item.popularity_score),
                desc(Item.recency_score),
                desc(Item.created_at),
            )
            .limit(settings.search_max_results)
            .all()
        )

        return items

    def _get_fallback_recommendations(
        self, limit: int, exclude_ids: List[str]
    ) -> List[Item]:
        """Recommandations par défaut (fallback)"""

        # Combiner trending + new arrivals
        items = []

        # Trending
        trending = self.item_repo.get_trending(
            self.db, limit=limit // 2, exclude_ids=exclude_ids
        )
        items.extend(trending)
        exclude_ids.extend(item.id for item in trending)

        # New Arrivals
        remaining = limit - len(items)
        if remaining > 0:
            new_arrivals = self.item_repo.get_new_arrivals(
                self.db, limit=remaining, exclude_ids=exclude_ids
            )
            items.extend(new_arrivals)

        return items

    def _diversify_items(self, items: List[Item], max_results: int) -> List[Item]:
        """Diversifie les résultats pour éviter la redondance"""

        diversified = []
        seen_categories = set()
        seen_tailors = set()

        # Premier passage: prioriser la diversité
        for item in items:
            if len(diversified) >= max_results:
                break

            category = item.category or "other"
            tailor_id = item.tailor_id

            # Vérifier la diversité
            is_diverse = (
                category not in seen_categories or tailor_id not in seen_tailors
            )

            if is_diverse or len(diversified) < max_results // 2:
                diversified.append(item)
                seen_categories.add(category)
                seen_tailors.add(tailor_id)

        # Deuxième passage: compléter avec les meilleurs items restants
        remaining_items = [item for item in items if item not in diversified]
        remaining_items = sorted(
            remaining_items,
            key=lambda x: (x.popularity_score or 0, x.recency_score or 0),
            reverse=True,
        )

        while len(diversified) < max_results and remaining_items:
            diversified.append(remaining_items.pop(0))

        return diversified

    def _to_recommendation_item(
        self, item: Item, strategy: str
    ) -> RecommendationItem:
        """Convertit un Item en RecommendationItem avec raison"""

        # Générer une raison de recommandation
        reason = self._generate_recommendation_reason(item, strategy)

        # Calculer un score de pertinence basique
        relevance_score = self._calculate_relevance_score(item)

        return RecommendationItem(
            id=item.id,
            title=item.title,
            image_url=item.image_url or "",
            price=item.price,
            tailor_id=item.tailor_id,
            tailor_name=item.tailor_name or "Tailleur",
            rating=item.rating,
            relevance_score=relevance_score,
            recommendation_reason=reason,
        )

    def _generate_recommendation_reason(self, item: Item, strategy: str) -> str:
        """Génère une raison de recommandation explicable"""

        reasons = []

        if strategy == "content-based":
            reasons.append("Basé sur vos préférences")
        elif strategy == "similarity":
            reasons.append("Similaire aux items consultés")
        elif "fallback" in strategy:
            reasons.append("Tendances populaires")

        if item.popularity_score and item.popularity_score > 0.7:
            reasons.append("Très populaire")
        if item.recency_score and item.recency_score > 0.8:
            reasons.append("Nouveauté")

        # Ajouter info sur le tailleur
        tailor = (
            self.db.query(Tailor)
            .filter(Tailor.id == item.tailor_id)
            .first()
        )
        if tailor and tailor.rating and tailor.rating >= 4.5:
            reasons.append("Tailleur de qualité")

        return " • ".join(reasons) if reasons else "Recommandé pour vous"

    def _calculate_relevance_score(self, item: Item) -> float:
        """Calcule un score de pertinence basique"""

        score = 0.5  # Score de base

        # Boost pour popularité
        if item.popularity_score:
            score += item.popularity_score * 0.2

        # Boost pour récence
        if item.recency_score:
            score += item.recency_score * 0.2

        # Boost pour qualité
        if item.quality_score:
            score += item.quality_score * 0.1

        return min(score, 1.0)

