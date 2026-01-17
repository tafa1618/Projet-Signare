-- =====================================================
-- Migration : Système de gestion des admins et rôles
-- @security CRITIQUE : Gestion RBAC pour le dashboard admin
-- =====================================================

-- Table pour stocker les rôles et métadonnées des admins
-- Note: Les utilisateurs sont dans auth.users, cette table stocke les infos supplémentaires
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'RESPONSABLE_COMMERCIAL', 'BUSINESS_DEVELOPER', 'ADMIN')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id), -- Qui a créé ce compte admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  
  -- Contraintes
  CONSTRAINT valid_admin_role CHECK (role IN ('SUPER_ADMIN', 'RESPONSABLE_COMMERCIAL', 'BUSINESS_DEVELOPER', 'ADMIN'))
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_admin_users_phone ON admin_users(phone);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON admin_users(created_by);

-- Table pour l'historique des actions admin (audit trail)
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'CREATE_ADMIN', 'UPDATE_ROLE', 'DEACTIVATE_ADMIN', 'DELETE_ADMIN', etc.
  target_user_id UUID REFERENCES auth.users(id), -- Utilisateur concerné par l'action
  details JSONB DEFAULT '{}', -- Détails de l'action (ancien rôle, nouveau rôle, etc.)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche par admin
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id ON admin_actions(target_user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_admin_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER admin_user_updated_at_trigger
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_user_updated_at();

-- Fonction pour mettre à jour last_active_at
CREATE OR REPLACE FUNCTION update_admin_last_active()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour last_active_at quand l'admin se connecte
  UPDATE admin_users
  SET last_active_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un compte admin
-- Note: L'utilisateur doit déjà exister dans auth.users
-- Cette fonction crée uniquement l'entrée dans admin_users
CREATE OR REPLACE FUNCTION create_admin_user(
  p_user_id UUID,
  p_phone TEXT,
  p_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_role TEXT,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Vérifier que le créateur est SUPER_ADMIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = p_created_by 
    AND role = 'SUPER_ADMIN' 
    AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Seul un SUPER_ADMIN peut créer des comptes admin';
  END IF;

  -- Vérifier que le rôle n'est pas SUPER_ADMIN (on ne peut pas créer un SUPER_ADMIN)
  IF p_role = 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'Impossible de créer un compte SUPER_ADMIN via cette fonction';
  END IF;

  -- Vérifier que le téléphone n'existe pas déjà
  IF EXISTS (SELECT 1 FROM admin_users WHERE phone = p_phone) THEN
    RAISE EXCEPTION 'Un admin avec ce numéro de téléphone existe déjà';
  END IF;

  -- Vérifier que l'utilisateur existe dans auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'L''utilisateur doit d''abord être créé dans Supabase Auth';
  END IF;

  -- Insérer dans admin_users
  INSERT INTO admin_users (id, phone, name, email, role, created_by)
  VALUES (p_user_id, p_phone, p_name, p_email, p_role, p_created_by)
  RETURNING id INTO v_admin_id;

  -- Logger l'action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (
    p_created_by,
    'CREATE_ADMIN',
    v_admin_id,
    jsonb_build_object(
      'new_admin_phone', p_phone,
      'new_admin_name', p_name,
      'new_admin_role', p_role
    )
  );

  RETURN v_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le rôle d'un admin
CREATE OR REPLACE FUNCTION update_admin_role(
  p_admin_id UUID,
  p_new_role TEXT,
  p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_role TEXT;
BEGIN
  -- Vérifier que le modificateur est SUPER_ADMIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = p_updated_by 
    AND role = 'SUPER_ADMIN' 
    AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Seul un SUPER_ADMIN peut modifier les rôles';
  END IF;

  -- Vérifier que l'admin existe
  SELECT role INTO v_old_role
  FROM admin_users
  WHERE id = p_admin_id;

  IF v_old_role IS NULL THEN
    RAISE EXCEPTION 'Admin introuvable';
  END IF;

  -- Ne pas permettre de modifier le rôle d'un SUPER_ADMIN
  IF v_old_role = 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'Impossible de modifier le rôle d''un SUPER_ADMIN';
  END IF;

  -- Ne pas permettre de créer un SUPER_ADMIN
  IF p_new_role = 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'Impossible de définir le rôle SUPER_ADMIN via cette fonction';
  END IF;

  -- Mettre à jour le rôle
  UPDATE admin_users
  SET role = p_new_role,
      updated_at = NOW()
  WHERE id = p_admin_id;

  -- Logger l'action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (
    p_updated_by,
    'UPDATE_ROLE',
    p_admin_id,
    jsonb_build_object(
      'old_role', v_old_role,
      'new_role', p_new_role
    )
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour désactiver un admin
CREATE OR REPLACE FUNCTION deactivate_admin(
  p_admin_id UUID,
  p_deactivated_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que le modificateur est SUPER_ADMIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = p_deactivated_by 
    AND role = 'SUPER_ADMIN' 
    AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Seul un SUPER_ADMIN peut désactiver des admins';
  END IF;

  -- Ne pas permettre de désactiver un SUPER_ADMIN
  IF EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = p_admin_id 
    AND role = 'SUPER_ADMIN'
  ) THEN
    RAISE EXCEPTION 'Impossible de désactiver un SUPER_ADMIN';
  END IF;

  -- Désactiver
  UPDATE admin_users
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE id = p_admin_id;

  -- Logger l'action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (
    p_deactivated_by,
    'DEACTIVATE_ADMIN',
    p_admin_id,
    jsonb_build_object('reason', 'Désactivé par SUPER_ADMIN')
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Policy : Seuls les SUPER_ADMIN peuvent voir tous les admins
CREATE POLICY "Super admins can view all admin users"
ON admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = 'SUPER_ADMIN'
    AND is_active = TRUE
  )
);

-- Policy : Seuls les SUPER_ADMIN peuvent créer des admins
CREATE POLICY "Super admins can create admin users"
ON admin_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = 'SUPER_ADMIN'
    AND is_active = TRUE
  )
);

-- Policy : Seuls les SUPER_ADMIN peuvent modifier des admins
CREATE POLICY "Super admins can update admin users"
ON admin_users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = 'SUPER_ADMIN'
    AND is_active = TRUE
  )
);

-- Policy : Seuls les SUPER_ADMIN peuvent voir les actions admin
CREATE POLICY "Super admins can view admin actions"
ON admin_actions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = 'SUPER_ADMIN'
    AND is_active = TRUE
  )
);

-- Policy : Seuls les SUPER_ADMIN peuvent créer des actions admin
CREATE POLICY "Super admins can create admin actions"
ON admin_actions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = 'SUPER_ADMIN'
    AND is_active = TRUE
  )
);

-- Fonction pour récupérer le rôle d'un utilisateur (utilisée par le système RBAC)
CREATE OR REPLACE FUNCTION get_user_admin_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
  v_phone TEXT;
BEGIN
  -- Récupérer le téléphone depuis profiles
  SELECT phone_number INTO v_phone
  FROM profiles
  WHERE id = p_user_id;

  -- Vérifier si c'est le SUPER_ADMIN (par numéro de téléphone)
  IF v_phone = '+781110455' OR v_phone = '781110455' THEN
    RETURN 'SUPER_ADMIN';
  END IF;

  -- Récupérer le rôle depuis admin_users
  SELECT role INTO v_role
  FROM admin_users
  WHERE id = p_user_id
  AND is_active = TRUE;

  RETURN COALESCE(v_role, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour faciliter les requêtes (liste des admins avec leurs infos)
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  au.id,
  au.phone,
  au.name,
  au.email,
  au.role,
  au.is_active,
  au.created_at,
  au.updated_at,
  au.last_active_at,
  creator.name AS created_by_name,
  creator.phone AS created_by_phone
FROM admin_users au
LEFT JOIN admin_users creator ON au.created_by = creator.id;

-- Commentaires pour documentation
COMMENT ON TABLE admin_users IS 'Table des utilisateurs admin avec leurs rôles RBAC';
COMMENT ON COLUMN admin_users.role IS 'Rôle admin: SUPER_ADMIN, RESPONSABLE_COMMERCIAL, BUSINESS_DEVELOPER, ADMIN';
COMMENT ON COLUMN admin_users.is_active IS 'Statut actif/inactif du compte admin';
COMMENT ON COLUMN admin_users.created_by IS 'ID du SUPER_ADMIN qui a créé ce compte';
COMMENT ON TABLE admin_actions IS 'Audit trail de toutes les actions admin (création, modification, désactivation)';
COMMENT ON COLUMN admin_actions.action_type IS 'Type d''action: CREATE_ADMIN, UPDATE_ROLE, DEACTIVATE_ADMIN, DELETE_ADMIN';
COMMENT ON COLUMN admin_actions.details IS 'Détails JSON de l''action (ancien/nouveau rôle, etc.)';
