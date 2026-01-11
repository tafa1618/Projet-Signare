"""
Modèles SQLAlchemy pour le Feed (Read Model)
"""

from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.core.database import Base


class Item(Base):
    """Modèle Item (Read Model)"""

    __tablename__ = "items"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    image_url = Column(String)
    price = Column(Float)
    category = Column(String)
    color = Column(String)
    tailor_id = Column(String, nullable=False)
    tailor_name = Column(String)
    rating = Column(Float)
    availability = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Métadonnées ML
    embedding = Column(JSONB)  # Vector embeddings
    popularity_score = Column(Float, default=0.0)
    recency_score = Column(Float, default=0.0)
    quality_score = Column(Float, default=0.0)

    # Métadonnées business
    view_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)
    purchase_count = Column(Integer, default=0)


class Tailor(Base):
    """Modèle Tailor (Read Model - scores agrégés)"""

    __tablename__ = "tailors"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    rating = Column(Float)
    total_orders = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    performance_score = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserEvent(Base):
    """Modèle Event (append-only)"""

    __tablename__ = "user_events"

    id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False)  # view_item, search, click, etc.
    entity_id = Column(String)  # ID de l'item, query, etc.
    user_id = Column(String)
    session_id = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    context = Column(JSONB)  # Contexte additionnel

