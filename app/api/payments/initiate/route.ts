/**
 * API Route - Initier un paiement
 * @security CRITIQUE : Validation stricte des montants côté serveur
 * 
 * POST /api/payments/initiate
 * 
 * Body:
 * {
 *   amount: number (requis, > 0)
 *   currency?: string (défaut: XOF)
 *   purpose: 'SPONSORING' | 'FEATURE' | 'SUBSCRIPTION' | 'PROMOTION' | 'ORDER' | 'COMMISSION'
 *   metadata?: Record<string, any>
 * }
 * 
 * Retourne:
 * {
 *   paymentId: string
 *   reference: string
 *   status: string
 *   instructions: PaymentInstructions
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/backend/services'
import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { logError, logSecurity } from '@/lib/logger'
import type { Payment } from '@/shared/types/database.types'

/**
 * Schéma de validation (simplifié, utiliser Zod en production)
 */
interface InitiatePaymentRequest {
  amount: number
  currency?: string
  purpose: Payment['purpose']
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    // ✅ Authentification (à implémenter avec Supabase Auth)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      logSecurity('Payment initiation without auth', {})
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // TODO: Extraire userId depuis le token JWT
    // Pour l'instant, on utilise un userId mock (à remplacer)
    const userId = 'mock-user-id' // À remplacer par extraction depuis token

    // ✅ Valider le body
    const body: InitiatePaymentRequest = await request.json()

    if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être un nombre positif' },
        { status: 400 }
      )
    }

    if (!body.purpose) {
      return NextResponse.json(
        { error: 'Le type de paiement (purpose) est requis' },
        { status: 400 }
      )
    }

    // ✅ Validation des valeurs enum
    const validPurposes: Payment['purpose'][] = [
      'SPONSORING',
      'FEATURE',
      'SUBSCRIPTION',
      'PROMOTION',
      'ORDER',
      'COMMISSION',
    ]

    if (!validPurposes.includes(body.purpose)) {
      return NextResponse.json(
        { error: `Type de paiement invalide. Valeurs acceptées: ${validPurposes.join(', ')}` },
        { status: 400 }
      )
    }

    // ✅ Initier le paiement
    const result = await paymentService.initiatePayment({
      userId,
      amount: body.amount,
      currency: body.currency || 'XOF',
      purpose: body.purpose,
      metadata: body.metadata || {},
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    logError(error, 'Payment initiation')
    logSecurity('Payment initiation error', {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    })

    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json(
      {
        error: 'Erreur lors de l\'initiation du paiement',
        ...(isDev && { details: error instanceof Error ? error.message : 'Erreur inconnue' }),
      },
      { status: 500 }
    )
  }
}

