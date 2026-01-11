-- Migration initiale pour SIGNARE Search, Feed & Recommendation Engine
-- Read Model pour le microservice

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: items (Read Model)
-- Vue simplifiée des items pour le ranking et la recherche
-- =====================================================
CREATE TABLE items (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    image_url VARCHAR,
    price FLOAT,
    category VARCHAR,
    color VARCHAR,
    tailor_id VARCHAR NOT NULL,
    tailor_name VARCHAR,
    rating FLOAT,
    availability BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Métadonnées ML
    embedding JSONB,  -- Vector embeddings (384 dimensions)
    popularity_score FLOAT DEFAULT 0.0,
    recency_score FLOAT DEFAULT 0.0,
    quality_score FLOAT DEFAULT 0.0,

    -- Métadonnées business
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0
);

-- Index pour performance
CREATE INDEX idx_items_tailor_id ON items(tailor_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_availability ON items(availability);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_popularity ON items(popularity_score DESC);
CREATE INDEX idx_items_price ON items(price);

-- Index GIN pour recherche dans embeddings
CREATE INDEX idx_items_embedding ON items USING GIN(embedding);

-- =====================================================
-- TABLE: tailors (Read Model - scores agrégés)
-- Vue simplifiée des tailleurs avec scores de performance
-- =====================================================
CREATE TABLE tailors (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    rating FLOAT,
    total_orders INTEGER DEFAULT 0,
    total_revenue FLOAT DEFAULT 0.0,
    performance_score FLOAT DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tailors_performance ON tailors(performance_score DESC);
CREATE INDEX idx_tailors_rating ON tailors(rating DESC);

-- =====================================================
-- TABLE: user_events (Append-only)
-- Événements utilisateurs pour tracking et ML
-- =====================================================
CREATE TABLE user_events (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
    event_type VARCHAR NOT NULL,  -- view_item, search, click, add_to_cart, purchase, etc.
    entity_id VARCHAR,  -- ID de l'item, query, etc.
    user_id VARCHAR,
    session_id VARCHAR,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    context JSONB  -- Contexte additionnel
);

-- Index pour performance
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_entity_id ON user_events(entity_id);
CREATE INDEX idx_user_events_timestamp ON user_events(timestamp DESC);
CREATE INDEX idx_user_events_event_type ON user_events(event_type);
CREATE INDEX idx_user_events_session_id ON user_events(session_id);

-- Partition par date (optionnel, pour performance)
-- CREATE TABLE user_events_2024_01 PARTITION OF user_events
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

