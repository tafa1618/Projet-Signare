from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class TrafficLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ZoneType(str, Enum):
    normal = "normal"
    dense = "dense"
    very_dense = "very_dense"


class CostRequest(BaseModel):
    distance_km: float = Field(..., gt=0, description="Distance en kilomètres")
    traffic_level: TrafficLevel
    zone_type: ZoneType
    delivery_datetime: datetime
    battery_level: float | None = Field(
        None,
        ge=0,
        le=100,
        description="Niveau de batterie (%) optionnel pour pénalité future",
    )


class CostBreakdown(BaseModel):
    base_cost: float
    penalty_traffic: float
    penalty_battery: float
    penalty_zone: float
    penalty_time: float
    total_cost: float


class Position(BaseModel):
    lat: float
    lng: float

    @field_validator("lat")
    def check_lat(cls, v: float) -> float:
        if not -90 <= v <= 90:
            raise ValueError("Latitude invalide")
        return v

    @field_validator("lng")
    def check_lng(cls, v: float) -> float:
        if not -180 <= v <= 180:
            raise ValueError("Longitude invalide")
        return v


class RouteScoreRequest(BaseModel):
    current_position: Position
    candidate_position: Position
    traffic_level: TrafficLevel
    zone_type: ZoneType


class RouteScoreResponse(BaseModel):
    distance_km: float
    estimated_cost: float
    score: float

