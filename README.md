# 🇸🇳 SIGNARE - Plateforme de Mode Sénégalaise de Luxe

**Architecture Data-Ready pour l'entraînement d'IA**

SIGNARE est une plateforme mobile-first alliant artisanat traditionnel sénégalais et intelligence artificielle, avec un design luxueux Noir Profond & Or Raffiné.

## 🎨 Identité Visuelle

- **Noir Profond** (`#0A0A0A`) - Fond élégant
- **Or Raffiné** (`#D4AF37`) - Accents luxueux
- **Blanc Pur** (`#FFFFFF`) - Texte principal

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_secrete

# Delivery Engine (microservice Python)
DELIVERY_ENGINE_URL=http://localhost:8001

# Measurements Service (microservice Python)
NEXT_PUBLIC_MEASUREMENTS_API_URL=http://localhost:8003/api/v1

# AI Service (microservice Python - Inspiration & Essayage)
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8002
```

### 3. Lancement des Services

**Frontend Next.js :**
```bash
npm run dev
```

**Microservices Python (optionnel pour développement local) :**
```bash
# Delivery Engine (port 8001)
cd Services/delivery_engine
python -m uvicorn delivery_engine.app.main:app --host 0.0.0.0 --port 8001 --reload

# Measurements Service (port 8003)
cd Services/Signare_Measurements
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

# AI Service (port 8002)
cd Services/Signare_AI
python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

> **Note :** Consultez [`deploiement_check.md`](deploiement_check.md) pour la checklist complète de déploiement.

## 📁 Architecture

**SIGNARE utilise une séparation claire Backend/Frontend pour faciliter l'export et la portabilité.**

```
signare/
├── 📦 backend/              # Backend pur (exportable vers Node.js/Express)
│   ├── api/                 # Configuration API
│   ├── services/            # Logique métier
│   ├── repositories/        # Accès aux données
│   └── lib/                 # Config Supabase server
├── 🎨 frontend/             # Frontend pur (portable vers React Native)
│   ├── components/          # Composants UI
│   ├── hooks/               # Hooks React
│   └── lib/                 # Utils frontend
├── 🔗 shared/               # Code partagé
│   ├── types/               # Types TypeScript
│   ├── constants/           # Constantes
│   └── lib/                 # Utilitaires
├── 📄 app/                  # Next.js App Router (glue)
│   ├── page.tsx            # Feed social
│   ├── messages/           # Messagerie
│   ├── atelier/            # Gestion mesures & portfolio
│   ├── essayage/           # Essayage virtuel IA
│   ├── inspiration/       # Génération IA
│   ├── shop/               # Marketplace
│   └── profil/             # Profils utilisateurs
└── 🐍 Services/            # Microservices Python (FastAPI)
    ├── delivery_engine/    # Calcul prix livraison (port 8001)
    ├── Signare_Measurements/ # Prise de mesures IA (port 8003)
    ├── Signare_AI/         # Inspiration & Try-on (port 8002)
    └── Signare_Search_Feed/ # Recherche & recommandation
```

**📚 Documentation détaillée :** [`docs/BACKEND_FRONTEND_SEPARATION.md`](docs/BACKEND_FRONTEND_SEPARATION.md)

### Avantages

✅ **Backend exportable** → Node.js/Express/Serverless  
✅ **Frontend portable** → React Native  
✅ **Code partagé** → DRY (Don't Repeat Yourself)  
✅ **Testabilité** → Tests isolés  
✅ **Maintenance** → Responsabilités claires

## 🤖 Architecture Data-Ready

### Types de Données Structurés pour l'IA

Chaque interface inclut des métadonnées sémantiques pour faciliter l'entraînement de modèles ML :

#### **Profiles**
- `role_score` : Score comportemental (0=acheteur, 100=créateur)
- `style_preferences` : Vecteur de préférences stylistiques
- `interaction_history` : Historique pour recommandations

#### **Mesures**
- `pattern_type` : Type de patron (boubou, kaftan, etc.)
- `fabric_stretch_index` : Élasticité du tissu (0-100)
- `complexity_score` : Complexité du vêtement (1-10)

#### **Posts**
- `color_palette` : Palette de couleurs extraite
- `garment_type` : Type de vêtement pour classification
- `cultural_tags` : Tags culturels sénégalais
- `complexity` : Niveau de complexité (simple → haute_couture)

#### **Inspirations**
- `prompt_text` : Prompt utilisateur
- `generation_params` : Paramètres du modèle
- `user_rating` : Feedback pour amélioration continue
- `was_commissioned` : Conversion en commande réelle

## 🚚 Logistique (Modèle Yango)

### Calcul Automatique des Frais de Livraison

```typescript
Prix de base : 1500 FCFA
Prix au km : 100 FCFA / km
Frais SIGNARE : 15% inclus dans le prix final
```

**Exemple :**
- Distance : 5 km
- Calcul : 1500 + (5 × 100) = 2000 FCFA
- Frais SIGNARE : 15% inclus
- **Total : 2000 FCFA** (frais inclus)

### Sécurité de Livraison

- Code de validation client à 6 chiffres
- Fonds débloqués uniquement après validation
- Géolocalisation GPS obligatoire

## 🔐 Authentification

**Uniquement par numéro de téléphone (OTP SMS)**

```typescript
// Connexion
await signInWithPhone('+221771234567')

// Vérification
await verifyOTP('+221771234567', '123456')
```

❌ Pas de Google Login  
❌ Pas d'email/password

## 🎯 Fonctionnalités

### Pages Principales

- ✅ **Feed Social** : Partage de créations (aspect ratio 4:5 ou 9:16) avec système de likes et commentaires
- ✅ **Messagerie** : Communication premium entre clients et tailleurs avec indicateurs de statut, appels audio/vidéo
- ✅ **Atelier** : Gestion des mesures corporelles avec données ML et validation automatique
- ✅ **Portfolio** : Galerie de créations pour les tailleurs (distinct du shop)
- ✅ **Essayage Virtuel** : Try-on IA avec sélection visuelle de modèles et tailleurs
- ✅ **Inspiration IA** : Génération de designs personnalisés basés sur des tags
- ✅ **Shop** : Marketplace pour la vente de créations
- ✅ **Events** : Billetterie pour défilés et expositions
- ✅ **Profil** : Profils enrichis avec atelier virtuel pour tailleurs, paramètres personnalisés
- ✅ **Commandes** : Suivi des commandes avec validation de livraison par code

### Segmentation

- **SIGNARE** : Référence aux femmes
- **NDANANE** : Référence aux hommes

## 🛠️ Tech Stack

### Frontend
- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript (mode strict)
- **Styling** : Tailwind CSS
- **Icons** : Lucide React
- **Animations** : Framer Motion
- **Polices** : Playfair Display (serif) + Inter (sans-serif)

### Backend
- **BaaS** : Supabase (Auth, Database, Storage, Realtime)
- **Auth** : OTP par SMS uniquement (pas de Google Login)

### Microservices Python (FastAPI)
- **Delivery Engine** : Calcul automatique des prix de livraison (modèle Yango)
- **Measurements Service** : Prise de mesures corporelles avec IA (Replicate)
- **AI Service** : Génération d'inspiration et essayage virtuel
- **Search/Feed Engine** : Moteur de recherche et recommandation

### WebRTC (À venir)
- **Appels Audio/Vidéo** : Communication en temps réel entre utilisateurs
- **STUN/TURN Servers** : Configuration pour la traversée NAT

## 📱 Mobile-First Absolu

L'application est conçue pour mobile en priorité :
- Navigation bottom fixe
- Animations fluides (effet soie)
- Retour haptique visuel
- Optimisation des images via `next/image`

### Règles de Layout & Conteneurs

- **Layout Principal** : Le `body` a uniquement `overflow-x-hidden` (pas de conteneur global `max-w-screen-xl`)
- **Header** : Utilise `max-w-2xl mx-auto` pour centrer
- **Feed Principal** : Utilise `max-w-2xl mx-auto` pour le conteneur
- **Cartes de Posts** : Utilise `mx-2 sm:mx-3` pour les marges horizontales
- **Global Gutter** : Chaque page doit respecter un padding latéral minimal de `px-4` sur mobile
- **Anti-Overflow** : Pas de largeurs fixes > 320px sans media queries, utiliser `w-full` par défaut

## 🌍 Monnaie

Toutes les transactions sont en **FCFA** (Franc CFA).

## 📝 Règles de Codage

### Règles Critiques des Hooks React

⚠️ **ORDRE STRICT DES HOOKS :**
1. Tous les `useState` doivent être déclarés **AVANT** tous les `useEffect`
2. Ne **JAMAIS** placer un `useEffect` entre deux `useState`
3. Structure recommandée :
   - Tous les `useState` en premier
   - Tous les `useEffect` ensuite
   - Toutes les fonctions de gestion d'événements après

### Règles Générales

1. TypeScript strict activé
2. Single Responsibility Principle
3. Composants avec JSDoc et tag `@ai-context`
4. Hooks séparés pour la logique métier
5. Pas de secrets en dur (toujours `.env.local`)
6. Mobile-first absolu (pas de largeurs fixes > 320px sans media queries)
7. Utilisation exclusive de `rem` pour le texte (pas de `px`)
8. Toute logique de pricing doit passer par le service de pricing officiel SIGNARE

## 📚 Documentation

- **Architecture** : [`docs/ARCHITECTURE_OVERVIEW.md`](docs/ARCHITECTURE_OVERVIEW.md)
- **Séparation Backend/Frontend** : [`docs/BACKEND_FRONTEND_SEPARATION.md`](docs/BACKEND_FRONTEND_SEPARATION.md)
- **Architecture Data ML-Ready** : [`docs/ML_READY_GUIDE.md`](docs/ML_READY_GUIDE.md)
- **Checklist de Déploiement** : [`deploiement_check.md`](deploiement_check.md)
- **Charte de Développement** : [`.cursorrules`](.cursorrules)

## 🚀 Déploiement

Avant chaque déploiement, consultez la **checklist complète** dans [`deploiement_check.md`](deploiement_check.md) qui inclut :
- Variables d'environnement à configurer
- Configuration Supabase (tables, RLS, storage)
- Remplacement des données mockées
- Configuration des microservices Python
- Tests de sécurité et performance
- Configuration WebRTC pour les appels

## 🤝 Contribution

Ce projet suit la **Charte SIGNARE** (voir `.cursorrules`).

## 📄 Licence

Propriétaire - SIGNARE © 2026

---

**Conçu avec 🤍 au Sénégal 🇸🇳**

