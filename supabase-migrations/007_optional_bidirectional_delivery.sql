-- =====================================================
-- MIGRATION: Livraison Optionnelle et Bidirectionnelle
-- Permet de rendre la livraison optionnelle et bidirectionnelle
-- (client peut livrer son tissu au tailleur, ou tailleur peut livrer au client)
-- =====================================================

-- Modifier la table orders pour rendre la livraison optionnelle et bidirectionnelle
ALTER TABLE orders
  -- Rendre les champs de livraison optionnels
  ALTER COLUMN delivery_latitude DROP NOT NULL,
  ALTER COLUMN delivery_longitude DROP NOT NULL,
  ALTER COLUMN delivery_address DROP NOT NULL,
  ALTER COLUMN distance_km DROP NOT NULL,
  ALTER COLUMN validation_code DROP NOT NULL,
  ALTER COLUMN shipping_price DROP NOT NULL,
  
  -- Ajouter le champ pour la direction de livraison
  ADD COLUMN IF NOT EXISTS delivery_direction TEXT CHECK (delivery_direction IN ('buyer_to_seller', 'seller_to_buyer', NULL)),
  
  -- Ajouter les champs pour la livraison bidirectionnelle
  ADD COLUMN IF NOT EXISTS delivery_to_buyer_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_to_buyer_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_to_buyer_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_to_buyer_distance_km NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS delivery_to_buyer_validation_code TEXT CHECK (delivery_to_buyer_validation_code IS NULL OR LENGTH(delivery_to_buyer_validation_code) = 6),
  
  ADD COLUMN IF NOT EXISTS delivery_to_seller_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_to_seller_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_to_seller_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_to_seller_distance_km NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS delivery_to_seller_validation_code TEXT CHECK (delivery_to_seller_validation_code IS NULL OR LENGTH(delivery_to_seller_validation_code) = 6),
  
  -- Ajouter un champ pour indiquer si la livraison est demandée
  ADD COLUMN IF NOT EXISTS requires_delivery BOOLEAN DEFAULT FALSE,
  
  -- Ajouter un champ pour le type de livraison
  ADD COLUMN IF NOT EXISTS delivery_type TEXT CHECK (delivery_type IN ('product_delivery', 'fabric_delivery', 'both', NULL));

-- Mettre à jour les contraintes pour garantir la cohérence
-- Si requires_delivery = TRUE, au moins une direction de livraison doit être définie
CREATE OR REPLACE FUNCTION check_delivery_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Si requires_delivery est TRUE, au moins une direction doit être définie
  IF NEW.requires_delivery = TRUE THEN
    IF NEW.delivery_to_buyer_address IS NULL AND NEW.delivery_to_seller_address IS NULL THEN
      RAISE EXCEPTION 'Si requires_delivery est TRUE, au moins une adresse de livraison doit être définie';
    END IF;
  END IF;
  
  -- Si delivery_to_buyer est défini, tous les champs doivent être remplis
  IF NEW.delivery_to_buyer_address IS NOT NULL THEN
    IF NEW.delivery_to_buyer_latitude IS NULL OR NEW.delivery_to_buyer_longitude IS NULL OR 
       NEW.delivery_to_buyer_distance_km IS NULL OR NEW.delivery_to_buyer_validation_code IS NULL THEN
      RAISE EXCEPTION 'Si delivery_to_buyer_address est défini, tous les champs de livraison au client doivent être remplis';
    END IF;
  END IF;
  
  -- Si delivery_to_seller est défini, tous les champs doivent être remplis
  IF NEW.delivery_to_seller_address IS NOT NULL THEN
    IF NEW.delivery_to_seller_latitude IS NULL OR NEW.delivery_to_seller_longitude IS NULL OR 
       NEW.delivery_to_seller_distance_km IS NULL OR NEW.delivery_to_seller_validation_code IS NULL THEN
      RAISE EXCEPTION 'Si delivery_to_seller_address est défini, tous les champs de livraison au tailleur doivent être remplis';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_check_delivery_consistency ON orders;
CREATE TRIGGER trigger_check_delivery_consistency
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_delivery_consistency();

-- Mettre à jour shipping_price pour qu'il soit 0 si pas de livraison
CREATE OR REPLACE FUNCTION calculate_shipping_price()
RETURNS TRIGGER AS $$
DECLARE
  total_shipping NUMERIC(10,2) := 0;
BEGIN
  -- Calculer le prix de livraison total
  IF NEW.delivery_to_buyer_distance_km IS NOT NULL THEN
    total_shipping := total_shipping + (1500 + (NEW.delivery_to_buyer_distance_km * 100));
  END IF;
  
  IF NEW.delivery_to_seller_distance_km IS NOT NULL THEN
    total_shipping := total_shipping + (1500 + (NEW.delivery_to_seller_distance_km * 100));
  END IF;
  
  -- Ajouter les frais SIGNARE (15%)
  NEW.shipping_price := total_shipping * 1.15;
  
  -- Mettre à jour le total_price
  NEW.total_price := NEW.product_price + NEW.shipping_price;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour calculer automatiquement le prix de livraison
DROP TRIGGER IF EXISTS trigger_calculate_shipping_price ON orders;
CREATE TRIGGER trigger_calculate_shipping_price
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_shipping_price();

-- Index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_orders_requires_delivery ON orders(requires_delivery);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_type ON orders(delivery_type);

-- Commentaires pour documentation
COMMENT ON COLUMN orders.requires_delivery IS 'Indique si une livraison est demandée pour cette commande';
COMMENT ON COLUMN orders.delivery_type IS 'Type de livraison: product_delivery (tailleur->client), fabric_delivery (client->tailleur), both (les deux)';
COMMENT ON COLUMN orders.delivery_to_buyer_address IS 'Adresse de livraison du produit fini au client';
COMMENT ON COLUMN orders.delivery_to_seller_address IS 'Adresse de livraison du tissu au tailleur';

