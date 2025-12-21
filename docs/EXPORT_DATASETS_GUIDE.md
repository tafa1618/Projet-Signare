# 📤 Guide d'Export des Datasets pour Entraînement ML

## 🎯 Objectif

Ce guide explique comment **exporter vos données de Supabase** pour créer des datasets d'entraînement de qualité pour vos modèles d'IA.

---

## 📊 Datasets Disponibles

### 1. **Dataset Classification d'Images**
**Pour:** Entraîner un CNN à classifier les types de vêtements

**Requête SQL:**
```sql
SELECT 
  p.id,
  p.image_url,
  p.garment_type,
  p.garment_subcategory,
  p.gender_target,
  p.complexity,
  p.fabric_type,
  p.cultural_tags,
  p.style_tags,
  p.has_embroidery,
  p.has_beading,
  p.has_print,
  p.has_lace,
  pa.verified_garment_type,
  pa.verified_fabric_type,
  pa.image_quality_score,
  pa.cultural_authenticity_score
FROM posts p
LEFT JOIN post_annotations pa ON p.id = pa.post_id AND pa.is_approved = true
WHERE p.views_count >= 10  -- Filtrer les posts populaires
  AND (pa.image_quality_score IS NULL OR pa.image_quality_score >= 3)
ORDER BY p.created_at DESC;
```

**Format de sortie recommandé:** COCO JSON ou CSV

**Structure:**
```json
{
  "images": [
    {
      "id": "uuid",
      "file_name": "image_url",
      "width": 1080,
      "height": 1350
    }
  ],
  "annotations": [
    {
      "id": "uuid",
      "image_id": "uuid",
      "category_id": 1,
      "garment_type": "boubou",
      "verified": true,
      "quality_score": 4
    }
  ],
  "categories": [
    {"id": 1, "name": "boubou"},
    {"id": 2, "name": "robe"},
    {"id": 3, "name": "kaftan"}
  ]
}
```

---

### 2. **Dataset Détection d'Objets**
**Pour:** Détecter accessoires, broderies, perles, etc.

**Requête SQL:**
```sql
SELECT 
  p.id,
  p.image_url,
  p.image_width,
  p.image_height,
  pa.object_detections,
  pa.is_approved
FROM posts p
INNER JOIN post_annotations pa ON p.id = pa.post_id
WHERE pa.object_detections IS NOT NULL
  AND pa.is_approved = true;
```

**Format:** COCO JSON avec bounding boxes

---

### 3. **Dataset Recommandation**
**Pour:** Système de recommandation collaborative filtering

**Requête SQL:**
```sql
SELECT 
  ui.user_id,
  ui.post_id,
  ui.interaction_type,
  ui.duration_seconds,
  ui.scroll_depth,
  p.garment_type,
  p.fabric_type,
  p.cultural_tags,
  p.style_tags,
  p.price,
  prof.role_score,
  prof.style_preferences
FROM user_interactions ui
INNER JOIN posts p ON ui.post_id = p.id
INNER JOIN profiles prof ON ui.user_id = prof.id
WHERE ui.interaction_type IN ('view', 'like', 'save', 'purchase')
  AND ui.duration_seconds > 3  -- Ignorer les vues < 3s
ORDER BY ui.created_at DESC;
```

**Format:** CSV pour matrix factorization

**Structure:**
```csv
user_id,post_id,interaction_score,garment_type,fabric_type,cultural_tags,price
uuid1,uuid2,5,boubou,basin,"[wolof,traditionnel]",25000
uuid1,uuid3,3,robe,wax,"[moderne]",15000
```

**Score d'interaction:**
- view (>10s) = 1
- like = 3
- save = 4
- purchase = 5

---

### 4. **Dataset NLP - Recherche**
**Pour:** Améliorer le moteur de recherche

**Requête SQL:**
```sql
SELECT 
  sq.query_text,
  sq.query_tokens,
  sq.filters,
  sq.results_count,
  sq.no_results,
  sq.clicked_post_ids,
  p.garment_type,
  p.fabric_type,
  p.cultural_tags
FROM search_queries sq
LEFT JOIN LATERAL unnest(sq.clicked_post_ids) WITH ORDINALITY AS clicked(post_id, rank) ON true
LEFT JOIN posts p ON p.id = clicked.post_id
WHERE sq.results_count > 0
ORDER BY sq.created_at DESC;
```

**Format:** JSONL (une ligne par recherche)

---

### 5. **Dataset Génération IA (Fine-tuning)**
**Pour:** Fine-tuner Stable Diffusion sur la mode sénégalaise

**Requête SQL:**
```sql
SELECT 
  i.prompt_text,
  i.style_references,
  i.generated_image_url,
  i.model_used,
  i.generation_params,
  i.user_rating,
  i.was_commissioned,
  i.cultural_accuracy_score
FROM inspirations i
WHERE i.user_rating >= 4  -- Seulement les bonnes générations
  AND i.cultural_accuracy_score >= 0.7
ORDER BY i.user_rating DESC, i.created_at DESC;
```

**Format:** JSONL pour DreamBooth/LoRA

**Structure:**
```json
{"image": "url", "text": "boubou traditionnel wolof en basin brodé doré", "rating": 5}
{"image": "url", "text": "robe moderne sénégalaise wax coloré", "rating": 4}
```

---

### 6. **Dataset Prédiction de Tailles**
**Pour:** Recommander la bonne taille automatiquement

**Requête SQL:**
```sql
SELECT 
  m.tour_poitrine,
  m.tour_taille,
  m.tour_hanches,
  m.longueur_bras,
  m.longueur_jambe,
  m.body_type,
  m.height_cm,
  m.weight_kg,
  m.pattern_type,
  m.fabric_stretch_index,
  m.fit_preference,
  o.quality_rating  -- Feedback sur l'ajustement
FROM mesures m
LEFT JOIN orders o ON o.mesure_id = m.id
WHERE o.quality_rating IS NOT NULL;
```

**Format:** CSV pour régression

---

### 7. **Dataset Sentiment Analysis**
**Pour:** Analyser les feedbacks clients

**Requête SQL:**
```sql
SELECT 
  o.id,
  o.buyer_rating,
  o.seller_rating,
  o.quality_rating,
  o.delivery_rating,
  o.feedback_text,
  o.status,
  o.preparation_time_hours,
  EXTRACT(EPOCH FROM (o.delivered_at - o.created_at))/3600 as delivery_hours
FROM orders o
WHERE o.feedback_text IS NOT NULL
  AND o.status = 'delivered';
```

**Format:** CSV pour classification de sentiment

---

## 🛠️ Scripts d'Export

### Option 1 : Via SQL Editor Supabase

1. Aller dans **SQL Editor**
2. Copier une requête ci-dessus
3. Cliquer sur **Run**
4. Exporter en CSV (bouton "Download CSV")

### Option 2 : Via Python Script

```python
# export_dataset.py
import os
from supabase import create_client
import pandas as pd
import json

# Config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def export_classification_dataset():
    """Exporter le dataset de classification"""
    
    # Requête
    response = supabase.table('posts') \
        .select('*, post_annotations(*)') \
        .gte('views_count', 10) \
        .execute()
    
    posts = response.data
    
    # Transformation
    dataset = []
    for post in posts:
        dataset.append({
            'image_url': post['image_url'],
            'label': post.get('garment_type'),
            'verified_label': post['post_annotations'][0]['verified_garment_type'] if post['post_annotations'] else None,
            'quality_score': post['post_annotations'][0]['image_quality_score'] if post['post_annotations'] else None,
        })
    
    # Export CSV
    df = pd.DataFrame(dataset)
    df.to_csv('classification_dataset.csv', index=False)
    print(f"✅ Exporté {len(dataset)} images")

def export_interactions_matrix():
    """Exporter la matrice d'interactions"""
    
    response = supabase.table('user_interactions') \
        .select('user_id, post_id, interaction_type, duration_seconds') \
        .in_('interaction_type', ['view', 'like', 'save', 'purchase']) \
        .execute()
    
    interactions = response.data
    
    # Calcul du score
    scores = {'view': 1, 'like': 3, 'save': 4, 'purchase': 5}
    
    for interaction in interactions:
        interaction['score'] = scores.get(interaction['interaction_type'], 0)
    
    df = pd.DataFrame(interactions)
    df.to_csv('interactions_matrix.csv', index=False)
    print(f"✅ Exporté {len(interactions)} interactions")

def export_generation_dataset():
    """Exporter pour fine-tuning génératif"""
    
    response = supabase.table('inspirations') \
        .select('*') \
        .gte('user_rating', 4) \
        .execute()
    
    inspirations = response.data
    
    # Format JSONL
    with open('generation_dataset.jsonl', 'w') as f:
        for insp in inspirations:
            entry = {
                'image': insp['generated_image_url'],
                'text': insp['prompt_text'],
                'rating': insp['user_rating']
            }
            f.write(json.dumps(entry) + '\n')
    
    print(f"✅ Exporté {len(inspirations)} prompts")

if __name__ == '__main__':
    export_classification_dataset()
    export_interactions_matrix()
    export_generation_dataset()
```

**Utilisation:**
```bash
pip install supabase pandas
python export_dataset.py
```

---

### Option 3 : Via Node.js Script

```typescript
// export-dataset.ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function exportClassificationDataset() {
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      garment_type,
      fabric_type,
      cultural_tags,
      post_annotations (
        verified_garment_type,
        image_quality_score
      )
    `)
    .gte('views_count', 10)

  // Format COCO JSON
  const dataset = {
    images: posts?.map((post, idx) => ({
      id: idx,
      file_name: post.image_url,
      post_id: post.id,
    })),
    annotations: posts?.map((post, idx) => ({
      id: idx,
      image_id: idx,
      category: post.garment_type,
      verified: post.post_annotations?.[0]?.verified_garment_type || null,
    })),
    categories: [
      { id: 0, name: 'boubou' },
      { id: 1, name: 'robe' },
      { id: 2, name: 'kaftan' },
      { id: 3, name: 'ensemble' },
      { id: 4, name: 'accessoire' },
    ],
  }

  fs.writeFileSync('classification_coco.json', JSON.stringify(dataset, null, 2))
  console.log(`✅ Exporté ${posts?.length} images`)
}

exportClassificationDataset()
```

---

## 📋 Checklist Export

### Avant l'export
- [ ] Vérifier que vous avez au moins 1000+ échantillons
- [ ] Filtrer les données de mauvaise qualité
- [ ] Vérifier que les annotations sont approuvées
- [ ] Équilibrer les classes (éviter le déséquilibre)

### Après l'export
- [ ] Nettoyer les données (doublons, valeurs manquantes)
- [ ] Split train/val/test (80/10/10)
- [ ] Normaliser les features numériques
- [ ] Encoder les labels catégoriels
- [ ] Documenter le dataset (README)

---

## 📊 Enregistrer l'Export dans la DB

```sql
INSERT INTO ml_training_datasets (
  name,
  description,
  dataset_type,
  table_source,
  query_used,
  total_samples,
  date_range_start,
  date_range_end,
  labels_included,
  annotation_status,
  quality_score,
  export_format,
  export_url
) VALUES (
  'SIGNARE Classification v1',
  'Dataset de classification des vêtements sénégalais',
  'classification',
  'posts',
  'SELECT * FROM posts WHERE views_count >= 10',
  1523,
  '2024-01-01',
  '2024-12-31',
  ARRAY['boubou', 'robe', 'kaftan', 'ensemble', 'accessoire'],
  'fully_annotated',
  0.92,
  'coco',
  'https://storage.supabase.co/datasets/classification_v1.json'
);
```

---

## 🚀 Workflow Complet

```
1. COLLECTE (3-6 mois)
   └─> Users utilisent l'app
   └─> Données s'accumulent
   └─> Annotations manuelles

2. EXPORT (1 jour)
   └─> Exécuter scripts d'export
   └─> Télécharger les CSV/JSON
   └─> Vérifier la qualité

3. PREPROCESSING (2-3 jours)
   └─> Nettoyer les données
   └─> Split train/val/test
   └─> Augmentation de données

4. TRAINING (1-2 semaines)
   └─> Entraîner modèle baseline
   └─> Hyperparameter tuning
   └─> Évaluation

5. DEPLOYMENT (2-3 jours)
   └─> Exporter le modèle
   └─> Intégrer dans l'app
   └─> A/B testing

6. FEEDBACK LOOP (continu)
   └─> Collecter corrections users
   └─> Réentraîner périodiquement
   └─> Amélioration continue
```

---

## 📈 Métriques de Qualité

### Dataset Classification
- **Minimum:** 1000 images par classe
- **Équilibre:** Ratio max 3:1 entre classes
- **Qualité:** 80%+ images annotées manuellement
- **Résolution:** Minimum 512x512px

### Dataset Recommandation
- **Minimum:** 10,000 interactions
- **Users actifs:** 100+ users avec 10+ interactions
- **Sparsité:** < 95%

### Dataset Génération
- **Minimum:** 500 paires (prompt, image)
- **Rating:** 80%+ avec rating >= 4
- **Diversité:** Couvrir tous les garment_types

---

**🎉 Avec ces exports, vous êtes prêt à entraîner vos propres modèles ML !**

