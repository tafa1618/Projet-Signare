"""
Routes API pour le Delivery Engine Yango
Endpoints pour calculer les prix de livraison selon le modèle Yango
"""

from fastapi import APIRouter, HTTPException

from delivery_engine.app.schemas.cost import (
    ShippingCalculateRequest,
    ShippingCalculateResponse,
)
from delivery_engine.app.services.cost_service import calculate_shipping_price

router = APIRouter()


@router.post(
    "/shipping/calculate",
    response_model=ShippingCalculateResponse,
    tags=["shipping"],
    summary="Calculer le prix de livraison (modèle Yango)",
    description=(
        "Calcule le prix de livraison selon le modèle Yango : "
        "Base 1500 FCFA + 100 FCFA/km + 15% frais SIGNARE. "
        "Peut recevoir soit une distance en km, soit des coordonnées GPS.\n\n"
        "⚠️ **IMPORTANT** : Livraison uniquement disponible à Dakar, Sénégal. "
        "Pour les clients internationaux ou hors Dakar, une autre stratégie sera utilisée."
    ),
)
async def calculate_shipping_route(
    payload: ShippingCalculateRequest
) -> ShippingCalculateResponse:
    """
    Calcule le prix de livraison selon le modèle Yango.
    
    **Modèle de calcul :**
    - Prix de base : 1500 FCFA
    - Coût kilométrique : 100 FCFA/km
    - Frais SIGNARE : 15% du sous-total
    
    **Options d'entrée :**
    - Option 1 : Fournir `distance_km` directement
    - Option 2 : Fournir `origin` et `destination` (GPS) pour calculer la distance
    
    **Exemple avec distance :**
    ```json
    {
      "distance_km": 5.5
    }
    ```
    
    **Exemple avec GPS :**
    ```json
    {
      "origin": { "lat": 14.7167, "lng": -17.4677 },
      "destination": { "lat": 14.6928, "lng": -17.4467 }
    }
    ```
    """
    try:
        return calculate_shipping_price(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du calcul : {str(e)}"
        )

