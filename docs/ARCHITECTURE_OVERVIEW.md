# 🏗️ Architecture SIGNARE - Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         🇸🇳 SIGNARE                              │
│              Plateforme de Mode Sénégalaise de Luxe             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📱 FRONTEND (React/Next.js)                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  app/                    # Next.js App Router            │   │
│  │  ├── page.tsx           # Feed social                    │   │
│  │  ├── login/             # Authentification OTP           │   │
│  │  ├── atelier/           # Gestion mesures                │   │
│  │  ├── inspiration/       # Génération IA                  │   │
│  │  ├── events/            # Billetterie                    │   │
│  │  ├── messages/          # Messagerie                     │   │
│  │  └── profil/            # Paramètres                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  frontend/                                                │   │
│  │  ├── components/        # Composants UI                  │   │
│  │  │   └── layout/        # BottomNav, Header...          │   │
│  │  └── hooks/             # Hooks React custom            │   │
│  │      ├── useAuth        # Authentification              │   │
│  │      ├── useLikes       # Système de likes              │   │
│  │      ├── useShipping    # Calcul livraison              │   │
│  │      └── useGeolocation # GPS                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  🔗 SHARED (Types & Utils)                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  shared/                                                  │   │
│  │  ├── types/             # Types TypeScript ML-ready      │   │
│  │  │   └── database.types.ts                              │   │
│  │  ├── constants/         # Constantes                     │   │
│  │  │   └── SHIPPING_CONFIG, COLORS, GARMENT_TYPES...      │   │
│  │  └── lib/               # Utilitaires purs               │   │
│  │      └── utils.ts       # calculateShippingPrice(), cn() │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  📦 BACKEND (Services & API)                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  backend/                                                 │   │
│  │  ├── api/               # Configuration API              │   │
│  │  │   └── config.ts      # CORS, rate limiting, uploads   │   │
│  │  ├── services/          # Logique métier                 │   │
│  │  │   ├── ProfileService  # Gestion profils + ML         │   │
│  │  │   ├── PostService     # Feed personnalisé            │   │
│  │  │   └── OrderService    # Commandes + validation       │   │
│  │  ├── repositories/      # Pattern Repository             │   │
│  │  │   └── BaseRepository  # Abstraction DB (Supabase)    │   │
│  │  └── lib/               # Config backend                 │   │
│  │      └── supabase.ts    # Client Supabase server        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  🗄️ SUPABASE (Backend as a Service)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ├── Auth              # OTP par téléphone               │   │
│  │  ├── Database          # PostgreSQL (RLS activé)         │   │
│  │  │   ├── profiles      # Profils + ML metadata          │   │
│  │  │   ├── posts         # Posts + labels sémantiques     │   │
│  │  │   ├── mesures       # Mesures + pattern_type         │   │
│  │  │   ├── orders        # Commandes + validation         │   │
│  │  │   ├── events        # Billetterie                    │   │
│  │  │   └── inspirations  # Génération IA + feedback       │   │
│  │  ├── Storage           # Images (posts, avatars)         │   │
│  │  └── Realtime          # Messagerie + notifications      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🤖 DATA-READY pour IA                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Métadonnées ML structurées dans chaque table :          │   │
│  │  • role_score (0-100)          → Scoring comportemental  │   │
│  │  • style_preferences (JSON)    → Recommandations         │   │
│  │  • color_palette (array)       → Recherche par couleur   │   │
│  │  • garment_type (enum)         → Classification          │   │
│  │  • complexity (enum)           → Estimation prix/temps   │   │
│  │  • cultural_tags (array)       → Préservation identité   │   │
│  │  • user_rating (1-5)           → Feedback loop           │   │
│  │  • was_commissioned (bool)     → Conversion metrics      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🚀 EXPORTS POSSIBLES                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Frontend → React Native (mobile natif)                  │   │
│  │  Backend  → Express.js / Fastify / Serverless            │   │
│  │  Backend  → Docker container                             │   │
│  │  Shared   → Package npm réutilisable                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🎨 DESIGN SYSTEM                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Couleurs :                                               │   │
│  │  • Noir Profond   #0A0A0A   ████████  (Fond)            │   │
│  │  • Or Raffiné     #D4AF37   ████████  (Accents)         │   │
│  │  • Blanc Pur      #FFFFFF   ████████  (Texte)           │   │
│  │                                                           │   │
│  │  Typographie :                                            │   │
│  │  • Serif    → Titres élégants                           │   │
│  │  • Sans     → Corps de texte moderne                    │   │
│  │                                                           │   │
│  │  Animations :                                             │   │
│  │  • Framer Motion  → Effet "soie"                        │   │
│  │  • Lucide React   → Icônes Or/Blanc                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📊 FLUX DE DONNÉES (Exemple : Like)                             │
│                                                                   │
│  User clique ❤️                                                  │
│       ↓                                                          │
│  frontend/hooks/useLikes.ts                                      │
│       ↓                                                          │
│  backend/lib/supabase.ts                                         │
│       ↓                                                          │
│  Supabase → INSERT INTO likes                                    │
│       ↓                                                          │
│  Trigger → UPDATE posts SET likes_count++                        │
│       ↓                                                          │
│  Realtime → Notif temps réel                                     │
│       ↓                                                          │
│  frontend/components → Animation Or ✨                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📝 DOCUMENTATION                                                │
│  • README.md                    → Vue d'ensemble               │
│  • DATA_ARCHITECTURE.md         → Architecture ML-ready        │
│  • BACKEND_FRONTEND_SEPARATION  → Séparation Back/Front        │
│  • EXPORT_BACKEND_GUIDE         → Guide d'export              │
│  • supabase-schema.sql          → Schema SQL complet           │
└─────────────────────────────────────────────────────────────────┘
```

