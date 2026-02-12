-- ============================================================
-- Migration: Multi-Agent System Tables
-- Description: Creates tables for the Signare Agent Army
-- ============================================================

-- Enable pgvector extension for Growth Brain memory
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 1. AGENT_LOGS - Audit trail for all agent actions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL, -- 'orchestrator' | 'persona:fatou' | 'trend_hunter' | 'growth_brain'
    agent_type TEXT NOT NULL, -- 'orchestrator' | 'persona' | 'hunter' | 'growth'
    action_type TEXT NOT NULL, -- 'like' | 'comment' | 'follow' | 'scan' | 'insight' | 'spawn' | 'terminate'
    payload JSONB DEFAULT '{}',
    is_synthetic BOOLEAN DEFAULT false, -- true for persona-generated actions
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    tokens_used INTEGER DEFAULT 0, -- LLM token tracking for budget
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- For agents with limited lifespan
);

-- Index for querying by agent and time
CREATE INDEX idx_agent_logs_agent_id ON public.agent_logs(agent_id);
CREATE INDEX idx_agent_logs_created_at ON public.agent_logs(created_at DESC);
CREATE INDEX idx_agent_logs_synthetic ON public.agent_logs(is_synthetic) WHERE is_synthetic = true;

-- RLS Policy
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all agent logs" ON public.agent_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND role IN ('super_admin', 'moderator')
        )
    );

-- ============================================================
-- 2. AGENT_PERSONAS - Persona definitions (Anti-Cold Start)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    persona_type TEXT NOT NULL, -- 'elegant' | 'trendy' | 'classic' | 'diaspora'
    age INTEGER,
    location TEXT,
    style_preferences JSONB DEFAULT '[]', -- ['boubou', 'kaftan', 'modern']
    behavior_profile JSONB DEFAULT '{}', -- {like_frequency: 0.7, comment_probability: 0.3, ...}
    is_active BOOLEAN DEFAULT true,
    total_actions INTEGER DEFAULT 0,
    last_action_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- 90-day lifespan by default
    retired_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_personas_active ON public.agent_personas(is_active) WHERE is_active = true;

-- ============================================================
-- 3. TREND_SUGGESTIONS - Digital Twins pipeline
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trend_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL,
    source_platform TEXT NOT NULL, -- 'instagram' | 'pinterest'
    source_hashtags TEXT[], -- ['#ModeSenegalaise', '#Boubou2024']
    image_url TEXT NOT NULL,
    detected_tags JSONB DEFAULT '{}', -- {colors: [...], style: '...', garment_type: '...', confidence: 0.85}
    ai_description TEXT, -- GPT-4o generated description
    twin_status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'published'
    rejection_reason TEXT,
    priority_score FLOAT DEFAULT 0.5, -- Higher = more trending
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    published_post_id UUID -- Reference to the created post
);

-- Index for admin queue
CREATE INDEX idx_trends_pending ON public.trend_suggestions(twin_status) WHERE twin_status = 'pending';
CREATE INDEX idx_trends_priority ON public.trend_suggestions(priority_score DESC);

-- RLS Policy
ALTER TABLE public.trend_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trend suggestions" ON public.trend_suggestions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND role IN ('super_admin', 'moderator')
        )
    );

-- ============================================================
-- 4. GROWTH_MEMORY - Long-term memory for Growth Brain (pgvector)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.growth_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL, -- The insight/observation text
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small
    memory_type TEXT NOT NULL, -- 'insight' | 'decision' | 'observation' | 'trend' | 'recommendation'
    category TEXT, -- 'pricing' | 'content' | 'user_behavior' | 'market' | 'competition'
    confidence_score FLOAT DEFAULT 0.5,
    source_data JSONB DEFAULT '{}', -- Raw data that led to this insight
    is_actionable BOOLEAN DEFAULT false,
    actioned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    relevance_decay_rate FLOAT DEFAULT 0.01 -- How fast the insight becomes stale
);

-- Vector similarity search index
CREATE INDEX idx_growth_memory_embedding ON public.growth_memory 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_growth_memory_type ON public.growth_memory(memory_type);
CREATE INDEX idx_growth_memory_actionable ON public.growth_memory(is_actionable) WHERE is_actionable = true;

-- ============================================================
-- 5. LLM_BUDGET_TRACKER - Monthly token budget management
-- ============================================================
CREATE TABLE IF NOT EXISTS public.llm_budget_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year TEXT NOT NULL, -- '2026-02'
    model TEXT NOT NULL, -- 'gpt-4o' | 'gpt-4o-mini' | 'text-embedding-3-small'
    tokens_used BIGINT DEFAULT 0,
    tokens_limit BIGINT DEFAULT 1000000, -- 1M tokens/month default
    estimated_cost_usd FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(month_year, model)
);

-- ============================================================
-- 6. Helper function to update token budget
-- ============================================================
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

-- ============================================================
-- 7. Add is_synthetic column to existing interaction tables
-- ============================================================
DO $$
BEGIN
    -- Add to user_interactions if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_interactions') THEN
        ALTER TABLE public.user_interactions ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN DEFAULT false;
    END IF;
    
    -- Add to posts if exists (for twin-generated content)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN DEFAULT false;
        ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS source_trend_id UUID REFERENCES public.trend_suggestions(id);
    END IF;
END $$;

-- ============================================================
-- Seed initial personas (Anti-Cold Start)
-- ============================================================
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

-- ============================================================
-- Grant permissions
-- ============================================================
GRANT SELECT ON public.agent_logs TO authenticated;
GRANT SELECT ON public.agent_personas TO authenticated;
GRANT SELECT ON public.trend_suggestions TO authenticated;
GRANT SELECT ON public.growth_memory TO authenticated;
GRANT SELECT ON public.llm_budget_tracker TO authenticated;
