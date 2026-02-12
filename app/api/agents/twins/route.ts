/**
 * Twins Validation API Route
 * @ai-context Admin endpoints for approving/rejecting Digital Twin suggestions
 * 
 * POST - Approve or reject a twin suggestion
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTrendHunter } from '@/lib/agents/trend-hunter'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { twinId, action, reason, reviewerId } = body

        if (!twinId || !action || !reviewerId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: twinId, action, reviewerId' },
                { status: 400 }
            )
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, error: 'Invalid action. Use "approve" or "reject"' },
                { status: 400 }
            )
        }

        const hunter = getTrendHunter()
        let success: boolean

        if (action === 'approve') {
            success = await hunter.approveTrend(twinId, reviewerId)
        } else {
            if (!reason) {
                return NextResponse.json(
                    { success: false, error: 'Rejection reason required' },
                    { status: 400 }
                )
            }
            success = await hunter.rejectTrend(twinId, reviewerId, reason)
        }

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Failed to update twin status' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                twinId,
                action,
                message: action === 'approve'
                    ? 'Twin approved for publication'
                    : 'Twin rejected',
            },
        })
    } catch (error) {
        console.error('[API] Twins validation error:', error)
        return NextResponse.json(
            { success: false, error: 'Validation failed' },
            { status: 500 }
        )
    }
}
