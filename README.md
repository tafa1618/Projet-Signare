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
DELIVERY_ENGINE_URL=http://localhost:8002

# Search/Feed/Recommendation Engine (microservice Python)
NEXT_PUBLIC_SEARCH_ENGINE_URL=http://localhost:8003/api/v1

# Measurements Service (microservice Python)
NEXT_PUBLIC_MEASUREMENTS_API_URL=http://localhost:8003/api/v1
```

### 3. Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

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
└── 📄 app/                  # Next.js App Router (glue)
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
Prix de base : 500 FCFA
Prix au km : 100 FCFA / km
Frais SIGNARE : 15% du total
```

**Exemple :**
- Distance : 5 km
- Calcul : 500 + (5 × 100) = 1000 FCFA
- Frais : 1000 × 0.15 = 150 FCFA
- **Total : 1150 FCFA**

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

- ✅ **Flux Social** : Partage de créations (aspect ratio 4:5 ou 9:16)
- ✅ **Atelier** : Gestion des mesures avec données ML
- ✅ **Inspiration IA** : Génération de designs
- ✅ **Events** : Billetterie pour défilés et expositions
- ✅ **Profil** : Paramètres et préférences utilisateur

## 🛠️ Tech Stack

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript (mode strict)
- **Styling** : Tailwind CSS
- **Backend** : Supabase (Auth, Database, Storage, Realtime)
- **Icons** : Lucide React
- **Animations** : Framer Motion

## 📱 Mobile-First Absolu

L'application est conçue pour mobile en priorité :
- Navigation bottom fixe
- Animations fluides (effet soie)
- Retour haptique visuel
- Optimisation des images via `next/image`

## 🌍 Monnaie

Toutes les transactions sont en **FCFA** (Franc CFA).

## 📝 Règles de Codage

1. TypeScript strict activé
2. Single Responsibility Principle
3. Composants avec JSDoc et tag `@ai-context`
4. Hooks séparés pour la logique métier
5. Pas de secrets en dur (toujours `.env.local`)

## 🤝 Contribution

Ce projet suit la **Charte SIGNARE** (voir `.cursorrules`).

## 📄 Licence

Propriétaire - SIGNARE © 2024

---

**Conçu avec 🤍 au Sénégal 🇸🇳**

