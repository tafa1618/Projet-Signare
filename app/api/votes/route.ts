/**
 * API Routes pour le système de vote (likes) de la compétition "Sagnsé de la semaine"
 * @security Authentification requise, validation stricte, transactions atomiques
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { VoteCreateSchema } from '@/lib/validations/schemas'
import { handleFetchError } from '@/lib/errors'
import { logError, logSecurity } from '@/lib/logger'

/**
 * POST /api/votes
 * Créer un vote (like) pour une participation
 * 
 * @security Authentification requise
 * @security Vérification que la compétition est active
 * @security Vérification que l'utilisateur n'a pas déjà voté
 * @security Transaction atomique pour incrémenter likes_count
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Authentification
    // TODO: Remplacer par authentification réelle (middleware ou session)
    const authHeader = request.headers.get('authorization')
    const userId = request.headers.get('x-user-id') // Temporaire pour développement

    if (!userId) {
      logSecurity('Vote attempt without authentication', {
        authHeader: authHeader ? 'present' : 'missing',
      })
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // ✅ Validation du payload
    const body = await request.json()
    const validation = VoteCreateSchema.safeParse(body)

    if (!validation.success) {
      logSecurity('Invalid vote payload', {
        userId,
        errors: validation.error.issues,
      })
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { participation_id } = validation.data

    // ✅ Vérifier que la participation existe et que la compétition est active
    const { data: participation, error: participationError } = await supabase
      .from('participations')
      .select('id, competition_id, competition:competitions!inner(status)')
      .eq('id', participation_id)
      .single()

    if (participationError || !participation) {
      logSecurity('Vote attempt on non-existent participation', {
        userId,
        participation_id,
        error: participationError?.message,
      })
      return NextResponse.json({ error: 'Participation introuvable' }, { status: 404 })
    }

    // Type assertion pour accéder aux propriétés de la relation
    const competition = participation.competition as { status: string } | null

    if (!competition || competition.status !== 'active') {
      logSecurity('Vote attempt on inactive competition', {
        userId,
        participation_id,
        competition_status: competition?.status,
      })
      return NextResponse.json(
        { error: 'La compétition n\'est plus active' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que l'utilisateur n'a pas déjà voté (contrainte UNIQUE)
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('participation_id', participation_id)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (attendu si pas de vote)
      logError({
        message: 'Error checking existing vote',
        error: checkError,
        context: { userId, participation_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la vérification' },
        { status: 500 }
      )
    }

    if (existingVote) {
      logSecurity('Duplicate vote attempt', {
        userId,
        participation_id,
      })
      return NextResponse.json(
        { error: 'Vous avez déjà voté pour cette participation' },
        { status: 400 }
      )
    }

    // ✅ Créer le vote (trigger PostgreSQL incrémente automatiquement likes_count)
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: userId,
        participation_id,
      })
      .select('id, created_at')
      .single()

    if (voteError) {
      // Si erreur de contrainte unique, l'utilisateur a déjà voté (race condition)
      if (voteError.code === '23505') {
        logSecurity('Duplicate vote attempt (race condition)', {
          userId,
          participation_id,
        })
        return NextResponse.json(
          { error: 'Vous avez déjà voté pour cette participation' },
          { status: 400 }
        )
      }

      logError({
        message: 'Error creating vote',
        error: voteError,
        context: { userId, participation_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la création du vote' },
        { status: 500 }
      )
    }

    // ✅ Récupérer le nouveau likes_count (mis à jour par le trigger)
    const { data: updatedParticipation, error: countError } = await supabase
      .from('participations')
      .select('likes_count')
      .eq('id', participation_id)
      .single()

    if (countError || !updatedParticipation) {
      logError({
        message: 'Error fetching updated likes_count',
        error: countError,
        context: { participation_id },
      })
      // Le vote a été créé, on retourne quand même une réponse
      return NextResponse.json(
        {
          success: true,
          vote_id: vote.id,
          likes_count: null, // Indiquer que le compteur n'a pas pu être récupéré
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        vote_id: vote.id,
        likes_count: updatedParticipation.likes_count,
        created_at: vote.created_at,
      },
      { status: 201 }
    )
  } catch (err) {
    const errorMessage = handleFetchError(err, 'Erreur lors de la création du vote')
    logError({
      message: errorMessage,
      error: err instanceof Error ? err : new Error(String(err)),
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

