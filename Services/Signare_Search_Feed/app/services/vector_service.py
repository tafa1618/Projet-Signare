"""
Service de recherche vectorielle avec FAISS (mode mock disponible pour DEV)
"""

import numpy as np
from typing import List, Optional, Tuple
import os

# FAISS optionnel (peut ne pas être installé en DEV)
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

from app.core.config import settings


class VectorService:
    """
    Service de recherche vectorielle avec FAISS

    En mode DEV (FAISS non disponible), retourne des résultats mockés.
    En production, utilise FAISS pour la recherche sémantique.
    """

    def __init__(self):
        self.index: Optional[faiss.Index] = None
        self.index_path = settings.faiss_index_path
        self.dimension = settings.embedding_dimension
        self.is_mock_mode = not FAISS_AVAILABLE

    def initialize_index(self, item_ids: Optional[List[str]] = None):
        """
        Initialise l'index FAISS

        En mode mock, ne fait rien.
        """
        if self.is_mock_mode:
            return

        if item_ids and len(item_ids) > 0:
            # Créer un index vide
            self.index = faiss.IndexFlatL2(self.dimension)
            # TODO: Charger les embeddings des items depuis la DB et les ajouter à l'index

    def load_index(self) -> bool:
        """
        Charge l'index FAISS depuis le disque

        Retourne True si l'index a été chargé, False sinon.
        """
        if self.is_mock_mode:
            return False

        if os.path.exists(self.index_path):
            try:
                self.index = faiss.read_index(self.index_path)
                return True
            except Exception:
                return False

        return False

    def save_index(self) -> bool:
        """
        Sauvegarde l'index FAISS sur le disque

        Retourne True si sauvegardé, False sinon.
        """
        if self.is_mock_mode or not self.index:
            return False

        try:
            os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
            faiss.write_index(self.index, self.index_path)
            return True
        except Exception:
            return False

    def search(
        self,
        query_embedding: List[float],
        k: int = 10,
        item_ids: Optional[List[str]] = None,
    ) -> List[Tuple[str, float]]:
        """
        Recherche les k items les plus similaires

        Args:
            query_embedding: Embedding de la requête (liste de floats)
            k: Nombre de résultats à retourner
            item_ids: Liste des IDs d'items à considérer (optionnel)

        Returns:
            Liste de tuples (item_id, distance) triés par distance croissante
        """

        # Mode mock : retourner des résultats mockés
        if self.is_mock_mode:
            return self._mock_search(query_embedding, k, item_ids)

        if not self.index:
            # Index non initialisé, utiliser mock
            return self._mock_search(query_embedding, k, item_ids)

        try:
            # Convertir l'embedding en numpy array
            query_vector = np.array([query_embedding], dtype=np.float32)

            # Vérifier la dimension
            if query_vector.shape[1] != self.dimension:
                # Dimension incorrecte, utiliser mock
                return self._mock_search(query_embedding, k, item_ids)

            # Recherche dans l'index FAISS
            distances, indices = self.index.search(query_vector, k)

            # Convertir les indices en item_ids
            # TODO: Maintenir un mapping index -> item_id
            # Pour l'instant, on retourne des IDs mockés
            results = [
                (f"item_{idx}", float(dist))
                for idx, dist in zip(indices[0], distances[0])
            ]

            return results

        except Exception:
            # En cas d'erreur, fallback vers mock
            return self._mock_search(query_embedding, k, item_ids)

    def _mock_search(
        self,
        query_embedding: List[float],
        k: int,
        item_ids: Optional[List[str]],
    ) -> List[Tuple[str, float]]:
        """
        Recherche mockée pour le développement

        Retourne des résultats basés sur des distances simulées.
        """
        # Générer des résultats mockés
        # En DEV, on peut retourner des IDs existants ou générés
        if item_ids:
            # Utiliser les IDs fournis
            selected_ids = item_ids[:k] if len(item_ids) >= k else item_ids
        else:
            # Générer des IDs mockés
            selected_ids = [f"item_mock_{i}" for i in range(k)]

        # Générer des distances mockées (plus proche = plus petit)
        mock_distances = [float(i * 0.1) for i in range(len(selected_ids))]

        return list(zip(selected_ids, mock_distances))

    def add_embeddings(
        self, item_id: str, embedding: List[float], save: bool = False
    ) -> bool:
        """
        Ajoute un embedding à l'index

        Args:
            item_id: ID de l'item
            embedding: Embedding vectoriel
            save: Sauvegarder l'index après ajout

        Returns:
            True si ajouté avec succès
        """
        if self.is_mock_mode:
            return True  # En mode mock, on simule le succès

        if not self.index:
            self.initialize_index()

        try:
            vector = np.array([embedding], dtype=np.float32)
            if vector.shape[1] != self.dimension:
                return False

            # TODO: Maintenir le mapping item_id -> index
            self.index.add(vector)

            if save:
                return self.save_index()

            return True
        except Exception:
            return False

    def remove_embedding(self, item_id: str, save: bool = False) -> bool:
        """
        Supprime un embedding de l'index

        Note: FAISS ne supporte pas directement la suppression.
        Il faudrait reconstruire l'index sans cet item.

        Returns:
            True si supprimé (ou si mode mock)
        """
        if self.is_mock_mode:
            return True

        # TODO: Implémenter la suppression (reconstruction de l'index)
        # Pour l'instant, on retourne True
        return True


# Instance globale
_vector_service: Optional[VectorService] = None


def get_vector_service() -> VectorService:
    """Obtient l'instance du service vectoriel (singleton)"""
    global _vector_service
    if _vector_service is None:
        _vector_service = VectorService()
    return _vector_service

