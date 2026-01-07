from datetime import datetime
from math import radians, sin, cos, sqrt, atan2

from delivery_engine.app.core.config import settings
from delivery_engine.app.schemas.cost import (
    CostBreakdown,
    CostRequest,
    RouteScoreRequest,
    RouteScoreResponse,
    TrafficLevel,
    ZoneType,
)

# Pénalités fixes définies par la règle métier
TRAFFIC_PENALTIES = {
    TrafficLevel.low: 0,
    TrafficLevel.medium: 150,
    TrafficLevel.high: 300,
}

ZONE_PENALTIES = {
    ZoneType.normal: 0,
    ZoneType.dense: 200,
    ZoneType.very_dense: 400,
}

TIME_PENALTY_AFTER_18H = 150
TIME_PENALTY_WEEKEND = 200


def calculate_cost(payload: CostRequest) -> CostBreakdown:
    """
    Calcule le coût total selon la formule métier.
    La batterie est conservée pour extension future (pénalités dynamiques).
    """
    base_cost = payload.distance_km * settings.BASE_COST_PER_KM
    penalty_traffic = TRAFFIC_PENALTIES[payload.traffic_level]
    penalty_zone = ZONE_PENALTIES[payload.zone_type]
    penalty_time = _compute_time_penalty(payload.delivery_datetime)
    penalty_battery = _compute_battery_penalty(payload.battery_level)

    total_cost = (
        base_cost
        + penalty_traffic
        + penalty_battery
        + penalty_zone
        + penalty_time
    )

    return CostBreakdown(
        base_cost=base_cost,
        penalty_traffic=penalty_traffic,
        penalty_battery=penalty_battery,
        penalty_zone=penalty_zone,
        penalty_time=penalty_time,
        total_cost=total_cost,
    )


def score_route(payload: RouteScoreRequest) -> RouteScoreResponse:
    """
    Score de tournée : plus bas = meilleur.
    On réutilise le modèle économique (coût estimé) et on y ajoute une pondération
    sur la distance pour prioriser les trajets courts.
    """
    distance_km = _haversine_km(
        payload.current_position.lat,
        payload.current_position.lng,
        payload.candidate_position.lat,
        payload.candidate_position.lng,
    )

    synthetic_cost_request = CostRequest(
        distance_km=distance_km,
        traffic_level=payload.traffic_level,
        zone_type=payload.zone_type,
        delivery_datetime=datetime.utcnow(),
    )
    cost_breakdown = calculate_cost(synthetic_cost_request)

    # Score = coût estimé + bonus distance (favorise les tournées courtes)
    score = cost_breakdown.total_cost + distance_km * 10

    return RouteScoreResponse(
        distance_km=round(distance_km, 3),
        estimated_cost=round(cost_breakdown.total_cost, 2),
        score=round(score, 2),
    )


def _compute_time_penalty(delivery_datetime: datetime) -> float:
    penalty = 0
    if delivery_datetime.hour >= 18:
        penalty += TIME_PENALTY_AFTER_18H
    if delivery_datetime.weekday() >= 5:  # 5 = samedi, 6 = dimanche
        penalty += TIME_PENALTY_WEEKEND
    return penalty


def _compute_battery_penalty(battery_level: float | None) -> float:
    # Placeholder pour futures règles (ex: ajout d'un coût si batterie < 20%)
    if battery_level is not None and battery_level < 20:
        return 100.0
    return 0.0


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Rayon moyen de la Terre en km
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

