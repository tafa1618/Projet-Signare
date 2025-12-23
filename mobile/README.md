# SIGNARE Mobile (Expo Go)

Version mobile React Native/Expo qui partage le backend Supabase avec le web.

## Prérequis
- Node + npm/yarn
- Expo CLI (`npx expo --version`)
- Variables d’environnement (ne pas les committer) :
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Démarrage rapide
```bash
cd mobile
npm install          # ou yarn
EXPO_PUBLIC_SUPABASE_URL=... EXPO_PUBLIC_SUPABASE_ANON_KEY=... npx expo start --tunnel
```
- Scanne le QR avec **Expo Go** (Android/iOS). Le tunnel facilite la connexion au device.

## Où mettre les clés ?
- Exporte les variables dans ton shell (voir ci-dessus), Expo les injecte automatiquement.
- Ou crée localement un fichier `.env` (non committé) avec :
  ```
  EXPO_PUBLIC_SUPABASE_URL=...
  EXPO_PUBLIC_SUPABASE_ANON_KEY=...
  ```
  puis `npx expo start --tunnel`

## Fichiers clés
- `app.config.js` : remonte les variables d’env dans `extra.supabaseUrl/supabaseAnonKey`.
- `src/lib/supabase.ts` : client Supabase mobile (même schéma que le web).
- `src/components/BottomTabs.tsx` : navigation mobile (Feed, Messages, IA, Events, Profil).
- `src/screens/*` : écrans stub prêts à être branchés au backend partagé.

## Thème
- Couleurs Noir/Or alignées avec la charte (`src/theme/colors.ts`).
- Police : mobile utilisera par défaut la pile système ; aligner plus tard avec `expo-font` si besoin.

