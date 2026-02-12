/**
 * Agent Orchestrator API Route
 * @ai-context Triggers the orchestrator to schedule and run agent tasks
 * 
 * GET  - Get orchestrator status
 * POST - Trigger orchestrator cycle
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOrchestrator } from '@/lib/agents/orchestrator'
import { logAgentAction, getTokenBudgetStatus } from '@/lib/agents/logger'

// Secret key for CRON jobs (should match Vercel/Supabase CRON config)
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret'

export async function GET() {
    try {
        const orchestrator = getOrchestrator()
        const status = await orchestrator.getStatus()

        return NextResponse.json({
            success: true,
            data: status,
        })
    } catch (error) {
        console.error('[API] Orchestrator status error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get orchestrator status' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify CRON secret for production
        const authHeader = request.headers.get('authorization')
        const cronSecret = request.headers.get('x-cron-secret')

        if (process.env.NODE_ENV === 'production') {
            if (cronSecret !== CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized' },
                    { status: 401 }
                )
            }
        }

        const orchestrator = getOrchestrator()

        // Check budget before running
        const hasBudget = await orchestrator.hasBudget()
        if (!hasBudget) {
            await logAgentAction({
                agentId: 'orchestrator',
                agentType: 'orchestrator',
                actionType: 'schedule',
                payload: { skipped: true, reason: 'budget_exceeded' },
                success: false,
                errorMessage: 'Monthly token budget exceeded',
            })

            return NextResponse.json({
                success: false,
                error: 'Monthly token budget exceeded',
                budget: await getTokenBudgetStatus(),
            }, { status: 429 })
        }

        // Start orchestrator if not running
        await orchestrator.start()

        // Retire expired personas
        const retiredCount = await orchestrator.retireExpiredPersonas()

        // Schedule persona actions for today
        const tasks = await orchestrator.schedulePersonaActions()

        return NextResponse.json({
            success: true,
            data: {
                personas_retired: retiredCount,
                tasks_scheduled: tasks.length,
                tasks: tasks.slice(0, 5), // Preview first 5 tasks
                budget: await getTokenBudgetStatus(),
            },
        })
    } catch (error) {
        console.error('[API] Orchestrator trigger error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to trigger orchestrator' },
            { status: 500 }
        )
    }
}
