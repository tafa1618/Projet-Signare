"""
Service de calcul de livraison selon le modèle Yango
Modèle : Base 1500 FCFA + 100 FCFA/km + 15% frais SIGNARE
⚠️ IMPORTANT : Livraison uniquement disponible à Dakar, Sénégal
"""

from math import radians, sin, cos, sqrt, atan2

from delivery_engine.app.core.config import settings
from delivery_engine.app.schemas.cost import (
    ShippingCalculateRequest,
    ShippingCalculateResponse,
    Position,
)

# Zone de livraison : Dakar uniquement (bounding box approximative)
DAKAR_BOUNDS = {
    "min_lat": 14.60,   # Sud (vers Rufisque)
    "max_lat": 14.85,   # Nord (vers Yoff)
    "min_lng": -17.55,  # Ouest (côte atlantique)
    "max_lng": -17.35,  # Est (vers Thiès)
}


def calculate_shipping_price(payload: ShippingCalculateRequest) -> ShippingCalculateResponse:
    """
    Calcule le prix de livraison selon le modèle Yango.
    
    ⚠️ IMPORTANT : Livraison uniquement disponible à Dakar, Sénégal.
    Pour les clients internationaux ou hors Dakar, une autre stratégie sera utilisée.
    
    Formule :
    - Prix de base : 1500 FCFA
    - Coût kilométrique : 100 FCFA/km
    - Sous-total : BASE_PRICE + (distance_km * PRICE_PER_KM)
    - Frais SIGNARE : 15% du sous-total
    - Prix total : Sous-total + Frais SIGNARE
    
    @param payload: Requête contenant soit distance_km, soit origin+destination
    @return: Détail du calcul avec prix total
    @raises ValueError: Si les coordonnées sont hors de Dakar
    """
    # Calculer la distance si elle n'est pas fournie
    origin = None
    destination = None
    
    if payload.distance_km is None:
        if payload.origin is None or payload.destination is None:
            raise ValueError("Coordonnées GPS manquantes pour calculer la distance")
        origin = payload.origin
        destination = payload.destination
        distance_km = _haversine_km(
            origin.lat,
            origin.lng,
            destination.lat,
            destination.lng,
        )
    else:
        distance_km = payload.distance_km
        # Si distance fournie directement, on ne peut pas valider la zone géographique
        # On suppose que l'appelant a déjà validé que c'est dans Dakar
        if payload.origin is not None and payload.destination is not None:
            origin = payload.origin
            destination = payload.destination

    # Validation géographique : vérifier que les coordonnées sont dans Dakar
    if origin is not None and destination is not None:
        if not _is_in_dakar(origin.lat, origin.lng):
            raise ValueError(
                f"Livraison non disponible : l'origine ({origin.lat}, {origin.lng}) "
                f"est hors de la zone de livraison (Dakar uniquement). "
                f"Pour les clients internationaux ou hors Dakar, veuillez contacter le support."
            )
        if not _is_in_dakar(destination.lat, destination.lng):
            raise ValueError(
                f"Livraison non disponible : la destination ({destination.lat}, {destination.lng}) "
                f"est hors de la zone de livraison (Dakar uniquement). "
                f"Pour les clients internationaux ou hors Dakar, veuillez contacter le support."
            )

    # Validation : distance doit être positive
    if distance_km <= 0:
        raise ValueError("La distance doit être positive")

    # Validation : distance maximale raisonnable pour Dakar (50km devrait suffire)
    MAX_DISTANCE_KM = 50  # Dakar fait environ 20km de large, 50km est une marge de sécurité
    if distance_km > MAX_DISTANCE_KM:
        raise ValueError(
            f"Distance trop importante ({distance_km:.2f}km). "
            f"La zone de livraison (Dakar) a une distance maximale de {MAX_DISTANCE_KM}km. "
            f"Veuillez vérifier les coordonnées."
        )

    # Calcul selon le modèle Yango
    base_price = settings.BASE_PRICE  # 1500 FCFA
    distance_cost = distance_km * settings.PRICE_PER_KM  # 100 FCFA/km
    subtotal = base_price + distance_cost
    
    # Frais SIGNARE (15%)
    signare_fee = subtotal * settings.SIGNARE_FEE_PERCENT
    
    # Prix total
    total_price = subtotal + signare_fee

    return ShippingCalculateResponse(
        distance_km=round(distance_km, 2),
        base_price=round(base_price, 2),
        distance_cost=round(distance_cost, 2),
        subtotal=round(subtotal, 2),
        signare_fee=round(signare_fee, 2),
        total_price=round(total_price, 2),
        currency="FCFA",
    )


def calculate_distance(origin: Position, destination: Position) -> float:
    """
    Calcule la distance en kilomètres entre deux points GPS (formule Haversine).
    
    @param origin: Position d'origine
    @param destination: Position de destination
    @return: Distance en kilomètres
    """
    return _haversine_km(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng,
    )


def _is_in_dakar(lat: float, lng: float) -> bool:
    """
    Vérifie si les coordonnées GPS sont dans la zone de livraison (Dakar).
    
    @param lat: Latitude
    @param lng: Longitude
    @return: True si les coordonnées sont dans Dakar, False sinon
    """
    return (
        DAKAR_BOUNDS["min_lat"] <= lat <= DAKAR_BOUNDS["max_lat"]
        and DAKAR_BOUNDS["min_lng"] <= lng <= DAKAR_BOUNDS["max_lng"]
    )


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcule la distance entre deux points GPS en utilisant la formule Haversine.
    
    @param lat1: Latitude du point 1
    @param lon1: Longitude du point 1
    @param lat2: Latitude du point 2
    @param lon2: Longitude du point 2
    @return: Distance en kilomètres
    """
    # Rayon moyen de la Terre en km
    R = 6371.0
    
    # Conversion en radians
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    
    # Formule Haversine
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    return R * c

