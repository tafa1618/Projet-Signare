/**
 * GET /api/competitions/[id]/leaderboard
 * Récupérer le classement (Top participations) par catégorie
 * 
 * @security Lecture publique (pas d'authentification requise)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { handleFetchError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id: competition_id } = params

    // ✅ Validation de l'UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(competition_id)) {
      return NextResponse.json(
        { error: 'ID de compétition invalide' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que la compétition existe
    const { data: competition, error: competitionError } = await supabase
      .from('competitions')
      .select('id, status')
      .eq('id', competition_id)
      .single()

    if (competitionError || !competition) {
      if (competitionError?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Compétition introuvable' },
          { status: 404 }
        )
      }

      logError({
        message: 'Error fetching competition',
        error: competitionError,
        context: { competition_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      )
    }

    // ✅ Récupérer le top participations par catégorie (HOMME et FEMME)
    const { data: participations, error: participationsError } = await supabase
      .from('participations')
      .select('id, user_id, category, tailor_id, media_type, media_urls, likes_count, created_at')
      .eq('competition_id', competition_id)
      .in('category', ['HOMME', 'FEMME'])
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: true }) // En cas d'égalité, le plus ancien en premier

    if (participationsError) {
      logError({
        message: 'Error fetching leaderboard',
        error: participationsError,
        context: { competition_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du classement' },
        { status: 500 }
      )
    }

    // ✅ Grouper par catégorie
    const leaderboard = {
      HOMME: (participations || [])
        .filter((p) => p.category === 'HOMME')
        .slice(0, 10), // Top 10
      FEMME: (participations || [])
        .filter((p) => p.category === 'FEMME')
        .slice(0, 10), // Top 10
    }

    // ✅ Calculer le gagnant tailleur (participation avec le plus de likes parmi toutes les participations)
    // Note: Le backend peut être configuré pour utiliser la stratégie "max likes" ou "cumul par tailor_id"
    const STRATEGY_TAILOR_WINNER = 'max_likes' // Configurable: 'max_likes' | 'cumulative'

    let tailor_winner = null
    if (STRATEGY_TAILOR_WINNER === 'max_likes') {
      // Stratégie: participation avec le plus de likes
      const topParticipation = (participations || [])
        .sort((a, b) => b.likes_count - a.likes_count)[0]

      if (topParticipation) {
        tailor_winner = {
          tailor_id: topParticipation.tailor_id,
          participation_id: topParticipation.id,
          likes_count: topParticipation.likes_count,
        }
      }
    } else if (STRATEGY_TAILOR_WINNER === 'cumulative') {
      // Stratégie: cumul des likes par tailor_id
      const tailorScores = new Map<string, { tailor_id: string; total_likes: number }>()

      ;(participations || []).forEach((p) => {
        const existing = tailorScores.get(p.tailor_id) || { tailor_id: p.tailor_id, total_likes: 0 }
        existing.total_likes += p.likes_count
        tailorScores.set(p.tailor_id, existing)
      })

      const topTailor = Array.from(tailorScores.values())
        .sort((a, b) => b.total_likes - a.total_likes)[0]

      if (topTailor) {
        tailor_winner = {
          tailor_id: topTailor.tailor_id,
          total_likes: topTailor.total_likes,
        }
      }
    }

    return NextResponse.json(
      {
        competition_id,
        competition_status: competition.status,
        leaderboard,
        tailor_winner,
      },
      { status: 200 }
    )
  } catch (err) {
    const errorMessage = handleFetchError(err, 'Erreur lors de la récupération du classement')
    logError({
      message: errorMessage,
      error: err instanceof Error ? err : new Error(String(err)),
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

