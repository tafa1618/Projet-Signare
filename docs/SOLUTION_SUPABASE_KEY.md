# ✅ Solution : Erreur "supabaseKey is required"

## 🔍 Diagnostic

Vos variables sont bien dans `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://qvafjejmmxafxnwobfsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## ⚠️ Problème

Next.js **ne recharge PAS automatiquement** les variables d'environnement pendant l'exécution. Il faut **toujours redémarrer** le serveur.

## ✅ Solution en 3 Étapes

### 1️⃣ Arrêter le serveur

Dans le terminal où tourne `npm run dev` :
```bash
Ctrl + C
```

### 2️⃣ Vérifier que le processus est bien arrêté

```bash
# Si besoin, forcer l'arrêt
taskkill /F /IM node.exe
```

### 3️⃣ Relancer proprement

```bash
npm run dev
```

## 🧪 Test Rapide

Une fois le serveur relancé, ouvrir la console du navigateur et vérifier :

```javascript
// Dans app/page.tsx, ajouter temporairement :
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

Vous devriez voir :
```
URL: https://qvafjejmmxafxnwobfsw.supabase.co
KEY exists: true
```

## 🔧 Si ça ne marche toujours pas

### Option 1 : Clear cache Next.js

```bash
# Arrêter le serveur
Ctrl + C

# Supprimer le cache
Remove-Item -Recurse -Force .next

# Relancer
npm run dev
```

### Option 2 : Vérifier les imports

Le fichier `backend/lib/supabase.ts` doit maintenant contenir :

```typescript
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

✅ C'est déjà corrigé dans le dernier commit.

### Option 3 : Ajouter la clé service_role (optionnelle pour l'instant)

Si vous voulez utiliser `supabaseAdmin`, ajoutez dans `.env.local` :

```env
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

Pour la récupérer :
1. Aller sur https://supabase.com/dashboard
2. Votre projet → Settings → API
3. Copier la clé **service_role** (⚠️ ne pas confondre avec anon)

## 📝 Checklist Finale

- [x] `.env.local` existe à la racine
- [x] Variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définies
- [ ] Serveur Next.js **complètement arrêté** (Ctrl+C)
- [ ] Cache `.next` supprimé (optionnel)
- [ ] Serveur **relancé** (`npm run dev`)
- [ ] Page rechargée dans le navigateur (F5)

## 🎯 Résultat Attendu

Après redémarrage, l'erreur "supabaseKey is required" devrait disparaître ! 🎉

---

**Essayez maintenant : Ctrl+C → npm run dev → Rafraîchir le navigateur**

