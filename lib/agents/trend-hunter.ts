/**
 * Trend Hunter Agent
 * @ai-context Scans Instagram/Pinterest for Senegalese fashion trends
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { logAgentAction } from './logger';
import type { TrendSuggestion, TrendTags } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Apify configuration
const APIFY_API_KEY = process.env.APIFY_API_KEY;
const APIFY_BASE_URL = 'https://api.apify.com/v2';

// Hashtags to monitor
const INSTAGRAM_HASHTAGS = [
    'modesénégalaise',
    'modeSenegalaise',
    'boubou',
    'boubousenegalais',
    'boubou2024',
    'kaftanafricain',
    'modeafricaine',
    'waxfashion',
    'africanfashion',
    'signare',
    'tabaski2024',
    'korite2024',
];

const PINTEREST_BOARDS = [
    'african fashion',
    'senegalese fashion',
    'boubou style',
    'african wedding dress',
    'african men fashion',
];

/**
 * Trend Hunter class
 */
export class TrendHunter {
    private lastScanAt: Date | null = null;

    /**
     * Run a full scan on all platforms
     */
    async runScan(): Promise<{
        trendsFound: number;
        platforms: Record<string, number>;
    }> {
        const results = {
            trendsFound: 0,
            platforms: {} as Record<string, number>,
        };

        try {
            // Scan Instagram
            const igTrends = await this.scanInstagram();
            results.platforms['instagram'] = igTrends.length;
            results.trendsFound += igTrends.length;

            // Scan Pinterest
            const pinterestTrends = await this.scanPinterest();
            results.platforms['pinterest'] = pinterestTrends.length;
            results.trendsFound += pinterestTrends.length;

            this.lastScanAt = new Date();

            await logAgentAction({
                agentId: 'trend_hunter',
                agentType: 'hunter',
                actionType: 'scan',
                payload: results,
                success: true,
            });

            return results;
        } catch (error) {
            await logAgentAction({
                agentId: 'trend_hunter',
                agentType: 'hunter',
                actionType: 'scan',
                payload: { error: error instanceof Error ? error.message : 'Unknown' },
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Scan failed',
            });

            throw error;
        }
    }

    /**
     * Scan Instagram using Apify
     */
    async scanInstagram(): Promise<TrendSuggestion[]> {
        if (!APIFY_API_KEY) {
            console.log('[TrendHunter] No Apify API key, using mock data');
            return this.getMockInstagramTrends();
        }

        try {
            // Use Apify Instagram Hashtag Scraper
            const response = await fetch(`${APIFY_BASE_URL}/acts/apify~instagram-hashtag-scraper/runs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${APIFY_API_KEY}`,
                },
                body: JSON.stringify({
                    hashtags: INSTAGRAM_HASHTAGS.slice(0, 5), // Limit for budget
                    resultsLimit: 20,
                    proxy: {
                        useApifyProxy: true,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`Apify request failed: ${response.statusText}`);
            }

            const runData = await response.json();

            // Wait for results (in production, use webhooks)
            await new Promise(resolve => setTimeout(resolve, 30000));

            // Fetch results
            const resultsResponse = await fetch(
                `${APIFY_BASE_URL}/actor-runs/${runData.data.id}/dataset/items`,
                {
                    headers: {
                        'Authorization': `Bearer ${APIFY_API_KEY}`,
                    },
                }
            );

            const results = await resultsResponse.json();

            // Process and analyze each image
            const trends: TrendSuggestion[] = [];

            for (const post of results.slice(0, 10)) {
                if (!post.displayUrl) continue;

                const analysis = await this.analyzeImage(post.displayUrl);

                if (analysis && analysis.confidence > 0.7) {
                    const trend = await this.saveTrendSuggestion({
                        source_url: post.url || `https://instagram.com/p/${post.shortCode}`,
                        source_platform: 'instagram',
                        source_hashtags: post.hashtags || [],
                        image_url: post.displayUrl,
                        detected_tags: analysis,
                        ai_description: analysis.description,
                        priority_score: analysis.confidence,
                    });

                    if (trend) trends.push(trend);
                }
            }

            return trends;
        } catch (error) {
            console.error('[TrendHunter] Instagram scan failed:', error);
            return [];
        }
    }

    /**
     * Scan Pinterest using Apify
     */
    async scanPinterest(): Promise<TrendSuggestion[]> {
        if (!APIFY_API_KEY) {
            console.log('[TrendHunter] No Apify API key, using mock data');
            return this.getMockPinterestTrends();
        }

        try {
            // Use Apify Pinterest Scraper
            const response = await fetch(`${APIFY_BASE_URL}/acts/alexey~pinterest-crawler/runs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${APIFY_API_KEY}`,
                },
                body: JSON.stringify({
                    search: PINTEREST_BOARDS[0],
                    maxPins: 15,
                }),
            });

            if (!response.ok) {
                throw new Error(`Apify request failed: ${response.statusText}`);
            }

            const runData = await response.json();

            // Wait for results
            await new Promise(resolve => setTimeout(resolve, 20000));

            // Fetch results
            const resultsResponse = await fetch(
                `${APIFY_BASE_URL}/actor-runs/${runData.data.id}/dataset/items`,
                {
                    headers: {
                        'Authorization': `Bearer ${APIFY_API_KEY}`,
                    },
                }
            );

            const results = await resultsResponse.json();

            const trends: TrendSuggestion[] = [];

            for (const pin of results.slice(0, 10)) {
                if (!pin.image) continue;

                const analysis = await this.analyzeImage(pin.image);

                if (analysis && analysis.confidence > 0.7) {
                    const trend = await this.saveTrendSuggestion({
                        source_url: pin.url,
                        source_platform: 'pinterest',
                        image_url: pin.image,
                        detected_tags: analysis,
                        ai_description: analysis.description,
                        priority_score: analysis.confidence,
                    });

                    if (trend) trends.push(trend);
                }
            }

            return trends;
        } catch (error) {
            console.error('[TrendHunter] Pinterest scan failed:', error);
            return [];
        }
    }

    /**
     * Analyze an image using GPT-4o Vision
     */
    async analyzeImage(imageUrl: string): Promise<(TrendTags & { description: string }) | null> {
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert en mode africaine, spécialisé dans la mode sénégalaise (boubous, kaftans, tenues traditionnelles). Analyse les images de mode et extrait les informations suivantes en JSON:
- colors: liste des couleurs dominantes (max 3)
- style: 'traditionnel' | 'moderne' | 'fusion' | 'cérémonie'
- garment_type: 'boubou' | 'kaftan' | 'grand_boubou' | 'ensemble' | 'robe' | 'autre'
- patterns: liste des motifs (broderie, wax, bazin, etc.)
- confidence: score de 0 à 1 indiquant si c'est bien de la mode africaine
- description: courte description marketing (max 20 mots)`,
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl },
                            },
                            {
                                type: 'text',
                                text: 'Analyse cette image de mode. Retourne uniquement le JSON.',
                            },
                        ],
                    },
                ],
                max_tokens: 300,
                response_format: { type: 'json_object' },
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) return null;

            const analysis = JSON.parse(content);

            // Log token usage
            await logAgentAction({
                agentId: 'trend_hunter',
                agentType: 'hunter',
                actionType: 'analyze',
                payload: { image_url: imageUrl, analysis },
                tokensUsed: completion.usage?.total_tokens || 0,
            });

            return {
                colors: analysis.colors || [],
                style: analysis.style || 'traditionnel',
                garment_type: analysis.garment_type || 'boubou',
                patterns: analysis.patterns || [],
                confidence: analysis.confidence || 0.5,
                description: analysis.description || '',
            };
        } catch (error) {
            console.error('[TrendHunter] Image analysis failed:', error);
            return null;
        }
    }

    /**
     * Save a trend suggestion to the database
     */
    async saveTrendSuggestion(data: Omit<TrendSuggestion, 'id' | 'created_at' | 'twin_status'>): Promise<TrendSuggestion | null> {
        // Check for duplicates
        const { data: existing } = await supabase
            .from('trend_suggestions')
            .select('id')
            .eq('source_url', data.source_url)
            .single();

        if (existing) {
            console.log('[TrendHunter] Duplicate trend skipped:', data.source_url);
            return null;
        }

        const { data: trend, error } = await supabase
            .from('trend_suggestions')
            .insert({
                ...data,
                twin_status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('[TrendHunter] Failed to save trend:', error);
            return null;
        }

        await logAgentAction({
            agentId: 'trend_hunter',
            agentType: 'hunter',
            actionType: 'suggest_twin',
            payload: { trend_id: trend.id, source: data.source_platform },
        });

        return trend;
    }

    /**
     * Get pending trend suggestions for admin review
     */
    async getPendingTrends(limit: number = 20): Promise<TrendSuggestion[]> {
        const { data, error } = await supabase
            .from('trend_suggestions')
            .select('*')
            .eq('twin_status', 'pending')
            .order('priority_score', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[TrendHunter] Failed to fetch pending trends:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Approve a trend suggestion
     */
    async approveTrend(trendId: string, reviewerId: string): Promise<boolean> {
        const { error } = await supabase
            .from('trend_suggestions')
            .update({
                twin_status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: reviewerId,
            })
            .eq('id', trendId);

        return !error;
    }

    /**
     * Reject a trend suggestion
     */
    async rejectTrend(trendId: string, reviewerId: string, reason: string): Promise<boolean> {
        const { error } = await supabase
            .from('trend_suggestions')
            .update({
                twin_status: 'rejected',
                reviewed_at: new Date().toISOString(),
                reviewed_by: reviewerId,
                rejection_reason: reason,
            })
            .eq('id', trendId);

        return !error;
    }

    /**
     * Mock Instagram trends for testing
     */
    private getMockInstagramTrends(): TrendSuggestion[] {
        return [
            {
                id: 'mock-ig-1',
                source_url: 'https://instagram.com/p/mock1',
                source_platform: 'instagram',
                source_hashtags: ['#boubou', '#modesénégalaise'],
                image_url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600',
                detected_tags: {
                    colors: ['bleu marine', 'or'],
                    style: 'cérémonie',
                    garment_type: 'grand_boubou',
                    confidence: 0.92,
                },
                ai_description: 'Grand boubou bleu marine avec broderie dorée, parfait pour les cérémonies.',
                twin_status: 'pending',
                priority_score: 0.92,
                created_at: new Date().toISOString(),
            },
        ];
    }

    /**
     * Mock Pinterest trends for testing
     */
    private getMockPinterestTrends(): TrendSuggestion[] {
        return [
            {
                id: 'mock-pin-1',
                source_url: 'https://pinterest.com/pin/mock1',
                source_platform: 'pinterest',
                image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
                detected_tags: {
                    colors: ['wax multicolore', 'jaune'],
                    style: 'moderne',
                    garment_type: 'robe',
                    confidence: 0.88,
                },
                ai_description: 'Robe moderne en wax coloré, coupe contemporaine et élégante.',
                twin_status: 'pending',
                priority_score: 0.88,
                created_at: new Date().toISOString(),
            },
        ];
    }
}

// Singleton
let trendHunterInstance: TrendHunter | null = null;

export function getTrendHunter(): TrendHunter {
    if (!trendHunterInstance) {
        trendHunterInstance = new TrendHunter();
    }
    return trendHunterInstance;
}
