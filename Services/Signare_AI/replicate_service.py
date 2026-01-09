"""
Service Replicate pour génération IA en production
Utilise l'API Replicate pour Stable Diffusion
"""

import os
from typing import Dict
import asyncio

try:
    import replicate
except ImportError:
    replicate = None


class ReplicateService:
    """
    Service Replicate pour génération IA réelle
    
    Utilise Stable Diffusion pour :
    - Inspiration visuelle
    - Try-on spécialisé
    """
    
    def __init__(self):
        if replicate is None:
            raise ImportError("Le package 'replicate' n'est pas installé. Installez-le avec: pip install replicate")
        
        api_token = os.getenv("REPLICATE_API_TOKEN")
        if not api_token:
            raise ValueError("REPLICATE_API_TOKEN doit être défini en mode replicate")
        
        self.client = replicate.Client(api_token=api_token)
        
        # Modèles Replicate
        self.inspiration_model = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
        self.tryon_model = "cuuupid/idm-vton:906425dbca90663f6e0e0e0e0e0e0e0e0e0e0e0"  # À ajuster selon le modèle réel
    
    async def generate_inspiration(self, prompt: str) -> Dict[str, str]:
        """
        Génère une image d'inspiration via Stable Diffusion
        
        Args:
            prompt: Prompt structuré complet
            
        Returns:
            Dict avec image_url
        """
        try:
            # Exécuter le modèle en mode asynchrone
            output = await asyncio.to_thread(
                self.client.run,
                self.inspiration_model,
                input={"prompt": prompt}
            )
            
            # Replicate retourne une liste d'URLs
            image_url = output[0] if isinstance(output, list) else str(output)
            
            return {
                "image_url": image_url,
                "mode": "replicate"
            }
        except Exception as e:
            raise Exception(f"Erreur Replicate lors de la génération d'inspiration: {str(e)}")
    
    async def generate_tryon(
        self,
        user_image: str,
        garment_image: str,
        job_id: str
    ) -> Dict[str, str]:
        """
        Génère une image de try-on via Stable Diffusion spécialisé
        
        Args:
            user_image: Chemin ou URL de l'image utilisateur
            garment_image: Chemin ou URL de l'image du vêtement
            job_id: Identifiant du job
            
        Returns:
            Dict avec output_image_url
        """
        try:
            # Exécuter le modèle try-on
            output = await asyncio.to_thread(
                self.client.run,
                self.tryon_model,
                input={
                    "user_image": user_image,
                    "garment_image": garment_image
                }
            )
            
            # Une seule image par job
            output_image_url = output[0] if isinstance(output, list) else str(output)
            
            return {
                "output_image_url": output_image_url,
                "job_id": job_id,
                "mode": "replicate"
            }
        except Exception as e:
            raise Exception(f"Erreur Replicate lors de la génération try-on: {str(e)}")

