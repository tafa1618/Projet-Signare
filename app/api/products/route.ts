/**
 * API Route pour récupérer les produits avec pagination
 * @security Pagination côté serveur pour limiter la charge
 * 
 * GET /api/products?page=1&pageSize=20&category=boubou&search=wax
 * 
 * Retourne: { data: Product[], total: number, hasMore: boolean }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { logError, logPerformance } from '@/lib/logger'
import { z } from 'zod'

// Schéma de validation pour les paramètres de pagination et filtres
const ProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  category: z.enum(['boubou', 'kaftan', 'robe', 'ensemble', 'autre', 'all']).optional(),
  search: z.string().max(200).optional(), // Recherche textuelle
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).default('newest'),
})

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)

    // ✅ Valider les paramètres avec Zod
    const query = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      category: searchParams.get('category') || 'all',
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      sortBy: searchParams.get('sortBy') || 'newest',
    }

    const validation = ProductsQuerySchema.safeParse(query)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Paramètres invalides',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    const { page, pageSize, category, search, minPrice, maxPrice, sortBy } = validation.data

    // Calculer l'offset
    const offset = (page - 1) * pageSize

    // Obtenir client Supabase
    const supabase = getSupabaseAdmin()

    // Construire la requête avec filtres
    let queryBuilder = supabase
      .from('posts') // Utiliser la table posts comme source de produits pour l'instant
      .select('*', { count: 'exact' })
      .eq('is_product', true) // Filtrer uniquement les produits (à adapter selon schéma)

    // Filtrer par catégorie
    if (category !== 'all') {
      queryBuilder = queryBuilder.eq('garment_type', category)
    }

    // Recherche textuelle
    if (search) {
      queryBuilder = queryBuilder.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Filtrer par prix (si disponible dans le schéma)
    // TODO: Adapter selon le schéma réel de la table products/posts
    if (minPrice !== undefined) {
      // queryBuilder = queryBuilder.gte('price', minPrice)
    }
    if (maxPrice !== undefined) {
      // queryBuilder = queryBuilder.lte('price', maxPrice)
    }

    // Tri
    switch (sortBy) {
      case 'price_asc':
        // queryBuilder = queryBuilder.order('price', { ascending: true })
        break
      case 'price_desc':
        // queryBuilder = queryBuilder.order('price', { ascending: false })
        break
      case 'popular':
        // queryBuilder = queryBuilder.order('likes_count', { ascending: false })
        break
      case 'newest':
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
    }

    // Pagination
    const { data: products, error, count } = await queryBuilder
      .range(offset, offset + pageSize - 1)

    if (error) {
      logError(error, 'Products pagination fetch')
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      )
    }

    // Calculer si il y a plus de pages
    const total = count || 0
    const hasMore = offset + pageSize < total

    // Logger la performance
    const duration = Date.now() - startTime
    logPerformance('products-pagination', duration, {
      page,
      pageSize,
      itemsReturned: products?.length || 0,
      total,
      hasMore,
      filters: { category, search, sortBy },
    })

    return NextResponse.json({
      data: products || [],
      total,
      hasMore,
      page,
      pageSize,
    })
  } catch (error) {
    logError(error, 'Products pagination')
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

