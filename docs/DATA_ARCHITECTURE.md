# 🤖 Architecture Data-Ready pour l'IA

## Vue d'ensemble

SIGNARE est conçu avec une architecture **Data-Ready** optimisée pour l'entraînement de modèles d'intelligence artificielle. Chaque point de données est structuré avec des métadonnées sémantiques pour faciliter l'apprentissage automatique.

## Principes de Design

### 1. **Single Responsibility Principle**
Chaque fonction et composant a une responsabilité unique et claire, facilitant l'extraction de datasets cohérents.

### 2. **Métadonnées Sémantiques**
Tous les types de données incluent des labels explicites pour la classification et la régression :
- Types énumérés (pas de strings libres)
- Scores normalisés (0-100)
- Tags culturels structurés

### 3. **Commentaires @ai-context**
Chaque interface et fonction critique inclut un tag JSDoc `@ai-context` expliquant son intention métier.

## Datasets Disponibles

### 📊 Dataset 1 : Profils Utilisateurs

**Table :** `profiles`

**Objectif ML :** Système de recommandation et classification comportementale

**Features Clés :**
```typescript
{
  role_score: number,              // 0 (acheteur) → 100 (créateur)
  style_preferences: {             // Vecteur de préférences
    traditional: 0.8,
    modern: 0.6,
    luxury: 0.9
  },
  interaction_history: {           // Historique pour collaborative filtering
    likes: [post_ids],
    purchases: [order_ids],
    views: [post_ids]
  }
}
```

**Cas d'usage :**
- Recommandation de posts personnalisés
- Segmentation créateurs/consommateurs
- Prédiction du comportement d'achat

---

### 👗 Dataset 2 : Mesures Corporelles

**Table :** `mesures`

**Objectif ML :** Prédiction de tailles et estimation de complexité

**Features Clés :**
```typescript
{
  tour_poitrine: number,           // cm
  tour_taille: number,             // cm
  tour_hanches: number,            // cm
  pattern_type: enum,              // boubou, robe, kaftan...
  fabric_stretch_index: number,    // 0 (rigide) → 100 (élastique)
  complexity_score: number         // 1 (simple) → 10 (haute couture)
}
```

**Cas d'usage :**
- Recommandation de taille automatique
- Estimation du temps de confection
- Calcul du prix basé sur la complexité

---

### 🎨 Dataset 3 : Posts Créatifs

**Table :** `posts`

**Objectif ML :** Classification d'images et recherche sémantique

**Features Clés :**
```typescript
{
  color_palette: string[],         // ['#D4AF37', '#0A0A0A']
  garment_type: enum,              // Classification principale
  complexity: enum,                // simple → haute_couture
  cultural_tags: string[],         // ['wolof', 'serere']
  fabric_type: string,             // 'basin', 'wax', 'dentelle'
  
  // Engagement metrics
  likes_count: number,
  views_count: number,
  is_commissioned: boolean         // Conversion en commande
}
```

**Cas d'usage :**
- Recherche par couleur dominante
- Classification automatique de vêtements
- Prédiction de popularité
- Préservation de l'identité culturelle

---

### 🚚 Dataset 4 : Commandes & Livraisons

**Table :** `orders`

**Objectif ML :** Optimisation logistique et prédiction de délais

**Features Clés :**
```typescript
{
  distance_km: number,             // Distance réelle
  shipping_price: number,          // Calculé automatiquement
  delivery_latitude: number,       // Géolocalisation
  delivery_longitude: number,
  status: enum,                    // pending → delivered
  created_at: timestamp,
  delivered_at: timestamp          // Pour calcul du délai
}
```

**Cas d'usage :**
- Prédiction du temps de livraison
- Optimisation des routes
- Détection d'anomalies (retards)

---

### ✨ Dataset 5 : Génération IA

**Table :** `inspirations`

**Objectif ML :** Fine-tuning de modèles génératifs

**Features Clés :**
```typescript
{
  prompt_text: string,             // Prompt utilisateur
  style_references: string[],      // URLs de référence
  generated_image_url: string,     // Résultat
  model_used: string,              // 'dall-e-3', 'midjourney'
  generation_params: json,         // Paramètres utilisés
  
  // Feedback loop
  user_rating: number,             // 1 → 5
  was_commissioned: boolean        // Transformé en commande ?
}
```

**Cas d'usage :**
- Fine-tuning de modèles de génération
- A/B testing de prompts
- Amélioration continue via feedback
- Dataset pour RLHF (Reinforcement Learning from Human Feedback)

---

## Extraction de Données

### Exemple : Export pour Training

```typescript
// Export des posts avec labels pour classification
const trainingData = await supabase
  .from('posts')
  .select(`
    image_url,
    garment_type,
    complexity,
    color_palette,
    cultural_tags,
    likes_count
  `)
  .gte('likes_count', 10)  // Filtrer les posts populaires
  .order('created_at', { ascending: false })

// Format pour ML
const dataset = trainingData.map(post => ({
  image: post.image_url,
  labels: {
    garment: post.garment_type,
    complexity: post.complexity,
    colors: post.color_palette,
    culture: post.cultural_tags
  },
  engagement_score: post.likes_count
}))
```

### Exemple : Features Engineering

```typescript
// Calculer le "style_vector" d'un utilisateur
const userStyleVector = {
  traditional_preference: 
    likes.filter(p => p.cultural_tags.length > 0).length / likes.length,
  
  luxury_preference:
    likes.filter(p => p.complexity === 'haute_couture').length / likes.length,
  
  color_affinity: {
    gold: likes.filter(p => p.color_palette.includes('#D4AF37')).length,
    black: likes.filter(p => p.color_palette.includes('#0A0A0A')).length
  }
}
```

## Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours remplir les métadonnées ML** lors de l'insertion
2. **Normaliser les scores** entre 0 et 100
3. **Utiliser des enums** au lieu de strings libres
4. **Capturer le feedback utilisateur** (ratings, conversions)
5. **Horodater toutes les interactions** pour l'analyse temporelle

### ❌ À ÉVITER

1. Ne pas laisser les champs ML à `null`
2. Ne pas utiliser de valeurs par défaut arbitraires
3. Ne pas mélanger les unités (toujours en cm, FCFA, etc.)
4. Ne pas ignorer les erreurs de géolocalisation

## Évolution Future

### Phase 1 : Collection (Actuel)
- Structure de données optimisée
- Capture des interactions utilisateur
- Métadonnées sémantiques

### Phase 2 : Analyse (3-6 mois)
- Export de datasets
- Features engineering
- Modèles de recommandation basiques

### Phase 3 : ML Avancé (6-12 mois)
- Classification d'images automatique
- Génération de designs personnalisés
- Prédiction de tendances

### Phase 4 : IA Générative (12+ mois)
- Fine-tuning de modèles génératifs
- Création de patrons automatiques
- Assistant virtuel de stylisme

## Ressources

- **Types TypeScript :** `/types/database.types.ts`
- **Schema SQL :** `/supabase-schema.sql`
- **Hooks métier :** `/hooks/`
- **Utilitaires :** `/lib/utils.ts`

---

**Note :** Cette architecture est conçue pour évoluer. Chaque nouvelle feature doit inclure des métadonnées ML pertinentes.

