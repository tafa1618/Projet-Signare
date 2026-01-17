/**
 * API Route - Récupérer l'état d'un paiement
 * @security CRITIQUE : Vérification que l'utilisateur peut accéder à ce paiement
 * 
 * GET /api/payments/:reference
 * 
 * Retourne:
 * {
 *   id: string
 *   reference: string
 *   amount: number
 *   currency: string
 *   purpose: string
 *   status: string
 *   provider: string
 *   provider_reference: string | null
 *   metadata: Record<string, any>
 *   created_at: string
 *   updated_at: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/backend/services'
import { logError, logSecurity } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    // ✅ Authentification (à implémenter avec Supabase Auth)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      logSecurity('Payment status request without auth', { reference: params.reference })
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // TODO: Extraire userId depuis le token JWT
    const userId = 'mock-user-id' // À remplacer par extraction depuis token

    // ✅ Récupérer le paiement
    const payment = await paymentService.getPaymentStatus(params.reference)

    if (!payment) {
      return NextResponse.json(
        { error: 'Paiement introuvable' },
        { status: 404 }
      )
    }

    // ✅ Vérifier que l'utilisateur peut accéder à ce paiement
    // (RLS devrait gérer ça, mais double vérification côté API)
    if (payment.user_id !== userId) {
      logSecurity('Unauthorized payment access attempt', {
        requestedUserId: userId,
        paymentUserId: payment.user_id,
        reference: params.reference,
      })
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    return NextResponse.json(payment, { status: 200 })
  } catch (error) {
    logError(error, 'Payment status retrieval')
    logSecurity('Payment status retrieval error', {
      reference: params.reference,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    })

    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération du paiement',
        ...(isDev && { details: error instanceof Error ? error.message : 'Erreur inconnue' }),
      },
      { status: 500 }
    )
  }
}

