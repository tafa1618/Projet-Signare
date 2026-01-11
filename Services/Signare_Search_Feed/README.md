# 🔍 SIGNARE Search, Feed & Recommendation Engine

Microservice autonome pour la recherche, le feed personnalisé et les recommandations.

## 🎯 Objectif

Moteur de recherche, feed et recommandation **stateless**, **scalable** et **orienté conversion** pour SIGNARE.

## 📋 Principes

- **Stateless** : Aucune session, tout est dans la requête
- **Read Model** : Données synchronisées depuis le backend métier
- **ML Ready** : Structure préparée pour embeddings et ML
- **Orienté Conversion** : Search et Feed optimisés pour l'achat
- **Cold Start** : Stratégies de fallback robustes
- **Séparation stricte** : Aucune dépendance au frontend ou au backend métier

## 🏗️ Architecture

```
Signare_Search_Feed/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── core/
│   │   ├── config.py        # Configuration
│   │   └── database.py      # Connexions DB
│   ├── models/
│   │   └── feed.py          # Modèles SQLAlchemy (Read Model)
│   ├── schemas/
│   │   ├── feed.py          # Pydantic schemas Feed
│   │   ├── search.py        # Pydantic schemas Search
│   │   ├── recommendation.py # Pydantic schemas Recommendation
│   │   └── tracking.py      # Pydantic schemas Tracking
│   ├── services/
│   │   └── feed_service.py  # Logique de génération Feed
│   ├── repositories/
│   │   └── item_repository.py # Accès items
│   └── api/
│       └── routes/
│           ├── feed.py      # /feed endpoint ✅
│           ├── search.py    # /search endpoint (à implémenter)
│           ├── recommend.py # /recommend endpoint (à implémenter)
│           └── track.py     # /track endpoint ✅
├── migrations/
│   └── 001_initial_schema.sql # Migration SQL initiale
├── requirements.txt
├── Dockerfile
├── HYPOTHESES.md            # Hypothèses et choix architecturaux
└── .env.example
```

## 🚀 Installation

```bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Créer la base de données
psql -U postgres -d signare_search_feed < migrations/001_initial_schema.sql

# Lancer le service
uvicorn app.main:app --reload --port 8000
```

## 📡 Endpoints

### `POST /api/v1/feed`

Génère un feed personnalisé structuré par sections.

**Request:**
```json
{
  "user_context": {
    "user_id": "user123",
    "interaction_count": 10,
    "preferred_price_range": [5000, 50000],
    "preferred_categories": ["boubou", "robe"],
    "recent_item_ids": ["item1", "item2"]
  },
  "device_context": {
    "device_type": "mobile"
  },
  "location_context": {
    "city": "Dakar",
    "country": "SN"
  },
  "max_sections": 6,
  "items_per_section": 10
}
```

**Response:**
```json
{
  "feed_id": "uuid",
  "generated_at": "2024-01-01T00:00:00Z",
  "sections": [
    {
      "type": "personalized",
      "title": "Pour vous",
      "strategy": "content_similarity",
      "items": [...]
    },
    {
      "type": "trending",
      "title": "Tendances",
      "strategy": "popularity_and_recency",
      "items": [...]
    }
  ],
  "total_items": 60
}
```

### `POST /api/v1/search`

Recherche hybride (sémantique + mots-clés) orientée conversion.

**Request:**
```json
{
  "query": "boubou traditionnel",
  "filters": {
    "category": "boubou",
    "min_price": 10000,
    "max_price": 50000,
    "color": "blanc",
    "availability": true
  },
  "context": {
    "user_id": "user123",
    "device_type": "mobile",
    "location": {
      "city": "Dakar",
      "country": "SN"
    }
  },
  "max_results": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "query": "boubou traditionnel",
  "total_results": 45,
  "items": [
    {
      "id": "item123",
      "title": "Boubou traditionnel brodé",
      "description": "...",
      "image_url": "...",
      "price": 35000,
      "tailor_id": "tailor456",
      "tailor_name": "Maison Aïda",
      "tailor_rating": 4.8,
      "rating": 4.5,
      "availability": true,
      "created_at": "2024-01-01T00:00:00Z",
      "relevance_score": 0.85,
      "business_score": 0.92,
      "final_score": 0.892
    }
  ],
  "suggestions": ["boubou traditionnel mariage", "boubou traditionnel bazin"],
  "filters_applied": {...},
  "search_id": "uuid"
}
```

**Fonctionnalités:**
- Recherche par mots-clés (titre, description)
- Filtres structurés (catégorie, prix, couleur, disponibilité)
- Ranking hybride (similarité sémantique 40% + signaux business 60%)
- Orientation conversion (favorise récence, qualité tailleur, performance)
- Suggestions de recherche

### `GET /api/v1/search/suggestions`

Récupère des suggestions de recherche basées sur la requête.

### `POST /api/v1/recommend`

Recommandations contextuelles basées sur le contexte utilisateur ou item.

**Request (basé sur utilisateur):**
```json
{
  "user_context": {
    "user_id": "user123",
    "recent_item_ids": ["item1", "item2", "item3"],
    "interaction_count": 15
  },
  "max_results": 20,
  "diversify": true
}
```

**Request (items similaires):**
```json
{
  "item_context": {
    "item_id": "item123",
    "category": "boubou",
    "price_range": [20000, 50000]
  },
  "max_results": 20,
  "diversify": true
}
```

**Response:**
```json
{
  "items": [
    {
      "id": "item456",
      "title": "Boubou traditionnel",
      "image_url": "...",
      "price": 35000,
      "tailor_id": "tailor789",
      "tailor_name": "Maison Aïda",
      "rating": 4.5,
      "relevance_score": 0.85,
      "recommendation_reason": "Basé sur vos préférences • Très populaire • Tailleur de qualité"
    }
  ],
  "strategy_used": "content-based",
  "total_results": 20
}
```

**Stratégies:**
- `content-based` : Basé sur l'historique et préférences utilisateur
- `similarity` : Items similaires à un item donné
- `fallback` : Trending + New Arrivals si contexte insuffisant
- `content-based+fallback` : Combinaison des deux

### `POST /api/v1/track`

Enregistre des événements utilisateur **et met à jour automatiquement les signaux business**.

**Request:**
```json
{
  "events": [
    {
      "event_type": "view_item",
      "entity_id": "item123",
      "user_id": "user123",
      "session_id": "session456",
      "context": {}
    },
    {
      "event_type": "click",
      "entity_id": "item123",
      "user_id": "user123",
      "session_id": "session456",
      "context": {}
    }
  ]
}
```

**Mise à jour automatique des compteurs** :
- `view_item` → Incrémente `view_count`
- `click` → Incrémente `click_count`
- `add_to_cart` → Incrémente `click_count`
- `purchase` → Incrémente `purchase_count`

**Les mises à jour sont atomiques** pour garantir la cohérence.

### `GET /api/v1/track/item/{item_id}/stats`

Récupère les statistiques d'un item (view_count, click_count, purchase_count, conversion_rate).

## 🔄 Synchronisation des Données (Read Model)

Le microservice maintient un **Read Model** séparé du backend métier.

**Stratégies de synchronisation** (à implémenter):

1. **Batch Sync** : Script cron qui synchronise les données périodiquement
2. **Webhooks** : Le backend métier envoie des webhooks lors des mises à jour
3. **Event Sourcing** : Consommation d'événements depuis un bus d'événements

## 📊 Structure du Feed

Le feed est composé de **sections déclaratives** :

- `personalized` : Basé sur similarité utilisateur
- `trending` : Popularité locale et récence
- `similar_content` : Similarité avec items récemment vus
- `new_arrivals` : Nouveautés
- `budget_based` : Filtrage par gamme de prix
- `fallback` : Contenu par défaut si données insuffisantes

## ❄️ Gestion du Cold Start

- **Nouvel utilisateur** : Trending + New Arrivals + Budget populaire
- **Utilisateur peu actif** : Faible personnalisation, forte diversité
- **Utilisateur actif** : Personnalisation dominante, exploration 20-30%

## 🔍 Deep Search Orienté Conversion

Le ranking des résultats prend en compte :

- Similarité sémantique (40%)
- Récence des modèles (30%)
- Qualité/talent du tailleur (20%)
- Performance historique (20%)
- Disponibilité (15%)
- Cohérence du prix (15%)

**La similarité sémantique n'est pas dominante.**

## 📚 Documentation

Voir `HYPOTHESES.md` pour les hypothèses et choix architecturaux.

## 🐳 Docker

```bash
docker build -t signare-search-feed .
docker run -p 8000:8000 --env-file .env signare-search-feed
```

## ✅ Statut d'Implémentation

- ✅ Architecture de base
- ✅ Modèles de données
- ✅ Endpoint `/feed` (version minimale)
- ✅ Endpoint `/track`
- ✅ Endpoint `/search` (recherche hybride orientée conversion)
- ✅ Endpoint `/recommend` (recommandations contextuelles)
  - ✅ Content-based (basé sur historique utilisateur)
  - ✅ Similarity (items similaires)
  - ✅ Fallback anti-cold-start
  - ✅ Diversification automatique
  - ✅ Raisons de recommandation explicables
- ⏳ Intégration FAISS pour vector search
- ⏳ Synchronisation des données depuis le backend métier
