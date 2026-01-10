# 🔐 SIGNARE - Résumé des Validations API

**Date :** ${new Date().toISOString().split('T')[0]}

---

## ✅ Validations Zod Implémentées

### 1. `/api/shipping/calculate` ✅
**Méthode :** POST  
**Schéma :** `ShippingCalculateSchema`

**Validations :**
- ✅ `userLat`, `destLat` : -90 à 90 (latitude)
- ✅ `userLon`, `destLon` : -180 à 180 (longitude)
- ✅ Distance maximale : 500km
- ✅ Logging sécurisé des tentatives de manipulation

**Exemple de payload :**
```json
{
  "userLat": 14.7167,
  "userLon": -17.4677,
  "destLat": 14.7645,
  "destLon": -17.3660
}
```

---

### 2. `/api/orders/[orderId]/validation-code` ✅
**Méthode :** POST  
**Paramètres :** `{ orderId: string }`  
**Schéma :** `ValidationCodeRequestSchema`

**Validations :**
- ✅ `orderId` : UUID valide
- ✅ Commande existe dans la base
- ✅ Statut de commande : 'paid' ou 'in_delivery'
- ✅ Logging sécurisé des tentatives d'accès non autorisées

**Exemple d'URL :**
```
POST /api/orders/123e4567-e89b-12d3-a456-426614174000/validation-code
```

---

### 3. `/api/upload/process` ✅
**Méthode :** POST  
**Body :** FormData avec champ 'image'  
**Helper :** `validateImageFile(file: File)`

**Validations :**
- ✅ Fichier présent
- ✅ Type MIME : `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`
- ✅ Taille maximale : 10MB
- ✅ Taille minimale : > 0 (non vide)
- ✅ Logging sécurisé des tentatives d'upload invalides

**Exemple d'utilisation :**
```typescript
const formData = new FormData()
formData.append('image', file)

const response = await fetch('/api/upload/process', {
  method: 'POST',
  body: formData,
})
```

---

## 📋 Schémas Zod Disponibles

### `ShippingCalculateSchema`
```typescript
{
  userLat: number (-90 à 90)
  userLon: number (-180 à 180)
  destLat: number (-90 à 90)
  destLon: number (-180 à 180)
}
```

### `ValidationCodeRequestSchema`
```typescript
{
  orderId: string (UUID)
}
```

### `ProductPublishSchema` (prêt pour usage futur)
```typescript
{
  title: string (3-200 chars)
  description: string (max 2000 chars)
  price: number (positif, max 10M)
  currency: 'FCFA' | 'EUR' | 'USD'
  category: 'boubou' | 'kaftan' | 'robe' | 'ensemble' | 'autre'
  images: string[] (1-10 URLs)
  fabric_type?: string
  tags?: string[]
}
```

### `InspirationPayloadSchema` (prêt pour usage futur)
```typescript
{
  tissu: 'wax' | 'getzner' | 'bazin' | 'soie' | 'coton'
  evenement: 'tabaski' | 'mariage' | 'baptême' | 'travail' | 'sortie'
  genre_age: 'homme adulte' | 'femme adulte' | 'garçon' | 'fille'
  couleur: 'blanc' | 'beige' | 'bleu' | 'vert' | 'marron' | 'noir' | 'multicolore'
}
```

### `TryOnPayloadSchema` (prêt pour usage futur)
```typescript
{
  user_image_path: string
  garment_image_path: string
  job_id: string (UUID)
}
```

---

## 🔒 Sécurité

**Toutes les validations incluent :**
- ✅ Validation stricte avec messages d'erreur explicites
- ✅ Logging sécurisé (sanitization automatique des PII)
- ✅ Codes HTTP appropriés (400, 404, 500)
- ✅ Pas d'exposition d'informations sensibles en production
- ✅ Validation côté serveur uniquement (frontend validation = UX uniquement)

---

## 📝 Prochaines API Routes à Valider

Lors de la création de nouvelles API routes, utiliser les schémas existants ou créer de nouveaux dans `lib/validations/schemas.ts` :

1. **Panier** (`/api/cart/*`) - À créer avec validation
2. **Produits** (`/api/products/*`) - Utiliser `ProductPublishSchema`
3. **Inspiration IA** (`/api/inspiration`) - Utiliser `InspirationPayloadSchema`
4. **Try-on IA** (`/api/tryon`) - Utiliser `TryOnPayloadSchema`

---

## ✅ Checklist pour Nouvelles API Routes

- [ ] Créer schéma Zod dans `lib/validations/schemas.ts`
- [ ] Valider avec `.safeParse()` dans la route
- [ ] Logger les erreurs avec `logError()`
- [ ] Logger les tentatives de manipulation avec `logSecurity()`
- [ ] Retourner codes HTTP appropriés
- [ ] Ne pas exposer détails en production
- [ ] Documenter le schéma attendu

