# SIGNARE Delivery Engine (FastAPI)

Micro-service SaaS indépendant pour le calcul de coût de livraison et le scoring de tournée.

## Démarrage rapide
```bash
cd delivery_engine
python -m venv .venv
source .venv/bin/activate  # sous Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn delivery_engine.app.main:app --reload --host 0.0.0.0 --port 8001
```

## Configuration
- Variable clé : `BASE_COST_PER_KM` (par défaut 75 FCFA) dans `.env` ou variables d'environnement.
- Stack : Python 3.11, FastAPI, Pydantic, PostgreSQL (Supabase/PostGIS-ready).

## Endpoints
- `POST /api/cost/calculate` : calcule `base_cost`, pénalités, `total_cost`.
- `POST /api/route/score` : retourne `distance_km`, `estimated_cost`, `score` (plus bas = meilleur).
- `GET /health` : statut.

Swagger : `http://localhost:8001/docs`

## Docker (Python 3.12)
```bash
cd delivery_engine
docker build -t signare-delivery-engine .
docker run --rm -p 8001:8001 signare-delivery-engine
# health:   http://localhost:8001/health
# swagger:  http://localhost:8001/docs
```

## Mode SaaS / multi-clients
- Config centralisée via variables d’environnement (ex: `BASE_COST_PER_KM`) pour aligner plusieurs clients (Next.js web, mobile, partenaires).
- CORS ouvert par défaut dans `main.py` (à restreindre par domaine en production).
- Aucune logique métier dans les routes : les services sont isolés pour être réutilisés/étendus (ex: pénalités spécifiques par client ou par zone).
- Facile à extraire/déployer : le dossier `delivery_engine/` est autonome. Publier via Docker/Render/Fly/railway, ou derrière un API Gateway.

## Idées d’extension
- Persistance Supabase/PostgreSQL + PostGIS pour historiser les calculs et enrichir les scores de tournée.
- Authentification API Key ou JWT par tenant.
- Tests unitaires sur `services/cost_service.py`.

