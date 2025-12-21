# 🤖 SIGNARE - Guide Complet ML-Ready

## 📋 Vue d'Ensemble

SIGNARE est maintenant **100% structuré pour collecter des données d'entraînement IA de qualité**. Chaque interaction utilisateur est capturée, chaque image est enrichie de métadonnées, et toutes les données sont prêtes à être exportées pour l'entraînement de vos modèles.

---

## 🗂️ Fichiers Créés

### 📊 Schema & Types
- **`supabase-schema-ml-ready.sql`** - Schema SQL complet avec 11 tables enrichies ML
- **`shared/types/database.types.ts`** - Types TypeScript à jour

### 🔧 Backend Services
- **`backend/services/ml-collection.ts`** - Services de collecte de données :
  - `InteractionTracker` - Tracking des interactions
  - `SearchTracker` - Tracking des recherches
  - `AnnotationService` - Annotations manuelles
  - `RoleScoreService` - Mise à jour des scores
  - `VisualMetadataExtractor` - Extraction features visuelles

### 🎨 Frontend Hooks
- **`frontend/hooks/useTracking.ts`** - Hooks de tracking automatique :
  - `useTrackPostView` - Tracker les vues
  - `useTrackScrollDepth` - Tracker le scroll
  - `useTrackSearch` - Tracker les recherches
  - `usePostEngagement` - Tracker l'engagement complet
  - `useSessionTracking` - Tracker les sessions

### 📚 Documentation
- **`docs/TABLES_ML_SUPABASE.md`** - Liste complète des tables à créer
- **`docs/EXPORT_DATASETS_GUIDE.md`** - Guide d'export des datasets

---

## ✅ Étapes à Suivre

### 1. Créer les Tables sur Supabase

```bash
# Via SQL Editor Supabase
1. Ouvrir https://supabase.com/dashboard
2. Aller dans "SQL Editor"
3. Copier tout le contenu de "supabase-schema-ml-ready.sql"
4. Cliquer sur "Run"
5. Vérifier que les 11 tables sont créées
```

**Tables créées :**
1. ✅ `profiles` (enrichi)
2. ✅ `posts` (enrichi)
3. ✅ `post_annotations`
4. ✅ `user_interactions`
5. ✅ `search_queries`
6. ✅ `fabric_library`
7. ✅ `pattern_library`
8. ✅ `mesures` (enrichi)
9. ✅ `orders` (enrichi)
10. ✅ `inspirations` (enrichi)
11. ✅ `ml_training_datasets`

### 2. Intégrer le Tracking dans l'App

#### Exemple : Page de Post

```typescript
// app/post/[id]/page.tsx
'use client'

import { usePostEngagement } from '@/frontend/hooks/useTracking'
import { useAuth } from '@/frontend/hooks/useAuth'

export default function PostPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const {
    scrollDepth,
    timeSpent,
    trackLike,
    trackSave,
    trackInquiry,
  } = usePostEngagement(params.id, user?.id || null)

  const handleLike = async () => {
    await trackLike()
    // ... logique de like
  }

  return (
    <div>
      {/* Votre UI */}
      <button onClick={handleLike}>❤️ Like</button>
    </div>
  )
}
```

#### Exemple : Barre de Recherche

```typescript
// components/SearchBar.tsx
'use client'

import { useTrackSearch } from '@/frontend/hooks/useTracking'
import { useState } from 'react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const { trackSearch, trackSearchClick } = useTrackSearch()

  const handleSearch = async () => {
    const results = await fetchResults(query)
    await trackSearch(query, results.length, user?.id)
  }

  const handlePostClick = async (postId: string) => {
    await trackSearchClick(postId)
    // ... navigation
  }

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
    />
  )
}
```

### 3. Collecter les Données (3-6 mois)

**Ce qui sera automatiquement collecté :**
- ✅ Chaque vue de post (durée, scroll depth)
- ✅ Chaque like/save/share
- ✅ Chaque recherche (query + clics)
- ✅ Chaque création de post
- ✅ Chaque commande (ratings, feedback)
- ✅ Chaque génération IA (prompt + rating)
- ✅ Sessions utilisateurs (durée, activité)

### 4. Enrichir avec Annotations Manuelles

**Créer une interface d'annotation simple:**

```typescript
// app/admin/annotate/page.tsx
import { AnnotationService } from '@/backend/services/ml-collection'

async function AnnotationPage() {
  const posts = await AnnotationService.getUnannotatedPosts(20)

  return (
    <div>
      {posts.map(post => (
        <AnnotationForm key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### 5. Exporter les Datasets

**Après 3-6 mois de collecte :**

```bash
# Option 1 : Via Python
python export_dataset.py

# Option 2 : Via Node.js
npx ts-node export-dataset.ts

# Option 3 : Via SQL Editor (copier/coller requêtes du guide)
```

### 6. Entraîner vos Modèles

**Modèles possibles :**
- 🖼️ **Classification CNN** : Classifier les types de vêtements
- 🎯 **Object Detection** : Détecter broderies, perles, accessoires
- 🔍 **Recherche Sémantique** : Améliorer le moteur de recherche
- 💡 **Recommandation** : Système de recommandation personnalisé
- 🎨 **Génération** : Fine-tuning Stable Diffusion
- 📏 **Prédiction Tailles** : Recommander la bonne taille
- 💬 **Sentiment Analysis** : Analyser les feedbacks

---

## 📊 Métriques Collectées

### Par Post
- Views, Likes, Saves, Shares
- Durée moyenne de vue
- Scroll depth moyen
- Taux de conversion (vue → achat)
- Nombre de demandes

### Par User
- role_score (0-100)
- style_preferences (JSONB)
- Total posts créés
- Total achats
- Durée moyenne de session
- Dernière activité

### Visuelles (Auto-extraites)
- Couleurs dominantes
- Palette de couleurs
- Dimensions (width, height, ratio)
- Brightness & contrast

### Annotations Manuelles
- Labels vérifiés
- Bounding boxes
- Scores de qualité

---

## 🎯 Objectifs par Phase

### Phase 1 : Collection (Mois 0-6)
- ✅ Créer les tables Supabase
- ✅ Intégrer le tracking dans l'app
- ✅ Encourager les annotations
- 🎯 **Objectif :** 10,000+ interactions, 1,000+ posts annotés

### Phase 2 : Préparation (Mois 6-9)
- ✅ Exporter les datasets
- ✅ Nettoyer les données
- ✅ Split train/val/test
- 🎯 **Objectif :** 3 datasets propres et équilibrés

### Phase 3 : Training (Mois 9-12)
- ✅ Entraîner modèles baselines
- ✅ Hyperparameter tuning
- ✅ Évaluation et benchmarking
- 🎯 **Objectif :** 80%+ accuracy sur validation

### Phase 4 : Production (Mois 12+)
- ✅ Déployer les modèles
- ✅ A/B testing
- ✅ Feedback loop
- 🎯 **Objectif :** Amélioration continue

---

## 🔥 Quick Start

### 1️⃣ Créer les Tables
```bash
# Copier supabase-schema-ml-ready.sql dans SQL Editor
```

### 2️⃣ Tester le Tracking
```typescript
// Dans n'importe quelle page
import { usePostEngagement } from '@/frontend/hooks/useTracking'

const { trackLike } = usePostEngagement(postId, userId)
await trackLike()
```

### 3️⃣ Vérifier les Données
```sql
-- Voir les interactions collectées
SELECT * FROM user_interactions ORDER BY created_at DESC LIMIT 100;

-- Voir les posts avec le plus d'engagement
SELECT 
  p.id,
  p.garment_type,
  p.likes_count,
  p.views_count,
  p.conversion_rate
FROM posts p
ORDER BY p.views_count DESC
LIMIT 20;
```

---

## 📈 KPIs à Suivre

### Quantité de Données
- **Posts :** Objectif 1,000+ dans 6 mois
- **Interactions :** Objectif 10,000+ dans 6 mois
- **Annotations :** Objectif 500+ posts annotés
- **Users actifs :** Objectif 100+ users

### Qualité de Données
- **Posts annotés :** > 50%
- **Images haute qualité :** > 80% (score >= 3)
- **Interactions valides :** > 90% (durée > 3s)
- **Taux d'annotation :** > 10 annotations/jour

### Engagement
- **Durée session :** Objectif 5+ minutes
- **Posts/user :** Objectif 2+ posts/créateur
- **Interactions/user :** Objectif 20+ interactions/user
- **Taux de conversion :** Objectif 2-5%

---

## 🚀 Prochaines Étapes

1. **MAINTENANT :** Créer les tables sur Supabase
2. **SEMAINE 1 :** Intégrer le tracking dans les pages clés
3. **MOIS 1 :** Créer l'interface d'annotation
4. **MOIS 3 :** Premiers exports de test
5. **MOIS 6 :** Premier dataset complet
6. **MOIS 9 :** Premier modèle en production
7. **MOIS 12 :** Amélioration continue avec feedback loop

---

## 📞 Support

**Documentation :**
- `docs/TABLES_ML_SUPABASE.md` - Détails des tables
- `docs/EXPORT_DATASETS_GUIDE.md` - Guide d'export
- `docs/DATA_ARCHITECTURE.md` - Architecture générale

**Code :**
- `backend/services/ml-collection.ts` - Services backend
- `frontend/hooks/useTracking.ts` - Hooks frontend
- `supabase-schema-ml-ready.sql` - Schema SQL

---

**🎉 SIGNARE est maintenant une machine à données ML ! Bon entraînement ! 🤖**

