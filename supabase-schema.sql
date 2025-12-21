-- =====================================================
-- SIGNARE - Schema Database Supabase
-- Architecture Data-Ready pour l'entraînement d'IA
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles
-- Profils utilisateurs avec métadonnées ML
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- Géolocalisation pour livraison
  default_latitude DOUBLE PRECISION,
  default_longitude DOUBLE PRECISION,
  default_address TEXT,
  
  -- Métadonnées ML
  role_score INTEGER DEFAULT 50 CHECK (role_score >= 0 AND role_score <= 100),
  style_preferences JSONB DEFAULT '{}',
  interaction_history JSONB DEFAULT '{"likes": [], "purchases": [], "views": []}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_profiles_phone ON profiles(phone_number);
CREATE INDEX idx_profiles_role_score ON profiles(role_score);

-- =====================================================
-- TABLE: mesures
-- Mesures corporelles structurées pour ML
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
  
  -- Métadonnées ML
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('boubou', 'robe', 'tailleur', 'pantalon', 'kaftan', 'autre')),
  fabric_stretch_index INTEGER DEFAULT 50 CHECK (fabric_stretch_index >= 0 AND fabric_stretch_index <= 100),
  complexity_score INTEGER DEFAULT 5 CHECK (complexity_score >= 1 AND complexity_score <= 10),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mesures_user ON mesures(user_id);
CREATE INDEX idx_mesures_pattern ON mesures(pattern_type);

-- =====================================================
-- TABLE: posts
-- Posts avec labels sémantiques pour classification IA
-- =====================================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  price NUMERIC(10,2),
  
  -- Métadonnées ML
  color_palette TEXT[] DEFAULT '{}',
  garment_type TEXT NOT NULL CHECK (garment_type IN ('boubou', 'robe', 'ensemble', 'accessoire', 'kaftan', 'autre')),
  complexity TEXT NOT NULL CHECK (complexity IN ('simple', 'moyen', 'complexe', 'haute_couture')),
  cultural_tags TEXT[] DEFAULT '{}',
  fabric_type TEXT,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Disponibilité
  is_available BOOLEAN DEFAULT TRUE,
  is_commissioned BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_garment_type ON posts(garment_type);
CREATE INDEX idx_posts_complexity ON posts(complexity);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- =====================================================
-- TABLE: likes
-- Système de likes pour recommandations
-- =====================================================
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_post ON likes(post_id);

-- Trigger pour incrémenter likes_count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_likes
AFTER INSERT ON likes
FOR EACH ROW EXECUTE FUNCTION increment_likes_count();

-- Trigger pour décrémenter likes_count
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_likes
AFTER DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();

-- =====================================================
-- TABLE: orders
-- Commandes avec workflow Yango
-- =====================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  
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
  
  -- Statut
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'in_delivery', 'delivered', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);

-- =====================================================
-- TABLE: events
-- Événements culturels avec géolocalisation
-- =====================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  
  -- Localisation
  venue_name TEXT NOT NULL,
  venue_latitude DOUBLE PRECISION NOT NULL,
  venue_longitude DOUBLE PRECISION NOT NULL,
  venue_address TEXT NOT NULL,
  
  -- Date & Prix
  event_date TIMESTAMPTZ NOT NULL,
  ticket_price NUMERIC(10,2) NOT NULL,
  tickets_available INTEGER NOT NULL CHECK (tickets_available >= 0),
  
  -- Catégorie
  category TEXT NOT NULL CHECK (category IN ('défilé', 'exposition', 'atelier', 'festival', 'autre')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_category ON events(category);

-- =====================================================
-- TABLE: inspirations
-- Prompts et résultats de génération IA
-- =====================================================
CREATE TABLE inspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Prompt utilisateur
  prompt_text TEXT NOT NULL,
  style_references TEXT[],
  
  -- Résultat IA
  generated_image_url TEXT NOT NULL,
  model_used TEXT NOT NULL,
  generation_params JSONB,
  
  -- Feedback ML
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  was_commissioned BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspirations_user ON inspirations(user_id);
CREATE INDEX idx_inspirations_rating ON inspirations(user_rating);
CREATE INDEX idx_inspirations_commissioned ON inspirations(was_commissioned);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesures ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Profiles publics en lecture" ON profiles FOR SELECT USING (true);
CREATE POLICY "Utilisateurs peuvent modifier leur profil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies pour posts
CREATE POLICY "Posts publics en lecture" ON posts FOR SELECT USING (true);
CREATE POLICY "Utilisateurs peuvent créer des posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilisateurs peuvent modifier leurs posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Utilisateurs peuvent supprimer leurs posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Policies pour likes
CREATE POLICY "Likes publics en lecture" ON likes FOR SELECT USING (true);
CREATE POLICY "Utilisateurs peuvent liker" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilisateurs peuvent retirer leur like" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Policies pour mesures
CREATE POLICY "Utilisateurs voient leurs mesures" ON mesures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utilisateurs créent leurs mesures" ON mesures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilisateurs modifient leurs mesures" ON mesures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Utilisateurs suppriment leurs mesures" ON mesures FOR DELETE USING (auth.uid() = user_id);

-- Policies pour orders
CREATE POLICY "Acheteurs et vendeurs voient leurs commandes" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Acheteurs créent des commandes" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Acheteurs et vendeurs modifient les commandes" ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Policies pour events
CREATE POLICY "Events publics en lecture" ON events FOR SELECT USING (true);
CREATE POLICY "Organisateurs créent des events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organisateurs modifient leurs events" ON events FOR UPDATE USING (auth.uid() = organizer_id);

-- Policies pour inspirations
CREATE POLICY "Utilisateurs voient leurs inspirations" ON inspirations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utilisateurs créent des inspirations" ON inspirations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilisateurs modifient leurs inspirations" ON inspirations FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables concernées
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mesures_updated_at BEFORE UPDATE ON mesures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

