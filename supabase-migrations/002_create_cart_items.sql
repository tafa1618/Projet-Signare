-- =====================================================
-- Migration : Table pour panier utilisateur
-- @security Chaque utilisateur ne peut voir que son propre panier
-- =====================================================

-- Table pour stocker les items du panier
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL, -- Référence vers posts.id ou products.id (selon architecture)
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'FCFA' CHECK (currency IN ('FCFA', 'EUR', 'USD')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  
  -- Informations vendeur (optionnel, pour affichage)
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seller_name TEXT,
  seller_avatar_url TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte : Un utilisateur ne peut avoir qu'un seul item pour un produit
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Index pour recherche rapide par utilisateur
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- Index pour recherche rapide par produit
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- Index pour tri par date de création (plus récent en premier)
CREATE INDEX IF NOT EXISTS idx_cart_items_created ON cart_items(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_items_updated_at();

-- RLS (Row Level Security) : Les utilisateurs ne peuvent voir que leur propre panier
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir uniquement leurs propres items
CREATE POLICY "Users can view their own cart items"
ON cart_items
FOR SELECT
USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent insérer uniquement leurs propres items
CREATE POLICY "Users can insert their own cart items"
ON cart_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent modifier uniquement leurs propres items
CREATE POLICY "Users can update their own cart items"
ON cart_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent supprimer uniquement leurs propres items
CREATE POLICY "Users can delete their own cart items"
ON cart_items
FOR DELETE
USING (auth.uid() = user_id);

-- Commentaires pour documentation
COMMENT ON TABLE cart_items IS 'Items du panier utilisateur (synchronisé avec localStorage pour transition)';
COMMENT ON COLUMN cart_items.product_id IS 'ID du produit/post (UUID)';
COMMENT ON COLUMN cart_items.quantity IS 'Quantité (minimum 1)';
COMMENT ON COLUMN cart_items.price IS 'Prix unitaire en FCFA';
COMMENT ON COLUMN cart_items.seller_id IS 'ID du vendeur (optionnel, pour données enrichies)';

