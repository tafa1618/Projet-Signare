"""
SIGNARE AI Microservice
Microservice autonome pour l'inspiration visuelle et le try-on IA
Aucune dépendance au frontend - API pure
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from dotenv import load_dotenv

from inspiration_service import InspirationService
from tryon_service import TryOnService

# Charger les variables d'environnement
load_dotenv()

app = FastAPI(
    title="SIGNARE AI Microservice",
    description="Microservice IA autonome pour inspiration visuelle et try-on",
    version="1.0.0"
)

# CORS - Configurer selon vos besoins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser les services
inspiration_service = InspirationService()
tryon_service = TryOnService()


# ==================== MODÈLES DE REQUÊTES ====================

class InspirationRequest(BaseModel):
    """Requête pour génération d'inspiration visuelle"""
    tissu: str = Field(..., description="Type de tissu (wax, getzner, bazin, etc.)")
    evenement: str = Field(..., description="Événement (tabaski, mariage, baptême, etc.)")
    genre_age: str = Field(..., description="Genre et âge (homme, femme, garçon, fille)")
    couleur: str = Field(..., description="Couleur principale (blanc, bleu, vert, etc.)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "tissu": "bazin getzner premium",
                "evenement": "tabaski",
                "genre_age": "homme adulte",
                "couleur": "blanc"
            }
        }


class TryOnRequest(BaseModel):
    """Requête pour essayage virtuel"""
    user_image_path: str = Field(..., description="Chemin vers l'image utilisateur")
    garment_image_path: str = Field(..., description="Chemin vers l'image du vêtement/modèle")
    job_id: str = Field(..., description="Identifiant unique du job")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_image_path": "/uploads/user_123.jpg",
                "garment_image_path": "/uploads/garment_456.jpg",
                "job_id": "tryon_20250109_001"
            }
        }


# ==================== MODÈLES DE RÉPONSES ====================

class InspirationResponse(BaseModel):
    """Réponse pour inspiration visuelle"""
    success: bool
    image_url: Optional[str] = None
    prompt_used: str
    mode: str  # "mock" ou "replicate"
    error: Optional[str] = None


class TryOnResponse(BaseModel):
    """Réponse pour try-on"""
    success: bool
    output_image_url: Optional[str] = None
    job_id: str
    mode: str  # "mock" ou "replicate"
    error: Optional[str] = None


# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    """Health check"""
    return {
        "service": "SIGNARE AI Microservice",
        "status": "running",
        "mode": os.getenv("AI_MODE", "mock")
    }


@app.post("/inspiration", response_model=InspirationResponse)
async def generate_inspiration(request: InspirationRequest):
    """
    Génère une image d'inspiration visuelle à partir de tags structurés
    
    Le prompt est construit automatiquement avec le socle fixe SIGNARE
    """
    try:
        result = await inspiration_service.generate(
            tissu=request.tissu,
            evenement=request.evenement,
            genre_age=request.genre_age,
            couleur=request.couleur
        )
        
        return InspirationResponse(
            success=True,
            image_url=result["image_url"],
            prompt_used=result["prompt"],
            mode=result["mode"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération d'inspiration: {str(e)}"
        )


@app.post("/tryon", response_model=TryOnResponse)
async def generate_tryon(request: TryOnRequest):
    """
    Génère une image de try-on (essayage virtuel)
    
    Valide le job, pré-traite les images et génère le résultat final
    """
    try:
        result = await tryon_service.generate(
            user_image_path=request.user_image_path,
            garment_image_path=request.garment_image_path,
            job_id=request.job_id
        )
        
        return TryOnResponse(
            success=True,
            output_image_url=result["output_image_url"],
            job_id=result["job_id"],
            mode=result["mode"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération try-on: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

