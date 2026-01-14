# SIGNARE Measurements Microservice

Microservice IA autonome pour la prise de mesures corporelles (manuelles et automatiques).

## 🎯 Rôle

Ce microservice est le seul responsable de :
- La validation des mesures manuelles
- L'orchestration du pipeline IA pour les scans automatiques
- Le calcul géométrique des mesures à partir de meshes 3D
- La gestion des règles business (1 scan gratuit, puis payants)

## 🏗️ Architecture

```
Services/Signare_Measurements/
├── app/
│   ├── main.py                 # Point d'entrée FastAPI
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   └── constants.py       # Constantes (plages, modèles, etc.)
│   ├── schemas/
│   │   └── measurements.py   # Schémas Pydantic
│   ├── services/
│   │   ├── validation_service.py      # Validation des mesures
│   │   ├── geometric_service.py      # Calcul géométrique
│   │   └── measurement_service.py   # Service principal
│   ├── adapters/
│   │   ├── mock_adapter.py           # Adapter mock (dev)
│   │   └── replicate_adapter.py      # Adapter Replicate (prod)
│   └── api/
│       └── routes.py          # Endpoints API
├── requirements.txt
├── .env.example
└── README.md
```

## 🔧 Installation

```bash
cd Services/Signare_Measurements
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## ⚙️ Configuration

Copier `.env.example` vers `.env` et configurer :

```bash
# Mode développement (mock)
AI_MODE=mock

# Mode production (Replicate)
AI_MODE=replicate
REPLICATE_API_TOKEN=your_token_here
```

## 🚀 Lancement

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

Documentation API : `http://localhost:8003/docs`

## 📡 Endpoints

### POST `/api/v1/measurements/manual`

Mesures manuelles saisies par l'utilisateur.

**Body:**
```json
{
  "chest": 101,
  "waist": 89,
  "hips": 99,
  "shoulders": 45,
  "arm_length": 61,
  "leg_length": 103
}
```

**Response:**
```json
{
  "method": "manual",
  "measurements": { ... },
  "confidence": "exact",
  "precision_cm": "+/- 0.5",
  "version": 1
}
```

### POST `/api/v1/measurements/scan`

Scan automatique par IA.

**Body:**
```json
{
  "user_id": "user-123",
  "front_image_url": "https://...",
  "side_image_url": "https://...",
  "is_paid": false
}
```

**Response:**
```json
{
  "method": "scan",
  "measurements": { ... },
  "confidence": "estimated",
  "precision_cm": "+/- 1.5",
  "version": 1,
  "disclaimer": "Mesures estimées par IA – validation recommandée..."
}
```

## 🔬 Pipeline IA (Production)

1. **Pose Estimation** (ControlNet OpenPose)
   - Détection des points clés du corps

2. **Segmentation** (SAM2 / MediaPipe)
   - Isolation de la silhouette corporelle

3. **Reconstruction 3D** (Human Mesh Recovery)
   - Génération d'un mesh 3D du corps

4. **Calcul Géométrique**
   - Calcul des mesures à partir du mesh 3D

## 📊 Format de Sortie Standard

Toutes les mesures sont retournées dans le même format :

```json
{
  "method": "manual | scan",
  "measurements": {
    "chest": 101,
    "waist": 89,
    "hips": 99,
    "neck": 38,
    "shoulders": 45,
    "arm_length": 61,
    "thigh": 58,
    "biceps": 32,
    "leg_length": 103
  },
  "confidence": "exact | estimated",
  "precision_cm": "+/- 0.5 | +/- 1.5",
  "version": 1,
  "disclaimer": "..." // Uniquement pour les scans IA
}
```

## 🧪 Mode Développement (Mock)

En mode `AI_MODE=mock` :
- ✅ Génère des mesures réalistes
- ✅ Simule un délai de traitement (1-2 secondes)
- ✅ Retourne le même format que la production
- ❌ N'utilise pas Replicate
- ❌ N'utilise pas de GPU

## 🚀 Mode Production (Replicate)

En mode `AI_MODE=replicate` :
- ✅ Utilise Replicate pour tous les modèles IA
- ✅ Exécute le pipeline complet (pose, segmentation, 3D)
- ✅ Calcul géométrique local (NumPy/SciPy)
- ❌ Aucune logique IA locale

## 📋 Règles Business

- **1 scan gratuit** par utilisateur
- Scans suivants **payants** (`is_paid=true`)
- Validation des plages réalistes pour les mesures manuelles
- Normalisation automatique en cm

## 🔒 Sécurité & Transparence

- Toutes les mesures automatiques incluent un disclaimer
- Précision clairement indiquée (+/- 1.5 cm pour les scans)
- Validation stricte des entrées
- Logs détaillés pour traçabilité

## 📝 Notes Techniques

- **Calcul géométrique** : Utilise NumPy/SciPy pour les calculs sur meshes 3D
- **Unités** : Toutes les mesures sont en cm
- **Versioning** : Format de sortie versionné pour compatibilité future
- **Stateless** : Le service est stateless (pas de session)

## 🐛 Développement

Pour tester en mode mock :

```bash
curl -X POST http://localhost:8003/api/v1/measurements/scan \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "front_image_url": "https://example.com/image.jpg",
    "is_paid": false
  }'
```

## 📚 Références

- [Replicate API](https://replicate.com/docs)
- [SMPL Model](https://smpl.is.tue.mpg.de/)
- [MediaPipe](https://mediapipe.dev/)

