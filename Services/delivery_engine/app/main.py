"""
SIGNARE Delivery Engine - Microservice Yango
Calcule les prix de livraison selon le modèle Yango : Base 1500 FCFA + 100 FCFA/km + 15% frais SIGNARE
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from delivery_engine.app.api.routes import router

app = FastAPI(
    title="SIGNARE Delivery Engine",
    version="2.0.0",
    description=(
        "Micro-service de calcul de prix de livraison selon le modèle Yango. "
        "Modèle : Base 1500 FCFA + 100 FCFA/km + 15% frais SIGNARE. "
        "Mobile-first et multi-clients."
    ),
)

# CORS ouvert pour clients multiples (à ajuster en production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health", tags=["health"])
async def health():
    """Endpoint de santé pour vérifier que le service est opérationnel"""
    return {
        "status": "ok",
        "service": "SIGNARE Delivery Engine",
        "version": "2.0.0",
        "model": "Yango",
    }

