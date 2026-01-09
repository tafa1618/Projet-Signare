# SIGNARE AI Microservice

Microservice IA autonome pour l'inspiration visuelle et le try-on (essayage virtuel).

## 📋 Table des matières

- [Architecture](#-architecture)
- [Configuration](#-configuration)
- [Installation](#-installation)
- [Démarrage](#-démarrage)
- [Endpoints API](#-endpoints-api)
- [Structure du Code](#-structure-du-code)
- [Socle Fixe SIGNARE](#-socle-fixe-signare)
- [Déploiement Docker](#-déploiement-docker)
- [Tests](#-tests)
- [Troubleshooting](#-troubleshooting)

## 🎯 Architecture

Ce microservice est **totalement indépendant** du frontend. Il reçoit uniquement des requêtes structurées via API HTTP et retourne des résultats exploitables.

### Capacités

1. **Inspiration visuelle IA** : Génération d'images d'inspiration à partir de tags structurés
2. **Try-on IA** : Essayage virtuel (utilisateur + vêtement → résultat)

### Principes de Design

- 🔌 **API Pure** : Communication uniquement via HTTP/JSON
- 🧩 **Séparation stricte** : Chaque service a une responsabilité unique
- 🔄 **Mode Mock/Prod** : Basculement via variable d'environnement uniquement
- 🚀 **Production-ready** : Code maintenable, testable, remplaçable
- 🎯 **Zero Frontend Dependency** : Aucune connaissance de l'UI/UX

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

## 🐳 Déploiement Docker

### Avec Docker Compose (Recommandé)

```bash
# Créer le fichier .env
cp env.example .env
# Éditer .env avec vos configurations

# Démarrer le service
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter le service
docker-compose down
```

### Avec Docker seul

```bash
# Build l'image
docker build -t signare-ai .

# Lancer le container
docker run -d \
  -p 8000:8000 \
  -e AI_MODE=mock \
  -e REPLICATE_API_TOKEN=your_token \
  --name signare-ai \
  signare-ai
```

## 🧪 Tests

### Test avec cURL

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

### Test avec Python

```python
import requests

# Test inspiration
response = requests.post(
    "http://localhost:8000/inspiration",
    json={
        "tissu": "bazin getzner premium",
        "evenement": "tabaski",
        "genre_age": "homme adulte",
        "couleur": "blanc"
    }
)
print(response.json())

# Test try-on
response = requests.post(
    "http://localhost:8000/tryon",
    json={
        "user_image_path": "/uploads/user_123.jpg",
        "garment_image_path": "/uploads/garment_456.jpg",
        "job_id": "tryon_20250109_001"
    }
)
print(response.json())
```

### Documentation Interactive (Swagger)

Une fois le service démarré, accédez à la documentation interactive :

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🔍 Troubleshooting

### Le service ne démarre pas

1. **Vérifier les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

2. **Vérifier les variables d'environnement** :
   ```bash
   echo $AI_MODE
   echo $REPLICATE_API_TOKEN  # Requis uniquement en mode replicate
   ```

3. **Vérifier le port** :
   ```bash
   # Vérifier si le port 8000 est libre
   netstat -an | grep 8000
   ```

### Erreurs en mode Replicate

1. **Token invalide** :
   - Vérifier que `REPLICATE_API_TOKEN` est correct
   - Vérifier que le token a les permissions nécessaires

2. **Modèle non disponible** :
   - Vérifier que les modèles Replicate sont accessibles
   - Mettre à jour les IDs de modèles dans `replicate_service.py` si nécessaire

### Erreurs de pré-traitement (Try-on)

1. **Images introuvables** :
   - Vérifier que les chemins d'images sont corrects
   - Vérifier les permissions de lecture des fichiers

2. **Format d'image invalide** :
   - S'assurer que les images sont au format JPG/PNG
   - Vérifier la taille des images (max recommandé : 2048x2048)

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8000/
```

Réponse attendue :
```json
{
  "service": "SIGNARE AI Microservice",
  "status": "running",
  "mode": "mock"
}
```

### Logs

Les logs sont affichés dans la console. En production, rediriger vers un système de logging :

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --log-config logging.conf
```

## 🔐 Sécurité

### Recommandations Production

1. **Restreindre CORS** :
   - Modifier `allow_origins` dans `main.py` pour limiter les domaines autorisés

2. **Authentification** :
   - Ajouter un middleware d'authentification si nécessaire
   - Utiliser des tokens API pour sécuriser les endpoints

3. **Rate Limiting** :
   - Implémenter un rate limiter pour éviter les abus
   - Utiliser `slowapi` ou `fastapi-limiter`

4. **Validation des inputs** :
   - Les validations Pydantic sont déjà en place
   - Ajouter des validations supplémentaires si nécessaire

## 🚀 Roadmap

- [ ] Implémentation complète du pré-traitement (segmentation, pose estimation)
- [ ] Cache des résultats pour optimiser les coûts
- [ ] Système de queue pour les jobs asynchrones
- [ ] Métriques et monitoring avancés
- [ ] Support de batch processing
- [ ] Webhooks pour notifications de completion

## 📝 License

Propriétaire - SIGNARE © 2024

## 👥 Contribution

Ce microservice fait partie de l'écosystème SIGNARE. Pour toute modification, contacter l'équipe backend.

