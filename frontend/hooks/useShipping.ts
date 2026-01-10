import { useState, useEffect } from 'react'
import { handleFetchError, handleHTTPError } from '@/lib/errors'
import { logError } from '@/lib/logger'

/**
 * Hook pour calculer les frais de livraison selon le modèle Yango
 * @security CRITIQUE : Le calcul est effectué côté serveur pour prévenir la manipulation
 * @ai-context Calcul automatique : Base 1500 FCFA + 100 FCFA/km + 15% frais SIGNARE
 */
export function useShipping(
  userLatitude: number | null,
  userLongitude: number | null,
  destinationLatitude: number,
  destinationLongitude: number
) {
  const [distance, setDistance] = useState<number>(0)
  const [shippingPrice, setShippingPrice] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Ne pas calculer si les coordonnées utilisateur ne sont pas disponibles
    if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) {
      setDistance(0)
      setShippingPrice(0)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    // ✅ APPEL API BACKEND (sécurisé) - Le calcul est fait côté serveur uniquement
    fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userLat: userLatitude,
        userLon: userLongitude,
        destLat: destinationLatitude,
        destLon: destinationLongitude,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await handleHTTPError(res, 'Shipping calculate')
          throw error
        }
        
        return res.json()
      })
      .then((data) => {
        setDistance(data.distanceKm)
        setShippingPrice(data.price)
        setError(null)
      })
      .catch((err) => {
        const error = handleFetchError(err, 'Shipping calculate')
        logError(error, 'Shipping calculate')
        const userMessage = error instanceof Error && 'getUserMessage' in error
          ? (error as any).getUserMessage()
          : 'Erreur lors du calcul de livraison'
        setError(userMessage)
        setDistance(0)
        setShippingPrice(0)
      })
      .finally(() => setIsLoading(false))
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude])

  return { distance, shippingPrice, isLoading, error }
}

/**
 * Hook pour générer un code de validation sécurisé pour une commande
 * @security CRITIQUE : La génération est effectuée côté serveur uniquement
 * @ai-context Code requis pour débloquer les fonds après livraison
 */
export function useValidationCode() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = async (orderId: string): Promise<{ success: boolean; expiresIn?: number; error?: string }> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/validation-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await handleHTTPError(response, 'Validation code generate')
        throw error
      }

      const data = await response.json()
      return {
        success: true,
        expiresIn: data.expiresIn,
      }
    } catch (err) {
      const error = handleFetchError(err, 'Validation code generate')
      logError(error, 'Validation code generate')
      const userMessage = error instanceof Error && 'getUserMessage' in error
        ? (error as any).getUserMessage()
        : 'Erreur lors de la génération du code'
      setError(userMessage)
      return {
        success: false,
        error: userMessage,
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return { generateCode, isGenerating, error }
}

