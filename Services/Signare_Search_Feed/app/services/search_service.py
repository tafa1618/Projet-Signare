"""
Service de recherche hybride orienté conversion
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from datetime import datetime, timedelta
import math
import uuid

from app.schemas.search import SearchRequest, SearchResponse, SearchItem, SearchFilter
from app.models.feed import Item, Tailor
from app.repositories.item_repository import ItemRepository
from app.services.vector_service import get_vector_service
from app.core.config import settings


class SearchService:
    """Service de recherche hybride"""

    def __init__(self, db: Session):
        self.db = db
        self.item_repo = ItemRepository()
        self.vector_service = get_vector_service()
        self.vector_service = get_vector_service()

    def search(self, request: SearchRequest) -> SearchResponse:
        """
        Recherche hybride orientée conversion

        Ranking combine:
        - Similarité sémantique (40%)
        - Signaux business (60%):
          * Récence (30%)
          * Qualité tailleur (20%)
          * Performance historique (20%)
          * Disponibilité (15%)
          * Cohérence du prix (15%)
        """

        # Étape 1: Recherche par mots-clés
        keyword_items = self._search_by_keywords(request.query, request.filters)

        # Étape 2: Recherche sémantique (si embeddings disponibles)
        semantic_items = self._search_by_semantics(request.query, request.filters)

        # Étape 3: Combiner et dédupliquer
        all_items = self._merge_results(keyword_items, semantic_items)

        # Étape 4: Appliquer les filtres
        filtered_items = self._apply_filters(all_items, request.filters)

        # Étape 5: Calculer les scores de ranking
        scored_items = self._calculate_scores(
            filtered_items,
            request.query,
            semantic_items,
        )

        # Étape 6: Trier par score final
        sorted_items = sorted(
            scored_items, key=lambda x: x["final_score"], reverse=True
        )

        # Étape 7: Limiter les résultats
        limited_items = sorted_items[: request.max_results]

        # Étape 8: Convertir en SearchItem
        search_items = [
            self._to_search_item(item_data) for item_data in limited_items
        ]

        # Étape 9: Générer des suggestions
        suggestions = self._generate_suggestions(request.query)

        return SearchResponse(
            query=request.query,
            total_results=len(filtered_items),
            items=search_items,
            suggestions=suggestions,
            filters_applied=request.filters or SearchFilter(),
            search_id=str(uuid.uuid4()),
        )

    def _search_by_keywords(
        self, query: str, filters: Optional[SearchFilter]
    ) -> List[Item]:
        """Recherche par mots-clés dans titre et description"""

        search_terms = query.lower().split()

        # Construire la requête de base
        query_builder = self.db.query(Item).filter(Item.availability == True)

        # Recherche dans titre et description
        conditions = []
        for term in search_terms:
            conditions.append(Item.title.ilike(f"%{term}%"))
            conditions.append(Item.description.ilike(f"%{term}%"))

        if conditions:
            query_builder = query_builder.filter(or_(*conditions))

        # Appliquer les filtres de base
        if filters:
            if filters.category:
                query_builder = query_builder.filter(Item.category == filters.category)
            if filters.color:
                query_builder = query_builder.filter(Item.color == filters.color)
            if filters.availability is not None:
                query_builder = query_builder.filter(
                    Item.availability == filters.availability
                )
            if filters.min_price is not None:
                query_builder = query_builder.filter(Item.price >= filters.min_price)
            if filters.max_price is not None:
                query_builder = query_builder.filter(Item.price <= filters.max_price)
            if filters.tailor_id:
                query_builder = query_builder.filter(Item.tailor_id == filters.tailor_id)

        return query_builder.all()

    def _merge_results(
        self, keyword_items: List[Item], semantic_items: List[Item]
    ) -> List[Item]:
        """Fusionne les résultats en évitant les doublons"""

        seen_ids = set()
        merged = []

        # Priorité aux résultats sémantiques (plus pertinents)
        for item in semantic_items:
            if item.id not in seen_ids:
                seen_ids.add(item.id)
                merged.append(item)

        # Ajouter les résultats par mots-clés
        for item in keyword_items:
            if item.id not in seen_ids:
                seen_ids.add(item.id)
                merged.append(item)

        return merged

    def _apply_filters(
        self, items: List[Item], filters: Optional[SearchFilter]
    ) -> List[Item]:
        """Applique les filtres avancés"""

        if not filters:
            return items

        filtered = items

        # Filtre région (via tailor si nécessaire)
        # TODO: Implémenter le filtrage par région si besoin

        return filtered

    def _search_by_semantics(
        self, query: str, filters: Optional[SearchFilter]
    ) -> List[Item]:
        """
        Recherche sémantique via embeddings

        En mode DEV (FAISS non disponible), utilise un fallback basé sur les mots-clés.
        """
        # Générer l'embedding de la requête (mock en DEV, réel en PROD)
        query_embedding = self._generate_query_embedding(query)

        # Recherche vectorielle
        try:
            # Récupérer tous les items disponibles pour la recherche
            base_query = self.db.query(Item).filter(Item.availability == True)
            if filters:
                if filters.category:
                    base_query = base_query.filter(Item.category == filters.category)
                if filters.min_price:
                    base_query = base_query.filter(Item.price >= filters.min_price)
                if filters.max_price:
                    base_query = base_query.filter(Item.price <= filters.max_price)

            all_items = base_query.all()
            item_ids = [item.id for item in all_items]

            if not item_ids:
                return []

            # Recherche dans l'index vectoriel
            k = min(20, len(item_ids))  # Limiter à 20 résultats sémantiques
            vector_results = self.vector_service.search(query_embedding, k, item_ids)

            # Récupérer les items correspondants
            result_ids = [item_id for item_id, _ in vector_results]
            semantic_items = self.item_repo.get_by_ids(self.db, result_ids)

            return semantic_items

        except Exception:
            # En cas d'erreur, fallback vers liste vide (les mots-clés prendront le relais)
            return []

    def _generate_query_embedding(self, query: str) -> List[float]:
        """
        Génère un embedding pour la requête

        En DEV: embedding mocké (déterministe basé sur la requête)
        En PROD: utiliser un vrai modèle (sentence-transformers)
        """
        # Embedding mocké pour DEV (384 dimensions)
        # En production, remplacer par un vrai modèle d'embedding
        import random
        
        # Rendre déterministe pour la même requête
        random.seed(hash(query) % 1000)
        embedding = [random.gauss(0, 0.1) for _ in range(self.vector_service.dimension)]
        
        # Normaliser
        norm = sum(x**2 for x in embedding) ** 0.5
        if norm > 0:
            embedding = [x / norm for x in embedding]
        
        return embedding

    def _calculate_scores(
        self,
        items: List[Item],
        query: str,
        semantic_items: List[Item],
    ) -> List[dict]:
        """
        Calcule les scores de ranking hybrides

        Score final = (similarité sémantique * 0.4) + (business_score * 0.6)
        """

        # Créer un set des IDs sémantiques pour le scoring
        semantic_ids = {item.id for item in semantic_items}

        scored = []

        for item in items:
            # Score de similarité sémantique (0-1)
            semantic_score = 1.0 if item.id in semantic_ids else 0.5

            # Score business (0-1)
            business_score = self._calculate_business_score(item)

            # Score final combiné
            final_score = (
                semantic_score * settings.search_semantic_weight
                + business_score * settings.search_business_weight
            )

            scored.append(
                {
                    "item": item,
                    "relevance_score": semantic_score,
                    "business_score": business_score,
                    "final_score": final_score,
                }
            )

        return scored

    def _calculate_business_score(self, item: Item) -> float:
        """
        Calcule le score business (0-1) orienté conversion

        Composantes:
        - Récence (30%)
        - Qualité tailleur (20%)
        - Performance historique (20%)
        - Disponibilité (15%)
        - Prix cohérent (15%)
        """

        scores = []

        # 1. Score de récence (30%)
        recency_score = self._calculate_recency_score(item)
        scores.append(("recency", recency_score, 0.30))

        # 2. Score qualité tailleur (20%)
        tailor_score = self._calculate_tailor_score(item)
        scores.append(("tailor", tailor_score, 0.20))

        # 3. Score performance historique (20%)
        performance_score = self._calculate_performance_score(item)
        scores.append(("performance", performance_score, 0.20))

        # 4. Score disponibilité (15%)
        availability_score = 1.0 if item.availability else 0.0
        scores.append(("availability", availability_score, 0.15))

        # 5. Score prix cohérent (15%)
        price_score = self._calculate_price_score(item)
        scores.append(("price", price_score, 0.15))

        # Score final pondéré
        business_score = sum(score * weight for _, score, weight in scores)

        return min(business_score, 1.0)

    def _calculate_recency_score(self, item: Item) -> float:
        """Score basé sur la récence (0-1)"""

        if not item.created_at:
            return 0.5

        days_old = (datetime.utcnow() - item.created_at).days

        # Boost pour les items récents (moins de 30 jours)
        if days_old <= 7:
            return 1.0
        elif days_old <= 30:
            return 0.8
        elif days_old <= 90:
            return 0.5
        elif days_old <= 180:
            return 0.3
        else:
            return 0.1

    def _calculate_tailor_score(self, item: Item) -> float:
        """Score basé sur la qualité du tailleur (0-1)"""

        # Récupérer les infos du tailleur
        tailor = (
            self.db.query(Tailor)
            .filter(Tailor.id == item.tailor_id)
            .first()
        )

        if not tailor:
            return 0.5

        # Combiner rating et performance_score
        rating_score = (tailor.rating or 0.0) / 5.0  # Normaliser à 0-1
        performance_score = min(tailor.performance_score or 0.0, 1.0)

        # Moyenne pondérée
        return (rating_score * 0.6 + performance_score * 0.4)

    def _calculate_performance_score(self, item: Item) -> float:
        """Score basé sur la performance historique (0-1)"""

        # Combiner view_count, click_count, purchase_count
        total_interactions = (
            item.view_count + item.click_count * 2 + item.purchase_count * 5
        )

        # Normaliser avec une fonction logarithmique
        if total_interactions == 0:
            return 0.3  # Score par défaut pour nouveaux items

        normalized = math.log(1 + total_interactions) / math.log(100)  # Log base 100
        return min(normalized, 1.0)

    def _calculate_price_score(self, item: Item) -> float:
        """
        Score basé sur la cohérence du prix

        En v1, on favorise les prix raisonnables (entre 5000 et 100000 FCFA)
        TODO: Adapter selon le contexte de la requête
        """

        if not item.price:
            return 0.5

        # Prix optimal pour SIGNARE (gamme moyenne-haut de gamme)
        if 5000 <= item.price <= 50000:
            return 1.0
        elif 50000 < item.price <= 100000:
            return 0.8
        elif 1000 <= item.price < 5000:
            return 0.6
        elif 100000 < item.price <= 200000:
            return 0.5
        else:
            return 0.3

    def _to_search_item(self, item_data: dict) -> SearchItem:
        """Convertit un item avec scores en SearchItem"""

        item = item_data["item"]

        return SearchItem(
            id=item.id,
            title=item.title,
            description=item.description,
            image_url=item.image_url or "",
            price=item.price,
            tailor_id=item.tailor_id,
            tailor_name=item.tailor_name or "Tailleur",
            tailor_rating=self._get_tailor_rating(item.tailor_id),
            rating=item.rating,
            availability=item.availability,
            created_at=item.created_at or datetime.utcnow(),
            relevance_score=item_data["relevance_score"],
            business_score=item_data["business_score"],
            final_score=item_data["final_score"],
        )

    def _get_tailor_rating(self, tailor_id: str) -> Optional[float]:
        """Récupère le rating du tailleur"""

        tailor = self.db.query(Tailor).filter(Tailor.id == tailor_id).first()
        return tailor.rating if tailor else None

    def generate_suggestions(self, query: str) -> List[str]:
        """Génère des suggestions de recherche"""

        # Suggestions simples basées sur des termes populaires
        # TODO: Implémenter une logique plus sophistiquée (basée sur l'historique)

        common_terms = [
            "boubou",
            "robe",
            "kaftan",
            "ensemble",
            "tenue traditionnelle",
            "tailleur",
            "broderie",
            "bazin",
            "wax",
        ]

        query_lower = query.lower()
        suggestions = []

        for term in common_terms:
            if term not in query_lower and len(suggestions) < 5:
                suggestions.append(f"{query} {term}")

        return suggestions[:5]


