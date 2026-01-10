/**
 * Hook pour communiquer avec le microservice IA
 * Aucune logique IA - uniquement des appels HTTP
 */

import { useState } from 'react'
import type { InspirationPayload, TryOnPayload } from '@/shared/constants/ai-tags'

// URL du microservice IA
// Configurer via NEXT_PUBLIC_AI_SERVICE_URL dans .env.local
// Par défaut : http://127.0.0.1:8001 (développement local)
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://127.0.0.1:8001'

interface InspirationResponse {
  success: boolean
  image_url?: string
  prompt_used?: string
  mode: string
  error?: string
}

interface TryOnResponse {
  success: boolean
  output_image_url?: string
  job_id: string
  mode: string
  error?: string
}

export function useAIService() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Génère une inspiration visuelle
   * Le frontend envoie uniquement les tags, le microservice construit le prompt
   */
  const generateInspiration = async (
    payload: InspirationPayload
  ): Promise<InspirationResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${AI_SERVICE_URL}/inspiration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tissu: payload.fabric,
          evenement: payload.event,
          genre_age: payload.gender, // Format: "homme adulte", "femme adulte", "garçon", "fille"
          couleur: payload.color,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`)
      }

      const data: InspirationResponse = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Génère un try-on (essayage virtuel)
   * Le frontend envoie uniquement les chemins d'images, le microservice gère l'IA
   */
  const generateTryOn = async (payload: TryOnPayload): Promise<TryOnResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${AI_SERVICE_URL}/tryon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_image_path: payload.user_image_path,
          garment_image_path: payload.model_id, // À ajuster selon votre structure
          job_id: `tryon_${Date.now()}_${payload.model_id}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`)
      }

      const data: TryOnResponse = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateInspiration,
    generateTryOn,
    isLoading,
    error,
  }
}

