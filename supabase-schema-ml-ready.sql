-- =====================================================
-- SIGNARE - Schema Enrichi pour Entraînement IA
-- Version ML-Ready : Collecte de données optimisée
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour recherche full-text

-- =====================================================
-- TABLE: profiles (Enrichie)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- Géolocalisation
  default_latitude DOUBLE PRECISION,
  default_longitude DOUBLE PRECISION,
  default_address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Sénégal',
  
  -- Métadonnées ML
  role_score INTEGER DEFAULT 50 CHECK (role_score >= 0 AND role_score <= 100),
  style_preferences JSONB DEFAULT '{}',
  interaction_history JSONB DEFAULT '{"likes": [], "purchases": [], "views": [], "searches": []}',
  
  -- Profiling comportemental
  total_posts_created INTEGER DEFAULT 0,
  total_likes_given INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  average_session_duration INTEGER DEFAULT 0, -- en secondes
  last_active_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_phone ON profiles(phone_number);
CREATE INDEX idx_profiles_role_score ON profiles(role_score);
CREATE INDEX idx_profiles_city ON profiles(city);

-- =====================================================
-- TABLE: posts (Enrichie avec métadonnées visuelles)
-- =====================================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  price NUMERIC(10,2),
  
  -- Métadonnées visuelles (à extraire par IA)
  dominant_colors JSONB DEFAULT '[]', -- [{color: "#D4AF37", percentage: 0.35}]
  color_palette TEXT[] DEFAULT '{}', -- Simplifié
  image_width INTEGER,
  image_height INTEGER,
  aspect_ratio NUMERIC(4,2),
  brightness_score NUMERIC(3,2), -- 0.0 à 1.0
  contrast_score NUMERIC(3,2),
  
  -- Classification garment
  garment_type TEXT NOT NULL CHECK (garment_type IN ('boubou', 'robe', 'ensemble', 'accessoire', 'kaftan', 'autre')),
  garment_subcategory TEXT, -- 'boubou_homme', 'robe_soirée', etc.
  gender_target TEXT CHECK (gender_target IN ('homme', 'femme', 'mixte', 'enfant')),
  age_range TEXT, -- '18-25', '26-35', etc.
  
  -- Classification complexité
  complexity TEXT NOT NULL CHECK (complexity IN ('simple', 'moyen', 'complexe', 'haute_couture')),
  estimated_hours NUMERIC(5,2), -- Temps de confection estimé
  
  -- Tissus et matériaux
  fabric_type TEXT, -- 'basin', 'wax', 'dentelle', 'soie'
  fabric_pattern TEXT, -- 'uni', 'imprimé', 'brodé', 'perlé'
  fabric_texture TEXT, -- 'lisse', 'texturé', 'brillant', 'mat'
  
  -- Tags culturels et style
  cultural_tags TEXT[] DEFAULT '{}', -- ['wolof', 'moderne']
  style_tags TEXT[] DEFAULT '{}', -- ['traditionnel', 'chic', 'casual']
  occasion_tags TEXT[] DEFAULT '{}', -- ['mariage', 'bureau', 'soirée']
  season_tags TEXT[] DEFAULT '{}', -- ['été', 'hiver', 'toute_saison']

  -- Feedback client (pour post "client")
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  event_style TEXT,
  
  -- Détails techniques
  has_embroidery BOOLEAN DEFAULT FALSE,
  has_beading BOOLEAN DEFAULT FALSE,
  has_print BOOLEAN DEFAULT FALSE,
  has_lace BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0, -- Favoris
  
  -- Conversion metrics
  is_available BOOLEAN DEFAULT TRUE,
  is_commissioned BOOLEAN DEFAULT FALSE,
  inquiries_count INTEGER DEFAULT 0, -- Nombre de demandes
  conversion_rate NUMERIC(5,4), -- Taux de conversion vue -> vente
  
  -- SEO et recherche
  search_vector TSVECTOR, -- Pour full-text search
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_garment_type ON posts(garment_type);
CREATE INDEX idx_posts_complexity ON posts(complexity);
CREATE INDEX idx_posts_fabric_type ON posts(fabric_type);
CREATE INDEX idx_posts_cultural_tags ON posts USING GIN(cultural_tags);
CREATE INDEX idx_posts_style_tags ON posts USING GIN(style_tags);
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- =====================================================
-- TABLE: post_annotations
-- Annotations manuelles pour supervision de l'IA
-- =====================================================
CREATE TABLE post_annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  annotator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Annotations
  verified_garment_type TEXT,
  verified_fabric_type TEXT,
  verified_complexity TEXT,
  verified_colors TEXT[],
  
  -- Détection d'objets (bounding boxes)
  object_detections JSONB, -- [{label: "collier", x: 100, y: 200, width: 50, height: 30}]
  
  -- Qualité
  image_quality_score INTEGER CHECK (image_quality_score >= 1 AND image_quality_score <= 5),
  cultural_authenticity_score INTEGER CHECK (cultural_authenticity_score >= 1 AND cultural_authenticity_score <= 5),
  
  notes TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_annotations_post ON post_annotations(post_id);
CREATE INDEX idx_annotations_approved ON post_annotations(is_approved);

-- =====================================================
-- TABLE: user_interactions
-- Tracking détaillé des interactions pour recommandations
-- =====================================================
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Type d'interaction
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'view', 'like', 'unlike', 'comment', 'share', 'save', 'unsave',
    'click', 'zoom', 'inquiry', 'purchase'
  )),
  
  -- Contexte
  session_id TEXT, -- Pour grouper les interactions d'une session
  duration_seconds INTEGER, -- Temps passé sur le post
  scroll_depth NUMERIC(3,2), -- Profondeur de scroll (0.0 à 1.0)
  came_from TEXT, -- 'feed', 'search', 'profile', 'notification'
  
  -- Métadonnées device
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_interactions_post ON user_interactions(post_id);
CREATE INDEX idx_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_interactions_session ON user_interactions(session_id);
CREATE INDEX idx_interactions_created ON user_interactions(created_at DESC);

-- =====================================================
-- TABLE: search_queries
-- Pour comprendre les intentions de recherche
-- =====================================================
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Requête
  query_text TEXT NOT NULL,
  query_tokens TEXT[], -- Mots-clés extraits
  
  -- Filtres appliqués
  filters JSONB, -- {garment_type: 'boubou', price_range: [10000, 50000]}
  
  -- Résultats
  results_count INTEGER,
  clicked_post_ids UUID[], -- Posts cliqués dans les résultats
  no_results BOOLEAN DEFAULT FALSE,
  
  -- Contexte
  session_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_searches_user ON search_queries(user_id);
CREATE INDEX idx_searches_query ON search_queries USING GIN(to_tsvector('french', query_text));
CREATE INDEX idx_searches_created ON search_queries(created_at DESC);

-- =====================================================
-- TABLE: fabric_library
-- Bibliothèque de tissus avec caractéristiques
-- =====================================================
CREATE TABLE fabric_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_wolof TEXT, -- Nom en wolof
  category TEXT NOT NULL, -- 'basin', 'wax', 'dentelle', etc.
  
  -- Caractéristiques physiques
  stretch_index INTEGER CHECK (stretch_index >= 0 AND stretch_index <= 100),
  weight_gsm INTEGER, -- Grammage en g/m²
  opacity TEXT CHECK (opacity IN ('transparent', 'semi-transparent', 'opaque')),
  texture TEXT,
  
  -- Propriétés
  is_traditional BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  care_instructions TEXT,
  
  -- Prix indicatif
  price_per_meter_min NUMERIC(10,2),
  price_per_meter_max NUMERIC(10,2),
  
  -- Visuels
  sample_image_url TEXT,
  color_variants TEXT[],
  
  -- Usage
  recommended_for TEXT[], -- ['boubou', 'robe']
  season_tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fabrics_category ON fabric_library(category);
CREATE INDEX idx_fabrics_traditional ON fabric_library(is_traditional);

-- =====================================================
-- TABLE: pattern_library
-- Bibliothèque de patrons avec métadonnées
-- =====================================================
CREATE TABLE pattern_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_wolof TEXT,
  garment_type TEXT NOT NULL,
  
  -- Difficulté
  complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 10),
  skill_level TEXT CHECK (skill_level IN ('débutant', 'intermédiaire', 'avancé', 'expert')),
  
  -- Mesures requises
  required_measurements TEXT[], -- ['tour_poitrine', 'tour_taille']
  
  -- Estimations
  estimated_hours NUMERIC(5,2),
  fabric_meters_needed NUMERIC(5,2),
  
  -- Visuels
  pattern_diagram_url TEXT,
  finished_example_urls TEXT[],
  
  -- Instructions
  instructions_text TEXT,
  video_tutorial_url TEXT,
  
  -- Métadonnées ML
  popularity_score INTEGER DEFAULT 0,
  success_rate NUMERIC(3,2), -- % de projets terminés avec succès
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patterns_garment ON pattern_library(garment_type);
CREATE INDEX idx_patterns_complexity ON pattern_library(complexity_score);

-- =====================================================
-- TABLE: mesures (Enrichie)
-- =====================================================
CREATE TABLE mesures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  
  -- Mesures standards (en cm)
  tour_poitrine NUMERIC(5,2) NOT NULL,
  tour_taille NUMERIC(5,2) NOT NULL,
  tour_hanches NUMERIC(5,2) NOT NULL,
  longueur_bras NUMERIC(5,2) NOT NULL,
  longueur_jambe NUMERIC(5,2) NOT NULL,
  tour_cou NUMERIC(5,2),
  carrure NUMERIC(5,2),
  hauteur_poitrine NUMERIC(5,2),
  longueur_dos NUMERIC(5,2),
  tour_cuisse NUMERIC(5,2),
  
  -- Mesures supplémentaires pour ML
  body_type TEXT, -- 'rectangle', 'poire', 'pomme', 'sablier'
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  
  -- Métadonnées ML
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('boubou', 'robe', 'tailleur', 'pantalon', 'kaftan', 'autre')),
  fabric_stretch_index INTEGER DEFAULT 50 CHECK (fabric_stretch_index >= 0 AND fabric_stretch_index <= 100),
  complexity_score INTEGER DEFAULT 5 CHECK (complexity_score >= 1 AND complexity_score <= 10),
  
  -- Ajustements et préférences
  fit_preference TEXT, -- 'ajusté', 'confortable', 'ample'
  adjustments_notes TEXT,
  
  -- Historique
  notes TEXT,
  photo_references TEXT[], -- URLs de photos
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mesures_user ON mesures(user_id);
CREATE INDEX idx_mesures_pattern ON mesures(pattern_type);
CREATE INDEX idx_mesures_body_type ON mesures(body_type);

-- =====================================================
-- TABLE: orders (Enrichie)
-- =====================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  mesure_id UUID REFERENCES mesures(id) ON DELETE SET NULL, -- Si sur mesure
  
  -- Prix (en FCFA)
  product_price NUMERIC(10,2) NOT NULL,
  shipping_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  
  -- Livraison
  delivery_latitude DOUBLE PRECISION NOT NULL,
  delivery_longitude DOUBLE PRECISION NOT NULL,
  delivery_address TEXT NOT NULL,
  distance_km NUMERIC(6,2) NOT NULL,
  validation_code TEXT NOT NULL CHECK (LENGTH(validation_code) = 6),
  
  -- Timing
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  preparation_time_hours INTEGER,
  
  -- Statut
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'in_preparation', 'in_delivery', 'delivered', 'cancelled')),
  
  -- Feedback pour ML
  buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
  seller_rating INTEGER CHECK (seller_rating >= 1 AND seller_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  feedback_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_post ON orders(post_id);

-- =====================================================
-- TABLE: inspirations (Enrichie)
-- =====================================================
CREATE TABLE inspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Prompt utilisateur
  prompt_text TEXT NOT NULL,
  prompt_language TEXT DEFAULT 'fr',
  style_references TEXT[], -- URLs d'images
  
  -- Paramètres de génération
  model_used TEXT NOT NULL,
  model_version TEXT,
  generation_params JSONB, -- Tous les paramètres
  seed INTEGER,
  
  -- Résultat
  generated_image_url TEXT NOT NULL,
  generation_time_seconds NUMERIC(5,2),
  
  -- Analyse du résultat
  detected_colors TEXT[],
  detected_style_tags TEXT[],
  cultural_accuracy_score NUMERIC(3,2), -- Auto-évalué ou manuel
  
  -- Feedback ML
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  was_commissioned BOOLEAN DEFAULT FALSE,
  was_shared BOOLEAN DEFAULT FALSE,
  edit_count INTEGER DEFAULT 0, -- Nombre de rééditions
  
  -- Tracking d'amélioration
  compared_to_inspiration_id UUID REFERENCES inspirations(id), -- Si réédition
  improvement_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspirations_user ON inspirations(user_id);
CREATE INDEX idx_inspirations_rating ON inspirations(user_rating);
CREATE INDEX idx_inspirations_commissioned ON inspirations(was_commissioned);
CREATE INDEX idx_inspirations_model ON inspirations(model_used);

-- =====================================================
-- TABLE: ml_training_datasets
-- Suivi des exports de datasets pour entraînement
-- =====================================================
CREATE TABLE ml_training_datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  dataset_type TEXT NOT NULL, -- 'classification', 'detection', 'segmentation', 'generation'
  
  -- Contenu
  table_source TEXT NOT NULL, -- 'posts', 'inspirations', etc.
  query_used TEXT, -- SQL query utilisée pour extraire
  total_samples INTEGER,
  
  -- Métadonnées
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  labels_included TEXT[],
  
  -- Qualité
  annotation_status TEXT, -- 'raw', 'partially_annotated', 'fully_annotated'
  quality_score NUMERIC(3,2),
  
  -- Export
  export_format TEXT, -- 'csv', 'json', 'tfrecord', 'coco'
  export_url TEXT,
  file_size_mb NUMERIC(10,2),
  
  -- Utilisation
  used_for_model_id TEXT,
  training_date DATE,
  model_performance JSONB, -- Métriques après entraînement
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Mise à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mesures_updated_at BEFORE UPDATE ON mesures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Incrémenter total_posts_created
CREATE OR REPLACE FUNCTION increment_user_posts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET total_posts_created = total_posts_created + 1 WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_posts
AFTER INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION increment_user_posts();

-- Mettre à jour search_vector pour posts
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('french', coalesce(NEW.caption, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW.cultural_tags, ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW.style_tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_vector
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesures ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;

-- Policies (exemples, à adapter selon besoins)
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users track own interactions" ON user_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own interactions" ON user_interactions FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue agrégée pour recommandations
CREATE VIEW post_metrics AS
SELECT 
  p.id,
  p.user_id,
  p.garment_type,
  p.fabric_type,
  p.cultural_tags,
  p.likes_count,
  p.views_count,
  p.saves_count,
  CASE WHEN p.views_count > 0 THEN p.likes_count::FLOAT / p.views_count ELSE 0 END as engagement_rate,
  COUNT(DISTINCT ui.user_id) as unique_viewers,
  AVG(ui.duration_seconds) as avg_view_duration,
  p.created_at
FROM posts p
LEFT JOIN user_interactions ui ON p.id = ui.post_id AND ui.interaction_type = 'view'
GROUP BY p.id;

-- Vue des top créateurs
CREATE VIEW top_creators AS
SELECT 
  p.id,
  p.display_name,
  p.role_score,
  p.total_posts_created,
  p.total_sales,
  AVG(o.seller_rating) as avg_seller_rating,
  COUNT(DISTINCT o.id) as total_orders
FROM profiles p
LEFT JOIN orders o ON p.id = o.seller_id
GROUP BY p.id
ORDER BY p.role_score DESC;

