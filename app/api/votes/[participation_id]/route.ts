/**
 * DELETE /api/votes/[participation_id]
 * Supprimer un vote (unlike) pour une participation
 * 
 * @security Authentification requise
 * @security Vérification de l'ownership (un utilisateur ne peut supprimer que ses propres votes)
 * @security Transaction atomique pour décrémenter likes_count
 * @security Idempotent (retourner 200 même si le vote n'existe pas)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { handleFetchError } from '@/lib/errors'
import { logError, logSecurity } from '@/lib/logger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { participation_id: string } }
) {
  try {
    // ✅ Authentification
    // TODO: Remplacer par authentification réelle (middleware ou session)
    const userId = request.headers.get('x-user-id') // Temporaire pour développement

    if (!userId) {
      logSecurity('Vote deletion attempt without authentication', {
        authHeader: request.headers.get('authorization') ? 'present' : 'missing',
      })
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    const { participation_id } = params

    // ✅ Validation de l'UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(participation_id)) {
      return NextResponse.json(
        { error: 'ID de participation invalide' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que le vote existe et appartient à l'utilisateur
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('participation_id', participation_id)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      logError({
        message: 'Error checking vote for deletion',
        error: checkError,
        context: { userId, participation_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la vérification' },
        { status: 500 }
      )
    }

    // ✅ Idempotent : si le vote n'existe pas, retourner 200 (déjà supprimé)
    if (!existingVote) {
      // Récupérer quand même le likes_count actuel pour la cohérence
      const { data: participation } = await supabase
        .from('participations')
        .select('likes_count')
        .eq('id', participation_id)
        .maybeSingle()

      return NextResponse.json(
        {
          success: true,
          message: 'Vote déjà supprimé',
          likes_count: participation?.likes_count ?? 0,
        },
        { status: 200 }
      )
    }

    // ✅ Supprimer le vote (trigger PostgreSQL décrémente automatiquement likes_count)
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId)
      .eq('participation_id', participation_id)

    if (deleteError) {
      logError({
        message: 'Error deleting vote',
        error: deleteError,
        context: { userId, participation_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du vote' },
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
        message: 'Error fetching updated likes_count after deletion',
        error: countError,
        context: { participation_id },
      })
      // Le vote a été supprimé, on retourne quand même une réponse
      return NextResponse.json(
        {
          success: true,
          likes_count: null, // Indiquer que le compteur n'a pas pu être récupéré
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        likes_count: updatedParticipation.likes_count,
      },
      { status: 200 }
    )
  } catch (err) {
    const errorMessage = handleFetchError(err, 'Erreur lors de la suppression du vote')
    logError({
      message: errorMessage,
      error: err instanceof Error ? err : new Error(String(err)),
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

