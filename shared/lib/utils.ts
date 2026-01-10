import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fonction utilitaire pour fusionner les classes Tailwind
 * @ai-context Utilisé pour combiner des classes CSS dynamiquement
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcul du prix de livraison selon le modèle Yango
 * @security CRITIQUE : Cette fonction ne doit être appelée QUE côté serveur (API route)
 * @ai-context Base: 1500 FCFA + 100 FCFA/km + 15% frais SIGNARE
 * @param distanceKm Distance en kilomètres
 * @returns Prix total en FCFA avec frais inclus
 */
export function calculateShippingPrice(distanceKm: number): number {
  // Constantes de pricing (selon .cursorrules section 3)
  const BASE_PRICE = 1500 // FCFA
  const PRICE_PER_KM = 100 // FCFA
  const SIGNARE_FEE_PERCENT = 0.15 // 15%

  // Validation : distance doit être positive
  if (distanceKm < 0) {
    throw new Error('Distance ne peut pas être négative')
  }

  const subtotal = BASE_PRICE + distanceKm * PRICE_PER_KM
  const signareFee = subtotal * SIGNARE_FEE_PERCENT
  
  return Math.round(subtotal + signareFee)
}

/**
 * Calcul de la distance entre deux points GPS (formule Haversine)
 * @ai-context Utilisé pour calculer les frais de livraison
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

