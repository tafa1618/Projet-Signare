from fastapi import APIRouter

from delivery_engine.app.schemas.cost import (
    CostBreakdown,
    CostRequest,
    RouteScoreRequest,
    RouteScoreResponse,
)
from delivery_engine.app.services.cost_service import calculate_cost, score_route

router = APIRouter()


@router.post("/cost/calculate", response_model=CostBreakdown, tags=["cost"])
async def calculate_cost_route(payload: CostRequest) -> CostBreakdown:
    """Calcule le coût total d'une livraison (moteur centralisé)."""
    return calculate_cost(payload)


@router.post("/route/score", response_model=RouteScoreResponse, tags=["route"])
async def score_route_candidate(payload: RouteScoreRequest) -> RouteScoreResponse:
    """Retourne un score de tournée (plus bas = meilleur)."""
    return score_route(payload)

