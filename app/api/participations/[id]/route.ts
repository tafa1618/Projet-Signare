/**
 * GET /api/participations/[id]
 * Récupérer les détails d'une participation avec likes_count et has_user_voted
 * 
 * @security Authentification optionnelle (pour has_user_voted)
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
    const { id: participation_id } = params

    // ✅ Validation de l'UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(participation_id)) {
      return NextResponse.json(
        { error: 'ID de participation invalide' },
        { status: 400 }
      )
    }

    // ✅ Récupérer la participation
    const { data: participation, error: participationError } = await supabase
      .from('participations')
      .select('*')
      .eq('id', participation_id)
      .single()

    if (participationError || !participation) {
      if (participationError?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Participation introuvable' },
          { status: 404 }
        )
      }

      logError({
        message: 'Error fetching participation',
        error: participationError,
        context: { participation_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      )
    }

    // ✅ Vérifier si l'utilisateur a voté (optionnel, si authentifié)
    const userId = request.headers.get('x-user-id') // Temporaire pour développement
    let has_user_voted = false

    if (userId) {
      const { data: vote, error: voteError } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', userId)
        .eq('participation_id', participation_id)
        .maybeSingle()

      if (voteError && voteError.code !== 'PGRST116') {
        logError({
          message: 'Error checking user vote',
          error: voteError,
          context: { userId, participation_id },
        })
        // On continue quand même, on retourne has_user_voted = false
      } else {
        has_user_voted = !!vote
      }
    }

    return NextResponse.json(
      {
        id: participation.id,
        user_id: participation.user_id,
        competition_id: participation.competition_id,
        category: participation.category,
        tailor_id: participation.tailor_id,
        media_type: participation.media_type,
        media_urls: participation.media_urls,
        likes_count: participation.likes_count,
        created_at: participation.created_at,
        updated_at: participation.updated_at,
        has_user_voted,
      },
      { status: 200 }
    )
  } catch (err) {
    const errorMessage = handleFetchError(err, 'Erreur lors de la récupération de la participation')
    logError({
      message: errorMessage,
      error: err instanceof Error ? err : new Error(String(err)),
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

