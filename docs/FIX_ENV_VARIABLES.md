# 🔧 Correction : Variables d'Environnement Supabase

## ❌ Problème Identifié

Le fichier `backend/lib/supabase.ts` utilisait `createClientComponentClient()` sans passer explicitement les variables d'environnement, ce qui pouvait causer des problèmes d'accès.

## ✅ Solution Appliquée

### 1. Fichier `.env.local` (à la racine)

```env
# Remplacer avec vos vraies valeurs Supabase

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

### 2. Code Corrigé

**Fichier : `backend/lib/supabase.ts`**

```typescript
// ❌ AVANT (problématique)
export const supabase = createClientComponentClient<Database>()

// ✅ APRÈS (correct)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## 📝 Étapes pour Configurer

### 1. Créer le fichier `.env.local`

```bash
# À la racine du projet
touch .env.local
```

### 2. Récupérer vos clés Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** → **API**
4. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Remplir `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-id-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...votre-clé-anon-complète
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...votre-clé-service-complète
```

### 4. Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

**⚠️ IMPORTANT :** Next.js ne recharge PAS automatiquement les variables d'environnement. Il faut **TOUJOURS redémarrer** après modification de `.env.local`.

## ✅ Vérification

### Test 1 : Variables chargées ?

Ajouter temporairement dans un composant :

```typescript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))
```

### Test 2 : Connexion Supabase ?

```typescript
// Dans app/page.tsx
useEffect(() => {
  const testConnection = async () => {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    console.log('Supabase test:', { data, error })
  }
  testConnection()
}, [])
```

## 🚨 Erreurs Courantes

### Erreur : "Invalid API key"

**Cause :** Mauvaise clé ou espaces dans `.env.local`

**Solution :**
```env
# ❌ MAL (avec espaces)
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co

# ✅ BON (sans espaces)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

### Erreur : "process.env.NEXT_PUBLIC_SUPABASE_URL is undefined"

**Cause :** Serveur pas redémarré ou fichier `.env.local` mal placé

**Solution :**
1. Vérifier que `.env.local` est **à la racine** (même niveau que `package.json`)
2. Redémarrer : `Ctrl+C` puis `npm run dev`

### Erreur : "Row Level Security policy violation"

**Cause :** RLS activé mais pas de policies ou pas authentifié

**Solution :**
```sql
-- Temporairement désactiver RLS pour tester
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

## 📂 Structure Fichiers

```
signare/
├── .env.local              ✅ ICI (à la racine)
├── .env.example            ✅ Template pour référence
├── package.json
├── backend/
│   └── lib/
│       └── supabase.ts     ✅ Corrigé
└── ...
```

## 🔒 Sécurité

### ✅ Safe pour le client
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Ces variables sont **exposées** côté client (c'est normal).

### ⚠️ JAMAIS exposer côté client
- `SUPABASE_SERVICE_ROLE_KEY`

Cette clé doit **UNIQUEMENT** être utilisée :
- Dans les API routes (`app/api/...`)
- Dans les Server Components
- Dans les fonctions serveur

**Ne JAMAIS** l'utiliser dans un composant client (`'use client'`).

## 🎯 Résumé

1. ✅ Créer `.env.local` à la racine
2. ✅ Copier vos clés Supabase dedans
3. ✅ Redémarrer le serveur (`Ctrl+C` puis `npm run dev`)
4. ✅ Tester la connexion

**Le problème devrait être résolu ! 🎉**

