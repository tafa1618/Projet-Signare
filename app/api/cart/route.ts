/**
 * API Routes pour le panier utilisateur
 * @security Chaque utilisateur ne peut accéder qu'à son propre panier (RLS Supabase)
 * 
 * GET /api/cart - Récupérer le panier de l'utilisateur connecté
 * POST /api/cart - Ajouter un item au panier
 * PUT /api/cart - Mettre à jour la quantité d'un item
 * DELETE /api/cart?itemId=xxx - Supprimer un item du panier
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { CartItemSchema, UpdateCartQuantitySchema } from '@/lib/validations/schemas'
import { logError, logSecurity } from '@/lib/logger'

/**
 * GET /api/cart
 * Récupérer tous les items du panier de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Récupérer l'utilisateur depuis la session (à implémenter avec auth middleware)
    // const { user } = await getUserFromRequest(request)
    // if (!user) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    // }

    // Pour l'instant, on simule avec un userId (à remplacer par auth)
    const userId = request.headers.get('x-user-id') // Temporaire pour développement

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non identifié' },
        { status: 401 }
      )
    }

    // Utiliser Supabase avec service role pour bypass RLS (ou utiliser client avec auth)
    const supabase = getSupabaseAdmin()

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      logError(error, 'Cart fetch')
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du panier' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: cartItems || [],
      totalItems: cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      totalPrice: cartItems?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0,
    })
  } catch (error) {
    logError(error, 'Cart GET')
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cart
 * Ajouter un item au panier
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Récupérer l'utilisateur depuis la session
    // const { user } = await getUserFromRequest(request)
    const userId = request.headers.get('x-user-id') // Temporaire

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non identifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // ✅ Validation avec Zod
    const validation = CartItemSchema.safeParse(body)
    if (!validation.success) {
      logSecurity('Cart item validation failed', {
        userId,
        errors: validation.error.errors,
      })
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

    const itemData = validation.data
    const supabase = getSupabaseAdmin()

    // Vérifier si l'item existe déjà pour cet utilisateur
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', itemData.productId)
      .single()

    if (existingItem) {
      // Mettre à jour la quantité si l'item existe déjà
      const newQuantity = existingItem.quantity + itemData.quantity
      
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id)

      if (updateError) {
        logError(updateError, 'Cart item update')
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du panier' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Quantité mise à jour',
        itemId: existingItem.id,
        quantity: newQuantity,
      })
    }

    // Insérer un nouvel item
    const { data: newItem, error: insertError } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: itemData.productId,
        title: itemData.title,
        image_url: itemData.image,
        price: itemData.price,
        currency: itemData.currency,
        quantity: itemData.quantity,
        seller_id: itemData.seller?.name ? null : undefined, // TODO: récupérer seller_id depuis product
        seller_name: itemData.seller?.name,
        seller_avatar_url: itemData.seller?.avatar,
      })
      .select()
      .single()

    if (insertError) {
      logError(insertError, 'Cart item insert')
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout au panier' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item ajouté au panier',
      item: newItem,
    }, { status: 201 })
  } catch (error) {
    logError(error, 'Cart POST')
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cart
 * Mettre à jour la quantité d'un item
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') // Temporaire
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non identifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // ✅ Validation avec Zod
    const validation = UpdateCartQuantitySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { itemId, quantity } = validation.data
    const supabase = getSupabaseAdmin()

    // Vérifier que l'item appartient à l'utilisateur
    const { data: item, error: checkError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single()

    if (checkError || !item) {
      logSecurity('Cart update unauthorized', { userId, itemId })
      return NextResponse.json(
        { error: 'Item non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    // Mettre à jour la quantité
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)

    if (updateError) {
      logError(updateError, 'Cart quantity update')
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Quantité mise à jour',
    })
  } catch (error) {
    logError(error, 'Cart PUT')
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cart?itemId=xxx
 * Supprimer un item du panier
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') // Temporaire
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non identifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId requis' },
        { status: 400 }
      )
    }

    // Valider UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(itemId)) {
      return NextResponse.json(
        { error: 'itemId invalide' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Vérifier que l'item appartient à l'utilisateur avant suppression
    const { data: item, error: checkError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single()

    if (checkError || !item) {
      logSecurity('Cart delete unauthorized', { userId, itemId })
      return NextResponse.json(
        { error: 'Item non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    // Supprimer l'item
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (deleteError) {
      logError(deleteError, 'Cart item delete')
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item supprimé du panier',
    })
  } catch (error) {
    logError(error, 'Cart DELETE')
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

