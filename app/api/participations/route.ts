/**
 * POST /api/participations
 * Créer une participation à la compétition "Sagnsé de la semaine"
 * 
 * @security Authentification requise
 * @security Validation stricte des données
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { handleFetchError } from '@/lib/errors'
import { logError, logSecurity } from '@/lib/logger'
import { z } from 'zod'

/**
 * Schéma de validation pour créer une participation
 */
const ParticipationCreateSchema = z.object({
  competition_id: z.string().uuid('ID de compétition invalide'),
  category: z.enum(['HOMME', 'FEMME'], {
    errorMap: () => ({ message: 'Catégorie invalide (HOMME ou FEMME)' })
  }),
  tailor_id: z.string().uuid('ID de tailleur invalide'),
  media_type: z.enum(['PHOTOS', 'VIDEO'], {
    errorMap: () => ({ message: 'Type de média invalide (PHOTOS ou VIDEO)' })
  }),
  media_urls: z.array(z.string().url('URL invalide')).min(1, 'Au moins un média requis'),
  add_to_feed: z.boolean().optional().default(false), // Option pour ajouter au feed
})

export type ParticipationCreateInput = z.infer<typeof ParticipationCreateSchema>

/**
 * POST /api/participations
 * Créer une nouvelle participation
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Authentification
    // TODO: Remplacer par authentification réelle (middleware ou session)
    const userId = request.headers.get('x-user-id') // Temporaire pour développement

    if (!userId) {
      logSecurity('Participation creation attempt without authentication', {
        authHeader: request.headers.get('authorization') ? 'present' : 'missing',
      })
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // ✅ Validation du payload
    const body = await request.json()
    const validation = ParticipationCreateSchema.safeParse(body)

    if (!validation.success) {
      logSecurity('Invalid participation payload', {
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

    const { competition_id, category, tailor_id, media_type, media_urls, add_to_feed } = validation.data

    // ✅ Vérifier que la compétition existe et est active
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
        { error: 'Erreur lors de la vérification de la compétition' },
        { status: 500 }
      )
    }

    if (competition.status !== 'active') {
      logSecurity('Participation attempt on inactive competition', {
        userId,
        competition_id,
        competition_status: competition.status,
      })
      return NextResponse.json(
        { error: 'La compétition n\'est plus active' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que l'utilisateur n'a pas déjà participé à cette compétition
    const { data: existingParticipation, error: checkError } = await supabase
      .from('participations')
      .select('id')
      .eq('user_id', userId)
      .eq('competition_id', competition_id)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      logError({
        message: 'Error checking existing participation',
        error: checkError,
        context: { userId, competition_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la vérification' },
        { status: 500 }
      )
    }

    if (existingParticipation) {
      logSecurity('Duplicate participation attempt', {
        userId,
        competition_id,
      })
      return NextResponse.json(
        { error: 'Vous avez déjà participé à cette compétition' },
        { status: 400 }
      )
    }

    // ✅ Créer la participation
    const { data: participation, error: participationError } = await supabase
      .from('participations')
      .insert({
        user_id: userId,
        competition_id,
        category,
        tailor_id,
        media_type,
        media_urls,
      })
      .select('id, created_at')
      .single()

    if (participationError) {
      // Si erreur de contrainte unique, l'utilisateur a déjà participé (race condition)
      if (participationError.code === '23505') {
        logSecurity('Duplicate participation attempt (race condition)', {
          userId,
          competition_id,
        })
        return NextResponse.json(
          { error: 'Vous avez déjà participé à cette compétition' },
          { status: 400 }
        )
      }

      logError({
        message: 'Error creating participation',
        error: participationError,
        context: { userId, competition_id },
      })
      return NextResponse.json(
        { error: 'Erreur lors de la création de la participation' },
        { status: 500 }
      )
    }

    // ✅ Si add_to_feed est true, créer un post dans le feed
    if (add_to_feed && media_urls.length > 0) {
      try {
        // Prendre le premier média comme image principale
        const mainImageUrl = media_urls[0]

        // Créer un post avec les données de la participation
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: userId,
            image_url: mainImageUrl,
            caption: `Participation à la compétition "Sagnsé de la semaine" - Catégorie ${category}`,
            garment_type: 'autre', // Valeur par défaut, l'utilisateur peut modifier plus tard
            complexity: 'moyen', // Valeur par défaut
            gender_target: category === 'HOMME' ? 'homme' : category === 'FEMME' ? 'femme' : null,
            // Champs optionnels laissés vides (peuvent être enrichis plus tard)
          })
          .select('id')
          .single()

        if (postError) {
          // Log l'erreur mais ne bloque pas la création de la participation
          logError({
            message: 'Error creating post from participation',
            error: postError,
            context: {
              userId,
              participation_id: participation.id,
              competition_id,
            },
          })
          // On continue quand même, la participation a été créée
        } else {
          // Succès: le post a été créé
          logSecurity('Participation added to feed', {
            userId,
            participation_id: participation.id,
            post_id: post.id,
            competition_id,
          })
        }
      } catch (feedError) {
        // Log l'erreur mais ne bloque pas la création de la participation
        logError({
          message: 'Error adding participation to feed',
          error: feedError instanceof Error ? feedError : new Error(String(feedError)),
          context: {
            userId,
            participation_id: participation.id,
            competition_id,
          },
        })
        // On continue quand même, la participation a été créée
      }
    }

    return NextResponse.json(
      {
        success: true,
        participation_id: participation.id,
        created_at: participation.created_at,
        add_to_feed,
      },
      { status: 201 }
    )
  } catch (err) {
    const errorMessage = handleFetchError(err, 'Erreur lors de la création de la participation')
    logError({
      message: errorMessage,
      error: err instanceof Error ? err : new Error(String(err)),
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

