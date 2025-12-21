import { useState, useEffect } from 'react'
import { calculateDistance, calculateShippingPrice } from '@/shared/lib/utils'

/**
 * Hook pour calculer les frais de livraison selon le modèle Yango
 * @ai-context Calcul automatique : 500 FCFA base + 100 FCFA/km + 15% frais SIGNARE
 */
export function useShipping(
  userLatitude: number | null,
  userLongitude: number | null,
  destinationLatitude: number,
  destinationLongitude: number
) {
  const [distance, setDistance] = useState<number>(0)
  const [shippingPrice, setShippingPrice] = useState<number>(0)

  useEffect(() => {
    if (!userLatitude || !userLongitude) return

    // Calculer la distance
    const distanceKm = calculateDistance(
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude
    )

    // Calculer le prix
    const price = calculateShippingPrice(distanceKm)

    setDistance(distanceKm)
    setShippingPrice(price)
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude])

  return { distance, shippingPrice }
}

/**
 * Hook pour générer un code de validation à 6 chiffres
 * @ai-context Code requis pour débloquer les fonds après livraison
 */
export function useValidationCode() {
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  return { generateCode }
}

