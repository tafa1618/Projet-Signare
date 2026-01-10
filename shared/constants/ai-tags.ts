/**
 * Constantes pour les tags IA
 * Valeurs normalisées en minuscules, strictement identiques à celles attendues par le microservice
 */

// TISSU (obligatoire, 1 choix)
export const FABRIC_TAGS = [
  { id: 'wax', label: 'Wax' },
  { id: 'getzner', label: 'Getzner' },
  { id: 'bazin', label: 'Bazin' },
  { id: 'soie', label: 'Soie' },
  { id: 'coton', label: 'Coton' },
] as const

// ÉVÉNEMENT (obligatoire, 1 choix)
// Les valeurs doivent correspondre exactement à celles attendues par le microservice
export const EVENT_TAGS = [
  { id: 'tabaski', label: 'Tabaski' },
  { id: 'mariage', label: 'Mariage' },
  { id: 'baptême', label: 'Baptême' },
  { id: 'travail', label: 'Travail' },
  { id: 'sortie', label: 'Sortie' },
] as const

// GENRE / ÂGE (obligatoire, 1 choix)
// Les valeurs doivent correspondre exactement à celles attendues par le microservice
export const GENDER_TAGS = [
  { id: 'homme adulte', label: 'Homme' },
  { id: 'femme adulte', label: 'Femme' },
  { id: 'garçon', label: 'Garçon' },
  { id: 'fille', label: 'Fille' },
] as const

// COULEUR (obligatoire, 1 choix)
export const COLOR_TAGS = [
  { id: 'blanc', label: 'Blanc', color: '#FFFFFF' },
  { id: 'beige', label: 'Beige', color: '#F5F5DC' },
  { id: 'bleu', label: 'Bleu', color: '#4169E1' },
  { id: 'vert', label: 'Vert', color: '#228B22' },
  { id: 'marron', label: 'Marron', color: '#8B4513' },
  { id: 'noir', label: 'Noir', color: '#000000' },
  { id: 'multicolore', label: 'Multicolore', color: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)' },
] as const

// Types pour TypeScript
export type FabricTag = typeof FABRIC_TAGS[number]['id']
export type EventTag = typeof EVENT_TAGS[number]['id']
export type GenderTag = typeof GENDER_TAGS[number]['id']
export type ColorTag = typeof COLOR_TAGS[number]['id']

// Payload strict pour l'inspiration (format exact attendu par le microservice)
export interface InspirationPayload {
  fabric: FabricTag
  event: EventTag
  gender: GenderTag
  color: ColorTag
}

// Payload strict pour le try-on (format exact attendu par le microservice)
export interface TryOnPayload {
  model_id: string
  tailor_id: string
  user_image_path: string
}

