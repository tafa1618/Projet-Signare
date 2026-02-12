/**
 * Agent Logger Service
 * @ai-context Centralized logging for all agent actions with token tracking
 */

import { createClient } from '@supabase/supabase-js';
import type { AgentLog, AgentId, AgentType, ActionType } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface LogAgentActionParams {
    agentId: AgentId;
    agentType: AgentType;
    actionType: ActionType;
    payload?: Record<string, unknown>;
    isSynthetic?: boolean;
    success?: boolean;
    errorMessage?: string;
    tokensUsed?: number;
    expiresAt?: Date;
}

/**
 * Log an agent action to the database
 */
export async function logAgentAction({
    agentId,
    agentType,
    actionType,
    payload = {},
    isSynthetic = false,
    success = true,
    errorMessage,
    tokensUsed = 0,
    expiresAt,
}: LogAgentActionParams): Promise<AgentLog | null> {
    try {
        const { data, error } = await supabase
            .from('agent_logs')
            .insert({
                agent_id: agentId,
                agent_type: agentType,
                action_type: actionType,
                payload,
                is_synthetic: isSynthetic,
                success,
                error_message: errorMessage,
                tokens_used: tokensUsed,
                expires_at: expiresAt?.toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('[AgentLogger] Failed to log action:', error);
            return null;
        }

        // Update token budget if tokens were used
        if (tokensUsed > 0) {
            await incrementTokenUsage('gpt-4o', tokensUsed);
        }

        return data;
    } catch (err) {
        console.error('[AgentLogger] Exception:', err);
        return null;
    }
}

/**
 * Increment token usage for budget tracking
 */
async function incrementTokenUsage(model: string, tokens: number): Promise<void> {
    try {
        await supabase.rpc('increment_token_usage', {
            p_model: model,
            p_tokens: tokens,
        });
    } catch (err) {
        console.error('[AgentLogger] Failed to update token budget:', err);
    }
}

/**
 * Get current month's token usage
 */
export async function getTokenBudgetStatus(): Promise<{
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
} | null> {
    try {
        const monthYear = new Date().toISOString().slice(0, 7); // '2026-02'

        const { data, error } = await supabase
            .from('llm_budget_tracker')
            .select('tokens_used, tokens_limit')
            .eq('month_year', monthYear)
            .eq('model', 'gpt-4o')
            .single();

        if (error || !data) {
            return { used: 0, limit: 1000000, remaining: 1000000, percentUsed: 0 };
        }

        const remaining = data.tokens_limit - data.tokens_used;
        const percentUsed = (data.tokens_used / data.tokens_limit) * 100;

        return {
            used: data.tokens_used,
            limit: data.tokens_limit,
            remaining,
            percentUsed: Math.round(percentUsed * 100) / 100,
        };
    } catch (err) {
        console.error('[AgentLogger] Failed to get budget status:', err);
        return null;
    }
}

/**
 * Get recent agent logs for admin dashboard
 */
export async function getRecentAgentLogs(
    limit: number = 50,
    agentId?: AgentId
): Promise<AgentLog[]> {
    try {
        let query = supabase
            .from('agent_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (agentId) {
            query = query.eq('agent_id', agentId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[AgentLogger] Failed to fetch logs:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[AgentLogger] Exception:', err);
        return [];
    }
}

/**
 * Get agent action stats for dashboard
 */
export async function getAgentStats(days: number = 7): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByAgent: Record<string, number>;
    syntheticActions: number;
} | null> {
    try {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data, error } = await supabase
            .from('agent_logs')
            .select('agent_id, action_type, is_synthetic')
            .gte('created_at', since.toISOString());

        if (error || !data) {
            return null;
        }

        const actionsByType: Record<string, number> = {};
        const actionsByAgent: Record<string, number> = {};
        let syntheticActions = 0;

        data.forEach((log) => {
            actionsByType[log.action_type] = (actionsByType[log.action_type] || 0) + 1;
            actionsByAgent[log.agent_id] = (actionsByAgent[log.agent_id] || 0) + 1;
            if (log.is_synthetic) syntheticActions++;
        });

        return {
            totalActions: data.length,
            actionsByType,
            actionsByAgent,
            syntheticActions,
        };
    } catch (err) {
        console.error('[AgentLogger] Exception:', err);
        return null;
    }
}
