/**
 * API Route pour calculer les prix de livraison
 * @security CRITIQUE : Calcul effectué uniquement côté serveur pour prévenir la manipulation
 * 
 * POST /api/shipping/calculate
 * Body: { userLat, userLon, destLat, destLon }
 * 
 * Retourne: { distanceKm, price, currency }
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateDistance, calculateShippingPrice } from '@/shared/lib/utils'
import { ShippingCalculateSchema } from '@/lib/validations/schemas'
import { logError, logSecurity } from '@/lib/logger'

// Limites de sécurité
const MAX_DISTANCE_KM = 500 // Distance maximale raisonnable (500km)

export async function POST(request: NextRequest) {
  try {
    // Parser et valider le body avec Zod
    const body = await request.json()
    const validation = ShippingCalculateSchema.safeParse(body)

    if (!validation.success) {
      logSecurity('Shipping calculation validation failed', {
        errors: validation.error.errors,
        body: body, // Body sera sanitizé par logSecurity
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

    const { userLat, userLon, destLat, destLon } = validation.data

    // Calcul de la distance (formule Haversine) - côté serveur uniquement
    const distanceKm = calculateDistance(userLat, userLon, destLat, destLon)

    // Validation : distance raisonnable (sécurité contre manipulation)
    if (distanceKm > MAX_DISTANCE_KM) {
      logSecurity('Shipping calculation distance exceeded', {
        distanceKm,
        maxAllowed: MAX_DISTANCE_KM,
        coordinates: { userLat, userLon, destLat, destLon }, // Sanitizé automatiquement
      })
      return NextResponse.json(
        {
          error: 'Distance trop importante',
          message: `La distance maximale autorisée est de ${MAX_DISTANCE_KM}km`,
        },
        { status: 400 }
      )
    }

    // Validation : distance minimale (éviter calculs inutiles)
    if (distanceKm < 0) {
      logSecurity('Shipping calculation negative distance', {
        distanceKm,
        coordinates: { userLat, userLon, destLat, destLon },
      })
      return NextResponse.json(
        { error: 'Distance invalide' },
        { status: 400 }
      )
    }

    // Calcul du prix - côté serveur uniquement (CRITIQUE pour sécurité)
    const price = calculateShippingPrice(distanceKm)

    // Retourner le résultat avec 2 décimales pour la distance
    return NextResponse.json({
      distanceKm: Math.round(distanceKm * 100) / 100,
      price,
      currency: 'FCFA',
      calculatedAt: new Date().toISOString(),
    })
  } catch (error) {
    // Ne pas exposer les détails de l'erreur en production
    const isDev = process.env.NODE_ENV === 'development'
    
    logError(error, 'Shipping calculation')
    return NextResponse.json(
      {
        error: 'Erreur lors du calcul de livraison',
        ...(isDev && { details: error instanceof Error ? error.message : 'Erreur inconnue' }),
      },
      { status: 500 }
    )
  }
}

