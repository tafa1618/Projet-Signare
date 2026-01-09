# Architecture SIGNARE

## Vue d'ensemble

SIGNARE est une plateforme e-commerce sociale pour la mode sénégalaise, construite avec **Next.js 14 (App Router)** pour le frontend web et prévue pour un portage vers **React Native** pour le mobile. L'architecture suit une approche **mobile-first** avec une séparation claire entre la logique métier (hooks) et les composants UI.

---

## 1. Architecture Frontend

### 1.1 Stack Technologique

- **Framework** : Next.js 14.0.4 (App Router)
- **Langage** : TypeScript 5.3.3
- **Styling** : Tailwind CSS 3.4.0
- **Animations** : Framer Motion 10.18.0
- **Icônes** : Lucide React 0.303.0
- **Polices** : Google Fonts (Inter, Playfair Display)
- **State Management** : React Hooks + LocalStorage

### 1.2 Structure des Dossiers

```
app/                          # Next.js App Router
├── api/                      # API Routes (Backend)
│   └── upload/process/       # Traitement d'images
├── page.tsx                  # Feed principal (Home)
├── shop/                     # E-commerce
│   ├── page.tsx             # Liste produits
│   ├── [id]/page.tsx        # Détail produit
│   └── publish/page.tsx     # Publier produit
├── cart/page.tsx             # Panier
├── messages/page.tsx        # Messagerie
├── profil/page.tsx           # Profil utilisateur
├── layout.tsx                # Layout racine
└── globals.css               # Styles globaux

components/                    # Composants réutilisables
└── CartDropdown.tsx          # Dropdown panier

hooks/                        # Hooks métier (portables React Native)
├── useCart.ts               # Gestion panier
├── useImageProcessor.ts     # Traitement images
└── useImageQuality.ts        # Détection flou

lib/                          # Utilitaires backend
├── image-processing.ts       # Sharp (optimisation images)
└── image-upload.ts           # Client API upload

shared/                       # Code partagé web/mobile
├── services/
│   └── feedService.ts       # Service feed Supabase
├── types/
│   └── database.types.ts    # Types Supabase
└── lib/
    └── utils.ts             # Utilitaires (cn, etc.)
```

### 1.3 Patterns Architecturaux

#### **Mobile-First Design**
- Tous les composants sont conçus d'abord pour mobile
- Breakpoints Tailwind : `sm:`, `md:`, `lg:` pour desktop
- Conteneurs : `max-w-2xl mx-auto` pour centrage optimal

#### **Séparation Logique/UI**
- **Hooks** (`hooks/`) : Logique métier pure, portable vers React Native
- **Composants** (`components/`) : UI uniquement, utilise les hooks
- **Services** (`shared/services/`) : Appels API, partagés web/mobile

#### **Client Components**
- Tous les composants interactifs sont `'use client'`
- Layout racine (`app/layout.tsx`) reste Server Component pour SEO

### 1.4 Gestion d'État

#### **LocalStorage (Client-Side)**
```typescript
// hooks/useCart.ts
const CART_STORAGE_KEY = 'signare_cart'
// Persistance automatique via useEffect
```

#### **State React**
- `useState` pour état local (modals, toasts, formulaires)
- `useEffect` pour synchronisation avec localStorage
- Pas de Redux/Zustand (simplicité, portabilité)

#### **Props Drilling Minimisé**
- Hooks personnalisés pour logique partagée
- Context API non utilisé (évite complexité inutile)

### 1.5 Routing (App Router)

```
/                    → Feed principal
/shop                → Liste produits
/shop/[id]           → Détail produit
/shop/publish        → Publier produit
/cart                → Panier
/messages            → Messagerie
/profil              → Profil utilisateur
/login               → Connexion
/register            → Inscription
```

**Dynamic Routes** : `[id]` pour produits dynamiques

---

## 2. Architecture Backend

### 2.1 Stack Technologique

- **Runtime** : Node.js (via Next.js API Routes)
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (OTP par téléphone)
- **Storage** : Supabase Storage (images)
- **Traitement images** : Sharp 0.34.5
- **API** : Next.js API Routes (REST)

### 2.2 API Routes

#### **POST /api/upload/process**
```typescript
// app/api/upload/process/route.ts
// Traite les images avec Sharp :
// - Redimensionne à max 1200px
// - Convertit en WebP (80% qualité)
// - Auto-enhancement (contraste, netteté)
// - Analyse qualité (brightness, contrast, sharpness)
```

**Flux** :
1. Client envoie `FormData` avec fichier image
2. Validation (type, taille max 10MB)
3. Conversion `File` → `Buffer`
4. Traitement Sharp (`lib/image-processing.ts`)
5. Retour JSON avec image base64 + métadonnées

### 2.3 Services Backend

#### **Image Processing (Sharp)**
```typescript
// lib/image-processing.ts
- processImage()        // Redimensionne + WebP + enhance
- analyzeImageQuality() // Analyse brightness/contrast/sharpness
- getImageDimensions()  // Extrait width/height/aspectRatio
```

**Configuration** :
- Max width : 1200px (règle SIGNARE)
- Format : WebP
- Qualité : 80%
- Auto-enhancement : `normalize()` + `sharpen()`

#### **Feed Service (Supabase)**
```typescript
// shared/services/feedService.ts
- getFeed()      // Récupère posts avec profils
- toggleLike()   // Like/Unlike
- toggleSave()   // Save/Unsave
- repostPost()   // Repost avec commentaire
```

**Architecture Supabase** :
- Tables : `posts`, `profiles`, `user_interactions`, `reposts`
- Relations : Foreign keys avec `user_id`
- Realtime : Préparé pour subscriptions (non implémenté)

### 2.4 Base de Données (Supabase)

#### **Tables Principales**

```sql
posts
├── id (uuid)
├── user_id (uuid → profiles)
├── image_url (text)
├── caption (text)
├── price (numeric)
├── likes_count (int)
├── comments_count (int)
├── reposts_count (int)
├── garment_type (text)
├── fabric_type (text)
├── complexity (enum: simple/moyen/complexe)
├── quality_rating (numeric)
└── created_at (timestamp)

profiles
├── id (uuid)
├── display_name (text)
├── avatar_url (text)
├── bio (text)
├── role_score (int)  # 0-100 (≥70 = tailleur)
└── ...

user_interactions
├── user_id (uuid)
├── post_id (uuid)
├── interaction_type (enum: like/save)
└── device_type (text)

reposts
├── user_id (uuid)
├── post_id (uuid)
└── comment (text)
```

#### **Authentification**
- **Méthode** : OTP par numéro de téléphone (Supabase Auth)
- **Pas de Google Login** (règle SIGNARE)
- **Sessions** : Gérées par Supabase (cookies)

---

## 3. Flux de Données

### 3.1 Flux Feed Principal

```
1. app/page.tsx (Client Component)
   ↓
2. useState pour posts mockés (temporaire)
   ↓
3. Affichage via TailorCard / ClientCard
   ↓
4. Interactions (like, save, repost) → useState local
   ↓
5. [FUTUR] Appel shared/services/feedService.ts → Supabase
```

### 3.2 Flux Upload Image

```
1. User sélectionne image (input file)
   ↓
2. hooks/useImageQuality.ts → Détection flou (Canvas API)
   ↓
3. Si qualité OK → hooks/useImageProcessor.ts
   ↓
4. POST /api/upload/process (FormData)
   ↓
5. lib/image-processing.ts (Sharp)
   ↓
6. Retour image WebP base64 + métadonnées
   ↓
7. Affichage preview dans UI
```

### 3.3 Flux Panier

```
1. User clique "Ajouter au panier"
   ↓
2. hooks/useCart.ts → addToCart()
   ↓
3. useState local + useEffect
   ↓
4. localStorage.setItem('signare_cart', JSON)
   ↓
5. Persistance automatique
   ↓
6. components/CartDropdown.tsx → Affichage
```

### 3.4 Flux Shop

```
1. app/shop/page.tsx → Liste produits (mockés)
   ↓
2. User clique produit → /shop/[id]
   ↓
3. app/shop/[id]/page.tsx → Détail produit
   ↓
4. User ajoute au panier → useCart()
   ↓
5. Toast confirmation
```

---

## 4. Optimisation & Performance

### 4.1 Images

#### **Next.js Image Component**
```typescript
<Image
  src={url}
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, 640px"
  priority  // Pour images above-the-fold
/>
```

**Avantages** :
- Lazy loading automatique
- Responsive images (srcset)
- Optimisation format (WebP si supporté)

#### **Sharp Backend**
- Redimensionnement serveur (max 1200px)
- Compression WebP (80%)
- Auto-enhancement (contraste, netteté)

#### **Client-Side Validation**
- Détection flou avant upload (`useImageQuality.ts`)
- Avertissement utilisateur si qualité insuffisante

### 4.2 Code Splitting

- **App Router** : Automatic code splitting par route
- **Dynamic Imports** : Non utilisé (pas nécessaire pour l'instant)
- **Bundle Size** : Optimisé via Tree Shaking (ES modules)

### 4.3 Caching

- **LocalStorage** : Panier, préférences utilisateur
- **Next.js** : Static generation pour pages publiques (non utilisé actuellement)
- **Supabase** : Cache côté client via React Query (non implémenté)

---

## 5. Design System

### 5.1 Couleurs

```css
/* app/globals.css */
--color-bg-primary: #0A0A0A    /* Noir profond */
--color-accent: #D4AF37        /* Or raffiné */
--color-text: #FFFFFF          /* Blanc pur */
```

### 5.2 Typographie

```css
/* Polices */
Primary: 'Playfair Display' (Serif) → Titres, prix
Secondary: 'Inter' (Sans-serif) → Body, navigation

/* Tailles */
- Utilisation exclusive de rem (pas de px)
- Classes Tailwind : text-sm, text-base, etc.
- Responsive : text-lg sm:text-xl md:text-2xl
```

### 5.3 Composants UI

- **Cartes** : Bordures fines, ombres dorées subtiles
- **Boutons** : Or (#D4AF37) avec shadow glow
- **Animations** : Framer Motion (effet "soie")
- **Icônes** : Lucide React (Or ou Blanc)

---

## 6. Architecture Mobile (Future)

### 6.1 Portage React Native

**Stratégie** :
- **Hooks** (`hooks/`) : Déjà portables (React pur)
- **Services** (`shared/services/`) : Déjà partagés
- **Composants** : À recréer avec React Native components

**Structure prévue** :
```
mobile/
├── src/
│   ├── screens/          # Équivalent pages Next.js
│   ├── components/       # Composants React Native
│   ├── hooks/           # Réutilisation hooks web
│   └── lib/
│       └── supabase.ts  # Client Supabase mobile
```

### 6.2 Partage de Code

- ✅ **Hooks** : 100% réutilisables
- ✅ **Services** : 100% réutilisables (Supabase client)
- ✅ **Types** : 100% réutilisables (TypeScript)
- ❌ **Composants UI** : À recréer (web vs native)

---

## 7. Sécurité

### 7.1 Authentification

- **OTP par téléphone** : Supabase Auth
- **Sessions** : Cookies sécurisés (HttpOnly)
- **Pas de secrets en dur** : Variables d'environnement (`.env.local`)

### 7.2 Validation

- **Images** : Type (image/*), taille (max 10MB)
- **Formulaires** : Validation côté client (à compléter)
- **API Routes** : Validation des inputs (à compléter)

### 7.3 CORS & Headers

- **Next.js** : CORS géré automatiquement pour API Routes
- **Supabase** : CORS configuré côté Supabase dashboard

---

## 8. Déploiement

### 8.1 Environnements

- **Development** : `npm run dev` (localhost:3000)
- **Production** : Vercel (recommandé) ou autre plateforme Node.js

### 8.2 Variables d'Environnement

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 8.3 Build

```bash
npm run build    # Production build
npm run start    # Production server
```

---

## 9. Patterns & Bonnes Pratiques

### 9.1 Composants

- **Atomic Design** : Composants atomiques dans `components/ui/` (à créer)
- **Composition** : Préférer composition à héritage
- **Props Typées** : TypeScript strict pour toutes les props

### 9.2 Hooks

- **Custom Hooks** : Logique métier isolée, réutilisable
- **Naming** : Préfixe `use` (useCart, useImageProcessor)
- **Return** : Objet avec méthodes et état

### 9.3 Services

- **Async/Await** : Pas de callbacks
- **Error Handling** : Try/catch avec logs
- **Types** : Interfaces TypeScript strictes

### 9.4 Styling

- **Tailwind** : Utility-first, pas de CSS custom sauf variables
- **Responsive** : Mobile-first, breakpoints progressifs
- **Dark Mode** : Non implémenté (design noir fixe)

---

## 10. Évolutions Futures

### 10.1 Backend

- [ ] Intégration complète Supabase (remplacer mocks)
- [ ] Realtime subscriptions (notifications, messages)
- [ ] ML Tracking (analyse comportement utilisateur)
- [ ] API REST complète (CRUD produits, commandes)

### 10.2 Frontend

- [ ] React Query pour cache Supabase
- [ ] Infinite scroll pour feed
- [ ] Optimistic updates (like, save)
- [ ] PWA (Progressive Web App)

### 10.3 Mobile

- [ ] Portage React Native
- [ ] Push notifications
- [ ] Géolocalisation (livraison)
- [ ] App stores (iOS, Android)

---

## 11. Dependencies Clés

```json
{
  "next": "14.0.4",           // Framework
  "react": "^18.2.0",          // UI Library
  "typescript": "^5.3.3",      // Type Safety
  "tailwindcss": "^3.4.0",     // Styling
  "framer-motion": "^10.18.0", // Animations
  "lucide-react": "^0.303.0",  // Icons
  "sharp": "^0.34.5",          // Image Processing
  "@supabase/supabase-js": "^2.39.3" // Backend
}
```

---

## 12. Conclusion

L'architecture SIGNARE suit une approche **modulaire**, **mobile-first**, et **portable** vers React Native. La séparation claire entre logique métier (hooks/services) et UI (composants) facilite la maintenance et le portage futur.

**Points forts** :
- ✅ Code partagé web/mobile (hooks, services)
- ✅ Performance optimisée (images, code splitting)
- ✅ Type safety (TypeScript strict)
- ✅ Design system cohérent (Noir/Or)

**À améliorer** :
- ⚠️ Remplacement des mocks par Supabase réel
- ⚠️ Gestion d'erreurs plus robuste
- ⚠️ Tests unitaires/intégration

---

*Documentation générée le : 2024*
*Version : 0.1.0*

