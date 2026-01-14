/**
 * SERVICE DE PRICING DYNAMIQUE - SIGNARE
 * 
 * Ce service centralise toute la logique de calcul des prix pour la plateforme.
 * Il applique des commissions progressives aux tailleurs et des frais de service aux clients.
 * 
 * Règles de pricing :
 * - PALIER 1 (0-25 000 FCFA) : Commission tailleur 5%, Frais client 5%
 * - PALIER 2 (26 000-50 000 FCFA) : Commission tailleur 7%, Frais client 5%
 * - PALIER 3 (>50 000 FCFA) : Commission tailleur 10%, Frais client 3%
 */

export type PricingTier = 1 | 2 | 3

export interface PricingResult {
  /** Prix de base renseigné par le tailleur (FCFA) */
  price_tailor: number
  
  /** Commission prélevée sur le tailleur (FCFA) */
  commission_tailor: number
  
  /** Frais de service appliqués au client (FCFA) */
  client_fee: number
  
  /** Prix final affiché et payé par le client (FCFA) */
  price_client: number
  
  /** Revenu total de la plateforme (FCFA) */
  platform_revenue: number
  
  /** Palier de pricing appliqué (1, 2 ou 3) */
  pricing_tier: PricingTier
  
  /** Pourcentage de commission tailleur appliqué */
  commission_rate: number
  
  /** Pourcentage de frais client appliqué */
  client_fee_rate: number
}

/**
 * Configuration des paliers de pricing
 */
interface PricingTierConfig {
  min: number
  max: number | null // null = pas de limite supérieure
  commissionRate: number // en pourcentage (ex: 5 = 5%)
  clientFeeRate: number // en pourcentage (ex: 5 = 5%)
}

const PRICING_TIERS: Record<PricingTier, PricingTierConfig> = {
  1: {
    min: 0,
    max: 25000,
    commissionRate: 5,
    clientFeeRate: 5,
  },
  2: {
    min: 26000,
    max: 50000,
    commissionRate: 7,
    clientFeeRate: 5,
  },
  3: {
    min: 51000,
    max: null, // Pas de limite supérieure
    commissionRate: 10,
    clientFeeRate: 3,
  },
}

/**
 * Détermine le palier de pricing en fonction du prix de base
 * 
 * @param price_tailor Prix de base renseigné par le tailleur (FCFA)
 * @returns Le palier de pricing (1, 2 ou 3)
 */
function determinePricingTier(price_tailor: number): PricingTier {
  if (price_tailor < 0) {
    throw new Error('Le prix de base ne peut pas être négatif')
  }

  if (price_tailor <= PRICING_TIERS[1].max!) {
    return 1
  }
  
  if (price_tailor <= PRICING_TIERS[2].max!) {
    return 2
  }
  
  return 3
}

/**
 * Calcule le pricing complet pour un produit/service
 * 
 * Cette fonction est pure : elle ne modifie aucun état externe et retourne
 * toujours le même résultat pour les mêmes entrées.
 * 
 * @param price_tailor Prix de base renseigné par le tailleur (FCFA)
 * @param customCommissionRate Optionnel : taux de commission personnalisé pour le tailleur (en %)
 * @param customClientFeeRate Optionnel : taux de frais client personnalisé (en %)
 * @returns Objet PricingResult contenant tous les montants calculés
 * 
 * @example
 * ```typescript
 * const pricing = calculatePricing(30000)
 * // {
 * //   price_tailor: 30000,
 * //   commission_tailor: 2100,
 * //   client_fee: 1500,
 * //   price_client: 31500,
 * //   platform_revenue: 3600,
 * //   pricing_tier: 2,
 * //   commission_rate: 7,
 * //   client_fee_rate: 5
 * // }
 * ```
 */
export function calculatePricing(
  price_tailor: number,
  customCommissionRate?: number,
  customClientFeeRate?: number
): PricingResult {
  // Validation de l'entrée
  if (typeof price_tailor !== 'number' || isNaN(price_tailor)) {
    throw new Error('Le prix de base doit être un nombre valide')
  }

  if (price_tailor < 0) {
    throw new Error('Le prix de base ne peut pas être négatif')
  }

  // Déterminer le palier
  const tier = determinePricingTier(price_tailor)
  const tierConfig = PRICING_TIERS[tier]

  // Utiliser les taux personnalisés si fournis, sinon utiliser les taux du palier
  const commissionRate = customCommissionRate ?? tierConfig.commissionRate
  const clientFeeRate = customClientFeeRate ?? tierConfig.clientFeeRate

  // Validation des taux personnalisés
  if (commissionRate < 0 || commissionRate > 100) {
    throw new Error('Le taux de commission doit être entre 0 et 100%')
  }

  if (clientFeeRate < 0 || clientFeeRate > 100) {
    throw new Error('Le taux de frais client doit être entre 0 et 100%')
  }

  // Calculs
  // Commission prélevée sur le tailleur (arrondie)
  const commission_tailor = Math.round(price_tailor * (commissionRate / 100))

  // Frais de service appliqués au client (arrondis)
  const client_fee = Math.round(price_tailor * (clientFeeRate / 100))

  // Prix final payé par le client
  const price_client = price_tailor + client_fee

  // Revenu total de la plateforme
  const platform_revenue = commission_tailor + client_fee

  return {
    price_tailor,
    commission_tailor,
    client_fee,
    price_client,
    platform_revenue,
    pricing_tier: tier,
    commission_rate: commissionRate,
    client_fee_rate: clientFeeRate,
  }
}

/**
 * Applique une réduction temporaire au prix client
 * 
 * @param pricing Résultat du calcul de pricing de base
 * @param discountAmount Montant de la réduction en FCFA
 * @returns Nouveau résultat de pricing avec la réduction appliquée
 */
export function applyDiscount(
  pricing: PricingResult,
  discountAmount: number
): PricingResult {
  if (discountAmount < 0) {
    throw new Error('Le montant de la réduction ne peut pas être négatif')
  }

  if (discountAmount > pricing.price_client) {
    throw new Error('La réduction ne peut pas dépasser le prix client')
  }

  return {
    ...pricing,
    price_client: pricing.price_client - discountAmount,
    // La réduction réduit le revenu plateforme (on la prend sur les frais client)
    platform_revenue: Math.max(0, pricing.platform_revenue - discountAmount),
    client_fee: Math.max(0, pricing.client_fee - discountAmount),
  }
}

/**
 * Applique un pourcentage de réduction au prix client
 * 
 * @param pricing Résultat du calcul de pricing de base
 * @param discountPercent Pourcentage de réduction (ex: 10 = 10%)
 * @returns Nouveau résultat de pricing avec la réduction appliquée
 */
export function applyDiscountPercent(
  pricing: PricingResult,
  discountPercent: number
): PricingResult {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Le pourcentage de réduction doit être entre 0 et 100%')
  }

  const discountAmount = Math.round(pricing.price_client * (discountPercent / 100))
  return applyDiscount(pricing, discountAmount)
}

