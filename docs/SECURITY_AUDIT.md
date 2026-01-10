# 🔒 SIGNARE - Rapport d'Audit de Sécurité

**Date :** ${new Date().toISOString().split('T')[0]}
**Auditeur :** Auto (Architecture Review)
**Scope :** Codebase Frontend & Backend

---

## 🚨 PROBLÈMES CRITIQUES (Priorité 1)

### 1. **CALCUL DES PRIX DE LIVRAISON CÔTÉ CLIENT** ❌

**Localisation :** 
- `frontend/hooks/useShipping.ts`
- `shared/lib/utils.ts` → `calculateShippingPrice()`

**Problème :** 
Le calcul des prix de livraison (base + km + frais SIGNARE 15%) est effectué côté client. Un utilisateur peut modifier le JavaScript et manipuler les prix.

**Impact :** 
- **CRITIQUE** : Perte financière potentielle
- Les clients peuvent forcer des prix réduits
- Les frais de service peuvent être contournés

**Solution recommandée :**
```typescript
// ✅ CORRECT : API Route Backend
// app/api/shipping/calculate/route.ts
export async function POST(request: Request) {
  const { userLat, userLon, destLat, destLon } = await request.json()
  
  // Validation des coordonnées (backend)
  if (!isValidCoordinates(userLat, userLon, destLat, destLon)) {
    return Response.json({ error: 'Coordonnées invalides' }, { status: 400 })
  }
  
  // Calcul côté serveur uniquement
  const distanceKm = calculateDistance(userLat, userLon, destLat, destLon)
  const price = calculateShippingPrice(distanceKm)
  
  return Response.json({ distanceKm, price })
}
```

**Action requise :** 
- [ ] Créer API route `/api/shipping/calculate`
- [ ] Déplacer `calculateShippingPrice` vers le backend
- [ ] Modifier `useShipping` pour appeler l'API
- [ ] Valider les coordonnées côté serveur

---

### 2. **GÉNÉRATION DE CODE DE VALIDATION CÔTÉ CLIENT** ❌

**Localisation :** 
- `frontend/hooks/useShipping.ts` → `useValidationCode()`

**Problème :** 
Le code de validation à 6 chiffres est généré côté client avec `Math.random()`. Un attaquant peut prédire ou forcer le code.

**Impact :** 
- **CRITIQUE** : Sécurité des paiements compromise
- Fonds débloqués sans validation réelle
- Pas de source de vérité côté serveur

**Solution recommandée :**
```typescript
// ✅ CORRECT : Génération backend
// app/api/orders/[orderId]/validation-code/route.ts
export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  // Vérifier auth, permissions, état de la commande
  const code = crypto.randomInt(100000, 999999).toString()
  
  // Stocker dans DB avec expiration (5 min)
  await supabase.from('order_validation_codes').insert({
    order_id: params.orderId,
    code,
    expires_at: new Date(Date.now() + 5 * 60 * 1000)
  })
  
  // Envoyer par SMS (service sécurisé)
  await sendSMS(order.phone, `Code validation: ${code}`)
  
  return Response.json({ success: true })
}
```

**Action requise :** 
- [ ] Créer table `order_validation_codes` dans Supabase
- [ ] Créer API route de génération
- [ ] Implémenter expiration (5-10 min)
- [ ] Intégrer service SMS sécurisé
- [ ] Supprimer `useValidationCode` du frontend

---

### 3. **AUTHENTIFICATION VIA LOCALSTORAGE** ❌

**Localisation :** 
- `app/page.tsx` → `isAuthenticated()` (ligne 1142)
- `app/login/page.tsx` → `localStorage.setItem('signare_auth_demo', '1')`

**Problème :** 
L'authentification est simulée via `localStorage` sans validation backend. Aucune vraie sécurité.

**Impact :** 
- **CRITIQUE** : Bypass d'authentification total
- Accès non autorisé aux fonctionnalités
- Pas de gestion de session réelle

**Solution recommandée :**
```typescript
// ✅ CORRECT : Utiliser Supabase Auth
// hooks/useAuth.ts (déjà existant mais à utiliser partout)
import { useAuth } from '@/hooks/useAuth'

// Dans les composants
const { user, isLoading } = useAuth()
if (!user) {
  router.push('/login')
  return null
}
```

**Action requise :** 
- [ ] Remplacer tous les `localStorage.getItem('signare_auth_demo')` par `useAuth()`
- [ ] Supprimer la simulation d'auth
- [ ] Implémenter les RLS (Row Level Security) dans Supabase
- [ ] Protéger les API routes avec middleware d'auth

---

## ⚠️ PROBLÈMES MAJEURS (Priorité 2)

### 4. **PERSISTANCE DE DONNÉES CRITIQUES DANS LOCALSTORAGE** ⚠️

**Localisation :** 
- `app/page.tsx` → `signare_reposts` (lignes 1250, 1257, 1261)
- `app/orders/**/*.tsx` → `signare_tailor_manual_orders`, `signare_tailor_manual_mesures`
- `hooks/useCart.ts` → Panier dans localStorage

**Problème :** 
Les commandes, mesures, reposts sont stockés dans `localStorage` sans synchronisation backend. Perte de données, pas de cohérence.

**Impact :** 
- Perte de données si localStorage est vidé
- Pas de backup/restauration
- Conflits entre appareils
- Pas d'historique

**Solution recommandée :**
```typescript
// ✅ CORRECT : API Routes + Supabase
// app/api/orders/route.ts
export async function POST(request: Request) {
  const { user } = await getUserFromRequest(request) // Middleware auth
  const orderData = await request.json()
  
  // Validation stricte côté serveur
  const validated = orderSchema.parse(orderData)
  
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...validated, user_id: user.id })
    .select()
    .single()
  
  if (error) throw error
  return Response.json(data)
}
```

**Action requise :** 
- [ ] Migrer le panier vers Supabase avec sync
- [ ] Créer API routes pour orders/mesures
- [ ] Implémenter sync localStorage ↔ Supabase (transition)
- [ ] Ajouter gestion d'erreurs réseau

---

### 5. **VALIDATION UNIQUEMENT FRONTEND** ⚠️

**Localisation :** 
- `app/inspiration/page.tsx` → Validation des tags (lignes 65-67)
- `app/shop/publish/page.tsx` → Validation formulaire produit
- `hooks/useImageQuality.ts` → Validation qualité image

**Problème :** 
Les validations sont faites uniquement côté client. Un attaquant peut contourner toutes les validations.

**Impact :** 
- Données invalides dans la base
- Injection potentielle (XSS, SQL)
- Corruption des données ML

**Solution recommandée :**
```typescript
// ✅ CORRECT : Validation backend avec Zod/similar
// app/api/shop/publish/route.ts
import { z } from 'zod'

const ProductSchema = z.object({
  title: z.string().min(3).max(200),
  price: z.number().positive().max(10000000),
  images: z.array(z.string().url()).min(1).max(5),
  category: z.enum(['boubou', 'kaftan', 'robe']),
})

export async function POST(request: Request) {
  const body = await request.json()
  
  try {
    const validated = ProductSchema.parse(body) // Validation stricte
    // ... traitement
  } catch (error) {
    return Response.json({ error: 'Données invalides' }, { status: 400 })
  }
}
```

**Action requise :** 
- [ ] Créer schémas Zod pour toutes les entrées
- [ ] Valider dans toutes les API routes
- [ ] Garder validation frontend pour UX (double couche)
- [ ] Ajouter sanitization pour prévenir XSS

---

### 6. **EXPOSITION DE DONNÉES SENSIBLES DANS CONSOLE.LOG** ⚠️

**Localisation :** 
- Multiple fichiers : `app/**/*.tsx` (18 occurrences)

**Problème :** 
Les `console.log` contiennent des données utilisateur, payloads, et interactions. Ces logs sont visibles dans la console du navigateur en production.

**Impact :** 
- Exposition de données utilisateur
- Fuite d'informations sensibles
- Debugging facilité pour attaquants

**Solution recommandée :**
```typescript
// ✅ CORRECT : Logger conditionnel + sanitization
// lib/logger.ts
export function logMLInteraction(payload: UserInteractionInsert) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[ML] user_interactions.insert', {
      ...payload,
      user_agent: payload.user_agent?.substring(0, 50), // Truncate
    })
  }
  // En production : envoyer à service de logging (Sentry, etc.)
}

// Ou utiliser un logger structuré
import pino from 'pino'
const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
})
```

**Action requise :** 
- [ ] Remplacer tous les `console.log` par logger structuré
- [ ] Sanitizer les données sensibles (PII)
- [ ] Désactiver logs en production
- [ ] Configurer service de logging externe

---

## 📊 PROBLÈMES MODÉRÉS (Priorité 3)

### 7. **PAS DE PAGINATION SUR LES COLLECTIONS** ⚠️

**Localisation :** 
- `app/page.tsx` → Liste des posts (tous chargés)
- `app/shop/page.tsx` → Liste des produits
- `app/messages/page.tsx` → Liste des conversations

**Problème :** 
Toutes les données sont chargées en une fois. Avec 1000+ posts/produits, cela cause des problèmes de performance et de mémoire.

**Solution recommandée :**
```typescript
// ✅ CORRECT : Pagination infinie avec React Query
import { useInfiniteQuery } from '@tanstack/react-query'

export function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 0 }) => fetchPosts({ offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length * 20 : undefined,
  })
}
```

**Action requise :** 
- [ ] Implémenter pagination backend (offset/limit ou cursor)
- [ ] Utiliser React Query pour cache + infinite scroll
- [ ] Limiter à 20-50 items par page
- [ ] Ajouter indicateurs de chargement

---

### 8. **GESTION D'ERREURS INSUFFISANTE** ⚠️

**Localisation :** 
- `app/inspiration/page.tsx` → `catch` blocks (lignes 225, 270)
- `hooks/useAIService.ts` → Gestion d'erreurs générique

**Problème :** 
Les erreurs sont catchées mais pas toujours gérées explicitement. Certaines erreurs sont silencieuses.

**Solution recommandée :**
```typescript
// ✅ CORRECT : Gestion explicite avec types d'erreurs
try {
  const result = await generateInspiration(payload)
} catch (error) {
  if (error instanceof NetworkError) {
    setToast('Erreur de connexion. Vérifiez votre réseau.')
  } else if (error instanceof ValidationError) {
    setToast(error.message) // Message explicite
  } else {
    // Logger l'erreur inattendue
    logger.error('Erreur inspiration inattendue', { error, payload })
    setToast('Une erreur est survenue. Veuillez réessayer.')
  }
}
```

**Action requise :** 
- [ ] Créer classes d'erreurs custom (NetworkError, ValidationError, etc.)
- [ ] Mapper codes HTTP vers messages utilisateur
- [ ] Logger toutes les erreurs inattendues
- [ ] Ajouter retry logic pour erreurs réseau

---

### 9. **CALCUL DE DISTANCE CÔTÉ CLIENT (ACCEPTABLE)** ✅

**Localisation :** 
- `shared/lib/utils.ts` → `calculateDistance()`

**Note :** 
Le calcul de distance (formule Haversine) côté client est **acceptable** pour l'affichage estimatif. Cependant, pour la facturation finale, le calcul doit être validé côté serveur.

**Recommandation :** 
- ✅ Garder le calcul côté client pour l'**estimation** (UX)
- ❌ **Valider** le prix final côté serveur avant paiement

---

## ✅ POINTS POSITIFS

1. ✅ **Séparation des responsabilités** : Services IA isolés (`Services/Signare_AI/`)
2. ✅ **Types TypeScript** : Bonne utilisation des types
3. ✅ **Pas de secrets en dur** : Utilisation de variables d'environnement
4. ✅ **Microservices IA** : Architecture correcte avec mode mock/prod
5. ✅ **Validation des payloads** : Structure stricte pour AI service

---

## 📋 PLAN D'ACTION RECOMMANDÉ

### Phase 1 - Sécurité Critique (Urgent)
- [ ] Migrer calcul prix livraison → API backend
- [ ] Implémenter génération code validation backend
- [ ] Remplacer auth localStorage par Supabase Auth
- [ ] Ajouter validation backend avec Zod

### Phase 2 - Robustesse (Important)
- [ ] Migrer données critiques localStorage → Supabase
- [ ] Implémenter pagination sur toutes les collections
- [ ] Améliorer gestion d'erreurs avec types explicites
- [ ] Sanitizer tous les console.log

### Phase 3 - Performance (Amélioration)
- [ ] Optimiser requêtes avec React Query
- [ ] Implémenter cache stratégique
- [ ] Ajouter lazy loading pour images
- [ ] Optimiser bundle size

---

## 🔍 RÉFÉRENCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/routing/middleware#security-headers)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

