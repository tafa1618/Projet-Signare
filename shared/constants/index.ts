/**
 * SHARED - Constantes de l'application
 * @ai-context Constantes partagées entre frontend et backend
 */

/**
 * Configuration de livraison (Modèle Yango)
 * @security Ces valeurs sont utilisées uniquement côté serveur pour le calcul des prix
 */
export const SHIPPING_CONFIG = {
  BASE_PRICE: 1500, // FCFA (selon .cursorrules section 3)
  PRICE_PER_KM: 100, // FCFA
  SIGNARE_FEE_PERCENT: 0.15, // 15%
} as const

/**
 * Types de vêtements
 */
export const GARMENT_TYPES = [
  'boubou',
  'robe',
  'ensemble',
  'accessoire',
  'kaftan',
  'autre',
] as const

/**
 * Niveaux de complexité
 */
export const COMPLEXITY_LEVELS = [
  'simple',
  'moyen',
  'complexe',
  'haute_couture',
] as const

/**
 * Types de patrons (mesures)
 */
export const PATTERN_TYPES = [
  'boubou',
  'robe',
  'tailleur',
  'pantalon',
  'kaftan',
  'autre',
] as const

/**
 * Catégories d'événements
 */
export const EVENT_CATEGORIES = [
  'défilé',
  'exposition',
  'atelier',
  'festival',
  'autre',
] as const

/**
 * Statuts de commande
 */
export const ORDER_STATUSES = [
  'pending',
  'paid',
  'in_delivery',
  'delivered',
  'cancelled',
] as const

/**
 * Tags culturels sénégalais
 */
export const CULTURAL_TAGS = [
  'wolof',
  'serere',
  'peul',
  'diola',
  'mandingue',
  'soninké',
  'bassari',
  'bedik',
] as const

/**
 * Types de tissus traditionnels
 */
export const FABRIC_TYPES = [
  'basin',
  'wax',
  'dentelle',
  'soie',
  'bazin',
  'bogolan',
  'kente',
  'ndop',
] as const

/**
 * Configuration des scores ML
 */
export const ML_CONFIG = {
  ROLE_SCORE: {
    MIN: 0,
    MAX: 100,
    INCREMENT_CREATION: 5,
    INCREMENT_PURCHASE: 1,
  },
  FABRIC_STRETCH: {
    MIN: 0,
    MAX: 100,
  },
  COMPLEXITY_SCORE: {
    MIN: 1,
    MAX: 10,
  },
  USER_RATING: {
    MIN: 1,
    MAX: 5,
  },
} as const

/**
 * Thème de couleurs SIGNARE
 */
export const COLORS = {
  NOIR: '#0A0A0A',
  NOIR_PROFOND: '#000000',
  OR: '#D4AF37',
  OR_CLAIR: '#E5C158',
  OR_FONCE: '#B8941F',
  BLANC: '#FFFFFF',
  BLANC_CASSE: '#F5F5F5',
} as const

/**
 * Configuration de pagination
 */
export const PAGINATION = {
  POSTS_PER_PAGE: 20,
  ORDERS_PER_PAGE: 15,
  EVENTS_PER_PAGE: 10,
  MESSAGES_PER_PAGE: 50,
} as const

