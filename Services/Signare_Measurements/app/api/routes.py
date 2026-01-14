"""
Routes API pour le microservice Measurements
"""

from fastapi import APIRouter, HTTPException, Depends
from app.schemas.measurements import (
    MeasurementsInput,
    MeasurementsOutput,
    ScanRequest
)
from app.services.measurement_service import MeasurementService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
measurement_service = MeasurementService()


@router.post("/measurements/manual", response_model=MeasurementsOutput)
async def create_manual_measurements(
    measurements: MeasurementsInput
):
    """
    Endpoint pour les mesures manuelles
    
    L'utilisateur saisit ses mesures manuellement.
    Le service valide et normalise les valeurs.
    """
    try:
        result = await measurement_service.process_manual_measurements(measurements)
        logger.info(f"Mesures manuelles traitées avec succès")
        return result
    except ValueError as e:
        logger.warning(f"Erreur de validation: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur lors du traitement: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


@router.post("/measurements/scan", response_model=MeasurementsOutput)
async def create_scan_measurements(
    request: ScanRequest
):
    """
    Endpoint pour les mesures automatiques par scan IA
    
    Pipeline:
    1. Pose estimation
    2. Segmentation
    3. Reconstruction 3D
    4. Calcul géométrique
    
    Règles business:
    - 1 scan gratuit par utilisateur
    - Scans suivants payants (is_paid=true)
    """
    try:
        result = await measurement_service.process_scan(request)
        logger.info(f"Scan traité avec succès pour user_id: {request.user_id}")
        return result
    except ValueError as e:
        logger.warning(f"Erreur business/validation: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur lors du scan: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors du traitement du scan")

