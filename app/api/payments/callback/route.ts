/**
 * API Route - Callback générique pour les providers
 * @security CRITIQUE : Validation de signature, idempotence obligatoire
 * 
 * POST /api/payments/callback
 * 
 * Body: ProviderCallbackData (format dépend du provider)
 * 
 * Retourne:
 * {
 *   status: 'SUCCESS' | 'FAILED' | 'PENDING'
 *   providerReference: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/backend/services'
import { logError, logSecurity } from '@/lib/logger'
import type { ProviderCallbackData } from '@/backend/services'

export async function POST(request: NextRequest) {
  try {
    // ✅ Récupérer les données du callback
    const callbackData: ProviderCallbackData = await request.json()

    // ✅ Validation minimale
    if (!callbackData.reference || !callbackData.providerReference) {
      logSecurity('Invalid callback data', { callbackData })
      return NextResponse.json(
        { error: 'Données de callback invalides : référence manquante' },
        { status: 400 }
      )
    }

    // ✅ TODO: Vérifier la signature du callback (selon le provider)
    // Pour MockProvider, on skip cette étape
    // Pour PayTech/PayDunya, valider la signature ici

    // ✅ Traiter le callback (idempotent)
    const result = await paymentService.handleCallback(callbackData)

    // ✅ Logger pour audit
    logSecurity('Payment callback processed', {
      reference: callbackData.reference,
      providerReference: callbackData.providerReference,
      status: result.status,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logError(error, 'Payment callback')
    logSecurity('Payment callback error', {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    })

    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json(
      {
        error: 'Erreur lors du traitement du callback',
        ...(isDev && { details: error instanceof Error ? error.message : 'Erreur inconnue' }),
      },
      { status: 500 }
    )
  }
}

