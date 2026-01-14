"""
Schémas Pydantic pour les mesures
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from app.core.constants import MEASUREMENT_RANGES


class MeasurementsInput(BaseModel):
    """Mesures saisies manuellement"""
    chest: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["chest"][0], le=MEASUREMENT_RANGES["chest"][1])
    waist: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["waist"][0], le=MEASUREMENT_RANGES["waist"][1])
    hips: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["hips"][0], le=MEASUREMENT_RANGES["hips"][1])
    neck: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["neck"][0], le=MEASUREMENT_RANGES["neck"][1])
    shoulders: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["shoulders"][0], le=MEASUREMENT_RANGES["shoulders"][1])
    arm_length: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["arm_length"][0], le=MEASUREMENT_RANGES["arm_length"][1])
    thigh: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["thigh"][0], le=MEASUREMENT_RANGES["thigh"][1])
    biceps: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["biceps"][0], le=MEASUREMENT_RANGES["biceps"][1])
    leg_length: Optional[float] = Field(None, ge=MEASUREMENT_RANGES["leg_length"][0], le=MEASUREMENT_RANGES["leg_length"][1])

    @validator("*", pre=True)
    def convert_to_cm(cls, v):
        """Normaliser toutes les valeurs en cm"""
        if v is None:
            return None
        # Si c'est déjà un nombre, on le garde tel quel (supposé en cm)
        return float(v)


class MeasurementsOutput(BaseModel):
    """Format de sortie standardisé"""
    method: Literal["manual", "scan"]
    measurements: MeasurementsInput
    confidence: Literal["exact", "estimated"] = "exact"
    precision_cm: str = "+/- 0.5"
    version: int = 1
    disclaimer: Optional[str] = None  # Pour les mesures IA


class ScanRequest(BaseModel):
    """Requête pour scan automatique"""
    user_id: str = Field(..., description="ID utilisateur unique")
    front_image_url: str = Field(..., description="URL de l'image face")
    side_image_url: Optional[str] = Field(None, description="URL de l'image profil")
    video_url: Optional[str] = Field(None, description="URL de la vidéo (alternative)")
    is_paid: bool = Field(False, description="Indique si le scan est payant (après le gratuit)")

