"""
Service de calcul géométrique des mesures à partir d'un mesh 3D
"""

import numpy as np
from typing import Dict, Optional
from app.schemas.measurements import MeasurementsInput


class GeometricService:
    """Service de calcul géométrique des mesures corporelles"""
    
    @staticmethod
    def calculate_measurements_from_mesh(
        mesh_vertices: np.ndarray,
        mesh_faces: Optional[np.ndarray] = None
    ) -> MeasurementsInput:
        """
        Calcule les mesures corporelles à partir d'un mesh 3D
        
        Args:
            mesh_vertices: Array numpy de shape (N, 3) avec les vertices du mesh
            mesh_faces: Array numpy de shape (M, 3) avec les faces (optionnel)
        
        Returns:
            MeasurementsInput avec les mesures calculées
        """
        # Calcul des points clés du corps (approximation)
        # Ces calculs sont basés sur la géométrie du mesh
        
        # Tour de poitrine (circumference au niveau de la poitrine)
        chest_circumference = GeometricService._calculate_circumference(
            mesh_vertices, axis="y", level="chest"
        )
        
        # Tour de taille
        waist_circumference = GeometricService._calculate_circumference(
            mesh_vertices, axis="y", level="waist"
        )
        
        # Tour de hanches
        hips_circumference = GeometricService._calculate_circumference(
            mesh_vertices, axis="y", level="hips"
        )
        
        # Tour de cou
        neck_circumference = GeometricService._calculate_circumference(
            mesh_vertices, axis="y", level="neck"
        )
        
        # Largeur épaules (distance entre les points d'épaule)
        shoulders_width = GeometricService._calculate_width(
            mesh_vertices, axis="x", level="shoulders"
        )
        
        # Longueur bras (distance épaule -> poignet)
        arm_length = GeometricService._calculate_limb_length(
            mesh_vertices, limb="arm"
        )
        
        # Tour de cuisse
        thigh_circumference = GeometricService._calculate_circumference(
            mesh_vertices, axis="y", level="thigh"
        )
        
        # Tour de biceps
        biceps_circumference = GeometricService._calculate_circumference(
            mesh_vertices, axis="y", level="biceps"
        )
        
        # Longueur jambes (hanche -> cheville)
        leg_length = GeometricService._calculate_limb_length(
            mesh_vertices, limb="leg"
        )
        
        return MeasurementsInput(
            chest=round(chest_circumference, 1),
            waist=round(waist_circumference, 1),
            hips=round(hips_circumference, 1),
            neck=round(neck_circumference, 1),
            shoulders=round(shoulders_width, 1),
            arm_length=round(arm_length, 1),
            thigh=round(thigh_circumference, 1),
            biceps=round(biceps_circumference, 1),
            leg_length=round(leg_length, 1),
        )
    
    @staticmethod
    def _calculate_circumference(
        vertices: np.ndarray,
        axis: str = "y",
        level: str = "waist"
    ) -> float:
        """
        Calcule la circonférence à un niveau donné du corps
        
        Args:
            vertices: Vertices du mesh
            axis: Axe vertical ("y" par défaut)
            level: Niveau du corps (chest, waist, hips, etc.)
        
        Returns:
            Circonférence en cm
        """
        # Déterminer le niveau Y approximatif selon la partie du corps
        y_levels = {
            "neck": 0.85,
            "chest": 0.65,
            "waist": 0.50,
            "hips": 0.35,
            "thigh": 0.20,
            "biceps": 0.60,
        }
        
        if level not in y_levels:
            return 0.0
        
        # Filtrer les vertices proches du niveau
        y_target = np.percentile(vertices[:, 1], y_levels[level] * 100)
        tolerance = 0.05 * (vertices[:, 1].max() - vertices[:, 1].min())
        
        mask = np.abs(vertices[:, 1] - y_target) < tolerance
        level_vertices = vertices[mask]
        
        if len(level_vertices) < 3:
            return 0.0
        
        # Calculer la circonférence approximative (périmètre du polygone)
        # Projection sur le plan XZ
        xz_points = level_vertices[:, [0, 2]]
        
        # Centrer les points
        center = np.mean(xz_points, axis=0)
        centered = xz_points - center
        
        # Calculer les angles polaires
        angles = np.arctan2(centered[:, 1], centered[:, 0])
        sorted_indices = np.argsort(angles)
        sorted_points = xz_points[sorted_indices]
        
        # Calculer le périmètre
        perimeter = 0.0
        for i in range(len(sorted_points)):
            next_i = (i + 1) % len(sorted_points)
            dist = np.linalg.norm(sorted_points[next_i] - sorted_points[i])
            perimeter += dist
        
        # Convertir en cm (supposant que les vertices sont en mètres)
        return perimeter * 100
    
    @staticmethod
    def _calculate_width(
        vertices: np.ndarray,
        axis: str = "x",
        level: str = "shoulders"
    ) -> float:
        """Calcule la largeur à un niveau donné"""
        y_levels = {
            "shoulders": 0.70,
        }
        
        if level not in y_levels:
            return 0.0
        
        y_target = np.percentile(vertices[:, 1], y_levels[level] * 100)
        tolerance = 0.05 * (vertices[:, 1].max() - vertices[:, 1].min())
        
        mask = np.abs(vertices[:, 1] - y_target) < tolerance
        level_vertices = vertices[mask]
        
        if len(level_vertices) == 0:
            return 0.0
        
        # Largeur selon l'axe spécifié
        if axis == "x":
            width = level_vertices[:, 0].max() - level_vertices[:, 0].min()
        else:
            width = level_vertices[:, 2].max() - level_vertices[:, 2].min()
        
        return width * 100  # Convertir en cm
    
    @staticmethod
    def _calculate_limb_length(
        vertices: np.ndarray,
        limb: str = "arm"
    ) -> float:
        """Calcule la longueur d'un membre"""
        # Approximation basée sur la géométrie du mesh
        # Pour un calcul précis, il faudrait les landmarks de pose
        
        if limb == "arm":
            # Épaule (Y ~ 0.70) -> Poignet (Y ~ 0.40)
            shoulder_y = np.percentile(vertices[:, 1], 70)
            wrist_y = np.percentile(vertices[:, 1], 40)
            length = abs(shoulder_y - wrist_y)
        elif limb == "leg":
            # Hanche (Y ~ 0.35) -> Cheville (Y ~ 0.05)
            hip_y = np.percentile(vertices[:, 1], 35)
            ankle_y = np.percentile(vertices[:, 1], 5)
            length = abs(hip_y - ankle_y)
        else:
            return 0.0
        
        return length * 100  # Convertir en cm

