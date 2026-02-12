/**
 * Growth Brain Agent
 * @ai-context Long-term memory and business insights generator
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { logAgentAction } from './logger';
import type { GrowthMemory } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Growth Brain class
 * Analyzes data and generates business insights
 */
export class GrowthBrain {

    /**
     * Generate weekly business report
     */
    async generateWeeklyReport(): Promise<{
        summary: string;
        insights: GrowthMemory[];
        recommendations: string[];
    }> {
        try {
            // Gather data from the past week
            const weekData = await this.gatherWeeklyData();

            // Generate insights using GPT-4o
            const analysis = await this.analyzeDataWithAI(weekData);

            // Store insights in memory
            const storedInsights: GrowthMemory[] = [];
            for (const insight of analysis.insights) {
                const stored = await this.storeInsight(insight);
                if (stored) storedInsights.push(stored);
            }

            await logAgentAction({
                agentId: 'growth_brain',
                agentType: 'growth',
                actionType: 'report',
                payload: {
                    period: 'weekly',
                    insights_generated: storedInsights.length,
                    recommendations: analysis.recommendations.length,
                },
            });

            return {
                summary: analysis.summary,
                insights: storedInsights,
                recommendations: analysis.recommendations,
            };
        } catch (error) {
            console.error('[GrowthBrain] Weekly report failed:', error);
            throw error;
        }
    }

    /**
     * Gather data from the past week
     */
    private async gatherWeeklyData(): Promise<Record<string, unknown>> {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoISO = weekAgo.toISOString();

        // Fetch various metrics
        const [
            userInteractions,
            newUsers,
            trendSuggestions,
            agentActions,
        ] = await Promise.all([
            // User interactions count
            supabase
                .from('user_interactions')
                .select('interaction_type', { count: 'exact' })
                .gte('created_at', weekAgoISO),

            // New users
            supabase
                .from('users')
                .select('id', { count: 'exact' })
                .gte('created_at', weekAgoISO),

            // Trend suggestions processed
            supabase
                .from('trend_suggestions')
                .select('twin_status', { count: 'exact' })
                .gte('created_at', weekAgoISO),

            // Agent actions
            supabase
                .from('agent_logs')
                .select('agent_type, action_type')
                .gte('created_at', weekAgoISO),
        ]);

        // Aggregate interaction types
        const interactionsByType: Record<string, number> = {};
        if (userInteractions.data) {
            // Group by interaction_type would be done in real query
        }

        return {
            period: {
                start: weekAgoISO,
                end: new Date().toISOString(),
            },
            metrics: {
                total_interactions: userInteractions.count || 0,
                new_users: newUsers.count || 0,
                trends_analyzed: trendSuggestions.count || 0,
                agent_actions: agentActions.data?.length || 0,
            },
            interactions_by_type: interactionsByType,
        };
    }

    /**
     * Analyze data with GPT-4o
     */
    private async analyzeDataWithAI(data: Record<string, unknown>): Promise<{
        summary: string;
        insights: Array<{
            content: string;
            type: GrowthMemory['memory_type'];
            category: GrowthMemory['category'];
            confidence: number;
            is_actionable: boolean;
        }>;
        recommendations: string[];
    }> {
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un analyste business senior pour Signare, une plateforme de mode sur-mesure africaine. Tu analyses les données de la semaine et génères des insights actionnables.

Réponds en JSON avec:
- summary: résumé exécutif (2-3 phrases)
- insights: liste d'insights (max 5), chacun avec:
  - content: l'insight en français
  - type: 'observation' | 'trend' | 'insight' | 'recommendation'
  - category: 'pricing' | 'content' | 'user_behavior' | 'market'
  - confidence: score 0-1
  - is_actionable: true si une action concrète est possible
- recommendations: liste de 3-5 recommandations concrètes`,
                    },
                    {
                        role: 'user',
                        content: `Voici les données de la semaine pour Signare:\n${JSON.stringify(data, null, 2)}`,
                    },
                ],
                max_tokens: 1000,
                response_format: { type: 'json_object' },
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No response from AI');

            const analysis = JSON.parse(content);

            await logAgentAction({
                agentId: 'growth_brain',
                agentType: 'growth',
                actionType: 'insight',
                payload: { insights_count: analysis.insights?.length || 0 },
                tokensUsed: completion.usage?.total_tokens || 0,
            });

            return {
                summary: analysis.summary || 'Aucun résumé disponible.',
                insights: analysis.insights || [],
                recommendations: analysis.recommendations || [],
            };
        } catch (error) {
            console.error('[GrowthBrain] AI analysis failed:', error);
            return {
                summary: 'Analyse impossible cette semaine.',
                insights: [],
                recommendations: [],
            };
        }
    }

    /**
     * Store an insight in the growth memory with embedding
     */
    async storeInsight(insight: {
        content: string;
        type: GrowthMemory['memory_type'];
        category?: GrowthMemory['category'];
        confidence: number;
        is_actionable: boolean;
        source_data?: Record<string, unknown>;
    }): Promise<GrowthMemory | null> {
        try {
            // Generate embedding for semantic search
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: insight.content,
            });

            const embedding = embeddingResponse.data[0]?.embedding;

            const { data, error } = await supabase
                .from('growth_memory')
                .insert({
                    content: insight.content,
                    embedding,
                    memory_type: insight.type,
                    category: insight.category,
                    confidence_score: insight.confidence,
                    is_actionable: insight.is_actionable,
                    source_data: insight.source_data || {},
                })
                .select()
                .single();

            if (error) {
                console.error('[GrowthBrain] Failed to store insight:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('[GrowthBrain] Store insight failed:', error);
            return null;
        }
    }

    /**
     * Search memory for similar insights
     */
    async searchMemory(query: string, limit: number = 5): Promise<GrowthMemory[]> {
        try {
            // Generate embedding for query
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: query,
            });

            const queryEmbedding = embeddingResponse.data[0]?.embedding;

            // Search using pgvector
            const { data, error } = await supabase.rpc('match_growth_memory', {
                query_embedding: queryEmbedding,
                match_threshold: 0.7,
                match_count: limit,
            });

            if (error) {
                console.error('[GrowthBrain] Memory search failed:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('[GrowthBrain] Memory search error:', error);
            return [];
        }
    }

    /**
     * Get actionable insights
     */
    async getActionableInsights(limit: number = 10): Promise<GrowthMemory[]> {
        const { data, error } = await supabase
            .from('growth_memory')
            .select('*')
            .eq('is_actionable', true)
            .is('actioned_at', null)
            .order('confidence_score', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[GrowthBrain] Failed to fetch actionable insights:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Mark insight as actioned
     */
    async markAsActioned(insightId: string): Promise<boolean> {
        const { error } = await supabase
            .from('growth_memory')
            .update({ actioned_at: new Date().toISOString() })
            .eq('id', insightId);

        return !error;
    }

    /**
     * Get growth dashboard data
     */
    async getDashboardData(): Promise<{
        totalInsights: number;
        actionableCount: number;
        recentInsights: GrowthMemory[];
        categoryBreakdown: Record<string, number>;
    }> {
        const [total, actionable, recent] = await Promise.all([
            supabase.from('growth_memory').select('id', { count: 'exact' }),
            supabase.from('growth_memory').select('id', { count: 'exact' }).eq('is_actionable', true).is('actioned_at', null),
            supabase.from('growth_memory').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        // Get category breakdown
        const { data: categories } = await supabase
            .from('growth_memory')
            .select('category');

        const categoryBreakdown: Record<string, number> = {};
        categories?.forEach(item => {
            if (item.category) {
                categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
            }
        });

        return {
            totalInsights: total.count || 0,
            actionableCount: actionable.count || 0,
            recentInsights: recent.data || [],
            categoryBreakdown,
        };
    }
}

// Singleton
let growthBrainInstance: GrowthBrain | null = null;

export function getGrowthBrain(): GrowthBrain {
    if (!growthBrainInstance) {
        growthBrainInstance = new GrowthBrain();
    }
    return growthBrainInstance;
}
