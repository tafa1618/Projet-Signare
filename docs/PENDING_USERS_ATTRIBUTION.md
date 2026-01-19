# 📱 Système de Rattachement Automatique pour Utilisateurs Non-Membres

## 🎯 Objectif

Ce système permet d'enregistrer les numéros de téléphone des tailleurs et clients qui publient ou passent des commandes **sans être encore membres** de l'application. Lorsqu'ils s'inscrivent plus tard, leur historique (posts, commandes) leur est **automatiquement rattaché**.

## 🏗️ Architecture

### Tables de Base de Données

1. **`pending_users`** : Stocke les numéros de téléphone des non-membres
   - `phone_number` : Numéro de téléphone unique
   - `user_type` : 'TAILLEUR' ou 'CLIENT'
   - `created_at` : Date d'enregistrement

2. **`posts`** : Modifiée pour accepter `phone_number` optionnel
   - `user_id` : Nullable (si l'utilisateur est membre)
   - `phone_number` : Nullable (si l'utilisateur n'est pas membre)
   - Contrainte : Un post doit avoir soit `user_id` soit `phone_number`

3. **`orders`** : Modifiée pour accepter `buyer_phone` et `seller_phone` optionnels
   - `buyer_id` : Nullable (si l'acheteur est membre)
   - `seller_id` : Nullable (si le vendeur est membre)
   - `buyer_phone` : Nullable (si l'acheteur n'est pas membre)
   - `seller_phone` : Nullable (si le vendeur n'est pas membre)

### Fonctions SQL

- **`register_pending_user(phone_number, user_type)`** : Enregistre un numéro non-membre
- **`attach_pending_user_data(user_id, phone_number)`** : Rattache les données d'un non-membre à son compte
- **`has_pending_data(phone_number)`** : Vérifie si un numéro a des données en attente

### Trigger Automatique

Un trigger SQL (`trigger_attach_pending_user_on_profile_create`) se déclenche automatiquement lors de la création d'un profil. Il rattache toutes les données en attente au nouveau compte.

## 💻 Utilisation

### 1. Créer un Post pour un Non-Membre

```typescript
import { PostService } from '@/backend/services'

// Cas 1 : Utilisateur connecté (membre)
const post = await PostService.create({
  user_id: currentUser.id,
  image_url: 'https://...',
  caption: 'Mon nouveau boubou',
  garment_type: 'boubou',
  complexity: 'moyen',
  // ... autres champs
})

// Cas 2 : Utilisateur non-membre (tailleur)
const post = await PostService.create(
  {
    image_url: 'https://...',
    caption: 'Mon nouveau boubou',
    garment_type: 'boubou',
    complexity: 'moyen',
    // Pas de user_id
  },
  '+221771234567', // Numéro de téléphone
  'TAILLEUR' // Type d'utilisateur
)

// Cas 3 : Utilisateur non-membre (client)
const post = await PostService.create(
  {
    image_url: 'https://...',
    caption: 'Ma nouvelle robe',
    garment_type: 'robe',
    complexity: 'simple',
  },
  '+221771234567', // Numéro de téléphone
  'CLIENT' // Type d'utilisateur
)
```

### 2. Créer une Commande pour des Non-Membres

```typescript
import { OrderService } from '@/backend/services'

// Cas 1 : Les deux sont membres
const order = await OrderService.create({
  buyer_id: buyerUser.id,
  seller_id: sellerUser.id,
  post_id: postId,
  // ... autres champs
})

// Cas 2 : L'acheteur n'est pas membre
const order = await OrderService.create(
  {
    seller_id: sellerUser.id,
    post_id: postId,
    // ... autres champs
  },
  '+221771234567', // Numéro de l'acheteur
  undefined, // Pas de seller_phone
  'CLIENT', // Type de l'acheteur
  undefined // Pas de sellerType
)

// Cas 3 : Le vendeur n'est pas membre
const order = await OrderService.create(
  {
    buyer_id: buyerUser.id,
    post_id: postId,
    // ... autres champs
  },
  undefined, // Pas de buyer_phone
  '+221771234568', // Numéro du vendeur
  undefined, // Pas de buyerType
  'TAILLEUR' // Type du vendeur
)

// Cas 4 : Les deux ne sont pas membres
const order = await OrderService.create(
  {
    post_id: postId,
    // ... autres champs
  },
  '+221771234567', // Numéro de l'acheteur
  '+221771234568', // Numéro du vendeur
  'CLIENT', // Type de l'acheteur
  'TAILLEUR' // Type du vendeur
)
```

### 3. Vérifier si un Numéro a des Données en Attente

```typescript
import { UserAttributionService } from '@/backend/services'

const phoneNumber = '+221771234567'
const hasPending = await UserAttributionService.hasPendingData(phoneNumber)

if (hasPending) {
  const postsCount = await UserAttributionService.getPendingPostsCount(phoneNumber)
  const ordersCount = await UserAttributionService.getPendingOrdersCount(phoneNumber)
  
  console.log(`Vous avez ${postsCount} posts et ${ordersCount} commandes en attente`)
}
```

### 4. Rattachement Manuel (si nécessaire)

Le rattachement se fait automatiquement lors de la création du profil. Si vous devez le faire manuellement :

```typescript
import { UserAttributionService } from '@/backend/services'

await UserAttributionService.attachPendingUserData(
  userId,
  phoneNumber
)
```

## 🔄 Flux Automatique

1. **Publication/Commande par Non-Membre**
   - Le numéro de téléphone est enregistré dans `pending_users`
   - Le post/commande est créé avec `phone_number` au lieu de `user_id`

2. **Inscription de l'Utilisateur**
   - Un profil est créé avec le numéro de téléphone
   - Le trigger SQL détecte automatiquement les données en attente
   - Tous les posts et commandes sont rattachés au nouveau compte
   - L'entrée dans `pending_users` est supprimée

## 📋 Exemple Complet : Route API pour Créer un Post

```typescript
// app/api/posts/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/backend/services'
import { getSupabaseAdmin } from '@/backend/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, caption, garment_type, complexity, phone_number, user_type } = body

    // Vérifier si l'utilisateur est connecté
    const supabase = getSupabaseAdmin()
    const { data: { user } } = await supabase.auth.getUser()

    let post
    if (user) {
      // Utilisateur connecté (membre)
      post = await PostService.create({
        user_id: user.id,
        image_url,
        caption,
        garment_type,
        complexity,
        // ... autres champs
      })
    } else if (phone_number) {
      // Utilisateur non-membre
      if (!user_type || !['TAILLEUR', 'CLIENT'].includes(user_type)) {
        return NextResponse.json(
          { error: 'user_type requis et doit être TAILLEUR ou CLIENT' },
          { status: 400 }
        )
      }
      
      post = await PostService.create(
        {
          image_url,
          caption,
          garment_type,
          complexity,
          // ... autres champs
        },
        phone_number,
        user_type
      )
    } else {
      return NextResponse.json(
        { error: 'Authentification requise ou numéro de téléphone fourni' },
        { status: 401 }
      )
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

## ⚠️ Points d'Attention

1. **Validation du Numéro de Téléphone** : Assurez-vous de valider le format du numéro avant de l'enregistrer
2. **Type d'Utilisateur** : Le `user_type` est requis pour les non-membres afin de les catégoriser correctement
3. **Rattachement Automatique** : Le trigger SQL se déclenche uniquement si le numéro de téléphone du profil correspond exactement au numéro enregistré
4. **Performance** : Le rattachement se fait en une seule transaction SQL, donc très rapide

## 🧪 Tests

Pour tester le système :

1. Créer un post avec un numéro de téléphone non-membre
2. Vérifier que le post est créé avec `phone_number` et `user_id = NULL`
3. Vérifier que le numéro est enregistré dans `pending_users`
4. Créer un profil avec le même numéro de téléphone
5. Vérifier que le post est automatiquement rattaché (`user_id` rempli, `phone_number = NULL`)
6. Vérifier que l'entrée dans `pending_users` est supprimée

## 📚 Références

- Migration SQL : `supabase-migrations/006_pending_users_attribution.sql`
- Service : `backend/services/UserAttributionService.ts`
- Services modifiés : `backend/services/index.ts` (PostService, OrderService)

