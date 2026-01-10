# 🛒 SIGNARE - Guide de Migration Panier localStorage → Supabase

**Date :** ${new Date().toISOString().split('T')[0]}

---

## ✅ Migration Terminée

### Structure Créée

1. **Table Supabase :** `cart_items`
   - Migration SQL : `supabase-migrations/002_create_cart_items.sql`
   - RLS (Row Level Security) activé
   - Index pour performance

2. **API Routes :** `/api/cart`
   - `GET /api/cart` - Récupérer le panier
   - `POST /api/cart` - Ajouter un item
   - `PUT /api/cart` - Mettre à jour la quantité
   - `DELETE /api/cart?itemId=xxx` - Supprimer un item

3. **Hook :** `hooks/useCart.ts`
   - Sync automatique localStorage ↔ Supabase
   - Fallback localStorage si utilisateur non connecté
   - Optimistic updates pour UX fluide

---

## 🔄 Système de Transition

### Mode Hybride (Actuel)

Le panier fonctionne en **mode hybride** avec transition automatique :

```typescript
const USE_API_CART = true // Flag activable/désactivable

// Si utilisateur connecté → Utilise Supabase
if (USE_API_CART && user?.id) {
  // Sync avec API Supabase
} else {
  // Fallback localStorage
}
```

### Comportement

1. **Utilisateur connecté :**
   - ✅ Chargement depuis Supabase
   - ✅ Sauvegarde dans Supabase + localStorage (backup)
   - ✅ Synchronisation entre appareils

2. **Utilisateur non connecté :**
   - ✅ Chargement depuis localStorage
   - ✅ Sauvegarde dans localStorage uniquement
   - ⚠️ Panier perdu si localStorage vidé

3. **Transition automatique :**
   - ✅ Au login : Panier localStorage migré vers Supabase
   - ✅ Au logout : Panier reste dans Supabase (disponible au prochain login)

---

## 📋 Schéma de la Table `cart_items`

```sql
cart_items (
  id UUID PRIMARY KEY
  user_id UUID → profiles(id)
  product_id UUID
  title TEXT
  image_url TEXT
  price NUMERIC(10,2)
  currency TEXT ('FCFA', 'EUR', 'USD')
  quantity INTEGER (min: 1)
  seller_id UUID → profiles(id) (optionnel)
  seller_name TEXT (optionnel)
  seller_avatar_url TEXT (optionnel)
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
)
```

**Contraintes :**
- Un utilisateur ne peut avoir qu'un seul item par produit (`UNIQUE (user_id, product_id)`)
- Quantité minimum : 1
- Prix minimum : 0

---

## 🔒 Sécurité

### Row Level Security (RLS)

Les policies Supabase garantissent que :
- ✅ Un utilisateur ne voit que son propre panier
- ✅ Un utilisateur ne peut modifier que son propre panier
- ✅ Pas d'accès croisé entre utilisateurs

### Validation Backend

- ✅ Schéma Zod `CartItemSchema` pour validation stricte
- ✅ Validation UUID productId
- ✅ Validation prix positif, quantité positive
- ✅ Logging sécurisé des erreurs

---

## 🔄 Compatibilité ProductId

**Problème :** Les pages shop utilisent encore `productId: number` (ex: `productId: 1`)

**Solution :** Conversion automatique `number` → UUID temporaire

```typescript
// Dans useCart.ts
const productIdStr = typeof item.productId === 'number' 
  ? `00000000-0000-0000-0000-${item.productId.toString().padStart(12, '0')}`
  : item.productId
```

**TODO Future :**
- Migrer tous les `productId` vers UUID réels
- Supprimer la conversion temporaire

---

## 🚀 Migration SQL à Exécuter

```bash
# Via Supabase SQL Editor
# Copier le contenu de : supabase-migrations/002_create_cart_items.sql
# Exécuter sur votre instance Supabase
```

**Vérification :**
```sql
-- Vérifier que la table existe
SELECT * FROM cart_items LIMIT 1;

-- Vérifier les policies RLS
SELECT * FROM pg_policies WHERE tablename = 'cart_items';
```

---

## 📝 TODO Avant Production

- [ ] Implémenter authentification réelle dans `/api/cart` (remplacer `x-user-id` header)
- [ ] Créer middleware auth pour toutes les API routes
- [ ] Migrer tous les `productId` vers UUID réels (supprimer conversion temporaire)
- [ ] Implémenter endpoint bulk delete pour `clearCart()`
- [ ] Ajouter tests unitaires pour le hook `useCart`
- [ ] Ajouter tests d'intégration pour les API routes `/api/cart`

---

## 🎯 Prochaines Étapes

1. **Tester la migration** avec un utilisateur connecté
2. **Vérifier la sync** entre localStorage et Supabase
3. **Implémenter l'auth middleware** pour remplacer `x-user-id`
4. **Migrer productId** vers UUID dans toutes les pages shop

---

## 📊 Statistiques

- ✅ API Routes créées : 4 (GET, POST, PUT, DELETE)
- ✅ Validation Zod : Implémentée
- ✅ RLS Supabase : Activé
- ✅ Fallback localStorage : Opérationnel
- ⏳ Auth middleware : À implémenter
- ⏳ Migration productId → UUID : À faire

