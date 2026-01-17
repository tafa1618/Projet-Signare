-- =====================================================
-- Migration : Système de paiement centralisé SIGNARE
-- @security CRITIQUE : Gestion de tous les flux financiers
-- =====================================================

-- Table principale des paiements
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference VARCHAR(50) NOT NULL UNIQUE, -- Référence unique pour tracking
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF', -- XOF (Franc CFA) par défaut
  purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('SPONSORING', 'FEATURE', 'SUBSCRIPTION', 'PROMOTION', 'ORDER', 'COMMISSION')),
  status VARCHAR(20) NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  provider VARCHAR(20) NOT NULL DEFAULT 'MOCK' CHECK (provider IN ('MOCK', 'PAYTECH', 'PAYDUNYA')),
  provider_reference VARCHAR(255), -- Référence retournée par le provider
  metadata JSONB DEFAULT '{}', -- Métadonnées flexibles (order_id, feature_type, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_status_transition CHECK (
    (status = 'INITIATED' AND provider_reference IS NULL) OR
    (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'))
  )
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_purpose ON payments(purpose);

-- Index composite pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);

-- Table des logs de transactions (audit trail complet)
CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL, -- INITIATED, CALLBACK_RECEIVED, STATUS_CHANGED, etc.
  payload JSONB DEFAULT '{}', -- Données brutes de l'événement
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche par paiement
CREATE INDEX IF NOT EXISTS idx_transaction_logs_payment_id ON transaction_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_event ON transaction_logs(event);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER payment_updated_at_trigger
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_updated_at();

-- Fonction pour logger une transaction (utilisée par le service)
CREATE OR REPLACE FUNCTION log_transaction(
  p_payment_id UUID,
  p_event VARCHAR(50),
  p_payload JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO transaction_logs (payment_id, event, payload)
  VALUES (p_payment_id, p_event, p_payload)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer une référence unique
CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS VARCHAR(50) AS $$
DECLARE
  v_reference VARCHAR(50);
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Format: PAY-{timestamp}-{random}
    v_reference := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    
    -- Vérifier unicité
    SELECT EXISTS(SELECT 1 FROM payments WHERE reference = v_reference) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_reference;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir uniquement leurs propres paiements
CREATE POLICY "Users can view their own payments"
ON payments
FOR SELECT
USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent créer leurs propres paiements
CREATE POLICY "Users can create their own payments"
ON payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent mettre à jour leurs propres paiements (limité)
CREATE POLICY "Users can update their own payments"
ON payments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Empêcher la modification manuelle du status (seul le callback peut le faire)
  OLD.status = NEW.status OR
  (OLD.status = 'INITIATED' AND NEW.status = 'CANCELLED')
);

-- Policy : Les logs sont accessibles uniquement via le paiement associé
CREATE POLICY "Users can view logs for their payments"
ON transaction_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM payments
    WHERE payments.id = transaction_logs.payment_id
      AND payments.user_id = auth.uid()
  )
);

-- Commentaires pour documentation
COMMENT ON TABLE payments IS 'Table centrale des paiements SIGNARE (tous les flux financiers)';
COMMENT ON COLUMN payments.reference IS 'Référence unique générée automatiquement (format: PAY-YYYYMMDDHH24MISS-XXXXXXXX)';
COMMENT ON COLUMN payments.purpose IS 'Type de paiement: SPONSORING, FEATURE, SUBSCRIPTION, PROMOTION, ORDER, COMMISSION';
COMMENT ON COLUMN payments.status IS 'État du paiement: INITIATED, PENDING, SUCCESS, FAILED, CANCELLED';
COMMENT ON COLUMN payments.provider IS 'Provider de paiement: MOCK (dev), PAYTECH, PAYDUNYA';
COMMENT ON COLUMN payments.metadata IS 'Métadonnées flexibles (order_id, feature_type, promotion_id, etc.)';
COMMENT ON TABLE transaction_logs IS 'Audit trail complet de toutes les transactions (idempotence, debugging)';
COMMENT ON COLUMN transaction_logs.event IS 'Type d''événement: INITIATED, CALLBACK_RECEIVED, STATUS_CHANGED, etc.';
COMMENT ON COLUMN transaction_logs.payload IS 'Données brutes de l''événement (pour debugging et audit)';

