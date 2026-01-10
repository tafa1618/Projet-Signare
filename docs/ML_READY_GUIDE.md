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

### 🤖 Microservice IA
- **`Services/Signare_AI/`** - Microservice IA autonome :
  - `main.py` - API FastAPI (endpoints `/inspiration`, `/tryon`)
  - `inspiration_service.py` - Génération d'inspiration visuelle
  - `tryon_service.py` - Essayage virtuel (try-on)
  - `replicate_service.py` - Intégration Replicate (production)
  - `mock_service.py` - Mode développement (mock)
  - **Mode mock/prod** : Basculement via `AI_MODE` (variable d'environnement)

### 🎨 Frontend Hooks
- **`frontend/hooks/useTracking.ts`** - Hooks de tracking automatique :
  - `useTrackPostView` - Tracker les vues
  - `useTrackScrollDepth` - Tracker le scroll
  - `useTrackSearch` - Tracker les recherches
  - `usePostEngagement` - Tracker l'engagement complet
  - `useSessionTracking` - Tracker les sessions
- **`hooks/useAIService.ts`** - Hook pour communiquer avec le microservice IA :
  - `generateInspiration` - Génération d'inspiration (tags → image)
  - `generateTryOn` - Essayage virtuel (photo + modèle → résultat)

### 🏷️ Constantes & Types
- **`shared/constants/ai-tags.ts`** - Tags normalisés pour l'IA :
  - `FABRIC_TAGS` - Tissus (wax, getzner, bazin, soie, coton)
  - `EVENT_TAGS` - Événements (tabaski, mariage, baptême, etc.)
  - `GENDER_TAGS` - Genre/âge (homme adulte, femme adulte, garçon, fille)
  - `COLOR_TAGS` - Couleurs avec pastilles visuelles
  - Types TypeScript stricts pour validation

### 📚 Documentation
- **`docs/TABLES_ML_SUPABASE.md`** - Liste complète des tables à créer
- **`docs/EXPORT_DATASETS_GUIDE.md`** - Guide d'export des datasets
- **`docs/AI_FRONTEND_INTEGRATION.md`** - Guide d'intégration frontend/microservice IA
- **`Services/Signare_AI/README.md`** - Documentation complète du microservice IA

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

**⚠️ Nouvelle table recommandée pour l'IA :**
12. ✅ `ai_interactions` (à créer) - Tracking des générations IA :
    - `interaction_type` : 'inspiration' | 'tryon'
    - `user_id` : Utilisateur qui a généré
    - `tags_selected` : JSONB des tags (inspiration)
    - `prompt_used` : Prompt généré par le microservice
    - `input_image_path` : Chemin image utilisateur (try-on)
    - `output_image_url` : URL de l'image générée
    - `model_used` : Modèle IA utilisé (replicate/mock)
    - `rating` : Note utilisateur (1-5) - optionnel
    - `converted_to_order` : Boolean - si l'inspiration a mené à une commande

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

#### Exemple : Page IA (Inspiration & Try-on)

```typescript
// app/inspiration/page.tsx
'use client'

import { useAIService } from '@/hooks/useAIService'
import type { InspirationPayload } from '@/shared/constants/ai-tags'

export default function InspirationPage() {
  const { generateInspiration, generateTryOn, isLoading } = useAIService()
  
  // Inspiration : Sélection de tags uniquement
  const handleGenerateInspiration = async () => {
    const payload: InspirationPayload = {
      fabric: 'bazin',
      event: 'tabaski',
      gender: 'homme adulte',
      color: 'blanc'
    }
    
    const result = await generateInspiration(payload)
    // Le microservice construit le prompt automatiquement
    // Le frontend ne connaît pas le prompt final
    
    // TODO: Tracker l'interaction IA pour ML
    // await trackAIInteraction('inspiration', { tags: payload, result })
  }
  
  // Try-on : Upload photo uniquement
  const handleGenerateTryOn = async () => {
    const result = await generateTryOn({
      model_id: 'uuid-model',
      tailor_id: 'uuid-tailor',
      user_image_path: '/uploads/user.jpg'
    })
    
    // TODO: Tracker l'interaction IA pour ML
    // await trackAIInteraction('tryon', { model_id, result })
  }
  
  return (
    // UI de sélection de tags et upload
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
- ✅ **Chaque génération IA** :
  - **Inspiration** : Tags sélectionnés → Prompt généré → Image résultat
  - **Try-on** : Photo utilisateur + Modèle → Image résultat
  - Mode utilisé (mock/replicate)
  - Rating utilisateur (optionnel)
  - Conversion en commande (si applicable)
- ✅ Sessions utilisateurs (durée, activité)

**📊 Données IA spécifiques collectées :**
- Tags sélectionnés (fabric, event, gender, color)
- Prompts générés automatiquement (par le microservice)
- Images générées (URLs)
- Temps de génération
- Taux de satisfaction (rating)
- Taux de conversion (inspiration → commande)

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
- 🎨 **Génération IA** :
  - **Fine-tuning Stable Diffusion** : Modèle spécialisé mode sénégalaise
  - **Try-on spécialisé** : Modèle d'essayage virtuel adapté aux tenues traditionnelles
  - **Prompt Engineering** : Optimiser les prompts pour meilleurs résultats
  - **Tag → Image** : Prédire les meilleures combinaisons de tags
- 📏 **Prédiction Tailles** : Recommander la bonne taille
- 💬 **Sentiment Analysis** : Analyser les feedbacks

**🤖 Modèles IA spécifiques (avec données collectées) :**
- **Modèle de génération d'inspiration** : Entraîné sur tags → images générées + ratings
- **Modèle de try-on** : Entraîné sur photos utilisateurs + résultats + feedbacks
- **Modèle de recommandation de tags** : Prédire les meilleurs tags selon contexte
- **Modèle de qualité d'image** : Prédire si une image générée sera appréciée

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

### Interactions IA (Nouveau)
- **Inspiration** :
  - Tags sélectionnés (fabric, event, gender, color)
  - Prompt généré (par microservice)
  - Image générée (URL)
  - Rating utilisateur (1-5)
  - Temps de génération
  - Conversion en commande (boolean)
- **Try-on** :
  - Photo utilisateur (chemin)
  - Modèle essayé (model_id)
  - Image résultat (URL)
  - Rating utilisateur (1-5)
  - Temps de génération
  - Conversion en commande (boolean)

---

## 🎯 Objectifs par Phase

### Phase 1 : Collection (Mois 0-6)
- ✅ Créer les tables Supabase
- ✅ Intégrer le tracking dans l'app
- ✅ Encourager les annotations
- ✅ **Démarrer le microservice IA** (mode mock puis replicate)
- ✅ **Tracker toutes les générations IA** (inspiration + try-on)
- 🎯 **Objectif :** 
  - 10,000+ interactions
  - 1,000+ posts annotés
  - **500+ générations d'inspiration**
  - **200+ try-ons**
  - **Ratings collectés** (taux de satisfaction IA)

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

-- Voir les générations IA (si table ai_interactions créée)
SELECT 
  interaction_type,
  tags_selected,
  prompt_used,
  rating,
  converted_to_order,
  created_at
FROM ai_interactions
ORDER BY created_at DESC
LIMIT 50;

-- Analyser les tags les plus populaires (inspiration)
SELECT 
  tags_selected->>'fabric' as fabric,
  tags_selected->>'event' as event,
  tags_selected->>'color' as color,
  COUNT(*) as count,
  AVG(rating) as avg_rating
FROM ai_interactions
WHERE interaction_type = 'inspiration'
GROUP BY fabric, event, color
ORDER BY count DESC;
```

---

## 📈 KPIs à Suivre

### Quantité de Données
- **Posts :** Objectif 1,000+ dans 6 mois
- **Interactions :** Objectif 10,000+ dans 6 mois
- **Annotations :** Objectif 500+ posts annotés
- **Users actifs :** Objectif 100+ users
- **Générations IA :** Objectif 500+ inspirations, 200+ try-ons
- **Ratings IA :** Objectif 300+ ratings collectés (taux de réponse > 30%)

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
- `docs/AI_FRONTEND_INTEGRATION.md` - Intégration frontend/microservice IA
- `Services/Signare_AI/README.md` - Documentation microservice IA

**Code :**
- `backend/services/ml-collection.ts` - Services backend
- `frontend/hooks/useTracking.ts` - Hooks frontend
- `hooks/useAIService.ts` - Hook pour microservice IA
- `shared/constants/ai-tags.ts` - Tags normalisés pour IA
- `supabase-schema-ml-ready.sql` - Schema SQL
- `Services/Signare_AI/` - Microservice IA complet

---

---

## 🤖 Microservice IA - Collecte de Données

### Architecture

Le microservice IA (`Services/Signare_AI/`) est **totalement indépendant** du frontend :

- **Frontend** : Collecte tags et photos uniquement
- **Microservice** : Construit prompts, génère images, gère l'IA
- **Aucune logique IA dans le frontend**

### Données Collectées pour ML

#### Inspiration Visuelle
- **Input** : Tags structurés (fabric, event, gender, color)
- **Output** : Image générée + prompt utilisé
- **Métriques** :
  - Combinaisons de tags les plus populaires
  - Prompts les plus efficaces
  - Ratings utilisateurs
  - Taux de conversion (inspiration → commande)

#### Try-on (Essayage Virtuel)
- **Input** : Photo utilisateur + Modèle
- **Output** : Image résultat
- **Métriques** :
  - Qualité des photos utilisateurs
  - Taux de satisfaction
  - Modèles les plus essayés
  - Taux de conversion (try-on → commande)

### Table Recommandée : `ai_interactions`

```sql
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Type d'interaction
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('inspiration', 'tryon')),
  
  -- Données inspiration
  tags_selected JSONB, -- {fabric, event, gender, color}
  prompt_used TEXT, -- Prompt généré par le microservice
  
  -- Données try-on
  model_id UUID REFERENCES posts(id),
  tailor_id UUID REFERENCES profiles(id),
  input_image_path TEXT,
  
  -- Résultat
  output_image_url TEXT NOT NULL,
  model_used TEXT, -- 'replicate' | 'mock'
  generation_time_ms INTEGER,
  
  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  converted_to_order BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id),
  
  -- Métadonnées
  device_type TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_user ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX idx_ai_interactions_rating ON ai_interactions(rating);
CREATE INDEX idx_ai_interactions_converted ON ai_interactions(converted_to_order);
```

### Intégration du Tracking IA

```typescript
// hooks/useAITracking.ts (à créer)
import { supabase } from '@/backend/lib/supabase'

export async function trackAIInteraction(
  type: 'inspiration' | 'tryon',
  data: {
    tags?: InspirationPayload
    prompt_used?: string
    output_image_url: string
    model_used: string
    generation_time_ms: number
    model_id?: string
    tailor_id?: string
  },
  userId?: string
) {
  await supabase.from('ai_interactions').insert({
    user_id: userId,
    interaction_type: type,
    tags_selected: data.tags,
    prompt_used: data.prompt_used,
    output_image_url: data.output_image_url,
    model_used: data.model_used,
    generation_time_ms: data.generation_time_ms,
    model_id: data.model_id,
    tailor_id: data.tailor_id,
  })
}
```

### Datasets pour Entraînement IA

**Dataset Inspiration :**
- **Input** : Tags (fabric, event, gender, color)
- **Output** : Images générées + ratings
- **Usage** : Fine-tuning Stable Diffusion, optimisation prompts

**Dataset Try-on :**
- **Input** : Photos utilisateurs + Modèles
- **Output** : Images résultats + ratings
- **Usage** : Amélioration modèle try-on, pré-traitement

**Dataset Tags → Satisfaction :**
- **Input** : Combinaisons de tags
- **Output** : Ratings moyens
- **Usage** : Recommandation de tags, prédiction satisfaction

---

**🎉 SIGNARE est maintenant une machine à données ML avec IA intégrée ! Bon entraînement ! 🤖**

