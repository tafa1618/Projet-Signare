"""
Adapter Mock pour le développement
Génère des mesures réalistes sans utiliser d'IA
"""

import asyncio
import numpy as np
from app.schemas.measurements import MeasurementsInput
from app.services.geometric_service import GeometricService
from typing import Optional


class MockAdapter:
    """Adapter mock pour générer des mesures réalistes en développement"""
    
    @staticmethod
    async def generate_mock_mesh() -> tuple[np.ndarray, Optional[np.ndarray]]:
        """
        Génère un mesh 3D mock réaliste
        
        Returns:
            Tuple (vertices, faces) du mesh
        """
        # Simuler un délai de traitement (1-2 secondes)
        await asyncio.sleep(np.random.uniform(1.0, 2.0))
        
        # Générer un mesh simplifié (forme humaine approximative)
        # Mesh basique en forme de torse + membres
        
        # Torse (cylindre approximatif)
        n_points = 100
        theta = np.linspace(0, 2 * np.pi, n_points)
        
        # Générer des vertices pour différentes hauteurs
        vertices = []
        
        # Cou (Y = 0.85)
        for t in theta:
            r = 0.12 + np.random.normal(0, 0.01)
            vertices.append([r * np.cos(t), 0.85, r * np.sin(t)])
        
        # Poitrine (Y = 0.65)
        for t in theta:
            r = 0.20 + np.random.normal(0, 0.02)
            vertices.append([r * np.cos(t), 0.65, r * np.sin(t)])
        
        # Taille (Y = 0.50)
        for t in theta:
            r = 0.18 + np.random.normal(0, 0.02)
            vertices.append([r * np.cos(t), 0.50, r * np.sin(t)])
        
        # Hanches (Y = 0.35)
        for t in theta:
            r = 0.22 + np.random.normal(0, 0.02)
            vertices.append([r * np.cos(t), 0.35, r * np.sin(t)])
        
        # Cuisses (Y = 0.20)
        for t in theta:
            r = 0.15 + np.random.normal(0, 0.01)
            vertices.append([r * np.cos(t), 0.20, r * np.sin(t)])
        
        # Ajouter des points pour les membres
        # Épaules
        vertices.append([0.25, 0.70, 0.0])  # Épaule droite
        vertices.append([-0.25, 0.70, 0.0])  # Épaule gauche
        
        # Poignets
        vertices.append([0.30, 0.40, 0.0])  # Poignet droit
        vertices.append([-0.30, 0.40, 0.0])  # Poignet gauche
        
        # Chevilles
        vertices.append([0.10, 0.05, 0.0])  # Cheville droite
        vertices.append([-0.10, 0.05, 0.0])  # Cheville gauche
        
        vertices_array = np.array(vertices)
        
        return vertices_array, None
    
    @staticmethod
    async def process_scan(
        front_image_url: str,
        side_image_url: Optional[str] = None,
        video_url: Optional[str] = None
    ) -> MeasurementsInput:
        """
        Traite un scan automatique en mode mock
        
        Args:
            front_image_url: URL de l'image face
            side_image_url: URL de l'image profil (optionnel)
            video_url: URL de la vidéo (optionnel)
        
        Returns:
            MeasurementsInput avec les mesures estimées
        """
        # Générer un mesh mock
        mesh_vertices, mesh_faces = await MockAdapter.generate_mock_mesh()
        
        # Calculer les mesures à partir du mesh
        measurements = GeometricService.calculate_measurements_from_mesh(
            mesh_vertices, mesh_faces
        )
        
        return measurements

