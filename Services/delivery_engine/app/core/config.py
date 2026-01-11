"""
Configuration du Delivery Engine selon le modèle Yango
Modèle : Base 1500 FCFA + 100 FCFA/km + 15% frais SIGNARE
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configuration centrale du moteur de livraison Yango.
    Toutes les valeurs sont configurables via variables d'environnement.
    """

    # Modèle Yango (selon .cursorrules section 3)
    BASE_PRICE: float = 1500.0  # FCFA - Prix de base
    PRICE_PER_KM: float = 100.0  # FCFA - Prix par kilomètre
    SIGNARE_FEE_PERCENT: float = 0.15  # 15% - Frais de service SIGNARE

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

