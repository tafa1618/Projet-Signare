"""
SIGNARE Measurements Microservice
Microservice IA autonome pour la prise de mesures corporelles
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router

app = FastAPI(
    title="SIGNARE Measurements API",
    description="Microservice IA pour la prise de mesures corporelles (manuelles et automatiques)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(router, prefix="/api/v1", tags=["measurements"])


@app.get("/")
async def root():
    return {
        "service": "SIGNARE Measurements",
        "version": "1.0.0",
        "mode": settings.AI_MODE,
        "status": "operational"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "mode": settings.AI_MODE}

