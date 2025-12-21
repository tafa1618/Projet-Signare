# 🚀 Guide d'Export du Backend

## 🎯 Objectif

Ce guide montre comment **exporter le backend SIGNARE** en API standalone, indépendante du frontend Next.js.

---

## 📦 Méthode 1 : API REST avec Express.js

### 1. Créer un nouveau projet backend

```bash
mkdir signare-backend
cd signare-backend
npm init -y
```

### 2. Installer les dépendances

```bash
npm install express cors dotenv
npm install @supabase/supabase-js
npm install -D typescript @types/node @types/express tsx
```

### 3. Copier les dossiers nécessaires

```bash
# Depuis le projet SIGNARE
cp -r backend/ signare-backend/
cp -r shared/ signare-backend/
cp .env.local signare-backend/.env
```

### 4. Créer le serveur Express

```typescript
// server.ts
import express from 'express'
import cors from 'cors'
import { ProfileService, PostService, OrderService } from './backend/services'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// ==================== ROUTES ====================

// Profiles
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await ProfileService.getById(req.params.id)
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.patch('/api/profiles/:id/score', async (req, res) => {
  try {
    const { activity } = req.body
    await ProfileService.updateRoleScore(req.params.id, activity)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Posts
app.get('/api/posts/feed/:userId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const posts = await PostService.getPersonalizedFeed(req.params.userId, limit)
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/posts', async (req, res) => {
  try {
    const post = await PostService.create(req.body)
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Orders
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const role = req.query.role as 'buyer' | 'seller' || 'buyer'
    const orders = await OrderService.getByUser(req.params.userId, role)
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const order = await OrderService.create(req.body)
    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/orders/:id/validate', async (req, res) => {
  try {
    const { validationCode } = req.body
    const isValid = await OrderService.validateDelivery(req.params.id, validationCode)
    res.json({ valid: isValid })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SIGNARE Backend API running on http://localhost:${PORT}`)
})
```

### 5. Configurer package.json

```json
{
  "name": "signare-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### 6. Lancer le serveur

```bash
npm run dev
```

**✅ Backend accessible sur `http://localhost:3001`**

---

## 📦 Méthode 2 : Serverless Functions (Vercel)

### Structure

```
signare-backend/
├── api/
│   ├── profiles/
│   │   └── [id].ts
│   ├── posts/
│   │   ├── index.ts
│   │   └── feed.ts
│   └── orders/
│       ├── index.ts
│       └── validate.ts
├── backend/           # Copié depuis SIGNARE
├── shared/            # Copié depuis SIGNARE
└── vercel.json
```

### Exemple de fonction

```typescript
// api/profiles/[id].ts
import { ProfileService } from '../../backend/services'

export default async function handler(req, res) {
  const { id } = req.query
  
  if (req.method === 'GET') {
    const profile = await ProfileService.getById(id)
    return res.json(profile)
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
```

### Déploiement

```bash
vercel deploy
```

---

## 📦 Méthode 3 : Supabase Edge Functions

### Structure

```
signare-backend/
├── supabase/
│   └── functions/
│       ├── get-profile/
│       │   └── index.ts
│       ├── create-post/
│       │   └── index.ts
│       └── validate-order/
│           └── index.ts
├── backend/           # Copié depuis SIGNARE
└── shared/            # Copié depuis SIGNARE
```

### Exemple

```typescript
// supabase/functions/get-profile/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { ProfileService } from '../../../backend/services/index.ts'

serve(async (req) => {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  
  const profile = await ProfileService.getById(id)
  
  return new Response(JSON.stringify(profile), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Déploiement

```bash
supabase functions deploy get-profile
```

---

## 📦 Méthode 4 : Docker Container

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY backend/ ./backend/
COPY shared/ ./shared/
COPY server.ts package.json tsconfig.json ./

RUN npm install
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

### Lancement

```bash
docker-compose up
```

---

## 🔄 Migration de Supabase vers PostgreSQL direct

Si vous voulez remplacer Supabase par PostgreSQL + Prisma :

### 1. Installer Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. Créer le schéma Prisma

Convertir `supabase-schema.sql` en `schema.prisma`

### 3. Modifier le Repository

```typescript
// backend/repositories/index.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class BaseRepository<T> {
  async findById(id: string) {
    // Remplacer Supabase par Prisma
    return prisma[this.tableName].findUnique({ where: { id } })
  }
}
```

**✅ Les services restent INCHANGÉS !** (grâce au pattern Repository)

---

## 📊 Comparaison des Méthodes

| Méthode | Complexité | Scalabilité | Coût | Use Case |
|---------|------------|-------------|------|----------|
| Express.js | ⭐ Simple | ⭐⭐⭐ Haute | 💰 Moyen | Production standard |
| Vercel Functions | ⭐⭐ Moyenne | ⭐⭐⭐⭐ Très haute | 💰 Gratuit → Moyen | Serverless |
| Supabase Edge | ⭐ Simple | ⭐⭐⭐⭐ Très haute | 💰 Gratuit → Faible | Déjà sur Supabase |
| Docker | ⭐⭐⭐ Complexe | ⭐⭐⭐⭐⭐ Maximale | 💰💰 Élevé | Enterprise |

---

## ✅ Checklist d'Export

- [ ] Copier `backend/`, `shared/`
- [ ] Installer dépendances backend
- [ ] Configurer `.env` (Supabase keys)
- [ ] Créer le serveur (Express/Serverless)
- [ ] Tester les routes API
- [ ] Configurer CORS
- [ ] Ajouter rate limiting
- [ ] Déployer sur la plateforme choisie

---

**🎉 Votre backend SIGNARE est maintenant exporté et indépendant !**

