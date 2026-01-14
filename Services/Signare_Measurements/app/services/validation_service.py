"""
Service de validation des mesures
"""

from app.schemas.measurements import MeasurementsInput
from app.core.constants import MEASUREMENT_RANGES
from typing import Dict, Optional


class ValidationService:
    """Service de validation des mesures manuelles"""
    
    @staticmethod
    def validate_measurements(measurements: MeasurementsInput) -> Dict[str, Optional[str]]:
        """
        Valide les mesures selon les plages réalistes
        
        Returns:
            Dict avec les erreurs de validation (clé: nom_mesure, valeur: message_erreur)
        """
        errors = {}
        
        for field_name, value in measurements.dict(exclude_none=True).items():
            if field_name in MEASUREMENT_RANGES:
                min_val, max_val = MEASUREMENT_RANGES[field_name]
                if value < min_val or value > max_val:
                    errors[field_name] = f"Valeur hors plage réaliste ({min_val}-{max_val} cm)"
        
        return errors
    
    @staticmethod
    def normalize_to_cm(value: float, unit: str = "cm") -> float:
        """Normalise une valeur en cm"""
        conversion = {
            "cm": 1.0,
            "m": 100.0,
            "inch": 2.54,
            "in": 2.54,
        }
        return value * conversion.get(unit.lower(), 1.0)

