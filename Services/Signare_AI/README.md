# SIGNARE AI Microservice

Microservice IA autonome pour l'inspiration visuelle et le try-on (essayage virtuel).

## 🎯 Architecture

Ce microservice est **totalement indépendant** du frontend. Il reçoit uniquement des requêtes structurées via API HTTP et retourne des résultats exploitables.

### Capacités

1. **Inspiration visuelle IA** : Génération d'images d'inspiration à partir de tags structurés
2. **Try-on IA** : Essayage virtuel (utilisateur + vêtement → résultat)

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```bash
# Mode de fonctionnement
AI_MODE=mock  # ou "replicate" pour la production

# Clé API Replicate (requis uniquement en mode replicate)
REPLICATE_API_TOKEN=your_token_here
```

### Modes de fonctionnement

#### Mode Développement (`AI_MODE=mock`)

- ❌ N'utilise pas Replicate
- ❌ Pas de GPU requis
- ✅ Génère des images placeholder
- ✅ Simule des délais réalistes (1-2 secondes)
- ✅ Retourne le même format que la production

#### Mode Production (`AI_MODE=replicate`)

- ✅ Utilise Replicate API
- ✅ Stable Diffusion pour l'inspiration
- ✅ Stable Diffusion spécialisé pour le try-on
- ✅ Génération réelle d'images

**⚠️ Le passage de mock à replicate se fait uniquement via `.env`, sans refactor.**

## 🚀 Installation

```bash
cd Services/Signare_AI
pip install -r requirements.txt
```

## 🏃 Démarrage

```bash
# Mode développement (mock)
AI_MODE=mock uvicorn main:app --reload --port 8000

# Mode production (replicate)
AI_MODE=replicate REPLICATE_API_TOKEN=your_token uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📡 Endpoints

### `POST /inspiration`

Génère une image d'inspiration à partir de tags structurés.

**Requête :**
```json
{
  "tissu": "bazin getzner premium",
  "evenement": "tabaski",
  "genre_age": "homme adulte",
  "couleur": "blanc"
}
```

**Réponse :**
```json
{
  "success": true,
  "image_url": "https://...",
  "prompt_used": "Tenue traditionnelle sénégalaise élégante, style premium SIGNARE, ...",
  "mode": "mock"
}
```

### `POST /tryon`

Génère une image de try-on (essayage virtuel).

**Requête :**
```json
{
  "user_image_path": "/uploads/user_123.jpg",
  "garment_image_path": "/uploads/garment_456.jpg",
  "job_id": "tryon_20250109_001"
}
```

**Réponse :**
```json
{
  "success": true,
  "output_image_url": "https://...",
  "job_id": "tryon_20250109_001",
  "mode": "mock"
}
```

## 🏗️ Structure du Code

```
Signare_AI/
├── main.py                 # FastAPI app + endpoints
├── inspiration_service.py  # Service d'inspiration
├── tryon_service.py        # Service de try-on
├── replicate_service.py    # Implémentation Replicate (prod)
├── mock_service.py         # Implémentation Mock (dev)
├── requirements.txt        # Dépendances Python
├── .env.example           # Exemple de configuration
└── README.md              # Documentation
```

## 🎨 Socle Fixe SIGNARE

Toute image d'inspiration inclut automatiquement ce socle fixe (non modifiable) :

> "Tenue traditionnelle sénégalaise élégante, style premium SIGNARE, coupe moderne, photographie réaliste, éclairage doux de studio, fond neutre, haute qualité, mise en valeur des tissus et broderies"

Le prompt final est construit ainsi :
```
[SOCLE FIXE SIGNARE] + [genre/âge] + [événement] + [tissu] + [couleur]
```

## 🔒 Règles Strictes (Try-on)

- **1 image par job** (pas de regenerate)
- **Pas de multi-angle**
- **Pas de HD** (optimisation coûts)
- Validation préalable des jobs et crédits

## 📝 Notes Techniques

- **Aucune dépendance au frontend** : Le service ne connaît pas l'UI/UX
- **API pure** : Communication uniquement via HTTP/JSON
- **Séparation stricte** : Chaque service a une responsabilité unique
- **Production-ready** : Code maintenable, testable, remplaçable

## 🧪 Tests

```bash
# Test inspiration
curl -X POST http://localhost:8000/inspiration \
  -H "Content-Type: application/json" \
  -d '{
    "tissu": "wax premium",
    "evenement": "mariage",
    "genre_age": "femme",
    "couleur": "or"
  }'

# Test try-on
curl -X POST http://localhost:8000/tryon \
  -H "Content-Type: application/json" \
  -d '{
    "user_image_path": "/uploads/user.jpg",
    "garment_image_path": "/uploads/garment.jpg",
    "job_id": "test_001"
  }'
```

