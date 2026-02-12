/**
 * Trend Hunter API Route
 * @ai-context Triggers trend scanning on Instagram/Pinterest
 * 
 * GET  - Get pending trend suggestions
 * POST - Trigger a new scan
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTrendHunter } from '@/lib/agents/trend-hunter'
import { getTokenBudgetStatus } from '@/lib/agents/logger'

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')

        const hunter = getTrendHunter()
        const pendingTrends = await hunter.getPendingTrends(limit)

        return NextResponse.json({
            success: true,
            data: {
                count: pendingTrends.length,
                trends: pendingTrends,
            },
        })
    } catch (error) {
        console.error('[API] Trend Hunter GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch trends' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify CRON secret
        const cronSecret = request.headers.get('x-cron-secret')
        const authHeader = request.headers.get('authorization')

        if (process.env.NODE_ENV === 'production') {
            if (cronSecret !== CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized' },
                    { status: 401 }
                )
            }
        }

        // Check budget
        const budget = await getTokenBudgetStatus()
        if (budget && budget.percentUsed > 90) {
            return NextResponse.json({
                success: false,
                error: 'Token budget nearly exhausted',
                budget,
            }, { status: 429 })
        }

        const hunter = getTrendHunter()
        const results = await hunter.runScan()

        return NextResponse.json({
            success: true,
            data: {
                ...results,
                budget: await getTokenBudgetStatus(),
            },
        })
    } catch (error) {
        console.error('[API] Trend Hunter scan error:', error)
        return NextResponse.json(
            { success: false, error: 'Scan failed' },
            { status: 500 }
        )
    }
}
