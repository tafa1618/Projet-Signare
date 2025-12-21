# 📊 Tables Supabase pour Entraînement IA - SIGNARE

## 🎯 Objectif
Ce document liste **TOUTES les tables** à créer sur Supabase pour collecter des données de qualité pour l'entraînement de votre modèle d'IA.

---

## 📋 Liste Complète des Tables (10 tables principales + 3 auxiliaires)

### ✅ 1. **profiles** - Profils Utilisateurs Enrichis
**Objectif ML :** Segmentation utilisateurs, recommandations personnalisées

**Colonnes clés pour IA :**
- `role_score` : Score 0-100 (acheteur → créateur)
- `style_preferences` : JSONB des préférences stylistiques
- `interaction_history` : JSONB de l'historique (likes, achats, vues)
- `total_posts_created`, `total_likes_given`, `total_purchases`, `total_sales`
- `average_session_duration` : Engagement utilisateur
- `city`, `country` : Localisation pour tendances régionales

**Cas d'usage :**
- Prédire si un user va devenir créateur ou rester acheteur
- Recommander des posts selon les préférences
- Segmenter les users (power creators, casual browsers, etc.)

---

### ✅ 2. **posts** - Publications avec Métadonnées Visuelles
**Objectif ML :** Classification d'images, détection d'objets, recherche visuelle

**Colonnes clés pour IA :**
- `dominant_colors` : JSONB [{color, percentage}] - palette extraite
- `color_palette` : Array simplifié des couleurs
- `image_width`, `image_height`, `aspect_ratio` : Dimensions
- `brightness_score`, `contrast_score` : Qualité visuelle (0-1)
- `garment_type`, `garment_subcategory` : Labels principaux
- `gender_target`, `age_range` : Cible démographique
- `complexity` : Niveau de difficulté
- `fabric_type`, `fabric_pattern`, `fabric_texture` : Caractéristiques tissu
- `cultural_tags[]` : Tags culturels (wolof, serere, etc.)
- `style_tags[]` : Tags de style (traditionnel, chic, etc.)
- `occasion_tags[]` : Tags d'occasion (mariage, soirée, etc.)
- `season_tags[]` : Saisonnalité
- `has_embroidery`, `has_beading`, `has_print`, `has_lace` : Features booléennes
- `likes_count`, `views_count`, `shares_count`, `saves_count` : Engagement
- `inquiries_count`, `conversion_rate` : Métriques business

**Cas d'usage :**
- Classification automatique du type de vêtement
- Recherche par similarité visuelle (couleurs, style)
- Détection de broderie, perles, dentelle
- Prédiction de popularité d'un post
- Recommandation basée sur le style

---

### ✅ 3. **post_annotations** - Annotations Manuelles
**Objectif ML :** Données supervisées pour entraîner et valider les modèles

**Colonnes clés pour IA :**
- `verified_garment_type`, `verified_fabric_type`, `verified_complexity` : Labels vérifiés
- `verified_colors[]` : Palette corrigée par humain
- `object_detections` : JSONB avec bounding boxes [{label, x, y, width, height}]
- `image_quality_score` : 1-5
- `cultural_authenticity_score` : 1-5
- `is_approved` : Pour filtrer les données de qualité

**Cas d'usage :**
- Ground truth pour entraînement supervisé
- Validation des prédictions du modèle
- Détection d'objets (colliers, boucles d'oreilles, etc.)
- Fine-tuning avec données annotées

---

### ✅ 4. **user_interactions** - Tracking des Interactions
**Objectif ML :** Systèmes de recommandation (collaborative filtering)

**Colonnes clés pour IA :**
- `interaction_type` : view, like, save, share, purchase, etc.
- `duration_seconds` : Temps passé sur un post
- `scroll_depth` : Profondeur de scroll (0-1)
- `came_from` : Source de trafic (feed, search, profile)
- `session_id` : Pour regrouper les interactions
- `device_type` : mobile, desktop, tablet

**Cas d'usage :**
- Collaborative filtering (users qui ont aimé X ont aussi aimé Y)
- Prédire l'engagement (temps de vue → like)
- Analyser les parcours utilisateurs
- A/B testing de features

---

### ✅ 5. **search_queries** - Requêtes de Recherche
**Objectif ML :** Compréhension du langage naturel (NLP), intentions de recherche

**Colonnes clés pour IA :**
- `query_text` : Texte de la recherche
- `query_tokens[]` : Mots-clés extraits
- `filters` : JSONB des filtres appliqués
- `results_count` : Nombre de résultats
- `clicked_post_ids[]` : Posts cliqués (relevance feedback)
- `no_results` : Recherches sans résultats (à améliorer)

**Cas d'usage :**
- Améliorer le moteur de recherche
- Comprendre les intentions (cherche-t-il un boubou ou une robe ?)
- Auto-complétion intelligente
- Suggestions de recherche

---

### ✅ 6. **fabric_library** - Bibliothèque de Tissus
**Objectif ML :** Classification et recommandation de tissus

**Colonnes clés pour IA :**
- `name`, `name_wolof`, `category` : Identification
- `stretch_index` : Élasticité 0-100
- `weight_gsm` : Poids du tissu
- `opacity` : transparent, semi-transparent, opaque
- `texture` : Caractéristiques tactiles
- `is_traditional`, `is_premium` : Flags
- `price_per_meter_min/max` : Fourchette de prix
- `recommended_for[]` : Types de vêtements recommandés
- `season_tags[]` : Saisonnalité

**Cas d'usage :**
- Recommander le bon tissu pour un vêtement
- Estimer le prix d'un projet
- Détecter automatiquement le tissu sur une photo

---

### ✅ 7. **pattern_library** - Bibliothèque de Patrons
**Objectif ML :** Estimation de complexité, recommandations

**Colonnes clés pour IA :**
- `garment_type` : Type de vêtement
- `complexity_score` : 1-10
- `skill_level` : débutant, intermédiaire, avancé, expert
- `required_measurements[]` : Mesures nécessaires
- `estimated_hours` : Temps de confection
- `fabric_meters_needed` : Métrage tissu
- `popularity_score` : Popularité
- `success_rate` : % de projets terminés

**Cas d'usage :**
- Recommander des patrons selon le niveau
- Estimer le temps de confection
- Calculer le coût matières

---

### ✅ 8. **mesures** - Mesures Corporelles Enrichies
**Objectif ML :** Prédiction de tailles, recommandations personnalisées

**Colonnes clés pour IA :**
- Toutes les mesures : `tour_poitrine`, `tour_taille`, `tour_hanches`, etc.
- `body_type` : rectangle, poire, pomme, sablier
- `height_cm`, `weight_kg` : Morphologie
- `pattern_type` : Type de vêtement visé
- `fabric_stretch_index` : Élasticité du tissu
- `fit_preference` : ajusté, confortable, ample

**Cas d'usage :**
- Recommander la bonne taille automatiquement
- Prédire les ajustements nécessaires
- Clustering de morphologies similaires

---

### ✅ 9. **orders** - Commandes Enrichies
**Objectif ML :** Prédiction de délais, optimisation logistique

**Colonnes clés pour IA :**
- `product_price`, `shipping_price`, `total_price`
- `distance_km` : Distance de livraison
- `estimated_delivery_date`, `actual_delivery_date` : Prédiction vs réalité
- `preparation_time_hours` : Temps de préparation
- `status` : Statut de la commande
- `buyer_rating`, `seller_rating`, `quality_rating`, `delivery_rating` : Feedback
- `feedback_text` : Commentaires (NLP)

**Cas d'usage :**
- Prédire le temps de livraison
- Optimiser les routes de livraison
- Détecter les retards potentiels
- Analyse de sentiment (feedback_text)

---

### ✅ 10. **inspirations** - Génération IA
**Objectif ML :** Fine-tuning de modèles génératifs, RLHF

**Colonnes clés pour IA :**
- `prompt_text` : Prompt utilisateur
- `style_references[]` : Images de référence
- `model_used`, `model_version` : Modèle utilisé
- `generation_params` : JSONB de tous les paramètres
- `seed` : Seed pour reproductibilité
- `generated_image_url` : Résultat
- `generation_time_seconds` : Performance
- `detected_colors[]`, `detected_style_tags[]` : Analyse auto
- `cultural_accuracy_score` : Respect de l'identité culturelle
- `user_rating` : 1-5 (feedback)
- `was_commissioned` : Converti en commande ?
- `edit_count` : Nombre de rééditions
- `compared_to_inspiration_id` : Si amélioration itérative

**Cas d'usage :**
- Fine-tuning de Stable Diffusion / DALL-E
- RLHF (Reinforcement Learning from Human Feedback)
- Amélioration itérative des prompts
- Mesurer la qualité culturelle des générations

---

### ✅ 11. **ml_training_datasets** - Suivi des Exports
**Objectif ML :** Traçabilité des datasets exportés

**Colonnes clés pour IA :**
- `name`, `description` : Identification
- `dataset_type` : classification, detection, segmentation, generation
- `table_source` : Table d'origine
- `query_used` : SQL utilisée pour l'export
- `total_samples` : Nombre d'échantillons
- `date_range_start/end` : Période couverte
- `labels_included[]` : Labels présents
- `annotation_status` : Statut d'annotation
- `quality_score` : Score de qualité
- `export_format` : csv, json, tfrecord, coco
- `export_url` : URL du fichier
- `used_for_model_id` : Modèle entraîné avec
- `model_performance` : JSONB des métriques

**Cas d'usage :**
- Tracer les versions de datasets
- Comparer les performances selon les datasets
- Reproductibilité des expériences

---

## 📥 TABLES AUXILIAIRES (Déjà créées dans le schema basique)

### ✅ 12. **likes** - Système de Likes
Simple table de jointure (user_id, post_id)

### ✅ 13. **events** - Événements
Pour la billetterie (défilés, expositions)

### ✅ 14. **messages** (À créer si besoin)
Pour la messagerie entre users

---

## 🚀 COMMANDES SQL À EXÉCUTER SUR SUPABASE

### Option 1 : Via l'interface Supabase
1. Aller dans **SQL Editor**
2. Copier tout le contenu de `supabase-schema-ml-ready.sql`
3. Cliquer sur **Run**

### Option 2 : Via CLI Supabase
```bash
supabase db reset
supabase db push
```

---

## 📊 RÉCAPITULATIF : Ce que vous collecterez

| Catégorie | Données Collectées | Modèle ML à Entraîner |
|-----------|-------------------|----------------------|
| **Images** | Photos de vêtements + métadonnées visuelles | Classification CNN, Détection d'objets |
| **Annotations** | Labels manuels + bounding boxes | Supervised Learning, Object Detection |
| **Interactions** | Views, likes, saves, durées | Système de recommandation |
| **Recherches** | Queries textuelles + clics | NLP, Search ranking |
| **Tissus** | Caractéristiques physiques | Classification de matériaux |
| **Mesures** | Mensurations + morphologies | Prédiction de tailles |
| **Commandes** | Délais, ratings, feedback | Prédiction logistique, Sentiment analysis |
| **Génération IA** | Prompts + résultats + ratings | Fine-tuning génératif, RLHF |

---

## 🎯 WORKFLOW RECOMMANDÉ

### Phase 1 : Collection (0-6 mois)
✅ Créer toutes les tables sur Supabase  
✅ Développer les features frontend pour capturer les données  
✅ Encourager les annotations manuelles  

### Phase 2 : Nettoyage (6-9 mois)
✅ Exporter les premières données  
✅ Nettoyer et labelliser  
✅ Créer les datasets de train/val/test  

### Phase 3 : Entraînement (9-12 mois)
✅ Entraîner les premiers modèles basiques  
✅ Évaluer les performances  
✅ Intégrer les prédictions dans l'app  

### Phase 4 : Amélioration Continue (12+ mois)
✅ Boucle de feedback (users corrigent le modèle)  
✅ Réentraînement régulier  
✅ A/B testing des modèles  

---

## ✅ CHECKLIST DE CRÉATION

- [ ] Exécuter `supabase-schema-ml-ready.sql` sur Supabase
- [ ] Vérifier que les 11 tables principales sont créées
- [ ] Activer Row Level Security (RLS) sur chaque table
- [ ] Configurer les policies d'accès
- [ ] Tester les triggers (updated_at, search_vector, etc.)
- [ ] Créer les index pour performance
- [ ] Configurer les buckets Storage pour les images
- [ ] Tester l'insertion de données de test

---

**🎉 Une fois ces tables créées, SIGNARE deviendra une machine à données ML de qualité !**

