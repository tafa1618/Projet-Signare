# 🗳️ Système de Vote - "Sagnsé de la semaine"

## Vue d'ensemble

Système de vote (likes) pour la compétition hebdomadaire "Sagnsé & Ndanane de la semaine". Le vote repose sur un système de likes simple, sécurisé et scalable.

## 📊 Modèle de données

### Tables

#### `competitions`
- `id` (UUID)
- `week_start` (DATE)
- `week_end` (DATE)
- `status` (active | closed)
- `created_at`, `updated_at`

#### `participations`
- `id` (UUID)
- `user_id` (UUID) → `auth.users`
- `competition_id` (UUID) → `competitions`
- `category` (HOMME | FEMME)
- `tailor_id` (UUID)
- `media_type` (PHOTOS | VIDEO)
- `media_urls` (TEXT[])
- `likes_count` (INTEGER, dénormalisé)
- `created_at`, `updated_at`

**Contraintes:**
- `UNIQUE (user_id, competition_id)` - Un utilisateur ne peut participer qu'une fois par compétition
- `CHECK (array_length(media_urls, 1) > 0)` - Au moins un média
- `CHECK (likes_count >= 0)` - Likes non négatif

#### `votes`
- `id` (UUID)
- `user_id` (UUID) → `auth.users`
- `participation_id` (UUID) → `participations`
- `created_at`

**Contraintes:**
- `UNIQUE (user_id, participation_id)` - Un utilisateur ne peut voter qu'une fois par participation

### Index

- `idx_votes_user_id` - Pour vérifier les votes d'un utilisateur
- `idx_votes_participation_id` - Pour compter les votes d'une participation
- `idx_participations_competition_category_likes` - Pour le classement (leaderboard)
- `idx_participations_user_id` - Pour les participations d'un utilisateur
- `idx_participations_tailor_id` - Pour les participations d'un tailleur

### Triggers PostgreSQL

#### `increment_participation_likes()`
- Déclenché après `INSERT` sur `votes`
- Incrémente automatiquement `likes_count` de la participation
- Atomique (transaction)

#### `decrement_participation_likes()`
- Déclenché après `DELETE` sur `votes`
- Décrémente automatiquement `likes_count` de la participation
- Atomique (transaction)

## 🔌 API Endpoints

### `POST /api/votes`

Créer un vote (like) pour une participation.

**Authentification:** Requise

**Payload:**
```json
{
  "participation_id": "uuid"
}
```

**Comportement:**
1. Vérifier l'authentification
2. Valider le payload (Zod)
3. Vérifier que la participation existe
4. Vérifier que la compétition est active
5. Vérifier que l'utilisateur n'a pas déjà voté
6. Créer le vote (trigger incrémente `likes_count`)
7. Retourner le nouveau `likes_count`

**Réponse:**
```json
{
  "success": true,
  "vote_id": "uuid",
  "likes_count": 42,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Codes d'erreur:**
- `401` - Authentification requise
- `400` - Données invalides / Compétition inactive / Déjà voté
- `404` - Participation introuvable
- `500` - Erreur serveur

### `DELETE /api/votes/[participation_id]`

Supprimer un vote (unlike) pour une participation.

**Authentification:** Requise

**Comportement:**
1. Vérifier l'authentification
2. Valider l'UUID
3. Vérifier que le vote existe et appartient à l'utilisateur
4. Supprimer le vote (trigger décrémente `likes_count`)
5. Retourner le nouveau `likes_count`
6. Idempotent (retourne 200 même si le vote n'existe pas)

**Réponse:**
```json
{
  "success": true,
  "likes_count": 41
}
```

**Codes d'erreur:**
- `401` - Authentification requise
- `400` - ID invalide
- `500` - Erreur serveur

### `GET /api/participations/[id]`

Récupérer les détails d'une participation.

**Authentification:** Optionnelle (pour `has_user_voted`)

**Réponse:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "competition_id": "uuid",
  "category": "FEMME",
  "tailor_id": "uuid",
  "media_type": "PHOTOS",
  "media_urls": ["url1", "url2"],
  "likes_count": 42,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "has_user_voted": true
}
```

### `GET /api/competitions/[id]/leaderboard`

Récupérer le classement (Top 10) par catégorie.

**Authentification:** Non requise (lecture publique)

**Réponse:**
```json
{
  "competition_id": "uuid",
  "competition_status": "active",
  "leaderboard": {
    "HOMME": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "category": "HOMME",
        "tailor_id": "uuid",
        "media_type": "PHOTOS",
        "media_urls": ["url1"],
        "likes_count": 150,
        "created_at": "2024-01-15T10:30:00Z"
      },
      // ... Top 10
    ],
    "FEMME": [
      // ... Top 10
    ]
  },
  "tailor_winner": {
    "tailor_id": "uuid",
    "participation_id": "uuid",
    "likes_count": 150
  }
}
```

**Stratégie "Tailleur de la semaine":**
- Configurable côté backend: `STRATEGY_TAILOR_WINNER`
- `max_likes` (défaut): Participation avec le plus de likes
- `cumulative`: Cumul des likes par `tailor_id`

## 🔒 Sécurité

### Règles de vote

1. ✅ **Un utilisateur peut liker plusieurs participations**
2. ✅ **Un utilisateur ne peut liker qu'une fois la même participation** (contrainte UNIQUE)
3. ✅ **Seuls les utilisateurs authentifiés peuvent voter**
4. ✅ **Un vote = un like**
5. ✅ **La compétition doit être active** pour voter

### Protection

- **Double vote:** Contrainte UNIQUE `(user_id, participation_id)` + vérification préalable
- **Race condition:** Contrainte UNIQUE capture les votes simultanés
- **Spam:** Rate limiting à implémenter (TODO)
- **Ownership:** RLS Supabase + vérification dans DELETE
- **Validation:** Zod pour tous les inputs
- **Logging:** Toutes les tentatives suspectes sont loggées

### Row Level Security (RLS)

- **competitions:** Lecture publique
- **participations:** Lecture publique, écriture authentifiée
- **votes:** Lecture/écriture authentifiée uniquement

## 📈 Performance

### Index optimisés

- Recherche de votes existants: `idx_votes_user_id` + `idx_votes_participation_id`
- Classement par catégorie: `idx_participations_competition_category_likes`
- Comptage de likes: Dénormalisé dans `likes_count` (mis à jour atomiquement)

### Transactions atomiques

- Incrémentation/décrémentation de `likes_count` via triggers PostgreSQL
- Pas de race condition possible grâce aux contraintes UNIQUE

## 🚀 Migration SQL

```bash
psql -U postgres -d signare < supabase-migrations/003_create_competitions_voting.sql
```

## 📝 TODO

- [ ] Implémenter rate limiting pour anti-spam
- [ ] Ajouter authentification réelle (remplacer `x-user-id`)
- [ ] Tests unitaires essentiels
- [ ] Documentation des stratégies "Tailleur de la semaine"

