"""
Service de ranking hybride pour la recherche
Orientation conversion : similarité sémantique (40%) + signaux business (60%)
"""

from typing import List, Optional
from datetime import datetime, timedelta
from app.models.feed import Item
from app.core.config import settings


class RankingService:
    """Service de ranking hybride"""

    @staticmethod
    def calculate_business_score(item: Item, base_date: datetime = None) -> float:
        """
        Calcule le score business d'un item (0-1)

        Composants:
        - Récence (30%)
        - Qualité tailleur (20%)
        - Performance historique (20%)
        - Disponibilité (15%)
        - Prix cohérent (15%)
        """
        if base_date is None:
            base_date = datetime.utcnow()

        score = 0.0

        # 1. Récence (30%)
        days_old = (base_date - item.created_at.replace(tzinfo=None)).days
        recency_score = max(0, 1 - (days_old / 180))  # Déclin sur 6 mois
        score += recency_score * 0.30

        # 2. Qualité tailleur (20%)
        # Utilise le performance_score du tailleur (supposé dans item pour simplifier)
        # En production, on joindrait avec la table tailors
        quality_score = min(1.0, (item.quality_score or 0.0) / 5.0)  # Normalisé 0-5
        score += quality_score * 0.20

        # 3. Performance historique (20%)
        # Combinaison de view_count, click_count, purchase_count
        total_engagement = item.view_count + (item.click_count * 2) + (item.purchase_count * 5)
        performance_score = min(1.0, total_engagement / 100.0)  # Normalisé sur 100 engagements
        score += performance_score * 0.20

        # 4. Disponibilité (15%)
        availability_score = 1.0 if item.availability else 0.0
        score += availability_score * 0.15

        # 5. Prix cohérent (15%)
        # Supposons que les prix entre 5000 et 100000 FCFA sont cohérents pour SIGNARE
        if item.price:
            if 5000 <= item.price <= 100000:
                price_score = 1.0
            elif item.price < 5000:
                price_score = 0.7  # Peut être trop bas
            else:
                price_score = 0.8  # Peut être haut de gamme
        else:
            price_score = 0.5  # Prix non spécifié
        score += price_score * 0.15

        return min(1.0, max(0.0, score))

    @staticmethod
    def calculate_semantic_score(
        item: Item, query_embedding: Optional[List[float]] = None
    ) -> float:
        """
        Calcule le score de similarité sémantique (0-1)

        Si query_embedding est fourni, calcule la similarité cosinus.
        Sinon, retourne un score par défaut basé sur les métadonnées.
        """
        if query_embedding and item.embedding:
            # TODO: Implémenter la similarité cosinus avec les embeddings
            # Pour l'instant, score par défaut
            return 0.5

        # Fallback : score basé sur les métadonnées (titre, description)
        # Simple matching pour l'instant
        return 0.5

    @staticmethod
    def calculate_final_score(
        item: Item,
        query_embedding: Optional[List[float]] = None,
        business_score: Optional[float] = None,
    ) -> tuple[float, float, float]:
        """
        Calcule le score final combiné

        Returns:
            (final_score, semantic_score, business_score)
        """
        semantic_score = RankingService.calculate_semantic_score(item, query_embedding)

        if business_score is None:
            business_score = RankingService.calculate_business_score(item)

        # Pondération : similarité (40%) + business (60%)
        final_score = (
            semantic_score * settings.search_semantic_weight
            + business_score * settings.search_business_weight
        )

        return (final_score, semantic_score, business_score)

    @staticmethod
    def rank_items(
        items: List[Item],
        query_embedding: Optional[List[float]] = None,
    ) -> List[tuple[Item, float, float, float]]:
        """
        Classe une liste d'items selon le ranking hybride

        Returns:
            Liste de tuples (item, final_score, semantic_score, business_score)
        """
        scored_items = []

        for item in items:
            final_score, semantic_score, business_score = RankingService.calculate_final_score(
                item, query_embedding
            )
            scored_items.append((item, final_score, semantic_score, business_score))

        # Trier par score final décroissant
        scored_items.sort(key=lambda x: x[1], reverse=True)

        return scored_items

