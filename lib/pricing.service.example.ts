/**
 * EXEMPLES D'UTILISATION - SERVICE DE PRICING
 * 
 * Ce fichier contient des exemples pratiques d'utilisation du service de pricing
 * dans différents contextes (API, composants React, commandes, etc.)
 */

import { calculatePricing, applyDiscount, applyDiscountPercent } from './pricing.service'

// ============================================
// EXEMPLE 1 : Calcul simple
// ============================================
export function example1_SimpleCalculation() {
  const price_tailor = 30000 // Prix renseigné par le tailleur
  
  const pricing = calculatePricing(price_tailor)
  
  console.log('=== EXEMPLE 1 : Calcul simple ===')
  console.log(`Prix tailleur : ${pricing.price_tailor.toLocaleString()} FCFA`)
  console.log(`Commission tailleur : ${pricing.commission_tailor.toLocaleString()} FCFA`)
  console.log(`Frais client : ${pricing.client_fee.toLocaleString()} FCFA`)
  console.log(`Prix client : ${pricing.price_client.toLocaleString()} FCFA`)
  console.log(`Revenu plateforme : ${pricing.platform_revenue.toLocaleString()} FCFA`)
  console.log(`Palier : ${pricing.pricing_tier}`)
  
  return pricing
}

// ============================================
// EXEMPLE 2 : Création de commande
// ============================================
export function example2_OrderCreation(price_tailor: number) {
  const pricing = calculatePricing(price_tailor)
  
  // Simuler la création d'une commande
  const order = {
    id: 'order-123',
    tailor_price: pricing.price_tailor,
    client_price: pricing.price_client,
    commission: pricing.commission_tailor,
    client_fee: pricing.client_fee,
    platform_revenue: pricing.platform_revenue,
    pricing_tier: pricing.pricing_tier,
    created_at: new Date().toISOString(),
  }
  
  console.log('\n=== EXEMPLE 2 : Création de commande ===')
  console.log('Commande créée :', order)
  
  return order
}

// ============================================
// EXEMPLE 3 : Affichage dans un composant React
// ============================================
export function example3_ReactComponent(price_tailor: number) {
  const pricing = calculatePricing(price_tailor)
  
  // Simuler le rendu d'un composant React
  const componentData = {
    displayPrice: pricing.price_client,
    displayPriceFormatted: `${pricing.price_client.toLocaleString()} FCFA`,
    serviceFee: pricing.client_fee,
    serviceFeeFormatted: `Frais de service : ${pricing.client_fee.toLocaleString()} FCFA`,
    breakdown: {
      basePrice: pricing.price_tailor,
      serviceFee: pricing.client_fee,
      total: pricing.price_client,
    },
  }
  
  console.log('\n=== EXEMPLE 3 : Données pour composant React ===')
  console.log('Données :', componentData)
  
  return componentData
}

// ============================================
// EXEMPLE 4 : Commission personnalisée
// ============================================
export function example4_CustomCommission(price_tailor: number, customRate: number) {
  // Tailleur premium avec commission réduite
  const pricing = calculatePricing(price_tailor, customRate)
  
  console.log('\n=== EXEMPLE 4 : Commission personnalisée ===')
  console.log(`Prix de base : ${price_tailor.toLocaleString()} FCFA`)
  console.log(`Commission personnalisée : ${customRate}%`)
  console.log(`Commission appliquée : ${pricing.commission_tailor.toLocaleString()} FCFA`)
  console.log(`Prix client : ${pricing.price_client.toLocaleString()} FCFA`)
  
  return pricing
}

// ============================================
// EXEMPLE 5 : Promotion avec réduction
// ============================================
export function example5_Promotion(price_tailor: number, discountPercent: number) {
  const basePricing = calculatePricing(price_tailor)
  const pricingWithDiscount = applyDiscountPercent(basePricing, discountPercent)
  
  console.log('\n=== EXEMPLE 5 : Promotion ===')
  console.log(`Prix de base : ${basePricing.price_client.toLocaleString()} FCFA`)
  console.log(`Réduction : ${discountPercent}%`)
  console.log(`Prix après réduction : ${pricingWithDiscount.price_client.toLocaleString()} FCFA`)
  console.log(`Économie : ${(basePricing.price_client - pricingWithDiscount.price_client).toLocaleString()} FCFA`)
  
  return pricingWithDiscount
}

// ============================================
// EXEMPLE 6 : Calcul pour différents paliers
// ============================================
export function example6_AllTiers() {
  const examples = [
    { name: 'Palier 1 (bas)', price: 10000 },
    { name: 'Palier 1 (limite)', price: 25000 },
    { name: 'Palier 2 (bas)', price: 26000 },
    { name: 'Palier 2 (milieu)', price: 40000 },
    { name: 'Palier 2 (limite)', price: 50000 },
    { name: 'Palier 3 (bas)', price: 51000 },
    { name: 'Palier 3 (élevé)', price: 100000 },
  ]
  
  console.log('\n=== EXEMPLE 6 : Tous les paliers ===')
  
  examples.forEach(example => {
    const pricing = calculatePricing(example.price)
    console.log(`\n${example.name} (${example.price.toLocaleString()} FCFA) :`)
    console.log(`  - Palier : ${pricing.pricing_tier}`)
    console.log(`  - Commission : ${pricing.commission_rate}% = ${pricing.commission_tailor.toLocaleString()} FCFA`)
    console.log(`  - Frais client : ${pricing.client_fee_rate}% = ${pricing.client_fee.toLocaleString()} FCFA`)
    console.log(`  - Prix client : ${pricing.price_client.toLocaleString()} FCFA`)
    console.log(`  - Revenu plateforme : ${pricing.platform_revenue.toLocaleString()} FCFA`)
  })
}

// ============================================
// EXEMPLE 7 : Utilisation dans un endpoint API
// ============================================
export async function example7_APIEndpoint(price_tailor: number) {
  try {
    const pricing = calculatePricing(price_tailor)
    
    // Simuler une réponse API
    const apiResponse = {
      success: true,
      data: {
        pricing,
        breakdown: {
          base_price: pricing.price_tailor,
          service_fee: pricing.client_fee,
          total: pricing.price_client,
        },
        formatted: {
          base_price: `${pricing.price_tailor.toLocaleString()} FCFA`,
          service_fee: `${pricing.client_fee.toLocaleString()} FCFA`,
          total: `${pricing.price_client.toLocaleString()} FCFA`,
        },
      },
    }
    
    console.log('\n=== EXEMPLE 7 : Réponse API ===')
    console.log(JSON.stringify(apiResponse, null, 2))
    
    return apiResponse
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

// ============================================
// EXÉCUTION DES EXEMPLES (pour test manuel)
// ============================================
if (require.main === module) {
  console.log('🚀 Exécution des exemples de pricing...\n')
  
  example1_SimpleCalculation()
  example2_OrderCreation(50000)
  example3_ReactComponent(35000)
  example4_CustomCommission(50000, 8)
  example5_Promotion(60000, 15)
  example6_AllTiers()
  
  console.log('\n✅ Tous les exemples ont été exécutés !')
}

