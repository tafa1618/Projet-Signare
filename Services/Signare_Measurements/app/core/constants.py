"""
Constantes pour le microservice Measurements
"""

# Plages de mesures réalistes (en cm)
MEASUREMENT_RANGES = {
    "chest": (70, 150),  # Tour de poitrine
    "waist": (60, 140),  # Tour de taille
    "hips": (70, 150),   # Tour de hanches
    "neck": (30, 50),    # Tour de cou
    "shoulders": (35, 60),  # Largeur épaules
    "arm_length": (50, 80),  # Longueur bras
    "thigh": (40, 80),   # Tour de cuisse
    "biceps": (20, 45),  # Tour de biceps
    "leg_length": (70, 120),  # Longueur jambes
}

# Modèles Replicate pour le pipeline IA
REPLICATE_MODELS = {
    "pose_estimation": "cjwbw/controlnet-openpose",
    "segmentation": "cjwbw/sam2",
    "human_mesh_recovery": "fofr/human-mesh-recovery",
}

# Précision estimée selon la méthode
PRECISION = {
    "manual": "+/- 0.5 cm",
    "scan": "+/- 1.5 cm",
}

# Version du format de sortie
MEASUREMENT_VERSION = 1

