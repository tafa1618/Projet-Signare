"""
Routes API pour le développement (données mockées)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from sqlalchemy import func

from app.core.database import get_db
from app.models.feed import Item, Tailor, UserEvent

router = APIRouter(prefix="/dev", tags=["dev"])


@router.post("/seed")
def seed_data(db: Session = Depends(get_db), clear_existing: bool = False):
    """
    Seede la base de données avec des données mockées (DEV uniquement)
    
    ⚠️  À utiliser uniquement en développement
    """
    try:
        # Import local pour éviter les problèmes de path
        import sys
        from pathlib import Path
        sys.path.insert(0, str(Path(__file__).parent.parent.parent))
        from scripts.seed_mock_data import seed_tailors, seed_items, seed_sample_events

        if clear_existing:
            # Supprimer les données existantes
            db.query(UserEvent).delete()
            db.query(Item).delete()
            db.query(Tailor).delete()
            db.commit()

        # Seeder les données
        seed_tailors(db)
        seed_items(db)
        seed_sample_events(db)

        return {
            "status": "success",
            "message": "Données mockées seedées avec succès",
            "stats": {
                "tailors": db.query(Tailor).count(),
                "items": db.query(Item).count(),
                "events": db.query(UserEvent).count(),
            },
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors du seeding: {str(e)}")


@router.get("/stats")
def get_dev_stats(db: Session = Depends(get_db)):
    """Retourne des statistiques sur les données en base (DEV)"""
    return {
        "tailors": db.query(Tailor).count(),
        "items": db.query(Item).count(),
        "events": db.query(UserEvent).count(),
        "available_items": db.query(Item).filter(Item.availability == True).count(),
        "total_views": db.query(func.sum(Item.view_count)).scalar() or 0,
        "total_clicks": db.query(func.sum(Item.click_count)).scalar() or 0,
        "total_purchases": db.query(func.sum(Item.purchase_count)).scalar() or 0,
    }


@router.delete("/reset")
def reset_data(db: Session = Depends(get_db)):
    """
    Supprime toutes les données de la base (DEV uniquement)
    
    ⚠️  DANGER : Supprime toutes les données !
    """
    try:
        db.query(UserEvent).delete()
        db.query(Item).delete()
        db.query(Tailor).delete()
        db.commit()

        return {
            "status": "success",
            "message": "Toutes les données ont été supprimées",
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

