/**
 * Agent Stats API Route
 * @ai-context Provides statistics and logs for the admin dashboard
 * 
 * GET - Get agent statistics and recent logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAgentStats, getRecentAgentLogs, getTokenBudgetStatus } from '@/lib/agents/logger'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'stats'
        const days = parseInt(searchParams.get('days') || '7')
        const limit = parseInt(searchParams.get('limit') || '50')
        const agentId = searchParams.get('agent') || undefined

        if (action === 'stats') {
            const stats = await getAgentStats(days)
            const budget = await getTokenBudgetStatus()

            return NextResponse.json({
                success: true,
                data: {
                    period: `${days} days`,
                    stats,
                    budget,
                },
            })
        }

        if (action === 'logs') {
            const logs = await getRecentAgentLogs(limit, agentId as any)

            return NextResponse.json({
                success: true,
                data: {
                    count: logs.length,
                    logs,
                },
            })
        }

        if (action === 'budget') {
            const budget = await getTokenBudgetStatus()

            return NextResponse.json({
                success: true,
                data: budget,
            })
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action. Use: stats, logs, budget' },
            { status: 400 }
        )
    } catch (error) {
        console.error('[API] Agent stats error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
