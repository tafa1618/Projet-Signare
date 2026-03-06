# SIGNARE — Plan d'action MVP

> Version 1.0 — Mars 2026
> Objectif : premier déploiement avec le cycle complet fonctionnel

---

## Vision produit rappelée

Signare n'est **pas** une boutique de vêtements africains. Des dizaines de boutiques vendent déjà des chemises wax en ligne. La différenciation réelle repose sur trois piliers qui n'existent nulle part ailleurs ensemble :

1. **Le feed social marchand** — les clients postent leurs tenues, taguent leur tailleur, créent une preuve sociale organique. Le ranking émerge de la communauté, pas d'un algorithme éditorial.
2. **Les mesures à distance** — un client à Paris envoie ses mesures morphologiques précises à un tailleur à Dakar. C'est la barrière technique qui a toujours empêché la couture sur mesure d'aller à distance.
3. **La conciergerie comme seul canal** — le client et le tailleur ne se parlent jamais directement. La conciergerie (IA, avec un humain en backup) gère la relation, génère le brief, protège les deux parties.

Ces trois éléments sont indissociables. Retirer l'un des trois et le produit redevient une boutique ordinaire.

---

## Architecture de la boucle MVP

```
[FEED SOCIAL]                    [MESURES]                    [CONCIERGERIE]
     |                               |                               |
Client découvre                Client scanne son              Conciergerie IA
un tailleur dans               corps (2 photos               reçoit la demande,
le feed, voit ses              ou vidéo) ou saisit            pose les questions,
créations, lit                 ses mesures                    construit le brief
les reviews                    manuellement
     |                               |                               |
     +-------> demande une tenue <---+                               |
                                                                     |
                                                    Brief PDF généré + signé
                                                    (description + mesures
                                                    + tissu + délai + prix)
                                                                     |
                                                    Paiement escrow (Wave /
                                                    Orange Money / Stripe)
                                                                     |
                                                    Tailleur reçoit le brief
                                                    (jamais le contact client)
                                                                     |
                                                    Livraison + validation
                                                    + fonds libérés au tailleur
```

---

## Principes de développement

- **Conciergerie obligatoire** : aucune route directe client → tailleur. Toute commande passe par la conciergerie. Au MVP, si l'IA n'est pas prête, une commerciale humaine joue le rôle de la conciergerie via une interface admin dédiée. Le workflow reste identique pour le client.
- **Feed social = surface de découverte primaire**, pas un bonus. Le client trouve son tailleur dans le feed, pas dans un annuaire.
- **Mesures à distance = must-have absolu**. Sans mesures en DB, aucune commande ne peut être passée via la conciergerie.
- **Scope strict** : tout ce qui n'est pas dans ce plan est différé. Pas de try-on, pas de ranking ML avancé, pas de NDANANE, pas d'agents marketing au MVP.

---

## Sprint 1 — Fondations (Semaine 1-2)

**Objectif : auth réelle + base de données opérationnelle**

### S1-T1 : Authentification OTP Supabase

**Problème actuel** : `verifyOTP` est commenté dans `app/login/page.tsx:104`. Trois numéros mock sont hardcodés. L'auth en production est non-fonctionnelle.

Actions :
- Brancher `verifyOTP` Supabase dans `handleVerifyOTP`
- Supprimer la liste `mockPhones` et le mock auth `localStorage`
- Unifier register et login : **téléphone uniquement** — retirer le champ email de `register/page.tsx` (crée une fausse promesse)
- Ajouter un sélecteur de code pays sur l'input téléphone (+221 par défaut, +33/+39/+1/+34 pour diaspora)
- Configurer Twilio dans Supabase Dashboard

Fichiers : `app/login/page.tsx`, `app/register/page.tsx`

---

### S1-T2 : Table `profiles` en Supabase

**Problème actuel** : `register/page.tsx:handleSubmit` fait un `console.log`. Aucun profil n'est créé en base. La détection du rôle tailleur est un hardcode de numéro dans `atelier/page.tsx:34-36`.

Schema :
```sql
profiles (
  id          uuid references auth.users primary key,
  phone       text unique not null,
  full_name   text not null,
  gender      text check (gender in ('signare', 'ndanane')),
  is_tailor   boolean default false,
  tailor_status text check (tailor_status in ('none', 'pending', 'verified')),
  created_at  timestamptz default now()
)
```

Actions :
- Créer la table avec RLS (chaque user lit/modifie uniquement son profil)
- Brancher la création de profil dans `register/page.tsx:handleSubmit`
- Remplacer la détection de rôle hardcodée par `profile.is_tailor` depuis Supabase
- Créer un hook `useProfile()` dans `frontend/hooks/`

---

### S1-T3 : Table `measurements` en Supabase

Schema :
```sql
measurements (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references profiles(id),
  method        text check (method in ('manual', 'scan')),
  chest         numeric,
  neck          numeric,
  waist         numeric,
  hips          numeric,
  shoulders     numeric,
  arm_length    numeric,
  thigh         numeric,
  biceps        numeric,
  leg_length    numeric,
  height_cm     numeric,
  weight_kg     numeric,
  confidence    text check (confidence in ('exact', 'estimated')),
  share_token   uuid default gen_random_uuid() unique,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
)
```

RLS :
- Le client lit uniquement ses propres mesures
- Un tailleur peut lire les mesures d'un client si une commande active les lie (`orders.measurements_id`)
- Accès public en lecture seule via `share_token` (pour le lien partageable)

---

## Sprint 2 — Mesures à distance (Semaine 3-4)

**Objectif : le cycle complet scan → mesures en DB → partage au tailleur**

### S2-T1 : Réparer le scan flow — upload réel

**Problème actuel** : `ScanMeasurementsFlow.tsx:88` retourne `storage/temp/${file.name}` (URL fictive locale). Le service Replicate ne reçoit jamais rien.

Actions :
- Implémenter `uploadFile()` : upload vers Supabase Storage bucket `measurements-photos` (bucket privé)
- Retourner l'URL signée (durée de vie 1h, suffisant pour le traitement Replicate)
- Envoyer les URLs au service `Signare_Measurements` FastAPI
- Recevoir les mesures estimées et les sauvegarder en table `measurements`
- Supprimer le scan tracker en mémoire Python (`self._scan_tracker` dans `measurement_service.py:24`) — remplacer par une requête count en Supabase

Fichiers : `frontend/components/atelier/ScanMeasurementsFlow.tsx`, `Services/Signare_Measurements/app/services/measurement_service.py`

---

### S2-T2 : Brancher ManualMeasurementsWizard vers Supabase

**Problème actuel** : `useMeasurements` hook appelle `submitManualMeasurements` mais la persistance finale n'est pas câblée vers Supabase.

Actions :
- Route `POST /api/measurements/manual` → insert en table `measurements`
- Confirmer le succès avec un toast (les TODO sont déjà marqués dans le code)

Fichiers : `frontend/components/atelier/ManualMeasurementsWizard.tsx`, `frontend/hooks/useMeasurements.ts`

---

### S2-T3 : Page "Mes mesures" avec partage

C'est **le moment différenciant visible pour l'utilisateur**. Après sauvegarde des mesures, une page dédiée affiche :

- Toutes les mesures en tableau lisible (pas les champs ML techniques)
- Le body type calculé si disponible (sablier / pomme / poire / rectangle)
- La date et méthode de la prise de mesures
- **Un bouton "Partager mes mesures"** qui génère un lien `/m/[share_token]`
- Ce lien s'affiche aussi sous forme de QR code (pour montrer son téléphone au tailleur en présentiel)
- Copier le lien → prêt à coller dans WhatsApp pour l'envoyer à la conciergerie

Le message suggéré que le client peut copier :
> "Voici mes mesures Signare : signare.co/m/[token] — je voudrais commander un [type de vêtement]"

---

### S2-T4 : Page publique `/m/[share_token]`

- Route accessible sans authentification
- Affiche le profil morphologique anonymisé (prénom seulement, pas de photo)
- Mesures lisibles pour un tailleur
- Bouton "Commander pour ce client" (redirige vers la conciergerie avec ce token pré-rempli)

---

### S2-T5 : Consignes scan enrichies avec visuels

**Problème actuel** : `MediaTypeChoice` affiche une liste à puces texte. En conditions réelles (Dakar, fond sombre, vêtements amples), la précision du scan sera mauvaise.

Actions :
- Remplacer la liste à puces par **3 illustrations ou une vidéo démo de 5 secondes** :
  1. Fond clair derrière soi (mur blanc ou rideau beige)
  2. Vêtements ajustés (legging + t-shirt proche du corps, pas de boubou pour le scan)
  3. Téléphone tenu par quelqu'un d'autre à 2 mètres de distance, à hauteur des hanches
- Ces 3 conditions doublent la précision des landmarks de pose sans modifier le modèle

---

## Sprint 3 — La Conciergerie (Semaine 5-6)

**Objectif : aucun contact direct client-tailleur, tout passe par la conciergerie**

### Architecture conciergerie

La conciergerie existe en deux modes selon l'avancement :

**Mode A — Conciergerie humaine** (MVP immédiat) :
- Une commerciale physique reçoit les demandes via une interface admin dédiée
- Elle converse avec le client (via l'interface Signare, pas WhatsApp direct)
- Elle construit le brief, contacte le tailleur, gère les échanges
- Le client et le tailleur voient uniquement l'état d'avancement, pas les échanges internes
- Ce mode permet de valider le workflow sans dépendre de la qualité de l'IA

**Mode B — Conciergerie IA** (après validation du Mode A) :
- Agent LLM qui guide le client à travers une série de questions
- Génération automatique du brief
- Handoff humain si la demande est complexe ou si le client est bloqué

**La règle absolue** : le tailleur reçoit uniquement un brief structuré. Il ne voit jamais le numéro de téléphone, l'email ou l'adresse du client. Le client ne voit jamais les coordonnées du tailleur. Tout passe par Signare.

---

### S3-T1 : Route `/commander`

Remplacer le "Contacter l'atelier" des posts par une entrée dans la conciergerie.

Flow client (5 étapes, écran par écran) :

```
Étape 1 — Quel tailleur ?
  → pré-rempli si venu depuis un post
  → sinon, recherche dans la liste des tailleurs vérifiés

Étape 2 — Quelle tenue ?
  → Type (boubou / robe / tailleur / kaftan / autre)
  → Tissu (wax / bazin / getzner / autre — avec photo de référence optionnelle)
  → Occasion (quotidien / mariage / baptême / Tabaski / soirée)
  → Couleur principale

Étape 3 — Vos mesures
  → Si mesures en DB : affichées avec date + bouton "Utiliser ces mesures"
  → Si pas de mesures : CTA "Prendre mes mesures maintenant" → redirect scan flow → retour ici

Étape 4 — Budget et délai
  → Budget estimé (fourchettes : < 30k / 30-60k / 60-100k / > 100k FCFA)
  → Délai souhaité

Étape 5 — Confirmation
  → Récapitulatif de la demande
  → Bouton "Envoyer à la conciergerie"
  → La conciergerie prend en charge sous 24h
```

---

### S3-T2 : Interface conciergerie admin

Une page dans `/admin/concierge` pour la commerciale (Mode A) ou pour monitorer l'IA (Mode B).

Fonctionnalités :
- Liste des demandes en attente avec priorité
- Vue détaillée : demande client + mesures + tailleur ciblé
- Formulaire de brief : compléter/corriger les informations
- Envoi du brief au tailleur (notification + accès à la page brief dans son dashboard)
- Statut : `received → in_negotiation → brief_sent → accepted → in_production → ready → delivered`

---

### S3-T3 : Brief PDF

À la validation de la commande par les deux parties, génération d'un PDF récapitulatif :
- Nom de code de la commande (pas les noms réels)
- Description de la tenue (type, tissu, couleur, occasion)
- Mesures complètes du client
- Prix convenu + délai
- Date de validation
- Signature numérique des deux parties (tap "J'accepte")

Librairie : `@react-pdf/renderer` ou génération côté serveur via une Supabase Edge Function.

---

### S3-T4 : Paiement Wave / Orange Money

Brancher les routes API déjà créées (`app/api/payments/initiate`, `app/api/payments/callback`).

Logique escrow MVP :
- Le client paie 100% à la commande → fonds reçus sur compte Signare
- Le tailleur reçoit 50% après acceptation du brief
- Le tailleur reçoit 50% restants après validation livraison par le client
- Si litige → fonds bloqués, traitement humain

Pour la diaspora : Stripe (carte bancaire), conversion en FCFA côté Signare.

---

### S3-T5 : Notifications SMS

Twilio (déjà configuré pour OTP). Moments de notification :

| Événement | Destinataire | Message |
|---|---|---|
| Demande reçue | Client | "Votre demande a été reçue. La conciergerie Signare vous contacte sous 24h." |
| Brief prêt | Client | "Votre brief est prêt. Validez-le sur Signare." |
| Brief accepté | Tailleur | "Nouvelle commande acceptée. Voir le brief sur Signare." |
| Commande en production | Client | "Votre tailleur a commencé votre tenue." |
| Commande prête | Client | "Votre tenue est prête. Confirmez la livraison sur Signare." |
| Paiement libéré | Tailleur | "Paiement reçu : [montant] FCFA. Voir détails." |

---

## Sprint 4 — Feed Social + Tailleur Dashboard (Semaine 7-8)

**Objectif : le feed devient fonctionnel (vrais posts) + tailleur autonome**

### S4-T1 : Posts réels en Supabase

**Problème actuel** : le feed utilise `mockPosts` depuis `lib/mocks`. Les likes, saves et reposts sont dans le state local, perdus au refresh.

Schema :
```sql
posts (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references profiles(id),
  caption       text,
  garment_type  text,
  fabric_type   text,
  tagged_tailor uuid references profiles(id),
  images        text[],
  price_from    numeric,
  created_at    timestamptz default now()
)

post_interactions (
  id              uuid default gen_random_uuid() primary key,
  post_id         uuid references posts(id),
  user_id         uuid references profiles(id),
  type            text check (type in ('like', 'save', 'repost', 'view', 'comment')),
  created_at      timestamptz default now(),
  unique (post_id, user_id, type)
)
```

Actions :
- Route `GET /api/posts` → lecture depuis Supabase avec RLS public
- Route `POST /api/posts` → création (auth requise)
- Brancher `handleLike`, `handleSave`, `handleRepost` vers `post_interactions`
- Le tracking `logMLInteraction` déjà implémenté dans `page.tsx` est utilisable tel quel

---

### S4-T2 : Publication de post

La page `/publish` existe déjà. Brancher le formulaire vers Supabase :
- Upload photos vers Storage bucket `posts-media`
- Sauvegarde en table `posts`
- Tag tailleur → autocomplete sur les tailleurs vérifiés

Le **tag tailleur** est le mécanisme central du ranking organique. Chaque post taggé un tailleur incrémente son score de visibilité.

---

### S4-T3 : Dashboard tailleur

La page `/atelier` existe. La compléter avec :

- **Commandes en cours** : liste des briefs reçus + statut à mettre à jour
- **Mesures client** : accessibles via le brief (lecture seule, sans contact client)
- **Portfolio** : galerie de ses créations + bouton upload
- **Score Signare** : nombre de posts taguant cet atelier + note moyenne

Ce dashboard est la surface la plus importante pour la rétention tailleur.

---

### S4-T4 : Inscription et vérification tailleur

Remplacer la checkbox `isTailor` dans le register par un flow dédié.

Après inscription standard, si le user veut devenir tailleur :
1. Photo de l'atelier ou du lieu de travail
2. Photo d'au moins 3 créations récentes
3. Numéro de téléphone pro (peut être le même)
4. Ville et quartier

Statut `pending_verification` → notification admin → validation manuelle → `verified`.

Pendant la phase `pending_verification`, l'interface tailleur est accessible mais un badge "En cours de vérification" est visible. Aucune commande ne peut être assignée avant vérification.

---

### S4-T5 : Navigation mobile — refonte

**Problème actuel** : la bottom nav a ACCUEIL / IA / EVENTS / NOTIFS. Il manque Mesures, Commandes, Profil.

Nouvelle bottom nav (5 items fixes) :
```
Accueil  |  Explorer  |  [Mesures]  |  Commandes  |  Profil
  🏠          🔍           📐             📦            👤
```

Le bouton Mesures au centre est le cœur différenciant du produit — il doit toujours être visible.

"Commandes" remplace "IA" et "EVENTS" (qui n'existent pas encore).

La sidebar desktop est également à aligner : ajouter "Commander" et "Mes mesures", retirer "Panier" (il n'y a pas de panier dans le modèle sur-mesure).

---

## Sprint 5 — Production hardening (Semaine 9-10)

**Objectif : déploiement robuste, pas de données perdues**

### S5-T1 : Corrections sécurité

- `Services/Signare_AI/main.py:28` — remplacer `allow_origins=["*"]` par la liste des domaines Signare
- Supprimer `venv/` du repo `Services/Signare_Measurements/` (ajouter au `.gitignore`)
- Retirer les `console.log` contenant des données utilisateur (`register/page.tsx:51`)
- Vérifier que les `share_token` mesures ne sont pas devinables (UUID v4 = OK)
- Valider que les RLS Supabase bloquent bien les accès croisés

### S5-T2 : Performance mobile Android

- `HeroSection.tsx` : réduire de 85vh → 45vh sur mobile (`h-[45vh] sm:h-[85vh]`)
- Images Unsplash en background : `quality={75}` (pas 90 ou 100)
- Wrap les animations Framer Motion dans un check `prefers-reduced-motion`
- `whileInView` sur chaque post card : remplacer par `useInView` avec un seul observer partagé

### S5-T3 : Déploiement

- Frontend Next.js → Vercel (variables d'env : Supabase URL+key, Twilio, CRON_SECRET)
- Services Python → Railway ou Render (3 services séparés + 1 venv par service)
- Supabase : activer les backups quotidiens
- Monitoring : Supabase Dashboard pour DB, Vercel Analytics pour frontend

---

## Messagerie minimale

La messagerie est conservée mais son périmètre est strict : elle sert uniquement de canal entre les parties et la conciergerie. Pas de chat libre entre utilisateurs au MVP.

### Canaux autorisés

| Canal | Participants | Usage |
|---|---|---|
| Client ↔ Conciergerie | Client + commerciale/IA | Préciser la demande, valider le brief, suivi commande |
| Tailleur ↔ Conciergerie | Tailleur + commerciale/IA | Clarifier le brief, signaler un problème, confirmer livraison |
| Admin ↔ Tailleur | Admin + tailleur | Onboarding, vérification, support |

Le client et le tailleur ne se voient pas dans la messagerie. Chacun parle à la conciergerie.

### Schema `messages`

```sql
conversations (
  id          uuid default gen_random_uuid() primary key,
  order_id    uuid references orders(id),       -- null si hors commande
  type        text check (type in ('client_concierge', 'tailor_concierge', 'admin_tailor')),
  created_at  timestamptz default now()
)

messages (
  id              uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id),
  sender_id       uuid references profiles(id),
  sender_role     text check (sender_role in ('client', 'tailor', 'concierge', 'admin')),
  content         text not null,
  is_read         boolean default false,
  created_at      timestamptz default now()
)
```

### Interface client

Page `/messages` existante. Affiche la liste des conversations actives (une par commande en cours + une conversation générale avec la conciergerie). Pas de recherche d'utilisateurs, pas de "nouvelle conversation" libre — uniquement les conversations ouvertes par une demande de commande.

### Interface conciergerie admin (`/admin/concierge`)

Vue unifiée de toutes les conversations actives, triées par urgence :
- Demandes sans réponse depuis plus de 2h → priorité haute
- Brief en attente de validation → priorité moyenne
- Commandes en production → surveillance passive

La commerciale répond depuis cette interface. Le client voit la réponse comme venant de "La Conciergerie Signare", pas d'un prénom individuel.

### Temps réel

Supabase Realtime (déjà disponible dans la stack) → subscriptions sur la table `messages`. Pas besoin de WebSocket custom. Un badge de notification non-lue s'affiche dans la nav.

---

## Stratégie anti cold-start

### Le problème en trois dimensions

1. **Cold-start contenu** : feed vide → aucune raison de revenir
2. **Cold-start offre** : pas de tailleurs vérifiés → aucune commande possible
3. **Cold-start confiance** : pas de reviews ni d'historique → personne ne fait confiance

La bonne nouvelle : Signare n'a pas besoin de millions d'utilisateurs pour avoir un feed vivant. **15 tailleurs actifs qui postent 2-3 créations par semaine = 90-130 posts par mois = un feed dense.** Le seuil critique est très bas.

---

### Phase 0 — Semaine de préparation (J-7 à J-1)

**L'objectif : 200-300 posts crédibles dans le feed avant que le premier vrai utilisateur s'inscrit.**

C'est une semaine de travail manuel supervisé, pas une opération automatisée. La qualité culturelle prime sur le volume.

#### Stack technique retenue

| Besoin | Outil |
|---|---|
| Scraping références visuelles | Apify (scrapers Instagram + Pinterest prêts à l'emploi) |
| Génération images tenues | Google Gemini Imagen 3 (gratuit dans les limites Gemini) |
| Génération avatars profils | ThisPersonDoesNotExist.com ou Generated Photos |
| Rédaction légendes et biographies | Gemini ou GPT-4o avec prompt en Français/Wolof |
| Supervision et publication | Interface admin `/admin/concierge` + personas system existant |

#### Jour 1-2 : Scraping et références

Apify scrapers configurés sur les hashtags cibles :
- Instagram : `#modeSénégalaise` `#bazin` `#waxprint` `#tailleursénégalais` `#bouboumoderne` `#kaftanafrican` `#broderie` `#getzner`
- Pinterest : boards "Senegalese fashion", "African couture", "Tenues Tabaski"

On ne republié rien de ce qui est scrapé. Ces images servent uniquement de référence visuelle pour construire les prompts Imagen 3. Chaque image scrapée est taguée : type de vêtement / tissu / couleur / occasion / genre.

Objectif : 400-500 références triées, dont 200 sélectionnées pour générer du contenu.

#### Jour 3-4 : Génération des images avec Gemini Imagen 3

Structure de prompt type pour un post tailleur :
```
Photo réaliste d'un [type de vêtement] en [tissu] [couleur principale],
[détail spécifique : broderie dorée au col / motif géométrique wax / ...],
femme/homme sénégalais(e), fond [atelier couture / mur clair / extérieur urbain Dakar],
lumière naturelle, style éditorial mode africaine, haute qualité
```

Structure de prompt type pour un post client :
```
Femme sénégalaise portant une [robe/tenue] en [tissu] [couleur],
[occasion : mariage / baptême / quotidien], sourire naturel,
[lieu : salon / rue Dakar / jardin], photo smartphone réaliste
```

Objectif : 150 visuels tailleurs + 80 visuels clients = 230 images générées.

#### Jour 4 : Création des profils jumeaux

**Profils tailleurs (15-20 comptes) :**
- Noms réalistes : Atelier Aminata Diallo, Maison Sow Couture, Créations Ndiaye...
- Quartiers Dakar : Médina, Plateau, Almadies, Sicap, Point E, Grand-Yoff
- Biographies courtes en français avec une ou deux expressions locales
- Spécialités cohérentes : "bazin et broderie", "wax moderne", "kaftan hommes"
- Avatar généré (visage IA) + photo atelier générée

**Profils clients (30-40 comptes) :**
- Noms féminins sénégalais courants + quelques profils diaspora (Paris, Milan)
- Biographies légères : "passionnée de mode africaine / Dakar 🇸🇳" ou "Paris / roots sénégalaises"
- Pas de spécialité, juste des goûts vestimentaires

Ces profils sont créés directement en base Supabase avec `is_digital_twin = true` et une `retirement_date` définie selon le calendrier de suppression progressive.

#### Jour 5-6 : Rédaction et programmation des posts

Pour chaque image générée, rédiger une légende en français naturel :
- Éviter le français trop formel ou trop "IA"
- Inclure des métadonnées : type de tissu, type de tenue, occasion
- Pour les posts tailleurs : mentionner le prix indicatif
- Pour les posts clients : taguer le tailleur "jumeau" correspondant

Les posts sont programmés sur 3-4 semaines pour simuler une activité organique, pas publiés en masse le même jour.

Rythme de publication par profil tailleur : 3-4 posts par semaine.
Rythme par profil client : 1-2 posts par semaine.

#### Jour 7 : Supervision et validation

Relecture humaine de chaque post avant activation :
- Le vocabulaire et les références culturelles sonnent juste ?
- Les images ne ressemblent pas à du généré évident ?
- La diversité de styles/tissus/occasions est représentative ?
- Aucun profil ne ressemble trop à un autre ?

Validation → activation progressive des publications via l'interface `/admin/concierge`.

#### Règles de comportement des profils jumeaux

Ces règles sont non-négociables pour éviter la détection :

- **Ils postent du contenu** — oui
- **Ils ont des likes entre profils jumeaux** — oui, mais limité et aléatoire
- **Ils commentent les posts de vrais utilisateurs** — non, jamais
- **Ils répondent à des messages** — non, jamais
- **Ils apparaissent dans les suggestions "à suivre"** — non, désactivé

Dès qu'un vrai utilisateur interagit avec eux, les jumeaux ne répondent pas. Ce silence doit être géré proprement (pas de message "compte inactif", juste aucune réponse).

#### Suppression progressive

Le système `retireExpiredPersonas` dans l'orchestrateur gère la sortie. La logique de retirement :

```
Si (vrais_tailleurs_actifs_même_ville >= 3) → retirer les jumeaux tailleurs de cette ville
Si (vrais_posts_feed >= 500) → retirer 50% des profils clients jumeaux
Si (vrais_posts_feed >= 2000) → retirer tous les profils jumeaux
```

Les posts des comptes retirés restent visibles mais l'activité s'arrête. Le compte devient silencieux puis est supprimé lors du cycle mensuel de nettoyage.

---

### Phase 1 — Lancement en parallèle : terrain Dakar

Pendant que le feed se remplit de contenu jumeau, l'équipe descend sur le terrain pour convaincre les premiers vrais tailleurs.

**Argument principal pour le tailleur :**
> "On a déjà des clientes qui cherchent des tailleurs sur la plateforme. Vos créations apparaissent dans leur feed. Venez créer votre vrai profil."

Le feed pré-rempli n'est pas un mensonge — il démontre ce que Signare peut faire. C'est un prototype vivant, pas une promesse vide.

**Critères de sélection des premiers tailleurs réels :**
- Déjà actifs sur Instagram ou Facebook (ils savent photographier leur travail)
- Au moins un client dans la diaspora dans leur réseau existant
- Quartiers variés de Dakar (un par quartier prioritaire)
- Disponibles pour une commande test dans les 2 premières semaines

**La promesse terrain :**
- 0% de commission sur les 3 premières commandes
- La conciergerie (commerciale physique) gère tout pour eux au début
- Leur vrai profil remplace progressivement le jumeau correspondant

---

### Phase 2 — Post-lancement : activer les vraies boucles

Une fois 5-10 vrais tailleurs et 20-30 vrais clients inscrits, deux actions pour accélérer :

#### Challenge "Ma tenue Signare"
- Toute cliente qui poste sa tenue avec tag du tailleur participe
- Les 5 posts avec le plus de likes à la fin du mois gagnent une commande offerte
- Les tailleurs taggés dans les posts gagnants reçoivent un badge "Top Créateur du mois"

#### Ambassadrices diaspora
- 5-10 micro-influenceuses sénégalaises en Europe (pas de paiement, commande offerte)
- Elles documentent l'expérience complète : scan des mesures depuis Paris, conciergerie, réception du colis
- Ce contenu démontre exactement ce qui est différenciant : la distance résolue

---

### Mécanisme de rétention automatique post cold-start

Une fois les premiers vrais posts et commandes créés, deux boucles s'auto-entretiennent :

**Boucle tailleurs** :
```
Tailleur poste une création
→ Client voit dans le feed, like, commente
→ Score Signare du tailleur monte
→ Tailleur reçoit une commande via conciergerie
→ Tailleur poste le résultat final (avec permission client)
→ Le client poste aussi sa tenue reçue + tag le tailleur
→ Score monte encore
```

**Boucle clients** :
```
Client poste sa tenue + tag le tailleur
→ Le post génère des "où t'as fait ça ?" en commentaires
→ Ces personnes s'inscrivent pour commander
→ Elles scannent leurs mesures
→ Elles commandent via conciergerie
→ Elles reçoivent leur tenue
→ Elles postent à leur tour
```

Le tag tailleur est le mécanisme de propagation. Chaque post client est une recommandation implicite.

---

### Ce qu'on ne fait pas pour le cold-start

| Approche | Pourquoi on l'évite |
|---|---|
| Personas IA qui postent du faux contenu | Détectable, détruit la confiance si découvert |
| Achat de followers ou faux likes | Inutile sur une plateforme fermée sur-mesure |
| Ouvrir NDANANE en parallèle | Double le problème de cold-start sans doubler les ressources |
| Attendre que les utilisateurs viennent seuls | Le cold-start ne se résout pas passivement |

---

## Ce qui est hors scope MVP

Ces éléments sont volontairement différés. Ne pas les développer avant que le cycle de base soit validé avec de vrais utilisateurs.

| Feature | Raison du report |
|---|---|
| Try-on / Essayage virtuel | Qualité insuffisante en conditions réelles → risque de déception |
| Conciergerie IA complète | Valider d'abord le workflow avec une humaine |
| Segmentation NDANANE | Double cold-start à éviter, concentrer l'énergie sur SIGNARE |
| Cellule marketing autonome | Valider le ton de marque avec des humains d'abord |
| Ranking ML sémantique | Ranking business score suffit au MVP, données insuffisantes pour le ML |
| Agents personas anti-cold-start | Le vrai contenu des tailleurs pilotes suffit |
| Landing diaspora dédiée | Construire après avoir du vrai contenu pilote |
| Stripe diaspora | Wave/OM suffisent pour le marché primaire Dakar |

---

## Pilote de lancement

**Phase pilote recommandée (avant ouverture publique) :**

- **10-15 tailleurs** à Dakar uniquement, sélectionnés sur critères :
  - Déjà actifs sur Instagram/Facebook (contenus existants)
  - Capables de photographier leur travail
  - Au moins 1 client diaspora dans leur réseau actuel
  - Localisés dans des quartiers distincts (Médina, Plateau, Almadies, Point E...)

- **30-50 clients test** dont au moins 15 en diaspora (France prioritaire)

- **Durée pilote** : 4 semaines, avec une commerciale physique jouant le rôle de la conciergerie

- **Métriques à mesurer** :
  - Taux de complétion du scan morphologique (objectif : > 60%)
  - Précision des mesures scan vs mesures réelles relevées par le tailleur
  - Taux de conversion commande démarrée → brief validé
  - Taux de conversion brief validé → paiement effectué
  - Net Promoter Score client et tailleur séparément

---

## Calendrier synthétique

```
Semaines 1-2   Auth OTP + Profils + Table measurements Supabase
Semaines 3-4   Scan upload réel + Mesures en DB + Page partage mesures
Semaines 5-6   Conciergerie (humaine) + Brief PDF + Paiement Wave/OM
Semaines 7-8   Posts réels + Publication + Dashboard tailleur + Nav mobile
Semaines 9-10  Security + Performance mobile + Déploiement Vercel/Railway
               ↓
           PILOTE FERME
           10-15 tailleurs Dakar + 30-50 clients (dont 15 diaspora)
           Conciergerie assurée par une commerciale physique
               ↓
           VALIDATION
           Si > 10 commandes complètes avec paiement réel
           → activer la conciergerie IA
           → ouvrir l'inscription publique
```
