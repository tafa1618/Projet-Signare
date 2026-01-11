/**
 * API Route pour calculer les prix de livraison
 * @security CRITIQUE : Calcul effectué uniquement côté serveur pour prévenir la manipulation
 * 
 * POST /api/shipping/calculate
 * Body: { userLat, userLon, destLat, destLon }
 * 
 * Retourne: { distanceKm, price, currency }
 * 
 * Cette route fait office de proxy vers le microservice Delivery Engine (Python)
 */

import { NextRequest, NextResponse } from 'next/server'
import { ShippingCalculateSchema } from '@/lib/validations/schemas'
import { logError, logSecurity, logPerformance } from '@/lib/logger'

// URL du microservice Delivery Engine
const DELIVERY_ENGINE_URL = process.env.DELIVERY_ENGINE_URL || 'http://localhost:8002'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

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

    // Appeler le microservice Delivery Engine
    const deliveryEngineResponse = await fetch(`${DELIVERY_ENGINE_URL}/api/shipping/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: {
          lat: userLat,
          lng: userLon,
        },
        destination: {
          lat: destLat,
          lng: destLon,
        },
      }),
    })

    // Gérer les erreurs du delivery engine
    if (!deliveryEngineResponse.ok) {
      const errorData = await deliveryEngineResponse.json().catch(() => ({}))
      const errorMessage = errorData.detail || errorData.error || 'Erreur du delivery engine'

      // Si c'est une erreur de zone géographique (400), permettre la commande mais sans livraison
      if (deliveryEngineResponse.status === 400 && errorMessage.includes('hors de la zone')) {
        logSecurity('Shipping calculation - Outside Dakar zone', {
          coordinates: { userLat, userLon, destLat, destLon },
        })
        // Retourner une réponse avec shippingPrice = 0 pour permettre la commande
        return NextResponse.json({
          distanceKm: 0,
          price: 0,
          currency: 'FCFA',
          calculatedAt: new Date().toISOString(),
          isOutsideDeliveryZone: true,
          message: 'Le support vous contactera pour la livraison',
        })
      }

      // Autres erreurs : fallback sur calcul local (pour compatibilité)
      logError(
        new Error(`Delivery Engine returned ${deliveryEngineResponse.status}: ${errorMessage}`),
        'Shipping calculation - Delivery Engine unavailable'
      )
      
      // Fallback : utiliser le calcul local (pour compatibilité)
      const { calculateDistance, calculateShippingPrice } = await import('@/shared/lib/utils')
      const distanceKm = calculateDistance(userLat, userLon, destLat, destLon)
      const price = calculateShippingPrice(distanceKm)

      return NextResponse.json({
        distanceKm: Math.round(distanceKm * 100) / 100,
        price,
        currency: 'FCFA',
        calculatedAt: new Date().toISOString(),
        fallback: true, // Indique que c'est un fallback
      })
    }

    // Parser la réponse du delivery engine
    const deliveryData = await deliveryEngineResponse.json()

    // Adapter le format pour rester compatible avec le frontend
    const response = {
      distanceKm: deliveryData.distance_km,
      price: deliveryData.total_price,
      currency: deliveryData.currency || 'FCFA',
      calculatedAt: new Date().toISOString(),
      // Détails supplémentaires du calcul (optionnel, pour debug)
      ...(process.env.NODE_ENV === 'development' && {
        breakdown: {
          basePrice: deliveryData.base_price,
          distanceCost: deliveryData.distance_cost,
          subtotal: deliveryData.subtotal,
          signareFee: deliveryData.signare_fee,
        },
      }),
    }

    // Logger la performance
    const duration = Date.now() - startTime
    logPerformance('shipping-calculation-delivery-engine', duration, {
      distanceKm: response.distanceKm,
      price: response.price,
    })

    return NextResponse.json(response)
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

