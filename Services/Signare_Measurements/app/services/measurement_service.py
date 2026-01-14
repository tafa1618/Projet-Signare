"""
Service principal de gestion des mesures
"""

import logging
from typing import Dict, Optional
from app.schemas.measurements import MeasurementsInput, MeasurementsOutput, ScanRequest
from app.services.validation_service import ValidationService
from app.adapters.mock_adapter import MockAdapter
from app.adapters.replicate_adapter import ReplicateAdapter
from app.core.config import settings
from app.core.constants import PRECISION, MEASUREMENT_VERSION

logger = logging.getLogger(__name__)


class MeasurementService:
    """Service principal pour la gestion des mesures"""
    
    def __init__(self):
        self.validation_service = ValidationService()
        self.ai_adapter = self._get_ai_adapter()
        # En production, on utiliserait une base de données pour tracker les scans
        self._scan_tracker: Dict[str, int] = {}  # user_id -> nombre de scans
    
    def _get_ai_adapter(self):
        """Retourne l'adapter IA approprié selon le mode"""
        if settings.AI_MODE == "replicate":
            return ReplicateAdapter()
        else:
            return MockAdapter()
    
    async def process_manual_measurements(
        self,
        measurements: MeasurementsInput
    ) -> MeasurementsOutput:
        """
        Traite les mesures manuelles
        
        Args:
            measurements: Mesures saisies par l'utilisateur
        
        Returns:
            MeasurementsOutput standardisé
        """
        # Valider les mesures
        errors = self.validation_service.validate_measurements(measurements)
        if errors:
            raise ValueError(f"Mesures invalides: {errors}")
        
        # Normaliser toutes les valeurs en cm (déjà fait par le schéma)
        
        return MeasurementsOutput(
            method="manual",
            measurements=measurements,
            confidence="exact",
            precision_cm=PRECISION["manual"],
            version=MEASUREMENT_VERSION,
        )
    
    async def process_scan(
        self,
        request: ScanRequest
    ) -> MeasurementsOutput:
        """
        Traite un scan automatique par IA
        
        Args:
            request: ScanRequest avec les images/vidéo
        
        Returns:
            MeasurementsOutput standardisé avec mesures estimées
        """
        # Vérifier les règles business (1 scan gratuit)
        if not request.is_paid:
            scan_count = self._scan_tracker.get(request.user_id, 0)
            if scan_count >= settings.FREE_SCAN_LIMIT:
                raise ValueError(
                    f"Limite de scans gratuits atteinte ({settings.FREE_SCAN_LIMIT}). "
                    "Un scan payant est requis."
                )
            self._scan_tracker[request.user_id] = scan_count + 1
        
        # Traiter le scan via l'adapter IA
        logger.info(f"Traitement du scan pour user_id: {request.user_id}")
        
        measurements = await self.ai_adapter.process_scan(
            front_image_url=request.front_image_url,
            side_image_url=request.side_image_url,
            video_url=request.video_url
        )
        
        return MeasurementsOutput(
            method="scan",
            measurements=measurements,
            confidence="estimated",
            precision_cm=PRECISION["scan"],
            version=MEASUREMENT_VERSION,
            disclaimer=(
                "Mesures estimées par IA – validation recommandée avant fabrication. "
                "Précision: +/- 1.5 cm"
            ),
        )

