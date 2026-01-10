/**
 * API Route pour générer un code de validation pour une commande
 * @security CRITIQUE : Génération de code sécurisée côté serveur uniquement
 * 
 * POST /api/orders/[orderId]/validation-code
 * 
 * Retourne: { success: true, expiresIn: 600 }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { ValidationCodeRequestSchema } from '@/lib/validations/schemas'
import { logError, logSecurity } from '@/lib/logger'

// Durée de validité du code (10 minutes)
const CODE_EXPIRATION_MINUTES = 10

// Générer un code sécurisé à 6 chiffres
function generateSecureCode(): string {
  // Utiliser crypto.getRandomValues pour génération sécurisée
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  
  // Générer un nombre entre 100000 et 999999 (6 chiffres)
  const code = 100000 + (array[0] % 900000)
  return code.toString().padStart(6, '0')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Vérifier authentification utilisateur
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    // }

    // ✅ Valider l'ID de commande avec Zod
    const validation = ValidationCodeRequestSchema.safeParse({ orderId: params.orderId })
    if (!validation.success) {
      logSecurity('Validation code request invalid order ID', {
        orderId: params.orderId,
        errors: validation.error.errors,
      })
      return NextResponse.json(
        {
          error: 'ID de commande invalide',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    const orderId = validation.data.orderId

    // Obtenir client Supabase avec service role (bypass RLS)
    const supabase = getSupabaseAdmin()

    // ✅ Vérifier que la commande existe et est en statut approprié
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, seller_id, status')
      .eq('id', orderId)
      // .eq('buyer_id', userId) // À décommenter avec auth
      .single()

    if (orderError || !order) {
      logSecurity('Validation code request - order not found', { orderId })
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    // ✅ Vérifier que la commande est éligible pour génération de code
    const validStatuses = ['paid', 'in_delivery']
    if (!validStatuses.includes(order.status)) {
      logSecurity('Validation code request - invalid order status', {
        orderId,
        currentStatus: order.status,
        requiredStatuses: validStatuses,
      })
      return NextResponse.json(
        {
          error: 'Commande non éligible pour validation',
          message: `Le statut de la commande doit être 'paid' ou 'in_delivery'. Statut actuel: ${order.status}`,
        },
        { status: 400 }
      )
    }

    // Générer code sécurisé
    const code = generateSecureCode()
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000)

    // Stocker dans DB avec expiration
    const { error: codeError } = await supabase
      .from('order_validation_codes')
      .insert({
        order_id: orderId,
        code,
        expires_at: expiresAt.toISOString(),
      })

    if (codeError) {
      logError(codeError, 'Validation code insertion')
      logSecurity('Validation code generation failed', { orderId })
      return NextResponse.json(
        { error: 'Erreur lors de la génération du code' },
        { status: 500 }
      )
    }

    // TODO: Envoyer SMS via service sécurisé (Twilio, AWS SNS, etc.)
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('phone_number')
    //   .eq('id', order.buyer_id)
    //   .single()
    // 
    // if (profile?.phone_number) {
    //   await sendSMS(profile.phone_number, `Code validation SIGNARE: ${code}. Expire dans ${CODE_EXPIRATION_MINUTES} minutes.`)
    // }

    // ⚠️ IMPORTANT : Ne jamais retourner le code en production
    // Pour l'instant en dev, on le retourne pour tester
    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json({
      success: true,
      expiresIn: CODE_EXPIRATION_MINUTES * 60, // secondes
      // ⚠️ SUPPRIMER EN PRODUCTION - Le code doit être envoyé uniquement par SMS
      ...(isDev && { code, expiresAt: expiresAt.toISOString() }),
    })
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development'
    
    logError(error, 'Validation code generation')
    logSecurity('Validation code generation error', { orderId: params.orderId })
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de la génération du code',
        ...(isDev && { details: error instanceof Error ? error.message : 'Erreur inconnue' }),
      },
      { status: 500 }
    )
  }
}

