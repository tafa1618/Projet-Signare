/**
 * API Route pour récupérer les posts avec pagination
 * @security Pagination côté serveur pour limiter la charge
 * 
 * GET /api/posts?page=1&pageSize=20&type=tailor|client
 * 
 * Retourne: { data: Post[], total: number, hasMore: boolean }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { logError, logPerformance } from '@/lib/logger'
import { handleHTTPError } from '@/lib/errors'
import { z } from 'zod'

// Schéma de validation pour les paramètres de pagination
const PostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20), // Max 100 items par page
  type: z.enum(['tailor', 'client', 'all']).optional(),
})

// Durée de cache pour les posts (en secondes)
const CACHE_DURATION = 60 // 1 minute

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    
    // ✅ Valider les paramètres de pagination avec Zod
    const query = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      type: searchParams.get('type') || 'all',
    }

    const validation = PostsQuerySchema.safeParse(query)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Paramètres de pagination invalides',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    const { page, pageSize, type } = validation.data

    // Calculer l'offset
    const offset = (page - 1) * pageSize

    // Obtenir client Supabase
    const supabase = getSupabaseAdmin()

    // Construire la requête avec filtres
    let queryBuilder = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Filtrer par type si spécifié
    if (type !== 'all') {
      queryBuilder = queryBuilder.eq('post_type', type === 'tailor' ? 'tailor' : 'client')
    }

    const { data: posts, error, count } = await queryBuilder

    if (error) {
      logError(error, 'Posts pagination fetch')
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des posts' },
        { status: 500 }
      )
    }

    // Calculer si il y a plus de pages
    const total = count || 0
    const hasMore = offset + pageSize < total

    // Logger la performance
    const duration = Date.now() - startTime
    logPerformance('posts-pagination', duration, {
      page,
      pageSize,
      itemsReturned: posts?.length || 0,
      total,
      hasMore,
    })

    return NextResponse.json({
      data: posts || [],
      total,
      hasMore,
      page,
      pageSize,
    })
  } catch (error) {
    logError(error, 'Posts pagination')
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des posts' },
      { status: 500 }
    )
  }
}

