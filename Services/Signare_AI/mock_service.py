"""
Service Mock pour développement
Simule les appels IA sans utiliser de GPU ou Replicate
"""

import asyncio
import os
from typing import Dict
from datetime import datetime


class MockService:
    """
    Service Mock pour développement
    
    Génère des images placeholder et simule des délais réalistes
    Retourne le même format que le service Replicate
    """
    
    # Base URL pour les images mock (à configurer selon votre setup)
    MOCK_IMAGE_BASE_URL = os.getenv(
        "MOCK_IMAGE_BASE_URL",
        "https://images.unsplash.com/photo"
    )
    
    # Images placeholder pour inspiration
    INSPIRATION_PLACEHOLDERS = [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1520975892776-3f7c5b37c5b2?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop",
    ]
    
    # Images placeholder pour try-on
    TRYON_PLACEHOLDERS = [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop",
    ]
    
    def _get_placeholder(self, category: str = "inspiration") -> str:
        """
        Sélectionne un placeholder aléatoire
        
        Args:
            category: "inspiration" ou "tryon"
            
        Returns:
            URL de l'image placeholder
        """
        import random
        
        if category == "tryon":
            return random.choice(self.TRYON_PLACEHOLDERS)
        else:
            return random.choice(self.INSPIRATION_PLACEHOLDERS)
    
    async def generate_inspiration(self, prompt: str) -> Dict[str, str]:
        """
        Simule la génération d'inspiration
        
        Args:
            prompt: Prompt structuré (utilisé pour logging)
            
        Returns:
            Dict avec image_url (placeholder)
        """
        # Simuler un délai réaliste (1-2 secondes)
        delay = 1.0 + (hash(prompt) % 1000) / 1000.0  # Entre 1.0 et 2.0 secondes
        await asyncio.sleep(delay)
        
        # Log du prompt pour debug
        print(f"[MOCK] Inspiration générée avec prompt: {prompt[:100]}...")
        
        # Retourner une image placeholder
        return {
            "image_url": self._get_placeholder("inspiration"),
            "mode": "mock"
        }
    
    async def generate_tryon(
        self,
        user_image: str,
        garment_image: str,
        job_id: str
    ) -> Dict[str, str]:
        """
        Simule la génération de try-on
        
        Args:
            user_image: Chemin de l'image utilisateur
            garment_image: Chemin de l'image du vêtement
            job_id: Identifiant du job
            
        Returns:
            Dict avec output_image_url (placeholder)
        """
        # Simuler un délai réaliste (1.5-2.5 secondes)
        delay = 1.5 + (hash(job_id) % 1000) / 1000.0
        await asyncio.sleep(delay)
        
        # Log pour debug
        print(f"[MOCK] Try-on généré pour job: {job_id}")
        print(f"[MOCK] User image: {user_image}")
        print(f"[MOCK] Garment image: {garment_image}")
        
        # Retourner une image placeholder
        return {
            "output_image_url": self._get_placeholder("tryon"),
            "job_id": job_id,
            "mode": "mock"
        }

