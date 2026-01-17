-- =====================================================
-- Script d'Initialisation : Créer le SUPER_ADMIN initial
-- @security CRITIQUE : À exécuter après la création de l'utilisateur dans Supabase Auth
-- =====================================================

-- INSTRUCTIONS :
-- 1. Créer d'abord l'utilisateur dans Supabase Dashboard > Authentication
--    - Numéro de téléphone : +781110455
--    - Noter l'UUID de l'utilisateur créé
--
-- 2. Remplacer 'VOTRE_UUID_ICI' ci-dessous par le vrai UUID
--
-- 3. Exécuter ce script dans SQL Editor

-- =====================================================
-- Créer le SUPER_ADMIN initial
-- =====================================================

-- ⚠️ REMPLACER 'VOTRE_UUID_ICI' PAR LE VRAI UUID DE L'UTILISATEUR SUPABASE AUTH
DO $$
DECLARE
  v_super_admin_id UUID := 'VOTRE_UUID_ICI'; -- ⚠️ À REMPLACER
BEGIN
  -- Vérifier que l'UUID est valide
  IF v_super_admin_id = 'VOTRE_UUID_ICI' THEN
    RAISE EXCEPTION 'Veuillez remplacer VOTRE_UUID_ICI par le vrai UUID de l''utilisateur Supabase Auth';
  END IF;

  -- Vérifier que l'utilisateur existe dans auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_super_admin_id) THEN
    RAISE EXCEPTION 'L''utilisateur avec l''UUID % n''existe pas dans auth.users. Créez-le d''abord dans Authentication.', v_super_admin_id;
  END IF;

  -- Créer l'entrée SUPER_ADMIN
  INSERT INTO admin_users (
    id,
    phone,
    name,
    role,
    is_active,
    created_by -- NULL car c'est le premier admin
  )
  VALUES (
    v_super_admin_id,
    '+781110455',
    'Super Admin',
    'SUPER_ADMIN',
    TRUE,
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    phone = EXCLUDED.phone,
    name = EXCLUDED.name,
    role = 'SUPER_ADMIN',
    is_active = TRUE,
    updated_at = NOW();

  RAISE NOTICE 'SUPER_ADMIN créé avec succès !';
END $$;

-- =====================================================
-- Vérification
-- =====================================================

-- Vérifier que le SUPER_ADMIN a été créé
SELECT 
  id,
  phone,
  name,
  role,
  is_active,
  created_at
FROM admin_users
WHERE role = 'SUPER_ADMIN';

