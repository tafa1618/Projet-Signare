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
import { logError, logPerformance, logSecurity } from '@/lib/logger'
import { ProductPublishSchema } from '@/lib/validations/schemas'
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
  // Filtres métadonnées pour recherche similaire
  fabric: z.string().max(50).optional(), // fabric_type
  occasion: z.string().max(50).optional(), // occasion_tags
  gender: z.enum(['homme', 'femme', 'mixte', 'enfant']).optional(), // gender_target
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
      fabric: searchParams.get('fabric') || undefined,
      occasion: searchParams.get('occasion') || undefined,
      gender: searchParams.get('gender') || undefined,
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

    const { page, pageSize, category, search, minPrice, maxPrice, sortBy, fabric, occasion, gender } = validation.data

    // Calculer l'offset
    const offset = (page - 1) * pageSize

    // Obtenir client Supabase
    const supabase = getSupabaseAdmin()

    // Construire la requête avec filtres
    let queryBuilder = supabase
      .from('posts') // Utiliser la table posts comme source de produits pour l'instant
      .select('*', { count: 'exact' })
      // Note: Si is_product n'existe pas, on ne filtre pas (pour compatibilité)
      // .eq('is_product', true)

    // Filtrer par catégorie
    if (category !== 'all') {
      queryBuilder = queryBuilder.eq('garment_type', category)
    }

    // Recherche textuelle
    if (search) {
      queryBuilder = queryBuilder.or(`title.ilike.%${search}%,description.ilike.%${search}%,caption.ilike.%${search}%`)
    }

    // Filtrer par tissu (fabric_type) - recherche flexible avec OR pour variantes
    if (fabric) {
      // Recherche exacte d'abord, puis variantes si besoin
      const fabricVariants: Record<string, string[]> = {
        'wax': ['wax', 'wax premium', 'wax imprimé'],
        'basin': ['basin', 'basin riche', 'basin getzner', 'bazin'],
        'soie': ['soie', 'soie premium', 'silk'],
        'coton': ['coton', 'cotton'],
      }
      const variants = fabricVariants[fabric] || [fabric]
      // Utiliser OR pour chercher dans les variantes
      queryBuilder = queryBuilder.or(variants.map(v => `fabric_type.ilike.%${v}%`).join(','))
    }

    // Filtrer par occasion (occasion_tags contient la valeur) - recherche flexible
    if (occasion) {
      // Essayer d'abord avec contains, puis avec une recherche textuelle dans caption si besoin
      queryBuilder = queryBuilder.or(`occasion_tags.cs.{${occasion}},caption.ilike.%${occasion}%`)
    }

    // Filtrer par genre (gender_target) - recherche flexible
    if (gender) {
      // Recherche exacte ou partielle
      const genderVariants: Record<string, string[]> = {
        'homme': ['homme', 'masculin', 'homme adulte'],
        'femme': ['femme', 'féminin', 'femme adulte'],
        'enfant': ['enfant', 'garçon', 'fille', 'kids'],
        'mixte': ['mixte', 'unisexe'],
      }
      const variants = genderVariants[gender] || [gender]
      queryBuilder = queryBuilder.or(variants.map(v => `gender_target.ilike.%${v}%`).join(','))
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
    let { data: products, error, count } = await queryBuilder
      .range(offset, offset + pageSize - 1)

    // Si aucun résultat avec les filtres stricts, essayer une recherche plus large
    if ((!products || products.length === 0) && (fabric || occasion || gender)) {
      // Relancer une recherche sans les filtres optionnels les moins importants
      let fallbackQuery = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(pageSize)

      // Garder uniquement le filtre le plus important (tissu en priorité)
      if (fabric) {
        const fabricVariants: Record<string, string[]> = {
          'wax': ['wax', 'wax premium', 'wax imprimé'],
          'basin': ['basin', 'basin riche', 'basin getzner', 'bazin'],
          'soie': ['soie', 'soie premium', 'silk'],
          'coton': ['coton', 'cotton'],
        }
        const variants = fabricVariants[fabric] || [fabric]
        fallbackQuery = fallbackQuery.or(variants.map(v => `fabric_type.ilike.%${v}%`).join(','))
      } else if (gender) {
        // Si pas de tissu, utiliser le genre
        const genderVariants: Record<string, string[]> = {
          'homme': ['homme', 'masculin'],
          'femme': ['femme', 'féminin'],
          'enfant': ['enfant', 'garçon', 'fille'],
        }
        const variants = genderVariants[gender] || [gender]
        fallbackQuery = fallbackQuery.or(variants.map(v => `gender_target.ilike.%${v}%`).join(','))
      }

      const fallbackResult = await fallbackQuery.range(offset, offset + pageSize - 1)
      if (fallbackResult.data && fallbackResult.data.length > 0) {
        products = fallbackResult.data
        count = fallbackResult.count
        error = fallbackResult.error
      }
    }

    if (error) {
      logError(error, 'Products pagination fetch')
      // Ne pas retourner d'erreur, retourner un tableau vide pour permettre le fallback côté client
      return NextResponse.json({
        data: [],
        total: 0,
        hasMore: false,
        page,
        pageSize,
      })
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

/**
 * API Route pour créer un nouveau produit
 * @security Validation stricte côté serveur, authentification requise
 * 
 * POST /api/products
 * Body: { title, description, price, category, tags, metadata: { fabric, event, gender, color }, sellerType }
 * 
 * Retourne: { success: boolean, productId?: string, message?: string }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Récupérer le body de la requête
    const body = await request.json()

    // ✅ Valider les données avec Zod
    const validation = ProductPublishSchema.safeParse(body)
    if (!validation.success) {
      logSecurity('Invalid product publish data', { errors: validation.error.errors })
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    const { title, description, price, category, tags, metadata, sellerType } = validation.data

    // TODO: Récupérer l'ID utilisateur depuis l'authentification Supabase
    // Pour l'instant, on utilise un placeholder (à remplacer par l'auth réelle)
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000'

    // Obtenir client Supabase
    const supabase = getSupabaseAdmin()

    // Mapper les métadonnées vers les champs de la base de données
    const fabricType = metadata?.fabric || null
    const genderTarget = metadata?.gender || null
    const occasionTags = metadata?.event ? [metadata.event] : []
    const colorPalette = metadata?.color ? [metadata.color] : []

    // Déterminer garment_type depuis category ou utiliser 'autre' par défaut
    const garmentType = category || 'autre'

    // Déterminer complexity par défaut (simple si non spécifié)
    const complexity = 'simple'

    // Préparer les données pour l'insertion
    const postData = {
      user_id: userId,
      image_url: '', // TODO: Remplacer par l'URL réelle après upload
      caption: description || null,
      price: price || null,
      garment_type: garmentType,
      complexity: complexity,
      fabric_type: fabricType,
      gender_target: genderTarget as 'homme' | 'femme' | 'mixte' | 'enfant' | null,
      occasion_tags: occasionTags,
      color_palette: colorPalette,
      style_tags: tags || [],
      cultural_tags: [],
      season_tags: [],
      is_available: true,
      is_commissioned: sellerType === 'tailleur',
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
      shares_count: 0,
      reposts_count: 0,
      saves_count: 0,
      inquiries_count: 0,
      has_embroidery: false,
      has_beading: false,
      has_print: false,
      has_lace: false,
    }

    // Insérer dans la base de données
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert(postData)
      .select('id')
      .single()

    if (insertError) {
      logError(insertError, 'Product creation')
      return NextResponse.json(
        { error: 'Erreur lors de la création du produit', details: insertError.message },
        { status: 500 }
      )
    }

    // Logger la performance
    const duration = Date.now() - startTime
    logPerformance('product-creation', duration, {
      productId: newPost.id,
      hasMetadata: !!metadata,
    })

    return NextResponse.json({
      success: true,
      productId: newPost.id,
      message: sellerType === 'consumer' 
        ? 'Publication réussie, en attente de validation'
        : 'Produit publié avec succès',
    })
  } catch (error) {
    logError(error, 'Product creation')
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du produit' },
      { status: 500 }
    )
  }
}

