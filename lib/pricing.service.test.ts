/**
 * TESTS UNITAIRES - SERVICE DE PRICING
 * 
 * Couverture complète des paliers, valeurs limites et cas d'erreur
 * 
 * Pour exécuter ces tests, installer Jest :
 * npm install --save-dev jest @types/jest ts-jest
 * 
 * Ou utiliser un autre framework de test de votre choix.
 */

import { calculatePricing, applyDiscount, applyDiscountPercent, type PricingResult } from './pricing.service'

// Fonctions d'assertion simples pour exécution manuelle
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ÉCHEC : ${message}`)
  }
  console.log(`✅ ${message}`)
}

function describe(name: string, fn: () => void) {
  console.log(`\n📦 ${name}`)
  fn()
}

function it(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
  } catch (error) {
    console.error(`  ❌ ${name}`)
    throw error
  }
}

describe('Pricing Service', () => {
  describe('PALIER 1 (0 - 25 000 FCFA)', () => {
    it('devrait appliquer 5% commission et 5% frais client pour 0 FCFA', () => {
      const result = calculatePricing(0)
      
      expect(result.price_tailor).toBe(0)
      expect(result.commission_tailor).toBe(0)
      expect(result.client_fee).toBe(0)
      expect(result.price_client).toBe(0)
      expect(result.platform_revenue).toBe(0)
      expect(result.pricing_tier).toBe(1)
      expect(result.commission_rate).toBe(5)
      expect(result.client_fee_rate).toBe(5)
    })

    it('devrait appliquer 5% commission et 5% frais client pour 10 000 FCFA', () => {
      const result = calculatePricing(10000)
      
      expect(result.price_tailor).toBe(10000)
      expect(result.commission_tailor).toBe(500) // 5% de 10000
      expect(result.client_fee).toBe(500) // 5% de 10000
      expect(result.price_client).toBe(10500) // 10000 + 500
      expect(result.platform_revenue).toBe(1000) // 500 + 500
      expect(result.pricing_tier).toBe(1)
    })

    it('devrait appliquer 5% commission et 5% frais client pour 25 000 FCFA (limite supérieure)', () => {
      const result = calculatePricing(25000)
      
      expect(result.price_tailor).toBe(25000)
      expect(result.commission_tailor).toBe(1250) // 5% de 25000
      expect(result.client_fee).toBe(1250) // 5% de 25000
      expect(result.price_client).toBe(26250) // 25000 + 1250
      expect(result.platform_revenue).toBe(2500) // 1250 + 1250
      expect(result.pricing_tier).toBe(1)
    })

    it('devrait arrondir correctement les montants (ex: 12 500 FCFA)', () => {
      const result = calculatePricing(12500)
      
      expect(result.commission_tailor).toBe(625) // 5% de 12500 = 625
      expect(result.client_fee).toBe(625) // 5% de 12500 = 625
      expect(result.price_client).toBe(13125) // 12500 + 625
    })
  })

  describe('PALIER 2 (26 000 - 50 000 FCFA)', () => {
    it('devrait appliquer 7% commission et 5% frais client pour 26 000 FCFA (limite inférieure)', () => {
      const result = calculatePricing(26000)
      
      expect(result.price_tailor).toBe(26000)
      expect(result.commission_tailor).toBe(1820) // 7% de 26000
      expect(result.client_fee).toBe(1300) // 5% de 26000
      expect(result.price_client).toBe(27300) // 26000 + 1300
      expect(result.platform_revenue).toBe(3120) // 1820 + 1300
      expect(result.pricing_tier).toBe(2)
      expect(result.commission_rate).toBe(7)
      expect(result.client_fee_rate).toBe(5)
    })

    it('devrait appliquer 7% commission et 5% frais client pour 40 000 FCFA', () => {
      const result = calculatePricing(40000)
      
      expect(result.price_tailor).toBe(40000)
      expect(result.commission_tailor).toBe(2800) // 7% de 40000
      expect(result.client_fee).toBe(2000) // 5% de 40000
      expect(result.price_client).toBe(42000) // 40000 + 2000
      expect(result.platform_revenue).toBe(4800) // 2800 + 2000
      expect(result.pricing_tier).toBe(2)
    })

    it('devrait appliquer 7% commission et 5% frais client pour 50 000 FCFA (limite supérieure)', () => {
      const result = calculatePricing(50000)
      
      expect(result.price_tailor).toBe(50000)
      expect(result.commission_tailor).toBe(3500) // 7% de 50000
      expect(result.client_fee).toBe(2500) // 5% de 50000
      expect(result.price_client).toBe(52500) // 50000 + 2500
      expect(result.platform_revenue).toBe(6000) // 3500 + 2500
      expect(result.pricing_tier).toBe(2)
    })
  })

  describe('PALIER 3 (> 50 000 FCFA)', () => {
    it('devrait appliquer 10% commission et 3% frais client pour 51 000 FCFA (limite inférieure)', () => {
      const result = calculatePricing(51000)
      
      expect(result.price_tailor).toBe(51000)
      expect(result.commission_tailor).toBe(5100) // 10% de 51000
      expect(result.client_fee).toBe(1530) // 3% de 51000
      expect(result.price_client).toBe(52530) // 51000 + 1530
      expect(result.platform_revenue).toBe(6630) // 5100 + 1530
      expect(result.pricing_tier).toBe(3)
      expect(result.commission_rate).toBe(10)
      expect(result.client_fee_rate).toBe(3)
    })

    it('devrait appliquer 10% commission et 3% frais client pour 100 000 FCFA', () => {
      const result = calculatePricing(100000)
      
      expect(result.price_tailor).toBe(100000)
      expect(result.commission_tailor).toBe(10000) // 10% de 100000
      expect(result.client_fee).toBe(3000) // 3% de 100000
      expect(result.price_client).toBe(103000) // 100000 + 3000
      expect(result.platform_revenue).toBe(13000) // 10000 + 3000
      expect(result.pricing_tier).toBe(3)
    })

    it('devrait appliquer 10% commission et 3% frais client pour 500 000 FCFA (montant élevé)', () => {
      const result = calculatePricing(500000)
      
      expect(result.price_tailor).toBe(500000)
      expect(result.commission_tailor).toBe(50000) // 10% de 500000
      expect(result.client_fee).toBe(15000) // 3% de 500000
      expect(result.price_client).toBe(515000) // 500000 + 15000
      expect(result.platform_revenue).toBe(65000) // 50000 + 15000
      expect(result.pricing_tier).toBe(3)
    })
  })

  describe('Commissions et frais personnalisés', () => {
    it('devrait accepter un taux de commission personnalisé', () => {
      const result = calculatePricing(30000, 8) // 8% au lieu de 7%
      
      expect(result.price_tailor).toBe(30000)
      expect(result.commission_tailor).toBe(2400) // 8% de 30000
      expect(result.commission_rate).toBe(8)
      expect(result.client_fee_rate).toBe(5) // Toujours 5% pour le palier 2
    })

    it('devrait accepter un taux de frais client personnalisé', () => {
      const result = calculatePricing(30000, undefined, 6) // 6% au lieu de 5%
      
      expect(result.price_tailor).toBe(30000)
      expect(result.client_fee).toBe(1800) // 6% de 30000
      expect(result.client_fee_rate).toBe(6)
      expect(result.commission_rate).toBe(7) // Toujours 7% pour le palier 2
    })

    it('devrait accepter les deux taux personnalisés simultanément', () => {
      const result = calculatePricing(30000, 8, 6)
      
      expect(result.commission_rate).toBe(8)
      expect(result.client_fee_rate).toBe(6)
      expect(result.commission_tailor).toBe(2400) // 8% de 30000
      expect(result.client_fee).toBe(1800) // 6% de 30000
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait rejeter un prix négatif', () => {
      expect(() => calculatePricing(-1000)).toThrow('Le prix de base ne peut pas être négatif')
    })

    it('devrait rejeter un prix NaN', () => {
      expect(() => calculatePricing(NaN)).toThrow('Le prix de base doit être un nombre valide')
    })

    it('devrait rejeter un prix non numérique', () => {
      expect(() => calculatePricing('10000' as any)).toThrow('Le prix de base doit être un nombre valide')
    })

    it('devrait rejeter un taux de commission > 100%', () => {
      expect(() => calculatePricing(30000, 101)).toThrow('Le taux de commission doit être entre 0 et 100%')
    })

    it('devrait rejeter un taux de commission négatif', () => {
      expect(() => calculatePricing(30000, -5)).toThrow('Le taux de commission doit être entre 0 et 100%')
    })

    it('devrait rejeter un taux de frais client > 100%', () => {
      expect(() => calculatePricing(30000, undefined, 101)).toThrow('Le taux de frais client doit être entre 0 et 100%')
    })
  })

  describe('Fonctions de réduction', () => {
    it('devrait appliquer une réduction en montant fixe', () => {
      const basePricing = calculatePricing(50000)
      const result = applyDiscount(basePricing, 2000)
      
      expect(result.price_client).toBe(50500) // 52500 - 2000
      expect(result.platform_revenue).toBe(4000) // 6000 - 2000
      expect(result.client_fee).toBe(500) // 2500 - 2000
    })

    it('devrait appliquer une réduction en pourcentage', () => {
      const basePricing = calculatePricing(50000)
      const result = applyDiscountPercent(basePricing, 10) // 10% de réduction
      
      const expectedDiscount = Math.round(52500 * 0.1) // 5250
      expect(result.price_client).toBe(52500 - expectedDiscount)
    })

    it('devrait rejeter une réduction négative', () => {
      const basePricing = calculatePricing(50000)
      expect(() => applyDiscount(basePricing, -1000)).toThrow('Le montant de la réduction ne peut pas être négatif')
    })

    it('devrait rejeter une réduction supérieure au prix client', () => {
      const basePricing = calculatePricing(50000)
      expect(() => applyDiscount(basePricing, 60000)).toThrow('La réduction ne peut pas dépasser le prix client')
    })

    it('devrait rejeter un pourcentage de réduction invalide', () => {
      const basePricing = calculatePricing(50000)
      expect(() => applyDiscountPercent(basePricing, 150)).toThrow('Le pourcentage de réduction doit être entre 0 et 100%')
    })
  })

  describe('Cohérence des calculs', () => {
    it('devrait garantir que price_client = price_tailor + client_fee', () => {
      const prices = [10000, 30000, 75000, 200000]
      
      prices.forEach(price => {
        const result = calculatePricing(price)
        expect(result.price_client).toBe(result.price_tailor + result.client_fee)
      })
    })

    it('devrait garantir que platform_revenue = commission_tailor + client_fee', () => {
      const prices = [10000, 30000, 75000, 200000]
      
      prices.forEach(price => {
        const result = calculatePricing(price)
        expect(result.platform_revenue).toBe(result.commission_tailor + result.client_fee)
      })
    })

    it('devrait garantir que tous les montants sont des entiers', () => {
      const prices = [12345, 33333, 77777]
      
      prices.forEach(price => {
        const result = calculatePricing(price)
        expect(Number.isInteger(result.price_tailor)).toBe(true)
        expect(Number.isInteger(result.commission_tailor)).toBe(true)
        expect(Number.isInteger(result.client_fee)).toBe(true)
        expect(Number.isInteger(result.price_client)).toBe(true)
        expect(Number.isInteger(result.platform_revenue)).toBe(true)
      })
    })
  })
})

