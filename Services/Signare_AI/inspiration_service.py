"""
Service d'inspiration visuelle IA
Génère des images d'inspiration à partir de tags structurés
"""

import os
from typing import Dict
try:
    from replicate_service import ReplicateService
    from mock_service import MockService
except ImportError:
    # Pour les tests ou imports depuis d'autres répertoires
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from replicate_service import ReplicateService
    from mock_service import MockService


class InspirationService:
    """
    Service d'inspiration visuelle IA
    
    Construit automatiquement le prompt avec le socle fixe SIGNARE
    et génère l'image via Replicate (prod) ou Mock (dev)
    """
    
    # SOCLE FIXE SIGNARE (non modifiable)
    SIGNARE_BASE_PROMPT = (
        "Tenue traditionnelle sénégalaise élégante, "
        "style premium SIGNARE, "
        "coupe moderne, "
        "photographie réaliste, "
        "éclairage doux de studio, "
        "fond neutre, "
        "haute qualité, "
        "mise en valeur des tissus et broderies"
    )
    
    def __init__(self):
        self.mode = os.getenv("AI_MODE", "mock").lower()
        
        if self.mode == "replicate":
            self.ai_service = ReplicateService()
        else:
            self.ai_service = MockService()
    
    def _build_prompt(
        self,
        tissu: str,
        evenement: str,
        genre_age: str,
        couleur: str
    ) -> str:
        """
        Construit le prompt final selon la structure imposée :
        [SOCLE FIXE SIGNARE] + [genre/âge] + [événement] + [tissu] + [couleur]
        """
        prompt_parts = [
            self.SIGNARE_BASE_PROMPT,
            f"{genre_age},",
            f"pour la fête de {evenement},",
            f"tissu {tissu},",
            f"couleur {couleur}"
        ]
        
        return ", ".join(prompt_parts)
    
    async def generate(
        self,
        tissu: str,
        evenement: str,
        genre_age: str,
        couleur: str
    ) -> Dict[str, str]:
        """
        Génère une image d'inspiration
        
        Args:
            tissu: Type de tissu (wax, getzner, bazin, etc.)
            evenement: Événement (tabaski, mariage, baptême, etc.)
            genre_age: Genre et âge (homme, femme, garçon, fille)
            couleur: Couleur principale
            
        Returns:
            Dict avec image_url, prompt, mode
        """
        # Construire le prompt structuré
        prompt = self._build_prompt(tissu, evenement, genre_age, couleur)
        
        # Générer l'image via le service approprié
        result = await self.ai_service.generate_inspiration(prompt)
        
        return {
            "image_url": result["image_url"],
            "prompt": prompt,
            "mode": self.mode
        }

