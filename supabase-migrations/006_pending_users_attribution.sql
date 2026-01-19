-- =====================================================
-- MIGRATION: Système de rattachement pour utilisateurs non-membres
-- Permet d'enregistrer les numéros de téléphone des non-membres
-- et de rattacher automatiquement leur historique lors de l'inscription
-- =====================================================

-- Table pour stocker les numéros de téléphone non-membres
CREATE TABLE IF NOT EXISTS pending_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('TAILLEUR', 'CLIENT')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phone_number)
);

CREATE INDEX idx_pending_users_phone ON pending_users(phone_number);

-- Modifier la table posts pour accepter phone_number optionnel
-- On va rendre user_id nullable et ajouter phone_number
ALTER TABLE posts 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD CONSTRAINT posts_user_or_phone_check CHECK (
    (user_id IS NOT NULL AND phone_number IS NULL) OR 
    (user_id IS NULL AND phone_number IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_posts_phone ON posts(phone_number);

-- Modifier la table orders pour accepter phone_number optionnel
ALTER TABLE orders
  ALTER COLUMN buyer_id DROP NOT NULL,
  ALTER COLUMN seller_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS buyer_phone TEXT,
  ADD COLUMN IF NOT EXISTS seller_phone TEXT,
  ADD CONSTRAINT orders_buyer_check CHECK (
    (buyer_id IS NOT NULL AND buyer_phone IS NULL) OR 
    (buyer_id IS NULL AND buyer_phone IS NOT NULL)
  ),
  ADD CONSTRAINT orders_seller_check CHECK (
    (seller_id IS NOT NULL AND seller_phone IS NULL) OR 
    (seller_id IS NULL AND seller_phone IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_orders_buyer_phone ON orders(buyer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_seller_phone ON orders(seller_phone);

-- Fonction pour enregistrer un numéro de téléphone non-membre
CREATE OR REPLACE FUNCTION register_pending_user(
  p_phone_number TEXT,
  p_user_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_pending_user_id UUID;
BEGIN
  -- Vérifier si le numéro existe déjà
  INSERT INTO pending_users (phone_number, user_type)
  VALUES (p_phone_number, p_user_type)
  ON CONFLICT (phone_number) DO NOTHING
  RETURNING id INTO v_pending_user_id;
  
  -- Si l'insertion n'a pas créé de nouvelle ligne, récupérer l'ID existant
  IF v_pending_user_id IS NULL THEN
    SELECT id INTO v_pending_user_id FROM pending_users WHERE phone_number = p_phone_number;
  END IF;
  
  RETURN v_pending_user_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour rattacher automatiquement les données d'un utilisateur non-membre
CREATE OR REPLACE FUNCTION attach_pending_user_data(
  p_user_id UUID,
  p_phone_number TEXT
)
RETURNS VOID AS $$
DECLARE
  v_pending_user_id UUID;
  v_user_type TEXT;
BEGIN
  -- Vérifier si ce numéro existe dans pending_users
  SELECT id, user_type INTO v_pending_user_id, v_user_type
  FROM pending_users
  WHERE phone_number = p_phone_number;
  
  -- Si le numéro n'existe pas dans pending_users, rien à faire
  IF v_pending_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Rattacher tous les posts avec ce numéro de téléphone
  UPDATE posts
  SET user_id = p_user_id, phone_number = NULL
  WHERE phone_number = p_phone_number AND user_id IS NULL;
  
  -- Rattacher toutes les commandes où l'utilisateur est l'acheteur
  UPDATE orders
  SET buyer_id = p_user_id, buyer_phone = NULL
  WHERE buyer_phone = p_phone_number AND buyer_id IS NULL;
  
  -- Rattacher toutes les commandes où l'utilisateur est le vendeur
  UPDATE orders
  SET seller_id = p_user_id, seller_phone = NULL
  WHERE seller_phone = p_phone_number AND seller_id IS NULL;
  
  -- Supprimer l'entrée de pending_users (les données sont maintenant rattachées)
  DELETE FROM pending_users WHERE id = v_pending_user_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour rattacher automatiquement lors de la création d'un profil
CREATE OR REPLACE FUNCTION trigger_attach_pending_user_on_profile_create()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le profil a un numéro de téléphone, essayer de rattacher les données
  IF NEW.phone_number IS NOT NULL THEN
    PERFORM attach_pending_user_data(NEW.id, NEW.phone_number);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger si la table profiles existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS trigger_attach_pending_user_on_profile_create ON profiles;
    CREATE TRIGGER trigger_attach_pending_user_on_profile_create
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION trigger_attach_pending_user_on_profile_create();
  END IF;
END $$;

-- Fonction pour vérifier si un numéro de téléphone a des données en attente
CREATE OR REPLACE FUNCTION has_pending_data(p_phone_number TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_posts BOOLEAN;
  v_has_orders BOOLEAN;
BEGIN
  -- Vérifier s'il y a des posts en attente
  SELECT EXISTS(SELECT 1 FROM posts WHERE phone_number = p_phone_number AND user_id IS NULL)
  INTO v_has_posts;
  
  -- Vérifier s'il y a des commandes en attente
  SELECT EXISTS(
    SELECT 1 FROM orders 
    WHERE (buyer_phone = p_phone_number AND buyer_id IS NULL) 
       OR (seller_phone = p_phone_number AND seller_id IS NULL)
  ) INTO v_has_orders;
  
  RETURN v_has_posts OR v_has_orders;
END;
$$ LANGUAGE plpgsql;

-- RLS pour pending_users (lecture seule pour les utilisateurs authentifiés)
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pending data" ON pending_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.phone_number = pending_users.phone_number
    )
  );

