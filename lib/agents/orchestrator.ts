/**
 * Orchestrator Agent
 * @ai-context Master coordinator for all Signare agents
 */

import { createClient } from '@supabase/supabase-js';
import { logAgentAction, getTokenBudgetStatus } from './logger';
import type {
    AgentPersona,
    OrchestratorConfig,
    AgentTask,
    DEFAULT_ORCHESTRATOR_CONFIG
} from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Main Orchestrator class
 * Coordinates all agents and manages their lifecycle
 */
export class Orchestrator {
    private config: OrchestratorConfig;
    private isRunning: boolean = false;

    constructor(config?: Partial<OrchestratorConfig>) {
        this.config = {
            persona_daily_actions_min: 3,
            persona_daily_actions_max: 8,
            hunter_scan_times: ['06:00', '18:00'],
            growth_report_day: 1,
            monthly_token_budget: 1000000,
            enabled_agents: ['orchestrator', 'persona:fatou', 'persona:aissatou', 'persona:moussa', 'trend_hunter', 'growth_brain'],
            ...config,
        };
    }

    /**
     * Start the orchestrator
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('[Orchestrator] Already running');
            return;
        }

        this.isRunning = true;

        await logAgentAction({
            agentId: 'orchestrator',
            agentType: 'orchestrator',
            actionType: 'spawn',
            payload: { config: this.config },
        });

        console.log('[Orchestrator] Started with config:', this.config);
    }

    /**
     * Stop the orchestrator
     */
    async stop(): Promise<void> {
        this.isRunning = false;

        await logAgentAction({
            agentId: 'orchestrator',
            agentType: 'orchestrator',
            actionType: 'terminate',
            payload: { reason: 'manual_stop' },
        });

        console.log('[Orchestrator] Stopped');
    }

    /**
     * Check if we have budget to run agents
     */
    async hasBudget(): Promise<boolean> {
        const budget = await getTokenBudgetStatus();
        if (!budget) return true; // Assume yes if can't check

        return budget.remaining > 1000; // Need at least 1000 tokens
    }

    /**
     * Get all active personas
     */
    async getActivePersonas(): Promise<AgentPersona[]> {
        const { data, error } = await supabase
            .from('agent_personas')
            .select('*')
            .eq('is_active', true)
            .is('retired_at', null);

        if (error) {
            console.error('[Orchestrator] Failed to fetch personas:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Check and retire expired personas
     */
    async retireExpiredPersonas(): Promise<number> {
        const { data, error } = await supabase
            .from('agent_personas')
            .update({
                is_active: false,
                retired_at: new Date().toISOString()
            })
            .lt('expires_at', new Date().toISOString())
            .is('retired_at', null)
            .select();

        if (error) {
            console.error('[Orchestrator] Failed to retire personas:', error);
            return 0;
        }

        const retiredCount = data?.length || 0;

        if (retiredCount > 0) {
            await logAgentAction({
                agentId: 'orchestrator',
                agentType: 'orchestrator',
                actionType: 'terminate',
                payload: {
                    reason: 'lifespan_expired',
                    personas_retired: data?.map(p => p.name),
                },
            });
        }

        return retiredCount;
    }

    /**
     * Schedule persona actions for the day
     * Returns tasks to be executed
     */
    async schedulePersonaActions(): Promise<AgentTask[]> {
        const personas = await this.getActivePersonas();
        const tasks: AgentTask[] = [];

        for (const persona of personas) {
            const behavior = persona.behavior_profile;
            const actionsToday = this.randomBetween(
                this.config.persona_daily_actions_min,
                this.config.persona_daily_actions_max
            );

            for (let i = 0; i < actionsToday; i++) {
                // Pick a random preferred hour
                const hour = behavior.preferred_hours[
                    Math.floor(Math.random() * behavior.preferred_hours.length)
                ];

                // Determine action type based on probabilities
                const actionType = this.pickActionByProbability(behavior);

                const scheduledAt = new Date();
                scheduledAt.setHours(hour, this.randomBetween(0, 59), 0, 0);

                tasks.push({
                    id: `${persona.id}-${Date.now()}-${i}`,
                    agent_id: `persona:${persona.name.toLowerCase().split(' ')[0]}`,
                    task_type: actionType,
                    payload: { persona_id: persona.id },
                    scheduled_at: scheduledAt,
                    priority: 'medium',
                    retries: 0,
                    max_retries: 3,
                });
            }
        }

        await logAgentAction({
            agentId: 'orchestrator',
            agentType: 'orchestrator',
            actionType: 'schedule',
            payload: {
                tasks_scheduled: tasks.length,
                personas: personas.map(p => p.name),
            },
        });

        return tasks;
    }

    /**
     * Pick an action type based on persona behavior probabilities
     */
    private pickActionByProbability(behavior: AgentPersona['behavior_profile']): 'like' | 'comment' | 'save' | 'follow' {
        const rand = Math.random();
        let cumulative = 0;

        // Normalize probabilities
        const total = behavior.like_frequency +
            behavior.comment_probability +
            behavior.save_probability +
            (behavior.follow_probability || 0.1);

        cumulative += behavior.like_frequency / total;
        if (rand < cumulative) return 'like';

        cumulative += behavior.comment_probability / total;
        if (rand < cumulative) return 'comment';

        cumulative += behavior.save_probability / total;
        if (rand < cumulative) return 'save';

        return 'follow';
    }

    /**
     * Get random number between min and max (inclusive)
     */
    private randomBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get orchestrator status for admin dashboard
     */
    async getStatus(): Promise<{
        isRunning: boolean;
        activePersonas: number;
        budgetStatus: Awaited<ReturnType<typeof getTokenBudgetStatus>>;
        config: OrchestratorConfig;
    }> {
        const personas = await this.getActivePersonas();
        const budgetStatus = await getTokenBudgetStatus();

        return {
            isRunning: this.isRunning,
            activePersonas: personas.length,
            budgetStatus,
            config: this.config,
        };
    }
}

// Singleton instance
let orchestratorInstance: Orchestrator | null = null;

export function getOrchestrator(config?: Partial<OrchestratorConfig>): Orchestrator {
    if (!orchestratorInstance) {
        orchestratorInstance = new Orchestrator(config);
    }
    return orchestratorInstance;
}
