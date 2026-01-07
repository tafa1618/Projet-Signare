# 🔄 Synchronisation Feed Web ↔ Mobile

## 📊 Situation Actuelle

**❌ Problème :** Actuellement, le feed web (`app/page.tsx`) et mobile (`mobile/src/screens/FeedScreen.tsx`) utilisent tous les deux des **données mockées** différentes. En production, ils n'auraient **PAS** le même feed.

## ✅ Solution Implémentée

J'ai créé une **architecture partagée** pour garantir que web et mobile utilisent les mêmes données Supabase :

### Structure Créée

```
shared/
  services/
    feedService.ts    ← Service partagé pour récupérer le feed depuis Supabase

frontend/
  hooks/
    useFeed.ts        ← Hook React partagé (web + mobile)
```

### Fonctionnalités

1. **`feedService.ts`** : Service qui :
   - Récupère les posts depuis Supabase
   - Transforme les données Supabase en format unifié
   - Gère les likes, saves, reposts
   - Inclut les reposts dans le feed

2. **`useFeed.ts`** : Hook React qui :
   - Utilise le service partagé
   - Gère le state (loading, error)
   - Fournit les handlers (like, save, repost)
   - Fonctionne sur web ET mobile

## 🚀 Comment Utiliser

### Pour Web (Next.js)

```typescript
// app/page.tsx
'use client'

import { useFeed } from '@/frontend/hooks/useFeed'
import { createClient } from '@/lib/supabase' // Votre client Supabase web

export default function HomePage() {
  const supabase = createClient()
  const { posts, loading, handleLike, handleSave, handleRepost } = useFeed({
    supabaseClient: supabase,
    userId: 'user-id-here', // Récupérer depuis l'auth
    limit: 20,
  })

  if (loading) return <div>Chargement...</div>

  return (
    <div>
      {posts.map(post => (
        <PostCard 
          key={post.id}
          post={post}
          onLike={() => handleLike(post.id)}
          onSave={() => handleSave(post.id)}
          onRepost={() => handleRepost(post.id)}
        />
      ))}
    </div>
  )
}
```

### Pour Mobile (React Native)

```typescript
// mobile/src/screens/FeedScreen.tsx
import { useFeed } from '../../../frontend/hooks/useFeed'
import { supabase } from '../lib/supabase' // Votre client Supabase mobile

export default function FeedScreen() {
  const { posts, loading, handleLike, handleSave, handleRepost } = useFeed({
    supabaseClient: supabase,
    userId: 'user-id-here', // Récupérer depuis l'auth
    limit: 20,
  })

  if (loading) return <Text>Chargement...</Text>

  return (
    <ScrollView>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => handleLike(post.id)}
          onSave={() => handleSave(post.id)}
          onRepost={() => handleRepost(post.id)}
        />
      ))}
    </ScrollView>
  )
}
```

## ✅ Résultat

Avec cette architecture :

1. **✅ Même source de données** : Les deux apps utilisent Supabase
2. **✅ Même logique** : Le service `feedService.ts` est partagé
3. **✅ Même format** : Les posts sont transformés de la même manière
4. **✅ Synchronisation** : Les likes/saves/reposts sont synchronisés entre web et mobile
5. **✅ ML-Ready** : Toutes les interactions sont trackées dans `user_interactions`

## 📝 Prochaines Étapes

1. **Créer le client Supabase côté web** (si pas déjà fait) :
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

2. **Remplacer les mocks** dans `app/page.tsx` et `mobile/src/screens/FeedScreen.tsx` par `useFeed`

3. **Implémenter l'authentification** pour récupérer le `userId`

4. **Tester** que les deux apps affichent le même feed

## 🎯 Avantages

- **Cohérence** : Même feed sur tous les devices
- **Maintenabilité** : Une seule source de vérité
- **Performance** : Cache et optimisations centralisées
- **ML-Ready** : Données structurées pour l'entraînement IA

