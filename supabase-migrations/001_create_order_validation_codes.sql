-- =====================================================
-- Migration : Table pour codes de validation de commande
-- @security CRITIQUE : Génération de codes sécurisés côté serveur avec expiration
-- =====================================================

-- Table pour stocker les codes de validation avec expiration
CREATE TABLE IF NOT EXISTS order_validation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL CHECK (LENGTH(code) = 6 AND code ~ '^[0-9]{6}$'),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint : Un seul code actif par commande (non expiré et non utilisé)
  CONSTRAINT unique_active_code_per_order UNIQUE (order_id, code, expires_at)
);

-- Index pour recherche rapide par commande
CREATE INDEX IF NOT EXISTS idx_validation_codes_order ON order_validation_codes(order_id);

-- Index pour nettoyage automatique des codes expirés
CREATE INDEX IF NOT EXISTS idx_validation_codes_expires ON order_validation_codes(expires_at) WHERE used_at IS NULL;

-- Index pour recherche par code (pour validation)
CREATE INDEX IF NOT EXISTS idx_validation_codes_code ON order_validation_codes(code) WHERE used_at IS NULL AND expires_at > NOW();

-- Fonction pour vérifier si un code est valide (non utilisé, non expiré)
CREATE OR REPLACE FUNCTION is_validation_code_valid(p_order_id UUID, p_code VARCHAR(6))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM order_validation_codes
    WHERE order_id = p_order_id
      AND code = p_code
      AND used_at IS NULL
      AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer un code comme utilisé
CREATE OR REPLACE FUNCTION use_validation_code(p_order_id UUID, p_code VARCHAR(6))
RETURNS BOOLEAN AS $$
DECLARE
  v_code_id UUID;
BEGIN
  -- Vérifier que le code existe et est valide
  SELECT id INTO v_code_id
  FROM order_validation_codes
  WHERE order_id = p_order_id
    AND code = p_code
    AND used_at IS NULL
    AND expires_at > NOW()
  FOR UPDATE; -- Lock pour éviter les double-usage

  IF v_code_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Marquer comme utilisé
  UPDATE order_validation_codes
  SET used_at = NOW()
  WHERE id = v_code_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS (Row Level Security) : Seuls les propriétaires de la commande peuvent voir les codes
ALTER TABLE order_validation_codes ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir uniquement les codes de leurs propres commandes
CREATE POLICY "Users can view validation codes for their orders"
ON order_validation_codes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_validation_codes.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

-- Commentaire pour documentation
COMMENT ON TABLE order_validation_codes IS 'Codes de validation sécurisés pour les livraisons (expiration 10 minutes)';
COMMENT ON COLUMN order_validation_codes.code IS 'Code à 6 chiffres généré de manière sécurisée côté serveur';
COMMENT ON COLUMN order_validation_codes.expires_at IS 'Date d''expiration (généralement 10 minutes après création)';
COMMENT ON COLUMN order_validation_codes.used_at IS 'Date d''utilisation du code (NULL si non utilisé)';

