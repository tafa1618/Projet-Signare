# 🔧 SIGNARE - Plan de Correction des Vulnérabilités de Sécurité

**Date :** ${new Date().toISOString().split('T')[0]}
**Priorité :** CRITIQUE

---

## 🚨 CORRECTIONS IMMÉDIATES (À FAIRE EN PREMIER)

### 1. Migrer le Calcul des Prix de Livraison → Backend

**Fichier à créer :** `app/api/shipping/calculate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { calculateDistance, calculateShippingPrice } from '@/shared/lib/utils'

// Validation des coordonnées
function isValidCoordinate(value: number): boolean {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= -90 && value <= 90 // Latitude
}

function isValidLongitude(value: number): boolean {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= -180 && value <= 180
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userLat, userLon, destLat, destLon } = body

    // Validation stricte côté serveur
    if (!isValidCoordinate(userLat) || !isValidCoordinate(destLat)) {
      return NextResponse.json(
        { error: 'Latitude invalide' },
        { status: 400 }
      )
    }

    if (!isValidLongitude(userLon) || !isValidLongitude(destLon)) {
      return NextResponse.json(
        { error: 'Longitude invalide' },
        { status: 400 }
      )
    }

    // Calcul côté serveur uniquement
    const distanceKm = calculateDistance(userLat, userLon, destLat, destLon)
    
    // Validation : distance raisonnable (max 500km)
    if (distanceKm > 500) {
      return NextResponse.json(
        { error: 'Distance trop importante' },
        { status: 400 }
      )
    }

    const price = calculateShippingPrice(distanceKm)

    return NextResponse.json({
      distanceKm: Math.round(distanceKm * 100) / 100, // 2 décimales
      price,
      currency: 'FCFA',
    })
  } catch (error) {
    console.error('Erreur calcul livraison:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul' },
      { status: 500 }
    )
  }
}
```

**Fichier à modifier :** `frontend/hooks/useShipping.ts`

```typescript
import { useState, useEffect } from 'react'

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
    if (!userLatitude || !userLongitude) return

    setIsLoading(true)
    setError(null)

    // ✅ APPEL API BACKEND (sécurisé)
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
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erreur calcul livraison')
        }
        return res.json()
      })
      .then((data) => {
        setDistance(data.distanceKm)
        setShippingPrice(data.price)
      })
      .catch((err) => {
        setError(err.message)
        console.error('Erreur shipping:', err)
      })
      .finally(() => setIsLoading(false))
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude])

  return { distance, shippingPrice, isLoading, error }
}
```

---

### 2. Génération de Code de Validation → Backend + SMS

**Fichier à créer :** `app/api/orders/[orderId]/validation-code/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role pour bypass RLS
)

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Vérifier authentification utilisateur
    // const { user } = await getUserFromRequest(request)
    // if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Vérifier que la commande existe et appartient à l'utilisateur
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, phone')
      .eq('id', params.orderId)
      // .eq('user_id', user.id) // À décommenter avec auth
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    if (order.status !== 'pending_delivery') {
      return NextResponse.json(
        { error: 'Commande non éligible pour validation' },
        { status: 400 }
      )
    }

    // Générer code sécurisé (6 chiffres)
    const code = crypto.getRandomValues(new Uint32Array(1))[0]
      .toString()
      .padStart(6, '0')
      .slice(-6)

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Stocker dans DB avec expiration
    const { error: codeError } = await supabase
      .from('order_validation_codes')
      .insert({
        order_id: params.orderId,
        code,
        expires_at: expiresAt.toISOString(),
      })

    if (codeError) {
      return NextResponse.json(
        { error: 'Erreur génération code' },
        { status: 500 }
      )
    }

    // TODO: Envoyer SMS via service sécurisé (Twilio, AWS SNS, etc.)
    // await sendSMS(order.phone, `Code validation SIGNARE: ${code}`)

    // Pour l'instant, retourner le code (À SUPPRIMER EN PRODUCTION)
    return NextResponse.json({
      success: true,
      expiresIn: 600, // secondes
      // code, // ⚠️ SUPPRIMER EN PRODUCTION
    })
  } catch (error) {
    console.error('Erreur génération code:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

**Migration SQL requise :**
```sql
-- Table pour stocker les codes de validation
CREATE TABLE IF NOT EXISTS order_validation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_active_code UNIQUE NULLS NOT DISTINCT (order_id, code, expires_at > NOW())
);

CREATE INDEX idx_validation_codes_order ON order_validation_codes(order_id);
CREATE INDEX idx_validation_codes_expires ON order_validation_codes(expires_at);
```

---

### 3. Remplacer Auth localStorage par Supabase Auth

**Fichiers à modifier :**
- `app/page.tsx` (ligne 1142, 1212, etc.)
- `app/login/page.tsx` (ligne 24)

**Avant :**
```typescript
const isAuthenticated = () => {
  return localStorage.getItem('signare_auth_demo') === '1'
}
```

**Après :**
```typescript
import { useAuth } from '@/hooks/useAuth'

// Dans le composant
const { user, isLoading } = useAuth()

if (isLoading) return <Loading />
if (!user) {
  router.push('/login')
  return null
}
```

---

### 4. Ajouter Validation Backend avec Zod

**Package requis :**
```bash
npm install zod
```

**Fichier à créer :** `lib/validations/schemas.ts`

```typescript
import { z } from 'zod'

export const ShippingCalculateSchema = z.object({
  userLat: z.number().min(-90).max(90),
  userLon: z.number().min(-180).max(180),
  destLat: z.number().min(-90).max(90),
  destLon: z.number().min(-180).max(180),
})

export const ProductPublishSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(2000).trim(),
  price: z.number().positive().max(10000000),
  currency: z.enum(['FCFA', 'EUR', 'USD']),
  category: z.enum(['boubou', 'kaftan', 'robe', 'ensemble', 'autre']),
  images: z.array(z.string().url()).min(1).max(10),
  fabric_type: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const InspirationPayloadSchema = z.object({
  tissu: z.enum(['wax', 'getzner', 'bazin', 'soie', 'coton']),
  evenement: z.enum(['tabaski', 'mariage', 'baptême', 'travail', 'sortie']),
  genre_age: z.enum(['homme adulte', 'femme adulte', 'garçon', 'fille']),
  couleur: z.enum(['blanc', 'beige', 'bleu', 'vert', 'marron', 'noir', 'multicolore']),
})

export const TryOnPayloadSchema = z.object({
  user_image_path: z.string().min(1),
  garment_image_path: z.string().min(1),
  job_id: z.string().uuid(),
})
```

**Utilisation dans API route :**
```typescript
import { ShippingCalculateSchema } from '@/lib/validations/schemas'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const validation = ShippingCalculateSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: validation.error.errors },
      { status: 400 }
    )
  }
  
  const { userLat, userLon, destLat, destLon } = validation.data
  // ... traitement sécurisé
}
```

---

## ⚠️ CORRECTIONS IMPORTANTES (Phase 2)

### 5. Migrer Panier localStorage → Supabase avec Sync

**Fichier à créer :** `app/api/cart/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  // Récupérer panier depuis Supabase pour l'utilisateur connecté
  // ...
}

export async function POST(request: NextRequest) {
  // Ajouter item au panier (validation backend)
  // ...
}

export async function DELETE(request: NextRequest) {
  // Retirer item du panier
  // ...
}
```

---

### 6. Sanitizer les Console.log

**Fichier à créer :** `lib/logger.ts`

```typescript
const isDev = process.env.NODE_ENV === 'development'

export function logMLInteraction(payload: any) {
  if (!isDev) return // Pas de logs en production
  
  // Sanitizer les données sensibles
  const sanitized = {
    ...payload,
    user_agent: payload.user_agent?.substring(0, 50),
    // Supprimer données PII
    phone: payload.phone ? '***' : undefined,
  }
  
  console.log('[ML] user_interactions.insert', sanitized)
}

export function logError(error: unknown, context?: string) {
  if (isDev) {
    console.error(`[ERROR] ${context || 'Unknown'}`, error)
  }
  // En production : envoyer à service de logging (Sentry, LogRocket, etc.)
}
```

---

## 📊 AMÉLIORATIONS (Phase 3)

### 7. Implémenter Pagination

- Utiliser React Query pour cache + infinite scroll
- Backend : endpoints avec `offset` et `limit`
- Frontend : `useInfiniteQuery` de TanStack Query

---

## ✅ CHECKLIST DE MIGRATION

- [ ] **Phase 1 - Critique**
  - [ ] Créer `/api/shipping/calculate`
  - [ ] Modifier `useShipping` pour appeler l'API
  - [ ] Créer `/api/orders/[orderId]/validation-code`
  - [ ] Créer table `order_validation_codes` dans Supabase
  - [ ] Remplacer auth localStorage par `useAuth()`
  - [ ] Installer et configurer Zod
  - [ ] Ajouter validations dans toutes les API routes

- [ ] **Phase 2 - Important**
  - [ ] Créer API routes pour panier
  - [ ] Migrer panier localStorage → Supabase
  - [ ] Créer `lib/logger.ts` et remplacer tous les console.log
  - [ ] Ajouter sanitization pour PII

- [ ] **Phase 3 - Amélioration**
  - [ ] Implémenter pagination backend
  - [ ] Ajouter React Query pour cache
  - [ ] Optimiser performances

---

**Estimation temps :**
- Phase 1 : 2-3 jours
- Phase 2 : 1-2 jours
- Phase 3 : 2-3 jours

**Total :** ~1 semaine de développement

