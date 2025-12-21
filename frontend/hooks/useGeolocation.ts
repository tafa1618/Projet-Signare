import { useState, useEffect } from 'react'

/**
 * Hook pour récupérer la géolocalisation de l'utilisateur
 * @ai-context Utilisé pour calculer les frais de livraison et recommander des événements
 */
export function useGeolocation() {
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par ce navigateur')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setIsLoading(false)
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      }
    )
  }, [])

  return { latitude, longitude, error, isLoading }
}

