/**
 * API ENDPOINT - CALCUL DE PRICING
 * 
 * Exemple d'utilisation du service de pricing dans un endpoint Next.js
 * 
 * POST /api/pricing/calculate
 * Body: { price_tailor: number, customCommissionRate?: number, customClientFeeRate?: number }
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculatePricing, applyDiscount, applyDiscountPercent } from '@/lib/pricing.service'
import { z } from 'zod'

// Schéma de validation pour la requête
const PricingRequestSchema = z.object({
  price_tailor: z.number().min(0, 'Le prix de base doit être positif ou nul'),
  customCommissionRate: z.number().min(0).max(100).optional(),
  customClientFeeRate: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données d'entrée
    const validation = PricingRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { price_tailor, customCommissionRate, customClientFeeRate, discountAmount, discountPercent } = validation.data

    // Calcul du pricing de base
    let pricing = calculatePricing(price_tailor, customCommissionRate, customClientFeeRate)

    // Application d'une réduction si fournie
    if (discountAmount !== undefined) {
      pricing = applyDiscount(pricing, discountAmount)
    } else if (discountPercent !== undefined) {
      pricing = applyDiscountPercent(pricing, discountPercent)
    }

    // Retourner le résultat
    return NextResponse.json(
      {
        success: true,
        data: pricing,
      },
      { status: 200 }
    )
  } catch (error) {
    // Gestion des erreurs du service de pricing
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Erreur de calcul',
          message: error.message,
        },
        { status: 400 }
      )
    }

    // Erreur inattendue
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: 'Une erreur inattendue s\'est produite',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/pricing/calculate?price_tailor=30000
 * 
 * Version simplifiée pour les requêtes GET (utile pour les tests)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const price_tailor = searchParams.get('price_tailor')

    if (!price_tailor) {
      return NextResponse.json(
        {
          error: 'Paramètre manquant',
          message: 'Le paramètre price_tailor est requis',
        },
        { status: 400 }
      )
    }

    const price = parseFloat(price_tailor)
    
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        {
          error: 'Valeur invalide',
          message: 'Le prix de base doit être un nombre positif',
        },
        { status: 400 }
      )
    }

    const pricing = calculatePricing(price)

    return NextResponse.json(
      {
        success: true,
        data: pricing,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Erreur de calcul',
          message: error.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: 'Une erreur inattendue s\'est produite',
      },
      { status: 500 }
    )
  }
}

