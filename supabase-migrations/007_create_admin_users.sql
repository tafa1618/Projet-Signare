-- ============================================================
-- Migration: Admin Users Table
-- Description: Creates the admin_users table for role-based access control
-- Run this BEFORE 008_create_multi_agent_system.sql
-- ============================================================

-- ============================================================
-- ADMIN_USERS - Role-based access control for admin features
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'moderator', -- 'super_admin' | 'moderator' | 'viewer'
    permissions JSONB DEFAULT '{}', -- Custom permissions override
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);

-- RLS Policy
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only super_admins can see and manage admin_users
CREATE POLICY "Super admins can view all admin users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
        OR user_id = auth.uid() -- Users can see their own record
    );

CREATE POLICY "Super admins can insert admin users" ON public.admin_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update admin users" ON public.admin_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can delete admin users" ON public.admin_users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

-- ============================================================
-- Helper function to check if user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true
    );
$$;

-- ============================================================
-- Helper function to check user's admin role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_role(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.admin_users
    WHERE user_id = p_user_id AND is_active = true
    LIMIT 1;
$$;

-- ============================================================
-- Grant permissions
-- ============================================================
GRANT SELECT ON public.admin_users TO authenticated;

-- ============================================================
-- IMPORTANT: Add yourself as the first super_admin
-- Replace 'YOUR_USER_ID' with your actual Supabase auth.users id
-- You can find it in Authentication > Users in the dashboard
-- ============================================================
-- INSERT INTO public.admin_users (user_id, email, role)
-- VALUES ('YOUR_USER_ID', 'your-email@example.com', 'super_admin');
