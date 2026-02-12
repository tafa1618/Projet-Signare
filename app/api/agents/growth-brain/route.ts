/**
 * Growth Brain API Route
 * @ai-context Generates business insights and weekly reports
 * 
 * GET  - Get actionable insights and dashboard data
 * POST - Generate weekly report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getGrowthBrain } from '@/lib/agents/growth-brain'
import { getTokenBudgetStatus } from '@/lib/agents/logger'

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'dashboard'
    
    const brain = getGrowthBrain()
    
    if (action === 'dashboard') {
      const dashboardData = await brain.getDashboardData()
      return NextResponse.json({
        success: true,
        data: dashboardData,
      })
    }
    
    if (action === 'actionable') {
      const limit = parseInt(searchParams.get('limit') || '10')
      const insights = await brain.getActionableInsights(limit)
      return NextResponse.json({
        success: true,
        data: {
          count: insights.length,
          insights,
        },
      })
    }
    
    if (action === 'search') {
      const query = searchParams.get('q')
      if (!query) {
        return NextResponse.json(
          { success: false, error: 'Query parameter required' },
          { status: 400 }
        )
      }
      const results = await brain.searchMemory(query)
      return NextResponse.json({
        success: true,
        data: {
          query,
          count: results.length,
          results,
        },
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API] Growth Brain GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insights' },
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
    if (budget && budget.percentUsed > 95) {
      return NextResponse.json({
        success: false,
        error: 'Token budget exhausted',
        budget,
      }, { status: 429 })
    }

    const brain = getGrowthBrain()
    const report = await brain.generateWeeklyReport()

    return NextResponse.json({
      success: true,
      data: {
        summary: report.summary,
        insights_generated: report.insights.length,
        recommendations: report.recommendations,
        budget: await getTokenBudgetStatus(),
      },
    })
  } catch (error) {
    console.error('[API] Growth Brain report error:', error)
    return NextResponse.json(
      { success: false, error: 'Report generation failed' },
      { status: 500 }
    )
  }
}
