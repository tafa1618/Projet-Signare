from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from delivery_engine.app.api.routes import router

app = FastAPI(
    title="SIGNARE Delivery Engine",
    version="1.0.0",
    description=(
        "Micro-service SaaS de calcul de coût de livraison et score de tournée "
        "pour SIGNARE, mobile-first et multi-clients."
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
    return {"status": "ok"}

