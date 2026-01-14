# 💰 Système de Pricing Dynamique - SIGNARE

## Vue d'ensemble

Le système de pricing dynamique de SIGNARE applique des commissions progressives aux tailleurs et des frais de service aux clients, tout en garantissant la transparence et la clarté des prix.

## Architecture

### Service centralisé

Toute la logique de pricing est centralisée dans `lib/pricing.service.ts`, garantissant :
- ✅ Aucune duplication de code
- ✅ Source unique de vérité
- ✅ Facilité de maintenance et d'évolution
- ✅ Testabilité complète

### Fonction principale

```typescript
import { calculatePricing } from '@/lib/pricing.service'

const pricing = calculatePricing(30000)
// {
//   price_tailor: 30000,
//   commission_tailor: 2100,
//   client_fee: 1500,
//   price_client: 31500,
//   platform_revenue: 3600,
//   pricing_tier: 2,
//   commission_rate: 7,
//   client_fee_rate: 5
// }
```

## Paliers de pricing

### PALIER 1 : 0 - 25 000 FCFA
- **Commission tailleur** : 5%
- **Frais client** : 5%
- **Exemple** : Prix de base 20 000 FCFA
  - Commission : 1 000 FCFA
  - Frais client : 1 000 FCFA
  - Prix client : 21 000 FCFA
  - Revenu plateforme : 2 000 FCFA

### PALIER 2 : 26 000 - 50 000 FCFA
- **Commission tailleur** : 7%
- **Frais client** : 5%
- **Exemple** : Prix de base 40 000 FCFA
  - Commission : 2 800 FCFA
  - Frais client : 2 000 FCFA
  - Prix client : 42 000 FCFA
  - Revenu plateforme : 4 800 FCFA

### PALIER 3 : > 50 000 FCFA
- **Commission tailleur** : 10%
- **Frais client** : 3%
- **Exemple** : Prix de base 100 000 FCFA
  - Commission : 10 000 FCFA
  - Frais client : 3 000 FCFA
  - Prix client : 103 000 FCFA
  - Revenu plateforme : 13 000 FCFA

## Utilisation

### Dans un endpoint API

```typescript
import { calculatePricing } from '@/lib/pricing.service'

export async function POST(request: Request) {
  const { price_tailor } = await request.json()
  
  const pricing = calculatePricing(price_tailor)
  
  // Utiliser pricing.price_client pour afficher au client
  // Utiliser pricing.commission_tailor pour prélever au tailleur
  // Utiliser pricing.platform_revenue pour le revenu plateforme
  
  return Response.json({ pricing })
}
```

### Dans un composant React (affichage uniquement)

```typescript
'use client'

import { calculatePricing } from '@/lib/pricing.service'

export function ProductPrice({ basePrice }: { basePrice: number }) {
  const pricing = calculatePricing(basePrice)
  
  return (
    <div>
      <p>Prix : {pricing.price_client.toLocaleString()} FCFA</p>
      <p className="text-sm text-gray-500">
        Frais de service : {pricing.client_fee.toLocaleString()} FCFA
      </p>
    </div>
  )
}
```

### Avec des taux personnalisés

```typescript
// Commission personnalisée pour un tailleur premium
const pricing = calculatePricing(50000, 8) // 8% au lieu de 7%

// Frais client personnalisés pour une promotion
const pricing = calculatePricing(50000, undefined, 3) // 3% au lieu de 5%

// Les deux personnalisés
const pricing = calculatePricing(50000, 8, 3)
```

### Application de réductions

```typescript
import { calculatePricing, applyDiscount, applyDiscountPercent } from '@/lib/pricing.service'

// Réduction en montant fixe
let pricing = calculatePricing(50000)
pricing = applyDiscount(pricing, 2000) // Réduction de 2000 FCFA

// Réduction en pourcentage
let pricing = calculatePricing(50000)
pricing = applyDiscountPercent(pricing, 10) // Réduction de 10%
```

## API REST

### POST /api/pricing/calculate

**Requête :**
```json
{
  "price_tailor": 30000,
  "customCommissionRate": 8,
  "customClientFeeRate": 5,
  "discountAmount": 1000
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "price_tailor": 30000,
    "commission_tailor": 2400,
    "client_fee": 1500,
    "price_client": 30500,
    "platform_revenue": 2900,
    "pricing_tier": 2,
    "commission_rate": 8,
    "client_fee_rate": 5
  }
}
```

### GET /api/pricing/calculate?price_tailor=30000

**Réponse :** Même format que POST

## Tests

Les tests unitaires couvrent :
- ✅ Tous les paliers (limites inférieures et supérieures)
- ✅ Valeurs limites (0, 25000, 26000, 50000, 51000)
- ✅ Arrondissements corrects
- ✅ Taux personnalisés
- ✅ Réductions
- ✅ Gestion des erreurs
- ✅ Cohérence des calculs

Exécuter les tests :
```bash
npm test lib/pricing.service.test.ts
```

## Évolutions futures

Le système est conçu pour faciliter l'ajout de :
- 🔮 **Réductions temporaires** : Déjà implémenté via `applyDiscount()`
- 🔮 **Commissions personnalisées par tailleur** : Déjà supporté via `customCommissionRate`
- 🔮 **Promotions côté client** : Déjà implémenté via `applyDiscountPercent()`
- 🔮 **Paliers supplémentaires** : Facilement ajoutables dans `PRICING_TIERS`
- 🔮 **Historique des prix** : À implémenter dans la base de données
- 🔮 **A/B testing de pricing** : À implémenter avec feature flags

## Principes de design

1. **Transparence** : Le client voit toujours le prix final clairement
2. **Équité** : Les commissions sont progressives (plus le prix est élevé, plus la commission est élevée)
3. **Simplicité** : Un seul service, une seule source de vérité
4. **Flexibilité** : Support des cas particuliers (taux personnalisés, réductions)
5. **Maintenabilité** : Code lisible, commenté, testé

## Notes importantes

⚠️ **Tous les montants sont en FCFA (entiers)**
⚠️ **Les arrondissements utilisent `Math.round()`**
⚠️ **Le prix affiché au client est toujours `price_client`**
⚠️ **Le revenu plateforme est toujours `commission_tailor + client_fee`**

