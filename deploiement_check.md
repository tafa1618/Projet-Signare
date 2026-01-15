# ✅ CHECKLIST DE DÉPLOIEMENT - SIGNARE

**Date de création :** 2024  
**Dernière mise à jour :** À compléter avant chaque déploiement

---

## 🔐 1. VARIABLES D'ENVIRONNEMENT

### Variables Supabase (OBLIGATOIRES)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - URL de votre projet Supabase (production)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme publique Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Clé service role (SECRÈTE, jamais exposée côté client)
- [ ] `SUPABASE_WEBHOOK_SECRET` - Secret pour valider les webhooks Supabase

### Variables Microservices Python
- [ ] `DELIVERY_ENGINE_URL` - URL du microservice de livraison (production)
- [ ] `NEXT_PUBLIC_SEARCH_ENGINE_URL` - URL du moteur de recherche/recommandation
- [ ] `NEXT_PUBLIC_MEASUREMENTS_API_URL` - URL du microservice de mesures corporelles
- [ ] `NEXT_PUBLIC_AI_SERVICE_URL` - URL du microservice IA (inspiration/essayage)

### Variables Replicate (IA)
- [ ] `REPLICATE_API_TOKEN` - Token API Replicate pour les modèles IA
- [ ] `AI_MODE` - Mode du service de mesures (`mock` ou `replicate`)

### Variables Paiement (si applicable)
- [ ] `PAYMENT_WEBHOOK_SECRET` - Secret pour valider les webhooks de paiement
- [ ] Clés API du fournisseur de paiement (ex: Stripe, Orange Money, etc.)

### Variables SMS/OTP
- [ ] Clé API du fournisseur SMS pour l'authentification OTP
- [ ] Numéro d'expéditeur SMS configuré

### Variables WebRTC (Appels Audio/Vidéo)
- [ ] `NEXT_PUBLIC_STUN_SERVER` - URL du serveur STUN (ex: `stun:stun.l.google.com:19302`)
- [ ] `NEXT_PUBLIC_TURN_SERVER` - URL du serveur TURN (si nécessaire)
- [ ] `TURN_USERNAME` - Identifiant pour le serveur TURN
- [ ] `TURN_CREDENTIAL` - Mot de passe pour le serveur TURN
- [ ] `NEXT_PUBLIC_AGORA_APP_ID` - Si utilisation d'Agora (optionnel)
- [ ] `NEXT_PUBLIC_DAILY_API_KEY` - Si utilisation de Daily.co (optionnel)

---

## 🗄️ 2. BASE DE DONNÉES SUPABASE

### Schéma de base de données
- [ ] Exécuter `supabase-schema-ml-ready.sql` sur la base de production
- [ ] Vérifier que toutes les tables sont créées :
  - [ ] `profiles`
  - [ ] `posts`
  - [ ] `mesures`
  - [ ] `orders`
  - [ ] `conversations`
  - [ ] `messages`
  - [ ] `user_interactions`
  - [ ] `inspirations`
  - [ ] `events`
  - [ ] `event_participations`
  - [ ] `cart_items`
  - [ ] `competitions`
  - [ ] `votes`

### Politiques RLS (Row Level Security)
- [ ] Activer RLS sur toutes les tables
- [ ] Créer les politiques de sécurité pour chaque table
- [ ] Tester les accès utilisateur (lecture/écriture)
- [ ] Vérifier que les utilisateurs ne peuvent accéder qu'à leurs propres données

### Storage Buckets
- [ ] Créer le bucket `posts-images` pour les images de posts
- [ ] Créer le bucket `measurements-scans` pour les scans corporels
- [ ] Créer le bucket `avatars` pour les photos de profil
- [ ] Créer le bucket `tryon-images` pour les images d'essayage virtuel
- [ ] Configurer les politiques d'accès pour chaque bucket
- [ ] Limiter la taille des fichiers (max 10MB pour images)

### Realtime
- [ ] Activer Supabase Realtime pour la table `messages`
- [ ] Activer Supabase Realtime pour la table `conversations`
- [ ] Activer Supabase Realtime pour la signalisation des appels (canaux `calls:*`)
- [ ] Configurer les abonnements Realtime côté frontend

### Table Calls (Appels Audio/Vidéo)
- [ ] Créer la table `calls` dans Supabase :
  ```sql
  CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id),
    caller_id UUID REFERENCES profiles(id),
    receiver_id UUID REFERENCES profiles(id),
    type TEXT CHECK (type IN ('audio', 'video')),
    status TEXT CHECK (status IN ('ringing', 'connected', 'ended', 'missed', 'rejected')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Activer RLS sur la table `calls`
- [ ] Créer les politiques de sécurité (utilisateurs peuvent voir leurs propres appels)

---

## 🧪 3. DONNÉES MOCKÉES À REMPLACER

### Authentification (`frontend/hooks/useAuth.ts`)
- [ ] **CRITIQUE** : Supprimer ou désactiver les profils mockés :
  - [ ] `+771111111` (Aminata Ndiaye - Client)
  - [ ] `+772222222` (Tapha Tailleur - Tailleur)
- [ ] Vérifier que `localStorage.getItem('mock_auth_phone')` n'est plus utilisé en production
- [ ] S'assurer que seule l'authentification Supabase OTP est active
- [ ] Tester le flux d'authentification OTP complet

### Messagerie (`app/messages/page.tsx`)
- [ ] Remplacer `MOCK_CONVERSATIONS` par des appels à Supabase
- [ ] Connecter les conversations à la table `conversations` de Supabase
- [ ] Connecter les messages à la table `messages` de Supabase
- [ ] Implémenter l'envoi réel de messages via API
- [ ] Activer Supabase Realtime pour les messages en temps réel

### Notifications (`app/notifications/page.tsx`)
- [ ] Remplacer les notifications mockées par des données Supabase
- [ ] Créer une table `notifications` dans Supabase si nécessaire
- [ ] Implémenter les webhooks pour générer des notifications automatiques
- [ ] Connecter les notifications aux événements réels (commandes, messages, likes)

### Recherche (`frontend/hooks/useSearch.ts`)
- [ ] Supprimer les résultats mockés en cas d'erreur
- [ ] S'assurer que le service de recherche est toujours disponible
- [ ] Implémenter un fallback gracieux si le service est indisponible
- [ ] Vérifier que les résultats mockés ne sont pas utilisés en production

### Votes/Événements (`frontend/hooks/useVote.ts`)
- [ ] Remplacer le stockage mock en mémoire par Supabase
- [ ] Connecter les votes à la table `event_participations`
- [ ] Supprimer l'utilisation de `localStorage` pour les votes

### Mesures Corporelles
- [ ] **CRITIQUE** : Vérifier que `ScanMeasurementsFlow.tsx` upload vers Supabase Storage
- [ ] Remplacer l'URL mock dans `uploadToStorage()` par un vrai upload
- [ ] Implémenter la vérification du premier scan gratuit via Supabase
- [ ] Connecter les mesures manuelles à la table `mesures` de Supabase
- [ ] Vérifier que `is_paid: false` est correctement géré

### Posts et Feed (`app/page.tsx`)
- [ ] Remplacer les posts mockés par des données depuis Supabase
- [ ] Connecter le feed à l'API Supabase
- [ ] Implémenter la pagination réelle
- [ ] Vérifier que les likes et interactions sont persistés

---

## 🔧 4. CONFIGURATION DES SERVICES

### Microservice Measurements (`Services/Signare_Measurements/`)
- [ ] Vérifier que `AI_MODE=replicate` en production (pas `mock`)
- [ ] Configurer `REPLICATE_API_TOKEN` dans le microservice
- [ ] Tester les endpoints `/measurements/manual` et `/measurements/scan`
- [ ] Vérifier que les modèles Replicate sont correctement configurés
- [ ] Tester le calcul géométrique des mesures depuis les meshes 3D
- [ ] Vérifier que le service est déployé et accessible depuis le frontend

### Microservice Delivery Engine
- [ ] Vérifier que le service est déployé et accessible
- [ ] Tester le calcul des frais de livraison (base 1500 FCFA + 100 FCFA/km + 15%)
- [ ] Vérifier la validation des codes de livraison
- [ ] Tester la validation des coordonnées GPS (Dakar uniquement)

### Microservice Search/Recommendation Engine
- [ ] Vérifier que le service est déployé et accessible
- [ ] Tester la recherche de posts
- [ ] Tester les recommandations personnalisées
- [ ] Vérifier que le service répond rapidement (< 2s)

### Microservice IA (Inspiration/Essayage)
- [ ] Vérifier que le service est déployé et accessible
- [ ] Tester la génération d'inspiration
- [ ] Tester l'essayage virtuel
- [ ] Vérifier que les images sont correctement uploadées et traitées

### Appels Audio/Vidéo (WebRTC)
- [ ] Configurer les serveurs STUN/TURN pour la traversée NAT
  - [ ] STUN servers (gratuits : Google, Twilio)
  - [ ] TURN servers (optionnel : service tiers ou auto-hébergé)
- [ ] Vérifier que Supabase Realtime est activé pour la signalisation
- [ ] Créer la table `calls` dans Supabase pour l'historique
- [ ] Tester les appels audio 1-to-1
- [ ] Tester les appels vidéo 1-to-1
- [ ] Vérifier les permissions d'accès micro/caméra dans le navigateur
- [ ] Tester sur mobile (iOS/Android)
- [ ] Vérifier la qualité audio/vidéo selon la connexion réseau
- [ ] Implémenter la gestion des erreurs (réseau, permissions, etc.)
- [ ] Configurer les appels de groupe (si nécessaire) avec SFU

---

## 🎨 5. CONFIGURATION FRONTEND

### URLs et Endpoints
- [ ] Vérifier que toutes les URLs d'API pointent vers la production
- [ ] Remplacer `localhost` par les URLs de production
- [ ] Vérifier les CORS pour permettre les requêtes depuis le domaine de production
- [ ] Tester tous les appels API depuis le frontend

### Images et Assets
- [ ] Vérifier que toutes les images sont hébergées (Supabase Storage ou CDN)
- [ ] Remplacer les URLs placeholder/mock par de vraies URLs
- [ ] Optimiser les images (WebP, compression)
- [ ] Vérifier que `next/image` est correctement configuré
- [ ] Tester le chargement des images sur mobile

### Analytics et Tracking
- [ ] Configurer les analytics (Google Analytics, Mixpanel, etc.)
- [ ] Vérifier que `logMLInteraction` envoie bien les données
- [ ] Tester le tracking des interactions utilisateur
- [ ] Vérifier que les données sont correctement collectées

---

## 🔒 6. SÉCURITÉ

### Authentification
- [ ] Désactiver complètement l'authentification mock
- [ ] Vérifier que l'OTP SMS fonctionne en production
- [ ] Tester le flux d'authentification complet
- [ ] Vérifier que les sessions expirent correctement
- [ ] Tester la déconnexion et la reconnexion

### Secrets et Clés
- [ ] Vérifier qu'aucun secret n'est hardcodé dans le code
- [ ] Vérifier que `.env.local` n'est pas commité dans Git
- [ ] S'assurer que toutes les clés API sont dans les variables d'environnement
- [ ] Vérifier que `SUPABASE_SERVICE_ROLE_KEY` n'est jamais exposée côté client
- [ ] Vérifier que les tokens Replicate ne sont pas exposés

### Validation des données
- [ ] Vérifier que toutes les entrées utilisateur sont validées
- [ ] Implémenter la validation côté serveur (pas seulement frontend)
- [ ] Tester les injections SQL/XSS potentielles
- [ ] Vérifier la validation des fichiers uploadés

### Rate Limiting
- [ ] Activer le rate limiting sur les API routes
- [ ] Configurer les limites appropriées (voir `backend/api/config.ts`)
- [ ] Tester que le rate limiting fonctionne correctement

---

## 📱 7. MOBILE & RESPONSIVE

### Tests Mobile
- [ ] Tester sur iOS (Safari)
- [ ] Tester sur Android (Chrome)
- [ ] Vérifier que le footer ne masque pas les champs de saisie
- [ ] Tester les interactions tactiles (swipe, tap)
- [ ] Vérifier que les animations sont fluides
- [ ] Tester le scroll et la navigation

### Viewport et Meta Tags
- [ ] Vérifier la balise `<meta name="viewport">` dans `app/layout.tsx`
- [ ] Tester que `overflow-x-hidden` fonctionne correctement
- [ ] Vérifier qu'il n'y a pas de scroll horizontal indésirable
- [ ] Tester sur différentes tailles d'écran

---

## 🚀 8. PERFORMANCE

### Optimisation des images
- [ ] Vérifier que toutes les images utilisent `next/image`
- [ ] Configurer les tailles d'images appropriées
- [ ] Vérifier le lazy loading des images
- [ ] Tester le temps de chargement des images

### Code Splitting
- [ ] Vérifier que le code est correctement divisé en chunks
- [ ] Optimiser les imports (éviter les imports inutiles)
- [ ] Vérifier la taille du bundle JavaScript

### Caching
- [ ] Configurer le caching approprié pour les assets statiques
- [ ] Configurer le caching pour les API routes si nécessaire
- [ ] Vérifier que le cache fonctionne correctement

---

## 🧪 9. TESTS

### Tests Fonctionnels
- [ ] Tester le flux d'authentification complet
- [ ] Tester la création et l'affichage de posts
- [ ] Tester l'envoi et la réception de messages
- [ ] Tester la prise de mesures (manuelle et automatique)
- [ ] Tester le processus de commande
- [ ] Tester la livraison et la validation
- [ ] Tester l'essayage virtuel
- [ ] Tester la génération d'inspiration IA
- [ ] Tester les appels audio 1-to-1
- [ ] Tester les appels vidéo 1-to-1
- [ ] Tester la gestion des appels (accepter, refuser, terminer)
- [ ] Tester les permissions micro/caméra
- [ ] Tester sur différents navigateurs (Chrome, Safari, Firefox)
- [ ] Tester sur mobile (iOS Safari, Android Chrome)

### Tests de Charge
- [ ] Tester avec plusieurs utilisateurs simultanés
- [ ] Vérifier que les performances restent acceptables
- [ ] Tester la scalabilité des microservices
- [ ] Vérifier les temps de réponse des API

### Tests de Régression
- [ ] Vérifier que toutes les fonctionnalités existantes fonctionnent toujours
- [ ] Tester les cas limites et les erreurs
- [ ] Vérifier la compatibilité avec les anciennes données

---

## 📊 10. MONITORING & LOGS

### Logging
- [ ] Configurer un service de logging (ex: Sentry, LogRocket)
- [ ] Vérifier que les erreurs sont correctement loggées
- [ ] Configurer les alertes pour les erreurs critiques
- [ ] Tester le logging des interactions utilisateur

### Monitoring
- [ ] Configurer le monitoring des performances (ex: Vercel Analytics)
- [ ] Surveiller l'utilisation des ressources (CPU, mémoire)
- [ ] Surveiller les temps de réponse des API
- [ ] Configurer des alertes pour les problèmes de performance

### Analytics
- [ ] Vérifier que les analytics collectent les bonnes données
- [ ] Configurer les dashboards de monitoring
- [ ] Tester le suivi des conversions

---

## 🌍 11. CONFIGURATION PRODUCTION

### Domaine et DNS
- [ ] Configurer le domaine de production
- [ ] Configurer les certificats SSL/HTTPS
- [ ] Vérifier que toutes les URLs utilisent HTTPS
- [ ] Tester l'accès depuis différents pays/réseaux

### CDN
- [ ] Configurer un CDN pour les assets statiques
- [ ] Vérifier que les images sont servies via CDN
- [ ] Tester la vitesse de chargement depuis différents endroits

### Backup
- [ ] Configurer les backups automatiques de la base de données
- [ ] Tester la restauration depuis un backup
- [ ] Documenter le processus de restauration
- [ ] Vérifier la fréquence des backups

---

## 📝 12. DOCUMENTATION

### Documentation Technique
- [ ] Mettre à jour le README avec les instructions de déploiement
- [ ] Documenter les variables d'environnement nécessaires
- [ ] Documenter l'architecture des microservices
- [ ] Documenter les procédures de rollback

### Documentation Utilisateur
- [ ] Créer un guide utilisateur si nécessaire
- [ ] Documenter les fonctionnalités principales
- [ ] Créer des tutoriels pour les fonctionnalités complexes

---

## ✅ 13. VALIDATION FINALE

### Checklist Pré-Déploiement
- [ ] Tous les tests passent
- [ ] Aucune erreur dans la console
- [ ] Toutes les fonctionnalités sont testées
- [ ] Tous les secrets sont configurés
- [ ] La base de données est prête
- [ ] Les microservices sont déployés
- [ ] Les URLs de production sont configurées
- [ ] Le monitoring est en place

### Post-Déploiement
- [ ] Vérifier que l'application fonctionne en production
- [ ] Tester les fonctionnalités critiques
- [ ] Surveiller les logs pour les erreurs
- [ ] Vérifier les performances
- [ ] Tester l'authentification OTP en production
- [ ] Vérifier que les emails/SMS sont envoyés correctement
- [ ] Tester les paiements si applicable

---

## 🚨 POINTS CRITIQUES À NE JAMAIS OUBLIER

1. **❌ SUPPRIMER LES PROFILS MOCKÉS** (`+771111111`, `+772222222`)
2. **❌ DÉSACTIVER L'AUTHENTIFICATION MOCK**
3. **❌ REMPLACER TOUTES LES DONNÉES MOCKÉES**
4. **✅ CONFIGURER TOUTES LES VARIABLES D'ENVIRONNEMENT**
5. **✅ VÉRIFIER QUE LES SECRETS NE SONT PAS EXPOSÉS**
6. **✅ TESTER L'OTP SMS EN PRODUCTION**
7. **✅ VÉRIFIER LES POLITIQUES RLS SUPABASE**
8. **✅ CONFIGURER LE MODE PRODUCTION POUR LES MICROSERVICES IA**
9. **✅ VÉRIFIER QUE LES UPLOADS FONCTIONNENT VERS SUPABASE STORAGE**
10. **✅ TESTER TOUS LES MICROSERVICES EN PRODUCTION**
11. **✅ CONFIGURER LES SERVEURS STUN/TURN POUR LES APPELS WEBRTC**
12. **✅ TESTER LES APPELS AUDIO/VIDÉO SUR DIFFÉRENTS RÉSEAUX**

---

## 📞 CONTACTS EN CAS DE PROBLÈME

- **Backend/Supabase :** [À compléter]
- **Microservices IA :** [À compléter]
- **Infrastructure :** [À compléter]
- **Sécurité :** [À compléter]
- **Support Utilisateur :** [À compléter]

---

## 🔄 PROCÉDURE DE ROLLBACK

En cas de problème critique après déploiement :

1. [ ] Identifier le problème et son impact
2. [ ] Décider si un rollback est nécessaire
3. [ ] Exécuter le rollback vers la version précédente
4. [ ] Vérifier que l'application fonctionne après rollback
5. [ ] Documenter le problème et la solution
6. [ ] Planifier la correction pour le prochain déploiement

---

**⚠️ IMPORTANT :** Cette checklist doit être complétée avant chaque déploiement en production. Ne pas déployer si tous les points critiques ne sont pas validés.

**📅 Date du dernier déploiement :** [À compléter]  
**👤 Déployé par :** [À compléter]  
**✅ Statut :** [À compléter]

