-- ============================================================
-- MIGRATION COMPLÈTE : Système Multi-Agents Signare
-- Description: Remplace admin_users et crée toutes les tables agents
-- ============================================================

-- ============================================================
-- 1. SUPPRESSION ET RECRÉATION DE ADMIN_USERS
-- ============================================================

-- Drop l'ancienne table
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Créer la nouvelle structure
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'moderator',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id)
);

-- Index
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);

-- RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all admin users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
        OR user_id = auth.uid()
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

-- Helper functions
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

GRANT SELECT ON public.admin_users TO authenticated;

-- ============================================================
-- 2. SYSTÈME MULTI-AGENTS
-- ============================================================

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.growth_memory CASCADE;
DROP TABLE IF EXISTS public.llm_budget_tracker CASCADE;
DROP TABLE IF EXISTS public.trend_suggestions CASCADE;
DROP TABLE IF EXISTS public.agent_personas CASCADE;
DROP TABLE IF EXISTS public.agent_logs CASCADE;

-- AGENT_LOGS
CREATE TABLE public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    action_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    is_synthetic BOOLEAN DEFAULT false,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_logs_agent_id ON public.agent_logs(agent_id);
CREATE INDEX idx_agent_logs_created_at ON public.agent_logs(created_at DESC);
CREATE INDEX idx_agent_logs_synthetic ON public.agent_logs(is_synthetic) WHERE is_synthetic = true;

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all agent logs" ON public.agent_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND role IN ('super_admin', 'moderator')
        )
    );

-- AGENT_PERSONAS
CREATE TABLE public.agent_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    persona_type TEXT NOT NULL,
    age INTEGER,
    location TEXT,
    style_preferences JSONB DEFAULT '[]',
    behavior_profile JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    total_actions INTEGER DEFAULT 0,
    last_action_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ
);

CREATE INDEX idx_personas_active ON public.agent_personas(is_active) WHERE is_active = true;

-- TREND_SUGGESTIONS
CREATE TABLE public.trend_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL,
    source_platform TEXT NOT NULL,
    source_hashtags TEXT[],
    image_url TEXT NOT NULL,
    detected_tags JSONB DEFAULT '{}',
    ai_description TEXT,
    twin_status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    priority_score FLOAT DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    published_post_id UUID
);

CREATE INDEX idx_trends_pending ON public.trend_suggestions(twin_status) WHERE twin_status = 'pending';
CREATE INDEX idx_trends_priority ON public.trend_suggestions(priority_score DESC);

ALTER TABLE public.trend_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trend suggestions" ON public.trend_suggestions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND role IN ('super_admin', 'moderator')
        )
    );

-- GROWTH_MEMORY
CREATE TABLE public.growth_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    memory_type TEXT NOT NULL,
    category TEXT,
    confidence_score FLOAT DEFAULT 0.5,
    source_data JSONB DEFAULT '{}',
    is_actionable BOOLEAN DEFAULT false,
    actioned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    relevance_decay_rate FLOAT DEFAULT 0.01
);

CREATE INDEX idx_growth_memory_embedding ON public.growth_memory 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_growth_memory_type ON public.growth_memory(memory_type);
CREATE INDEX idx_growth_memory_actionable ON public.growth_memory(is_actionable) WHERE is_actionable = true;

-- LLM_BUDGET_TRACKER
CREATE TABLE public.llm_budget_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_used BIGINT DEFAULT 0,
    tokens_limit BIGINT DEFAULT 1000000,
    estimated_cost_usd FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(month_year, model)
);

-- Helper function
CREATE OR REPLACE FUNCTION public.increment_token_usage(
    p_model TEXT,
    p_tokens INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_month TEXT := to_char(NOW(), 'YYYY-MM');
BEGIN
    INSERT INTO public.llm_budget_tracker (month_year, model, tokens_used, updated_at)
    VALUES (v_month, p_model, p_tokens, NOW())
    ON CONFLICT (month_year, model) 
    DO UPDATE SET 
        tokens_used = llm_budget_tracker.tokens_used + p_tokens,
        updated_at = NOW();
END;
$$;

-- Add is_synthetic to existing tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN DEFAULT false;
        ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS source_trend_id UUID REFERENCES public.trend_suggestions(id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes') THEN
        ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Seed personas
INSERT INTO public.agent_personas (name, avatar_url, persona_type, age, location, style_preferences, behavior_profile, expires_at)
VALUES 
    (
        'Fatou Diallo',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=FatouElegante',
        'elegant',
        28,
        'Dakar, Sénégal',
        '["boubou premium", "broderie", "soirée"]',
        '{"like_frequency": 0.8, "comment_probability": 0.4, "save_probability": 0.6, "preferred_hours": [9, 12, 19, 21]}',
        NOW() + INTERVAL '90 days'
    ),
    (
        'Aïssatou Ndiaye',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=AissatouTrendy',
        'trendy',
        22,
        'Abidjan, Côte d''Ivoire',
        '["moderne", "fusion", "streetwear africain"]',
        '{"like_frequency": 0.9, "comment_probability": 0.6, "save_probability": 0.3, "preferred_hours": [11, 14, 20, 23]}',
        NOW() + INTERVAL '90 days'
    ),
    (
        'Moussa Sow',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=MoussaClassic',
        'classic',
        45,
        'Paris, France',
        '["grand boubou", "classique", "cérémonie"]',
        '{"like_frequency": 0.5, "comment_probability": 0.2, "save_probability": 0.7, "preferred_hours": [8, 18, 20]}',
        NOW() + INTERVAL '90 days'
    )
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.agent_logs TO authenticated;
GRANT SELECT ON public.agent_personas TO authenticated;
GRANT SELECT ON public.trend_suggestions TO authenticated;
GRANT SELECT ON public.growth_memory TO authenticated;
GRANT SELECT ON public.llm_budget_tracker TO authenticated;
