-- Migration: Compétition hebdomadaire "Sagnsé de la semaine"
-- Système de vote pour les participations

-- Table: competitions
-- Stocke les compétitions hebdomadaires
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Contrainte: pas de chevauchement de semaines actives
    CONSTRAINT valid_week_range CHECK (week_end > week_start),
    CONSTRAINT unique_active_week UNIQUE (week_start) DEFERRABLE INITIALLY DEFERRED
);

-- Index pour recherches par statut et dates
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_week_start ON competitions(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_competitions_week_end ON competitions(week_end DESC);

-- Table: participations
-- Stocke les participations des utilisateurs
CREATE TABLE IF NOT EXISTS participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('HOMME', 'FEMME')),
    tailor_id UUID NOT NULL, -- Référence vers le profil tailleur
    media_type TEXT NOT NULL CHECK (media_type IN ('PHOTOS', 'VIDEO')),
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Contrainte: un utilisateur ne peut participer qu'une fois par compétition
    CONSTRAINT unique_user_competition UNIQUE (user_id, competition_id),
    
    -- Contrainte: au moins un média
    CONSTRAINT has_media CHECK (array_length(media_urls, 1) > 0),
    
    -- Contrainte: likes_count non négatif
    CONSTRAINT non_negative_likes CHECK (likes_count >= 0)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_participations_competition_category_likes 
    ON participations(competition_id, category, likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_participations_user_id ON participations(user_id);
CREATE INDEX IF NOT EXISTS idx_participations_tailor_id ON participations(tailor_id);
CREATE INDEX IF NOT EXISTS idx_participations_competition_id ON participations(competition_id);
CREATE INDEX IF NOT EXISTS idx_participations_created_at ON participations(created_at DESC);

-- Table: votes
-- Stocke les votes (likes) des utilisateurs
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participation_id UUID NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Contrainte: un utilisateur ne peut voter qu'une fois par participation
    CONSTRAINT unique_user_participation UNIQUE (user_id, participation_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_participation_id ON votes(participation_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);

-- Fonction: Incrémenter likes_count après insertion d'un vote
CREATE OR REPLACE FUNCTION increment_participation_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE participations
    SET likes_count = likes_count + 1,
        updated_at = NOW()
    WHERE id = NEW.participation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Après insertion d'un vote, incrémenter likes_count
CREATE TRIGGER trigger_increment_participation_likes
    AFTER INSERT ON votes
    FOR EACH ROW
    EXECUTE FUNCTION increment_participation_likes();

-- Fonction: Décrémenter likes_count après suppression d'un vote
CREATE OR REPLACE FUNCTION decrement_participation_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE participations
    SET likes_count = GREATEST(likes_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.participation_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Après suppression d'un vote, décrémenter likes_count
CREATE TRIGGER trigger_decrement_participation_likes
    AFTER DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION decrement_participation_likes();

-- Note: La vérification que la compétition est active est faite côté API
-- pour une meilleure gestion des erreurs HTTP. La contrainte UNIQUE sur votes
-- empêche déjà les votes multiples, et les triggers PostgreSQL gèrent
-- l'incrémentation/décrémentation atomique de likes_count.

-- Fonction: Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER trigger_update_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_participations_updated_at
    BEFORE UPDATE ON participations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Politiques de sécurité
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies: competitions (lecture publique, écriture admin)
CREATE POLICY "Competitions are viewable by everyone"
    ON competitions FOR SELECT
    USING (true);

-- Policies: participations (lecture publique, écriture authentifiée)
CREATE POLICY "Participations are viewable by everyone"
    ON participations FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own participations"
    ON participations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participations"
    ON participations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies: votes (lecture authentifiée, écriture authentifiée)
CREATE POLICY "Users can view votes"
    ON votes FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own votes"
    ON votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
    ON votes FOR DELETE
    USING (auth.uid() = user_id);

-- Commentaires pour documentation
COMMENT ON TABLE competitions IS 'Compétitions hebdomadaires "Sagnsé de la semaine"';
COMMENT ON TABLE participations IS 'Participations des utilisateurs à une compétition';
COMMENT ON TABLE votes IS 'Votes (likes) des utilisateurs sur les participations';
COMMENT ON COLUMN participations.likes_count IS 'Compteur dénormalisé des votes (mise à jour atomique)';
COMMENT ON CONSTRAINT unique_user_participation ON votes IS 'Empêche le double vote';

