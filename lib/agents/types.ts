/**
 * Multi-Agent System Types
 * @ai-context Type definitions for the Signare Agent Army
 */

// ============================================================
// AGENT TYPES
// ============================================================

export type AgentType = 'orchestrator' | 'persona' | 'hunter' | 'growth';

export type AgentId =
    | 'orchestrator'
    | `persona:${string}` // persona:fatou, persona:aissatou, etc.
    | 'trend_hunter'
    | 'growth_brain';

export type ActionType =
    // Persona actions
    | 'like'
    | 'comment'
    | 'follow'
    | 'save'
    | 'view'
    // Hunter actions
    | 'scan'
    | 'analyze'
    | 'suggest_twin'
    // Growth actions
    | 'insight'
    | 'report'
    | 'recommendation'
    // Orchestrator actions
    | 'spawn'
    | 'terminate'
    | 'schedule';

// ============================================================
// DATABASE MODELS
// ============================================================

export interface AgentLog {
    id: string;
    agent_id: AgentId;
    agent_type: AgentType;
    action_type: ActionType;
    payload: Record<string, unknown>;
    is_synthetic: boolean;
    success: boolean;
    error_message?: string;
    tokens_used: number;
    created_at: string;
    expires_at?: string;
}

export interface AgentPersona {
    id: string;
    name: string;
    avatar_url?: string;
    persona_type: 'elegant' | 'trendy' | 'classic' | 'diaspora';
    age?: number;
    location?: string;
    style_preferences: string[];
    behavior_profile: PersonaBehavior;
    is_active: boolean;
    total_actions: number;
    last_action_at?: string;
    created_at: string;
    expires_at?: string;
    retired_at?: string;
}

export interface PersonaBehavior {
    like_frequency: number;      // 0-1, probability of liking a post
    comment_probability: number; // 0-1, probability of commenting
    save_probability: number;    // 0-1, probability of saving
    follow_probability?: number; // 0-1, probability of following a tailor
    preferred_hours: number[];   // Hours of day when active (0-23)
    comment_templates?: string[]; // Template comments to use
}

export interface TrendSuggestion {
    id: string;
    source_url: string;
    source_platform: 'instagram' | 'pinterest';
    source_hashtags?: string[];
    image_url: string;
    detected_tags: TrendTags;
    ai_description?: string;
    twin_status: 'pending' | 'approved' | 'rejected' | 'published';
    rejection_reason?: string;
    priority_score: number;
    created_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
    published_at?: string;
    published_post_id?: string;
}

export interface TrendTags {
    colors: string[];
    style: string;
    garment_type: string;
    patterns?: string[];
    confidence: number;
}

export interface GrowthMemory {
    id: string;
    content: string;
    embedding?: number[];
    memory_type: 'insight' | 'decision' | 'observation' | 'trend' | 'recommendation';
    category?: 'pricing' | 'content' | 'user_behavior' | 'market' | 'competition';
    confidence_score: number;
    source_data: Record<string, unknown>;
    is_actionable: boolean;
    actioned_at?: string;
    created_at: string;
    relevance_decay_rate: number;
}

export interface LLMBudgetTracker {
    id: string;
    month_year: string;
    model: string;
    tokens_used: number;
    tokens_limit: number;
    estimated_cost_usd: number;
    created_at: string;
    updated_at: string;
}

// ============================================================
// AGENT ACTION PAYLOADS
// ============================================================

export interface PersonaLikePayload {
    post_id: string;
    reason?: string;
}

export interface PersonaCommentPayload {
    post_id: string;
    text: string;
    sentiment: 'positive' | 'question' | 'compliment';
}

export interface PersonaFollowPayload {
    tailor_id: string;
    reason?: string;
}

export interface HunterScanPayload {
    platform: 'instagram' | 'pinterest';
    hashtags: string[];
    posts_scanned: number;
    trends_found: number;
}

export interface GrowthInsightPayload {
    insight: string;
    data_sources: string[];
    recommendations: string[];
    confidence: number;
}

// ============================================================
// ORCHESTRATOR TYPES
// ============================================================

export interface AgentTask {
    id: string;
    agent_id: AgentId;
    task_type: ActionType;
    payload: Record<string, unknown>;
    scheduled_at: Date;
    priority: 'low' | 'medium' | 'high';
    retries: number;
    max_retries: number;
}

export interface OrchestratorConfig {
    persona_daily_actions_min: number;
    persona_daily_actions_max: number;
    hunter_scan_times: string[]; // ['06:00', '18:00']
    growth_report_day: number;   // Day of week (0 = Sunday)
    monthly_token_budget: number;
    enabled_agents: AgentId[];
}

export const DEFAULT_ORCHESTRATOR_CONFIG: OrchestratorConfig = {
    persona_daily_actions_min: 3,
    persona_daily_actions_max: 8,
    hunter_scan_times: ['06:00', '18:00'],
    growth_report_day: 1, // Monday
    monthly_token_budget: 1000000,
    enabled_agents: ['orchestrator', 'persona:fatou', 'persona:aissatou', 'persona:moussa', 'trend_hunter', 'growth_brain'],
};
