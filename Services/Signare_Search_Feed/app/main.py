"""
Application FastAPI principale
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import feed, search, recommend, track

app = FastAPI(
    title="SIGNARE Search, Feed & Recommendation Engine",
    version=settings.service_version,
    description="Microservice autonome pour recherche, feed personnalisé et recommandations",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À configurer selon l'environnement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(feed.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(recommend.router, prefix="/api/v1")
app.include_router(track.router, prefix="/api/v1")


@app.get("/")
def root():
    """Health check"""
    return {
        "service": settings.service_name,
        "version": settings.service_version,
        "status": "running",
    }


@app.get("/health")
def health():
    """Health check détaillé"""
    return {
        "status": "healthy",
        "service": settings.service_name,
        "version": settings.service_version,
    }

