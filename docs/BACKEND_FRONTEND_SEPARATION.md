# 📁 Architecture Backend/Frontend Séparée

## Structure du Projet

```
signare/
├── 📦 backend/              # BACKEND - Logique serveur (exportable)
│   ├── api/                 # Configuration des API routes
│   │   └── config.ts        # CORS, rate limiting, uploads
│   ├── services/            # Services métier
│   │   └── index.ts         # ProfileService, PostService, OrderService
│   ├── repositories/        # Couche d'accès aux données
│   │   └── index.ts         # BaseRepository, repositories spécifiques
│   └── lib/                 # Configuration backend
│       └── supabase.ts      # Client Supabase server-side
│
├── 🎨 frontend/             # FRONTEND - Interface utilisateur
│   ├── components/          # Composants React
│   │   └── layout/          # Layout components
│   │       └── BottomNav.tsx
│   ├── hooks/               # Hooks React custom
│   │   ├── useAuth.ts
│   │   ├── useGeolocation.ts
│   │   ├── useLikes.ts
│   │   └── useShipping.ts
│   └── lib/                 # Utils frontend (à créer si besoin)
│
├── 🔗 shared/               # PARTAGÉ - Code commun
│   ├── types/               # Types TypeScript
│   │   └── database.types.ts
│   ├── constants/           # Constantes
│   │   └── index.ts         # SHIPPING_CONFIG, COLORS, etc.
│   └── lib/                 # Utilitaires partagés
│       └── utils.ts         # cn(), calculateShippingPrice(), etc.
│
├── 📄 app/                  # Next.js App Router (glue layer)
│   ├── page.tsx             # Pages
│   ├── layout.tsx
│   └── [autres pages]/
│
└── 📚 docs/                 # Documentation
    └── DATA_ARCHITECTURE.md
```

## 🎯 Objectif de la Séparation

### Backend Exportable
Le dossier `backend/` est **100% indépendant du frontend** et peut être :
- Exporté vers un serveur Node.js standalone
- Utilisé avec Express/Fastify
- Converti en API REST pure
- Porté vers un autre framework backend

### Frontend Portable
Le dossier `frontend/` contient uniquement du code React :
- Composants UI
- Hooks métier
- Pas de logique de persistance

### Shared Réutilisable
Le dossier `shared/` contient le code commun :
- Types TypeScript (backend + frontend)
- Constantes (calculs, configs)
- Utilitaires purs (pas de side effects)

## 📦 Export du Backend

### Option 1 : API REST Standalone (Express)

```typescript
// server.js (nouveau fichier)
import express from 'express'
import { ProfileService, PostService, OrderService } from './backend/services'

const app = express()
app.use(express.json())

// Routes
app.get('/api/profiles/:id', async (req, res) => {
  const profile = await ProfileService.getById(req.params.id)
  res.json(profile)
})

app.get('/api/posts/feed/:userId', async (req, res) => {
  const posts = await PostService.getPersonalizedFeed(req.params.userId)
  res.json(posts)
})

app.listen(3001, () => console.log('Backend API on port 3001'))
```

### Option 2 : Serverless Functions

Chaque service peut être déployé comme fonction serverless :
- Vercel Functions
- AWS Lambda
- Cloudflare Workers
- Supabase Edge Functions

### Option 3 : GraphQL API

```typescript
// schema.ts
import { ProfileService, PostService } from './backend/services'

const typeDefs = `
  type Profile {
    id: ID!
    display_name: String
    role_score: Int
  }
  
  type Query {
    profile(id: ID!): Profile
  }
`

const resolvers = {
  Query: {
    profile: (_, { id }) => ProfileService.getById(id)
  }
}
```

## 🔄 Pattern Repository

Le **Repository Pattern** sépare la logique de persistance :

```typescript
// ✅ Service utilise Repository (pas de dépendance directe à Supabase)
export class ProfileService {
  static async getById(userId: string) {
    return ProfileRepository.findById(userId)
  }
}

// ✅ Repository encapsule Supabase (facile à remplacer)
export class BaseRepository {
  async findById(id: string) {
    // Supabase, Prisma, PostgreSQL direct, MongoDB, etc.
  }
}
```

### Avantages
1. **Testabilité** : Mock facilement le repository
2. **Flexibilité** : Change de DB sans toucher aux services
3. **Maintenance** : Logique métier isolée

## 🚀 Migration Future

### Vers React Native
```
mobile-app/
├── frontend/           # ← Copier depuis SIGNARE
│   ├── components/     # Réutiliser directement
│   └── hooks/          # Réutiliser directement
├── shared/             # ← Copier depuis SIGNARE
└── App.tsx             # Point d'entrée React Native
```

### Vers Backend Séparé
```
backend-api/
├── backend/            # ← Copier depuis SIGNARE
├── shared/             # ← Copier depuis SIGNARE
├── server.ts           # Express/Fastify
└── package.json        # Dépendances backend uniquement
```

## 📝 Règles de Développement

### ❌ À NE PAS FAIRE

1. **N'importez JAMAIS du frontend dans le backend**
   ```typescript
   // ❌ MAL
   import { useAuth } from '@/frontend/hooks/useAuth'
   ```

2. **N'importez JAMAIS de logique backend dans les composants**
   ```typescript
   // ❌ MAL
   import { ProfileService } from '@/backend/services'
   ```

### ✅ À FAIRE

1. **Backend → Shared uniquement**
   ```typescript
   // ✅ BON
   import { SHIPPING_CONFIG } from '@/shared/constants'
   import { calculateShippingPrice } from '@/shared/lib/utils'
   ```

2. **Frontend → Shared uniquement**
   ```typescript
   // ✅ BON
   import type { Profile } from '@/shared/types/database.types'
   import { COLORS } from '@/shared/constants'
   ```

3. **App/ (Next.js) fait le pont**
   ```typescript
   // ✅ BON - Server Component ou API Route
   import { ProfileService } from '@/backend/services'
   
   // ✅ BON - Client Component
   import { BottomNav } from '@/frontend/components/layout/BottomNav'
   ```

## 🧪 Tests

```bash
# Tester le backend seul
npm test backend/

# Tester le frontend seul
npm test frontend/

# Tester les utils partagés
npm test shared/
```

## 📊 Dépendances

### Backend
- `@supabase/supabase-js` (ou remplaçable)
- Pas de dépendances React

### Frontend
- `react`, `react-dom`
- `lucide-react`
- `framer-motion`
- Pas de dépendances backend

### Shared
- `clsx`, `tailwind-merge` (utils)
- Zéro dépendances lourdes

---

**Cette architecture garantit une séparation claire et un export facile du backend ! 🚀**

