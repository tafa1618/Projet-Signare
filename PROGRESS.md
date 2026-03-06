# PROGRESS.md — Signare

Suivi d'avancement du MVP. Mettre à jour après chaque session de travail.
Dernière mise à jour : 2026-03-06

---

## Légende
- `[x]` Terminé
- `[~]` En cours
- `[ ]` Non commencé
- `[!]` Bloquant / bug connu

---

## Sprint 1 — Fondations

### Auth OTP Supabase
- `[x]` Brancher `verifyOTP` dans `app/login/page.tsx` — importé depuis `backend/lib/supabase`
- `[x]` Supprimer les numéros mock hardcodés et le mock auth `localStorage`
- `[x]` Supprimer le mock auth dans `frontend/hooks/useAuth.ts`
- `[x]` Retirer le champ email de `app/register/page.tsx` (phone uniquement)
- `[x]` Ajouter sélecteur code pays (+221 défaut, +33/+39/+1/+34/+44) dans login et register
- `[ ]` Configurer Twilio dans Supabase Dashboard — **action manuelle requise**

### Table `profiles`
- `[ ]` Créer la table en Supabase avec RLS — **action manuelle requise**
- `[x]` Brancher `register/page.tsx` : OTP → verifyOTP → insert `profiles` Supabase
- `[x]` Supprimer la détection rôle tailleur hardcodée dans `app/atelier/page.tsx:34-36` — via `useAuth` qui retourne maintenant `profile`
- `[x]` `useAuth.ts` retourne maintenant `{ user, profile, isLoading, signOut }` avec fetch du profil Supabase

### Table `measurements`
- `[ ]` Créer la table en Supabase avec RLS
- `[ ]` Ajouter colonne `share_token uuid default gen_random_uuid()`
- `[ ]` Définir politique RLS accès public via `share_token`

---

## Sprint 2 — Mesures à distance

### Scan morphologique
- `[x]` `ScanMeasurementsFlow.tsx` — `uploadFile()` mock supprimé
- `[x]` Upload réel vers Supabase Storage (bucket `measurements-photos`) via `app/api/measurements/scan/route.ts`
- `[x]` URLs signées (1h) envoyées au service `Signare_Measurements` FastAPI
- `[x]` Mesures estimées reçues et sauvegardées en table `measurements`
- `[ ]` Remplacer scan tracker mémoire Python par count Supabase (`measurement_service.py:24`)

### Mesures manuelles
- `[x]` `ManualMeasurementsWizard` branché vers Supabase via `app/api/measurements/manual/route.ts`
- `[x]` Route `POST /api/measurements/manual`
- `[ ]` Toast de confirmation succès/erreur

### Page "Mes mesures"
- `[ ]` Tableau des mesures lisible (sans champs ML techniques)
- `[ ]` Bouton "Partager mes mesures" → génère lien `/m/[share_token]`
- `[ ]` Affichage QR code du lien
- `[ ]` Page publique `/m/[share_token]` (lecture seule, anonymisée)

### UX scan
- `[ ]` Remplacer liste à puces consignes par illustrations/vidéo démo 5s
- `[ ]` 3 consignes visuelles : fond clair / vêtements ajustés / téléphone à 2m

---

## Sprint 3 — Conciergerie

### Tunnel commande
- `[ ]` Route `/commander` — tunnel 5 étapes
- `[ ]` Étape 1 : choix tailleur (pré-rempli si venu d'un post)
- `[ ]` Étape 2 : description tenue (type / tissu / occasion / couleur)
- `[ ]` Étape 3 : sélection mesures (depuis DB ou redirect scan)
- `[ ]` Étape 4 : budget et délai
- `[ ]` Étape 5 : confirmation → envoi à la conciergerie

### Interface admin conciergerie
- `[ ]` Page `/admin/concierge`
- `[ ]` Liste des demandes avec priorité
- `[ ]` Vue détaillée : demande + mesures + tailleur ciblé
- `[ ]` Formulaire de construction du brief
- `[ ]` Envoi brief au tailleur
- `[ ]` Gestion des statuts : `received → in_negotiation → brief_sent → accepted → in_production → ready → delivered`

### Brief
- `[ ]` Génération PDF (description + mesures + prix + délai)
- `[ ]` Signature numérique client ("J'accepte")
- `[ ]` Signature numérique tailleur ("J'accepte")

### Paiement
- `[ ]` Brancher route `app/api/payments/initiate`
- `[ ]` Brancher route `app/api/payments/callback`
- `[ ]` Intégration Wave Business API
- `[ ]` Intégration Orange Money API
- `[ ]` Logique escrow : 50% à l'acceptation / 50% à la livraison
- `[ ]` Stripe pour diaspora (carte bancaire)

### Notifications SMS
- `[ ]` Demande reçue → client
- `[ ]` Brief prêt → client
- `[ ]` Brief accepté → tailleur
- `[ ]` Commande en production → client
- `[ ]` Commande prête → client
- `[ ]` Paiement libéré → tailleur

---

## Sprint 4 — Feed réel + Tailleur

### Posts réels
- `[ ]` Table `posts` en Supabase
- `[ ]` Table `post_interactions` en Supabase
- `[ ]` Route `GET /api/posts` depuis Supabase (remplacer `mockPosts`)
- `[ ]` Route `POST /api/posts`
- `[ ]` Brancher `handleLike` / `handleSave` / `handleRepost` vers `post_interactions`

### Publication
- `[ ]` Brancher `/publish` vers Supabase
- `[ ]` Upload photos vers Storage bucket `posts-media`
- `[ ]` Autocomplete tag tailleur sur les tailleurs vérifiés

### Messagerie
- `[ ]` Table `conversations` en Supabase
- `[ ]` Table `messages` en Supabase
- `[ ]` Supabase Realtime sur `messages`
- `[ ]` Interface client `/messages` (conversations conciergerie uniquement)
- `[ ]` Interface conciergerie dans `/admin/concierge` (vue unifiée)
- `[ ]` Badge notification non-lue dans la nav

### Dashboard tailleur
- `[ ]` Commandes en cours avec statuts
- `[ ]` Accès mesures client via brief (lecture seule)
- `[ ]` Portfolio : galerie + upload
- `[ ]` Score Signare visible

### Inscription tailleur
- `[ ]` Flow dédié (remplacer checkbox `isTailor` dans register)
- `[ ]` Upload : photo atelier + 3 créations minimum
- `[ ]` Statut `pending_verification` → validation admin → `verified`
- `[ ]` Notification admin à la demande de vérification

### Navigation mobile
- `[x]` Refonte bottom nav : Accueil / Explorer / Mesures / Commandes / Profil
- `[x]` Aligner sidebar desktop avec la même structure
- `[x]` Bouton "Mesures" au centre comme entrée primaire (cercle or surélevé)

---

## Sprint 5 — Hardening et déploiement

### Sécurité
- `[ ]` `Services/Signare_AI/main.py:28` — remplacer `allow_origins=["*"]`
- `[ ]` Supprimer `venv/` de `Services/Signare_Measurements/` + `.gitignore`
- `[ ]` Retirer `console.log` données utilisateur dans `register/page.tsx:51`
- `[ ]` Audit RLS Supabase — vérifier tous les accès croisés

### Performance mobile
- `[ ]` `HeroSection.tsx` : 85vh → 45vh sur mobile
- `[ ]` Images background : `quality={75}` maximum
- `[ ]` Wrap animations Framer Motion dans `prefers-reduced-motion`
- `[ ]` Remplacer `whileInView` par `useInView` partagé sur les post cards

### Déploiement
- `[ ]` Variables d'environnement Vercel configurées
- `[ ]` Services Python déployés sur Railway (3 services séparés)
- `[ ]` Supabase backups quotidiens activés
- `[ ]` Tests smoke post-déploiement

---

## Digital twins (anti cold-start)

### Préparation contenu (semaine J-7)
- `[ ]` Apify configuré — scrapers Instagram + Pinterest hashtags mode sénégalaise
- `[ ]` 400-500 références visuelles scrapées et triées
- `[ ]` 230 images générées via Gemini Imagen 3 (150 tailleurs + 80 clients)
- `[ ]` Avatars profils générés (ThisPersonDoesNotExist ou Generated Photos)
- `[ ]` 15-20 profils tailleurs créés en DB (`is_digital_twin = true`)
- `[ ]` 30-40 profils clients créés en DB
- `[ ]` Légendes rédigées (GPT/Claude) + validation humaine
- `[ ]` Posts programmés sur 3-4 semaines (pas de publication en masse)
- `[ ]` Interface supervision `/admin/concierge` opérationnelle

### Règles comportement vérifiées
- `[ ]` `is_digital_twin` non exposé dans les API publiques
- `[ ]` Aucune interaction avec de vrais utilisateurs
- `[ ]` Logique de retirement configurée dans l'orchestrateur

---

## Ce qui est déjà en place (base existante)

Ces éléments existent dans le code et sont fonctionnels ou quasi-fonctionnels.

| Élément | Fichier | État |
|---|---|---|
| UI Welcome page | `app/welcome/page.tsx` | Fonctionnel |
| UI Login page | `app/login/page.tsx` | UI ok, auth mock |
| UI Register page | `app/register/page.tsx` | UI ok, pas de persistance |
| Feed avec mocks | `app/page.tsx` | Fonctionnel avec données mock |
| Carousel media + vidéo | `app/page.tsx` | Fonctionnel |
| Tracking ML visibility | `app/page.tsx` (IntersectionObserver) | Fonctionnel |
| Scan flow UI | `frontend/components/atelier/ScanMeasurementsFlow.tsx` | UI ok, upload mock |
| Wizard mesures manuelles | `frontend/components/atelier/ManualMeasurementsWizard.tsx` | UI ok, pas de persistance |
| Service Measurements FastAPI | `Services/Signare_Measurements/` | Fonctionnel en mode mock |
| Service AI FastAPI | `Services/Signare_AI/` | Fonctionnel en mode mock |
| Service Search/Feed FastAPI | `Services/Signare_Search_Feed/` | Fonctionnel, ranking partiel |
| Delivery engine | `Services/delivery_engine/` | Fonctionnel |
| Orchestrateur agents | `lib/agents/orchestrator.ts` | Structuré, non branché prod |
| Personas / twins | `lib/agents/personas.ts` | Structuré, non branché prod |
| Routes paiement | `app/api/payments/` | Routes créées, non branchées |
| Dashboard admin | `app/admin/` | UI partielle |
| Design system | Tailwind + `#0A0A0A` / `#D4AF37` | Cohérent sur toutes les pages |

---

## Journal des sessions

### 2026-03-06 — Session 1
- Diagnostic complet de l'application (6 axes)
- Création de `MVP_PLAN.md` avec plan d'action complet
- Création de `CLAUDE.md` comme référence de travail
- Création de `PROGRESS.md` (ce fichier)
- Stratégie anti cold-start définie : digital twins via Gemini Imagen 3 + Apify
- Messagerie minimale : 3 canaux uniquement (client/conciergerie, tailleur/conciergerie, admin/tailleur)
- **Sprint 1 complété :**
  - `frontend/hooks/useAuth.ts` — mock auth supprimé, profile Supabase fetché
  - `app/login/page.tsx` — `verifyOTP` réel branché, sélecteur code pays (+221 défaut)
  - `app/register/page.tsx` — flow OTP 2 étapes, insert profil Supabase
  - `app/atelier/page.tsx` — détection tailleur via `profile.is_tailor` réel
- **Sprint 2 complété (mesures) :**
  - `app/api/measurements/manual/route.ts` — créé, auth cookie, insert Supabase
  - `app/api/measurements/scan/route.ts` — créé, upload Storage, URLs signées, proxy Python, insert Supabase
  - `frontend/hooks/useMeasurements.ts` — redirigé vers API routes Next.js (plus d'appel Python direct)
  - `frontend/components/atelier/ScanMeasurementsFlow.tsx` — `uploadFile()` mock supprimé, envoi FormData
  - `frontend/components/atelier/ManualMeasurementsWizard.tsx` — adapté au nouveau format hook
- **Navigation refondée :**
  - Bottom nav : Accueil / Explorer / [Mesures] / Commandes / Profil
  - Sidebar desktop aligné avec la même priorité
  - Bouton Mesures au centre, cercle or surélevé
- **Actions manuelles restantes avant test :**
  - Créer table `profiles` dans Supabase Dashboard (schema dans `MVP_PLAN.md`)
  - Créer table `measurements` dans Supabase Dashboard
  - Créer bucket Storage `measurements-photos` dans Supabase
  - Configurer Twilio dans Supabase Authentication settings
  - Vérifier variables d'env `.env.local` : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
