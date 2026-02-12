/**
 * Persona Execution API Route
 * @ai-context Executes persona actions (like, comment, follow, save)
 * 
 * POST - Execute a specific persona action
 */

import { NextRequest, NextResponse } from 'next/server'
import { executePersonaAction, getPersonaByName } from '@/lib/agents/personas'
import { logAgentAction, getTokenBudgetStatus } from '@/lib/agents/logger'

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret'

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

        const body = await request.json()
        const { personaName, actionType, targetId } = body

        if (!personaName || !actionType) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: personaName, actionType' },
                { status: 400 }
            )
        }

        if (!['like', 'comment', 'save', 'follow'].includes(actionType)) {
            return NextResponse.json(
                { success: false, error: 'Invalid action type' },
                { status: 400 }
            )
        }

        // Check budget
        const budget = await getTokenBudgetStatus()
        if (budget && budget.percentUsed > 95) {
            return NextResponse.json({
                success: false,
                error: 'Token budget exhausted',
                budget,
            }, { status: 429 })
        }

        // Get persona
        const persona = await getPersonaByName(personaName)
        if (!persona) {
            return NextResponse.json(
                { success: false, error: `Persona not found: ${personaName}` },
                { status: 404 }
            )
        }

        if (!persona.is_active) {
            return NextResponse.json(
                { success: false, error: 'Persona is inactive' },
                { status: 400 }
            )
        }

        // Execute action
        const success = await executePersonaAction(persona, actionType, targetId)

        return NextResponse.json({
            success,
            data: {
                persona: persona.name,
                action: actionType,
                target: targetId || 'random',
                budget: await getTokenBudgetStatus(),
            },
        })
    } catch (error) {
        console.error('[API] Persona execution error:', error)
        return NextResponse.json(
            { success: false, error: 'Action execution failed' },
            { status: 500 }
        )
    }
}
