# CLAUDE.md — Signare

Référence de travail pour Claude Code sur ce projet.
Plan produit complet : `MVP_PLAN.md`

---

## Ce qu'est Signare

Marketplace-réseau social pour la couture sénégalaise sur mesure. Trois piliers indissociables :

1. **Feed social marchand** — clients postent leurs tenues, taguent leur tailleur, ranking organique
2. **Mesures à distance** — scan morphologique (2 photos ou vidéo) ou saisie manuelle, mesures stockées en Supabase et partageables via token
3. **Conciergerie comme seul canal** — client et tailleur ne se parlent jamais directement, tout passe par la conciergerie (humaine au MVP, IA ensuite)

Marché primaire : Dakar (Android milieu de gamme, connexion variable) + diaspora sénégalaise (France, Italie, USA).

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript strict, Tailwind CSS 3, Framer Motion |
| Base de données | Supabase (PostgreSQL + RLS + Realtime + Storage) |
| Auth | Supabase Auth — OTP SMS uniquement (Twilio) |
| Services Python | FastAPI — `Signare_Measurements`, `Signare_AI`, `Signare_Search_Feed`, `delivery_engine` |
| CV / IA | Replicate (pose estimation pour les mesures) |
| Déploiement cible | Vercel (frontend) + Railway (services Python) |

Structure des imports dans le code :
- `@/frontend/` — composants et hooks UI
- `@/backend/` — lib Supabase côté serveur
- `@/shared/` — types TypeScript partagés
- `@/lib/` — utilitaires, agents, logger

---

## État actuel — ce qui est cassé

Ces problèmes bloquent tout. Les corriger en priorité absolue avant d'ajouter quoi que ce soit.

### Auth non-fonctionnelle en production
- `app/login/page.tsx:104` — `verifyOTP` est commenté (TODO)
- Trois numéros mock hardcodés (`+771111111`, `+772222222`, `+781110455`) avec auth via `localStorage`
- `app/register/page.tsx:handleSubmit` — fait un `console.log` au lieu d'appeler Supabase

### Zéro persistance réelle
- Commandes stockées dans `localStorage` (`signare_tailor_manual_orders`)
- Mesures stockées dans `localStorage` (`signare_tailor_manual_mesures`)
- Scan tracker en mémoire Python (`self._scan_tracker` dans `measurement_service.py:24`) — se reset au redémarrage
- Posts du feed sont des mocks statiques (`lib/mocks`)

### Scan morphologique inopérant
- `frontend/components/atelier/ScanMeasurementsFlow.tsx:88` — `uploadFile()` retourne `storage/temp/${file.name}` (URL fictive)
- Le service Replicate ne reçoit jamais rien

### Détection de rôle tailleur hardcodée
- `app/atelier/page.tsx:34-36` — détecte le rôle tailleur via un numéro de téléphone hardcodé, pas via Supabase

### Sécurité
- `Services/Signare_AI/main.py:28` — `allow_origins=["*"]` avec `allow_credentials=True` (invalide en prod)
- `venv/` committé dans `Services/Signare_Measurements/`

---

## Priorités de développement

Suivre l'ordre des sprints définis dans `MVP_PLAN.md`. Ne pas sauter de sprint.

### Sprint 1 — Fondations (priorité absolue)
1. Auth OTP Supabase fonctionnelle — brancher `verifyOTP`, supprimer mock auth
2. Table `profiles` en Supabase — brancher `register/page.tsx`
3. Table `measurements` en Supabase avec `share_token`

### Sprint 2 — Mesures à distance
4. `uploadFile()` réel vers Supabase Storage → Replicate → mesures en DB
5. `ManualMeasurementsWizard` branché vers Supabase
6. Page "Mes mesures" avec lien partageable `/m/[share_token]`

### Sprint 3 — Conciergerie
7. Route `/commander` — tunnel 5 étapes
8. Interface admin `/admin/concierge` pour la commerciale
9. Brief PDF + signatures numériques
10. Paiement Wave / Orange Money

### Sprint 4 — Feed réel + Tailleur
11. Posts réels en Supabase (remplacer `mockPosts`)
12. Messagerie minimale (client ↔ conciergerie, tailleur ↔ conciergerie)
13. Dashboard tailleur complet
14. Navigation mobile refaite (Accueil / Explorer / Mesures / Commandes / Profil)

### Sprint 5 — Hardening
15. Fix CORS services Python
16. Performance mobile (HeroSection, images, animations)
17. Déploiement Vercel + Railway

---

## Règles de développement

### Ne pas toucher sans instruction explicite
- Le système d'agents (`lib/agents/`) — architecture en place, ne pas modifier
- Le service `Signare_Search_Feed` — ranking et recommandations, différé post-MVP
- `app/essayage/page.tsx` et `Services/Signare_AI/tryon_service.py` — try-on différé
- La segmentation NDANANE — hors scope MVP

### Conventions de code
- TypeScript strict — pas de `any` sauf cas documenté
- Pas de `console.log` en production — utiliser `logError` et `logMLInteraction` depuis `@/lib/logger`
- Les composants `'use client'` uniquement quand nécessaire — préférer les Server Components
- Toutes les interactions utilisateur qui alimentent le ML passent par `logMLInteraction`

### Supabase
- Chaque nouvelle table doit avoir une politique RLS définie avant d'être utilisée
- Pas d'accès direct à la DB depuis le client — passer par les route handlers Next.js ou les hooks
- Le `share_token` des mesures est un UUID v4 généré par Supabase (`gen_random_uuid()`) — ne jamais l'exposer dans les logs

### Design system
- Couleurs : fond `#0A0A0A`, or `#D4AF37`, blanc `#FFFFFF`
- Typographie : Playfair Display (`font-serif`) pour les titres et moments premium, Inter (`font-sans`) pour le corps
- Animations : Framer Motion avec easing `[0.16, 1, 0.3, 1]` — toujours wrapper dans un check `prefers-reduced-motion`
- Pas d'emojis dans le code UI sauf demande explicite

### Messagerie
- Aucune route directe client → tailleur
- Trois canaux uniquement : `client_concierge` / `tailor_concierge` / `admin_tailor`
- Le tailleur ne voit jamais les coordonnées du client et inversement

---

## Profils utilisateurs

| Rôle | Accès | Détection |
|---|---|---|
| Client | Feed, mesures, conciergerie, messagerie | `profiles.is_tailor = false` |
| Tailleur | Dashboard, briefs, portfolio, messagerie | `profiles.is_tailor = true AND profiles.tailor_status = 'verified'` |
| Tailleur en attente | Dashboard limité, pas de commandes | `profiles.tailor_status = 'pending'` |
| Admin / Concierge | `/admin/*`, toutes les conversations | `profiles.role = 'admin'` |

---

## Digital twins (anti cold-start)

Des profils jumeaux peuplent le feed avant le lancement avec du contenu généré (Gemini Imagen 3 pour les images, GPT/Claude avec validation humaine pour les textes).

- Identifiables en DB via `profiles.is_digital_twin = true` et `profiles.retirement_date`
- Comportement autorisé : publier du contenu, likes entre jumeaux
- Comportement interdit : commenter les posts de vrais utilisateurs, répondre à des messages
- Suppression gérée par `retireExpiredPersonas()` dans l'orchestrateur selon des seuils d'activité réelle
- Ne jamais exposer `is_digital_twin` dans les réponses API publiques
