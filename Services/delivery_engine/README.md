# SIGNARE Delivery Engine (FastAPI) - Modèle Yango

Micro-service indépendant pour le calcul de prix de livraison selon le **modèle Yango**.

## 🎯 Modèle de Calcul

Le service calcule les prix selon la formule Yango :

```
Prix de base : 1500 FCFA
Coût kilométrique : 100 FCFA/km
Sous-total = 1500 + (distance_km × 100)
Frais SIGNARE : 15% du sous-total
Prix total = Sous-total + Frais SIGNARE
```

**Exemple :** Pour une livraison de 5 km
- Prix de base : 1500 FCFA
- Coût kilométrique : 5 × 100 = 500 FCFA
- Sous-total : 2000 FCFA
- Frais SIGNARE (15%) : 300 FCFA
- **Prix total : 2300 FCFA**

## ⚠️ Zone de Livraison

**Livraison uniquement disponible à Dakar, Sénégal.**

Le service valide automatiquement que les coordonnées GPS (origine et destination) sont dans les limites de Dakar :
- **Latitude** : 14.60° à 14.85° (Sud vers Nord)
- **Longitude** : -17.55° à -17.35° (Ouest vers Est)

**Pour les clients internationaux ou hors Dakar :** Une autre stratégie de livraison sera utilisée (non gérée par ce service).

## 🚀 Démarrage rapide

```bash
cd Services/delivery_engine
python -m venv .venv
source .venv/bin/activate  # sous Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn delivery_engine.app.main:app --reload --host 0.0.0.0 --port 8001
```

## ⚙️ Configuration

Variables d'environnement (optionnelles, valeurs par défaut) :
- `BASE_PRICE` : Prix de base en FCFA (défaut: 1500)
- `PRICE_PER_KM` : Prix par kilomètre en FCFA (défaut: 100)
- `SIGNARE_FEE_PERCENT` : Pourcentage de frais SIGNARE (défaut: 0.15 = 15%)

Créer un fichier `.env` :
```env
BASE_PRICE=1500
PRICE_PER_KM=100
SIGNARE_FEE_PERCENT=0.15
```

## 📡 Endpoints

### `POST /api/shipping/calculate`

Calcule le prix de livraison. Accepte soit une distance, soit des coordonnées GPS.

**Option 1 : Avec distance**
```json
{
  "distance_km": 5.5
}
```

**Option 2 : Avec coordonnées GPS**
```json
{
  "origin": { "lat": 14.7167, "lng": -17.4677 },
  "destination": { "lat": 14.6928, "lng": -17.4467 }
}
```

**Réponse :**
```json
{
  "distance_km": 5.5,
  "base_price": 1500.0,
  "distance_cost": 550.0,
  "subtotal": 2050.0,
  "signare_fee": 307.5,
  "total_price": 2357.5,
  "currency": "FCFA"
}
```

### `GET /health`

Vérifie que le service est opérationnel.

**Réponse :**
```json
{
  "status": "ok",
  "service": "SIGNARE Delivery Engine",
  "version": "2.0.0",
  "model": "Yango"
}
```

## 📚 Documentation Interactive

Swagger UI : `http://localhost:8001/docs`

## 🐳 Docker

```bash
cd Services/delivery_engine
docker build -t signare-delivery-engine .
docker run --rm -p 8001:8001 signare-delivery-engine
```

## 🏗️ Architecture

- **Stack** : Python 3.11+, FastAPI, Pydantic
- **Structure** : Microservice autonome, facile à déployer
- **Sécurité** : Validation stricte des entrées (Pydantic)
- **CORS** : Ouvert par défaut (à restreindre en production)

## 🔗 Intégration

Le service peut être appelé depuis :
- Frontend Next.js (via API route proxy)
- Application mobile React Native
- Partenaires externes (API Gateway)

**Exemple d'appel depuis Next.js :**
```typescript
const response = await fetch('http://localhost:8001/api/shipping/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    distance_km: 5.5
  })
})
```

## 📝 Notes

- Distance maximale autorisée : 500 km (validation côté serveur)
- Calcul de distance GPS : Formule Haversine
- Tous les prix sont arrondis à 2 décimales
- Le service est stateless (pas de session)

