"""
Script de seeding avec données mockées pour le développement
"""

import sys
from pathlib import Path

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.core.database import engine, Base, SessionLocal
from app.models.feed import Item, Tailor, UserEvent
from app.core.config import settings


def seed_tailors(db: Session):
    """Seed des tailleurs mockés"""

    tailors_data = [
        {
            "id": "tailor_1",
            "name": "Maison Aïda Sow",
            "rating": 4.9,
            "total_orders": 145,
            "total_revenue": 12500000.0,
            "performance_score": 0.92,
        },
        {
            "id": "tailor_2",
            "name": "Atelier Diop",
            "rating": 4.7,
            "total_orders": 98,
            "total_revenue": 8500000.0,
            "performance_score": 0.88,
        },
        {
            "id": "tailor_3",
            "name": "Couture Ndiaye",
            "rating": 4.5,
            "total_orders": 67,
            "total_revenue": 5200000.0,
            "performance_score": 0.75,
        },
        {
            "id": "tailor_4",
            "name": "Style Signare",
            "rating": 4.8,
            "total_orders": 112,
            "total_revenue": 9800000.0,
            "performance_score": 0.90,
        },
        {
            "id": "tailor_5",
            "name": "Boutique Fall",
            "rating": 4.6,
            "total_orders": 54,
            "total_revenue": 4100000.0,
            "performance_score": 0.72,
        },
    ]

    for tailor_data in tailors_data:
        tailor = Tailor(
            id=tailor_data["id"],
            name=tailor_data["name"],
            rating=tailor_data["rating"],
            total_orders=tailor_data["total_orders"],
            total_revenue=tailor_data["total_revenue"],
            performance_score=tailor_data["performance_score"],
            updated_at=datetime.utcnow(),
        )
        db.merge(tailor)

    db.commit()
    print(f"✅ {len(tailors_data)} tailleurs seedés")


def seed_items(db: Session):
    """Seed des items mockés"""

    categories = ["boubou", "robe", "kaftan", "ensemble", "tenue traditionnelle"]
    colors = ["blanc", "bleu", "vert", "marron", "noir", "multicolore", "beige"]
    tailor_ids = ["tailor_1", "tailor_2", "tailor_3", "tailor_4", "tailor_5"]

    items_data = []

    # Générer 50 items mockés
    for i in range(1, 51):
        days_ago = random.randint(0, 180)  # Items créés il y a 0-180 jours
        created_at = datetime.utcnow() - timedelta(days=days_ago)

        # Calculer popularity_score et recency_score
        popularity_score = random.uniform(0.3, 1.0)
        recency_score = max(0.1, 1.0 - (days_ago / 180))

        # Générer des compteurs réalistes
        view_count = random.randint(10, 5000)
        click_count = random.randint(5, int(view_count * 0.3))
        purchase_count = random.randint(0, int(click_count * 0.15))

        item_data = {
            "id": f"item_{i:03d}",
            "title": f"{random.choice(categories).capitalize()} {random.choice(colors)} - Modèle {i}",
            "description": f"Superbe {random.choice(categories)} en {random.choice(colors)}, confectionné avec soin par nos artisans.",
            "image_url": f"https://images.unsplash.com/photo-15{i % 10}5372039744-b8f02a3ae446?w=400&h=400&fit=crop",
            "price": random.choice([15000, 25000, 35000, 45000, 55000, 75000, 95000]),
            "category": random.choice(categories),
            "color": random.choice(colors),
            "tailor_id": random.choice(tailor_ids),
            "tailor_name": "",  # Sera rempli automatiquement
            "rating": round(random.uniform(3.5, 5.0), 1),
            "availability": random.choice([True, True, True, False]),  # 75% disponibles
            "created_at": created_at,
            "updated_at": created_at,
            "popularity_score": popularity_score,
            "recency_score": recency_score,
            "quality_score": random.uniform(0.6, 1.0),
            "view_count": view_count,
            "click_count": click_count,
            "purchase_count": purchase_count,
        }
        items_data.append(item_data)

    # Remplir les noms des tailleurs
    tailors_dict = {t.id: t.name for t in db.query(Tailor).all()}
    for item_data in items_data:
        item_data["tailor_name"] = tailors_dict.get(item_data["tailor_id"], "Tailleur")

    # Insérer les items
    for item_data in items_data:
        item = Item(**item_data)
        db.merge(item)

    db.commit()
    print(f"✅ {len(items_data)} items seedés")


def seed_sample_events(db: Session):
    """Seed quelques événements de test"""

    item_ids = [f"item_{i:03d}" for i in range(1, 21)]  # Premier 20 items
    user_ids = [f"user_{i}" for i in range(1, 6)]
    session_ids = [f"session_{i}" for i in range(1, 11)]

    events = []

    # Générer 100 événements de test
    for i in range(100):
        days_ago = random.randint(0, 30)
        timestamp = datetime.utcnow() - timedelta(days=days_ago)

        event_type = random.choices(
            ["view_item", "click", "add_to_cart", "purchase", "search"],
            weights=[50, 20, 15, 5, 10],  # Plus de vues que d'achats
        )[0]

        entity_id = random.choice(item_ids) if event_type != "search" else f"query_{random.randint(1, 10)}"

        event = UserEvent(
            id=f"event_{i:04d}",
            event_type=event_type,
            entity_id=entity_id,
            user_id=random.choice(user_ids),
            session_id=random.choice(session_ids),
            timestamp=timestamp,
            context={},
        )
        events.append(event)

    db.add_all(events)
    db.commit()
    print(f"✅ {len(events)} événements seedés")


def main():
    """Fonction principale de seeding"""

    print("🌱 Démarrage du seeding avec données mockées...\n")

    # Créer les tables si elles n'existent pas
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Vérifier si des données existent déjà
        existing_items = db.query(Item).count()
        if existing_items > 0:
            response = input(
                f"⚠️  {existing_items} items existent déjà. Voulez-vous continuer ? (oui/non): "
            )
            if response.lower() not in ["oui", "o", "yes", "y"]:
                print("❌ Seeding annulé")
                return

        print("📦 Seeding des tailleurs...")
        seed_tailors(db)

        print("📦 Seeding des items...")
        seed_items(db)

        print("📦 Seeding des événements de test...")
        seed_sample_events(db)

        print("\n✅ Seeding terminé avec succès!")
        print(f"📊 Statistiques:")
        print(f"   - Tailleurs: {db.query(Tailor).count()}")
        print(f"   - Items: {db.query(Item).count()}")
        print(f"   - Événements: {db.query(UserEvent).count()}")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors du seeding: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

