"""
Schémas Pydantic pour le modèle Yango de calcul de livraison
Modèle : Base 1500 FCFA + 100 FCFA/km + 15% frais SIGNARE + pénalité trafic
"""

from enum import Enum
from pydantic import BaseModel, Field, field_validator, model_validator


class TrafficLevel(str, Enum):
    """Niveaux de trafic possibles"""
    LIGHT = "light"  # Trafic fluide
    MODERATE = "moderate"  # Trafic modéré
    HEAVY = "heavy"  # Trafic dense
    UNKNOWN = "unknown"  # État inconnu (fallback)


class Position(BaseModel):
    """Coordonnées GPS (latitude, longitude)"""
    lat: float = Field(..., ge=-90, le=90, description="Latitude (-90 à 90)")
    lng: float = Field(..., ge=-180, le=180, description="Longitude (-180 à 180)")

    @field_validator("lat")
    def check_lat(cls, v: float) -> float:
        if not -90 <= v <= 90:
            raise ValueError("Latitude doit être entre -90 et 90")
        return v

    @field_validator("lng")
    def check_lng(cls, v: float) -> float:
        if not -180 <= v <= 180:
            raise ValueError("Longitude doit être entre -180 et 180")
        return v


class ShippingCalculateRequest(BaseModel):
    """
    Requête pour calculer le prix de livraison
    Peut être fournie soit avec distance_km, soit avec coordonnées GPS
    """
    distance_km: float | None = Field(
        None,
        gt=0,
        description="Distance en kilomètres (optionnel si coordonnées fournies)"
    )
    origin: Position | None = Field(
        None,
        description="Position d'origine (optionnel si distance_km fournie)"
    )
    destination: Position | None = Field(
        None,
        description="Position de destination (optionnel si distance_km fournie)"
    )

    @model_validator(mode='after')
    def validate_request(self):
        """Valider qu'on a soit distance_km, soit origin+destination"""
        has_distance = self.distance_km is not None
        has_coordinates = self.origin is not None and self.destination is not None
        
        if not has_distance and not has_coordinates:
            raise ValueError(
                "Vous devez fournir soit 'distance_km', soit 'origin' et 'destination'"
            )
        if has_distance and has_coordinates:
            raise ValueError(
                "Ne fournissez pas à la fois 'distance_km' et des coordonnées GPS"
            )
        return self


class ShippingCalculateResponse(BaseModel):
    """Réponse du calcul de livraison selon le modèle Yango"""
    distance_km: float = Field(..., description="Distance en kilomètres")
    base_price: float = Field(..., description="Prix de base (1500 FCFA)")
    distance_cost: float = Field(..., description="Coût kilométrique (100 FCFA/km)")
    subtotal: float = Field(..., description="Sous-total avant frais SIGNARE")
    signare_fee: float = Field(..., description="Frais SIGNARE (15%)")
    total_price: float = Field(..., description="Prix total en FCFA")
    currency: str = Field(default="FCFA", description="Devise")

