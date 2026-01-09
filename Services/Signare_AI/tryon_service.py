"""
Service de try-on IA (essayage virtuel)
Gère la validation, pré-traitement et génération finale
"""

import os
from typing import Dict
try:
    from replicate_service import ReplicateService
    from mock_service import MockService
except ImportError:
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from replicate_service import ReplicateService
    from mock_service import MockService


class TryOnService:
    """
    Service de try-on IA
    
    Valide les jobs, pré-traite les images et génère le résultat
    via Replicate (prod) ou Mock (dev)
    """
    
    def __init__(self):
        self.mode = os.getenv("AI_MODE", "mock").lower()
        
        if self.mode == "replicate":
            self.ai_service = ReplicateService()
        else:
            self.ai_service = MockService()
    
    def _validate_job(self, job_id: str) -> bool:
        """
        Valide qu'un job est autorisé
        
        En production, cette méthode vérifierait :
        - Crédits disponibles
        - Job non déjà traité
        - Limites de rate
        
        Pour l'instant, validation basique
        """
        if not job_id or not job_id.strip():
            raise ValueError("job_id est requis")
        
        # TODO: Implémenter la vérification des crédits et du statut du job
        # Pour l'instant, on accepte tous les jobs valides
        
        return True
    
    def _validate_images(self, user_image_path: str, garment_image_path: str) -> bool:
        """
        Valide que les images existent et sont valides
        
        Args:
            user_image_path: Chemin vers l'image utilisateur
            garment_image_path: Chemin vers l'image du vêtement
            
        Returns:
            True si valide
            
        Raises:
            ValueError si invalide
        """
        if not user_image_path or not user_image_path.strip():
            raise ValueError("user_image_path est requis")
        
        if not garment_image_path or not garment_image_path.strip():
            raise ValueError("garment_image_path est requis")
        
        # En production, vérifier que les fichiers existent
        # if not os.path.exists(user_image_path):
        #     raise ValueError(f"Image utilisateur introuvable: {user_image_path}")
        # if not os.path.exists(garment_image_path):
        #     raise ValueError(f"Image vêtement introuvable: {garment_image_path}")
        
        return True
    
    async def _preprocess_images(
        self,
        user_image_path: str,
        garment_image_path: str
    ) -> Dict[str, str]:
        """
        Pré-traitement des images :
        - Segmentation du corps
        - Estimation de la pose
        - Préparation du vêtement
        
        En mode mock, retourne les chemins originaux
        En mode replicate, effectue le pré-traitement réel
        """
        if self.mode == "mock":
            # En mode mock, pas de pré-traitement réel
            return {
                "processed_user": user_image_path,
                "processed_garment": garment_image_path
            }
        else:
            # TODO: Implémenter le pré-traitement réel
            # - Segmentation avec modèle dédié
            # - Estimation de pose
            # - Alignement du vêtement
            return {
                "processed_user": user_image_path,
                "processed_garment": garment_image_path
            }
    
    async def generate(
        self,
        user_image_path: str,
        garment_image_path: str,
        job_id: str
    ) -> Dict[str, str]:
        """
        Génère une image de try-on
        
        Workflow:
        1. Validation du job
        2. Validation des images
        3. Pré-traitement
        4. Génération finale
        
        Args:
            user_image_path: Chemin vers l'image utilisateur
            garment_image_path: Chemin vers l'image du vêtement
            job_id: Identifiant unique du job
            
        Returns:
            Dict avec output_image_url, job_id, mode
        """
        # 1. Validation du job
        self._validate_job(job_id)
        
        # 2. Validation des images
        self._validate_images(user_image_path, garment_image_path)
        
        # 3. Pré-traitement
        processed = await self._preprocess_images(user_image_path, garment_image_path)
        
        # 4. Génération finale
        result = await self.ai_service.generate_tryon(
            user_image=processed["processed_user"],
            garment_image=processed["processed_garment"],
            job_id=job_id
        )
        
        return {
            "output_image_url": result["output_image_url"],
            "job_id": job_id,
            "mode": self.mode
        }

