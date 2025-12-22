# SIGNARE - Charte Visuelle & Code Design System

## 🎨 Palette de Couleurs

### Couleurs Principales
```css
--noir-profond: #0A0A0A     /* Fond principal */
--or-raffine: #D4AF37       /* Accents, boutons, texte actif */
--blanc-pur: #FFFFFF        /* Texte principal sur fond noir */
```

### Couleurs Dérivées
```css
--or-50: rgba(212, 175, 55, 0.5)   /* Or semi-transparent */
--or-40: rgba(212, 175, 55, 0.4)   /* Or désactivé/inactif */
--or-30: rgba(212, 175, 55, 0.3)   /* Bordures subtiles */
--or-20: rgba(212, 175, 55, 0.2)   /* Fond hover léger */
--or-10: rgba(212, 175, 55, 0.1)   /* Fond actif très léger */

--blanc-90: rgba(255, 255, 255, 0.9)  /* Texte principal */
--blanc-70: rgba(255, 255, 255, 0.7)  /* Texte secondaire */
--blanc-60: rgba(255, 255, 255, 0.6)  /* Texte tertiaire */
--blanc-50: rgba(255, 255, 255, 0.5)  /* Texte désactivé */
--blanc-40: rgba(255, 255, 255, 0.4)  /* Placeholder */
--blanc-30: rgba(255, 255, 255, 0.3)  /* Bordures */
--blanc-20: rgba(255, 255, 255, 0.2)  /* Séparateurs */
--blanc-10: rgba(255, 255, 255, 0.1)  /* Fond subtil */

--noir-95: rgba(10, 10, 10, 0.95)     /* Overlay fort */
--noir-80: rgba(10, 10, 10, 0.8)      /* Backdrop blur */
--noir-60: rgba(10, 10, 10, 0.6)      /* Overlay moyen */
--noir-40: rgba(10, 10, 10, 0.4)      /* Overlay léger */
```

## 📝 Typographie

### Polices
```css
/* Polices (verrouillées via next/font pour un rendu constant Windows/macOS) */
font-sans: 'Inter', 'system-ui', sans-serif                 /* Corps de texte */
font-serif: 'Playfair Display', 'Georgia', serif            /* Titres élégants */
```

### Implémentation (Next.js)
```ts
// app/layout.tsx
// @ai-context Les variables CSS évitent les variations de rendu typographique entre OS.
Inter({ variable: '--font-sans' })
Playfair_Display({ variable: '--font-serif' })
```

### Hiérarchie
```css
/* Titres principaux */
h1: text-6xl (60px), font-serif, text-[#D4AF37], tracking-[0.2em]

/* Titres secondaires */
h2: text-4xl (36px), font-serif, text-[#D4AF37], tracking-[0.15em]

/* Titres de section */
h3: text-2xl (24px), font-serif, text-[#D4AF37], tracking-wide

/* Sous-titres */
.subtitle: text-base (16px), font-light, text-white/90, tracking-wide

/* Corps de texte */
.body: text-sm (14px), font-normal, text-white/70

/* Petits textes */
.caption: text-xs (12px), font-medium, text-white/60

/* Labels navigation */
.nav-label: text-[10px], font-semibold, uppercase, tracking-wider
```

## 🔘 Boutons

### Bouton Primaire (Or)
```jsx
<button className="w-full bg-[#D4AF37] text-[#0A0A0A] font-bold text-sm tracking-widest uppercase py-4 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300">
  TEXTE BOUTON
</button>
```

### Bouton Secondaire (Bordure Or)
```jsx
<button className="w-full bg-transparent border-2 border-[#D4AF37]/60 text-white font-semibold text-sm tracking-widest uppercase py-4 rounded-lg hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300">
  TEXTE BOUTON
</button>
```

### Bouton Actif Navigation
```jsx
<button className="flex flex-col items-center justify-center flex-1 bg-[#D4AF37]/10 rounded-lg py-2">
  <Icon className="text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" size={26} strokeWidth={2.5} />
  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#D4AF37]">LABEL</span>
</button>
```

## 📥 Champs de Saisie

### Input Luxe (Bordure inférieure Or)
```jsx
<input
  className="w-full bg-transparent text-white text-lg py-3 px-1 border-b-2 border-white/20 focus:border-[#D4AF37] outline-none transition-all duration-300 placeholder:text-white/30"
  placeholder="+221 77 123 45 67"
/>
```

### Label Input
```jsx
<label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
  TÉLÉPHONE OU EMAIL
</label>
```

## 🎭 Effets & Animations

### Glow Or (Effet lumineux)
```css
/* Ombre portée dorée */
drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]
box-shadow: 0 0 20px rgba(212, 175, 55, 0.3)

/* Ombre forte */
box-shadow: 0 0 40px rgba(212, 175, 55, 0.6)
```

### Backdrop Blur (Flou d'arrière-plan)
```css
backdrop-blur-lg
bg-[#0A0A0A]/95
```

### Transitions
```css
/* Transition standard */
transition-all duration-300

/* Transition douce */
transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]

/* Hover scale */
hover:scale-1.02
active:scale-0.98
```

### Animations Framer Motion
```jsx
// Fade in from top
<motion.div
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
>

// Fade in from bottom
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
>

// Scale animation
<motion.button
  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(212,175,55,0.5)' }}
  whileTap={{ scale: 0.98 }}
>

// Glow shine effect (brillance animée)
<motion.div
  animate={{ x: ['0%', '200%'] }}
  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
/>
```

## 🧭 Navigation Bottom

### Structure
```jsx
<nav className="fixed bottom-0 left-0 right-0 w-full z-50">
  <div className="flex justify-around items-center bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-[#D4AF37]/30 h-20 px-4 w-full">
    {/* Items de navigation */}
  </div>
</nav>
```

### Item Navigation
```jsx
// Inactif
<Link className="flex flex-col items-center justify-center flex-1">
  <Icon size={26} className="text-[#D4AF37]/50" strokeWidth={2} />
  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#D4AF37]/50">
    LABEL
  </span>
</Link>

// Actif
<Link className="flex flex-col items-center justify-center flex-1 bg-[#D4AF37]/10 rounded-lg py-2 relative">
  <Icon size={26} className="text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" strokeWidth={2.5} />
  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#D4AF37]">
    LABEL
  </span>
  {/* Barre indicatrice */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#D4AF37] rounded-b-full shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
</Link>
```

## 🖼️ Images & Overlays

### Image de fond avec overlay
```jsx
<div className="absolute inset-0 z-0">
  <Image
    src="/path/to/image.jpg"
    fill
    className="object-cover"
    priority
    quality={100}
  />
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-[#0A0A0A]/60 to-[#0A0A0A]/85" />
</div>
```

## ✨ Éléments Décoratifs

### Séparateur Or
```jsx
<div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
```

### Ornement avec icône
```jsx
<div className="flex items-center gap-3">
  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
  <Sparkles className="w-4 h-4 text-[#D4AF37]/40" />
  <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
</div>
```

### Badge culturel
```jsx
<div className="flex items-center gap-2 text-[#D4AF37]/40 text-xs tracking-widest">
  <span>🇸🇳</span>
  <span>MADE IN SENEGAL</span>
</div>
```

## 📐 Espacements

```css
/* Padding conteneur principal */
px-6 py-12 (24px horizontal, 48px vertical)

/* Espacement entre sections */
space-y-8 (32px)

/* Espacement entre boutons */
space-y-4 (16px)

/* Padding bottom pour navigation */
pb-24 (96px)
```

## 🎯 Règles d'Utilisation

### Mobile-First
- Tout doit être pensé pour mobile d'abord
- Max-width: 448px (max-w-md) pour les conteneurs centraux
- Largeur pleine (w-full) pour les éléments principaux

### Gabarit "One-View" (SIGNARE)
- **Objectif**: éviter le scroll global, privilégier les scrolls internes (feed, messages, carrousels).
- **Hauteur utile**: utiliser `h-[calc(100dvh-80px)]` (80px = BottomNav) pour les pages immersives (Messages, Publish, Product, Order).
- **Padding bottom**: garder `pb-24` sur les pages scrollables (feed/profil) pour laisser respirer la BottomNav.
- **Largeur**: contenir le contenu principal avec `max-w-md` (ou `max-w-lg` si besoin), centré `mx-auto`.

### Images (compact & premium)
- **Feed / Product**: `aspect-[4/5]` + `max-h-[50vh]` (ou `55vh` si nécessaire) + `object-cover`.
- **Preview Publish**: `aspect-[4/5]` + `max-h-[40vh]` pour laisser de la place au formulaire.
- **Grilles (profil)**: `aspect-square`, hover bordure or `hover:border-[#D4AF37]/40`.

### CTAs fixes (conversion)
- **Barre fixe**: positionner au-dessus de la BottomNav (ex: `fixed bottom-20 left-0 right-0`) avec un dégradé `from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent`.
- **Bouton primaire**: plein or, texte noir, tracking uppercase serré.

### Messagerie (Salon Privé)
- **Séparateurs**: `border-[#D4AF37]/20`
- **Bulles**:
  - Reçu: `bg-[#0A0A0A] border-[#D4AF37]/20`
  - Envoyé: `bg-[#141414] border-white/10`
- **Actions**: icônes or/blanc, + menu rapide, micro (vocal) à côté de l’icône photo.

### ML Ready (UX → dataset)
- Toute action importante doit être traçable (`user_interactions`) via un `came_from` explicite.
- Exemples `came_from`:
  - `feed:post_view`, `product:product_detail_view:score2`, `order:order_view:score2`, `messages:conversation_select`, `messages:voice_mic`

### Contraste
- Toujours assurer un ratio de contraste minimum de 4.5:1
- Utiliser l'or (#D4AF37) pour les éléments importants
- Texte blanc avec opacité pour la hiérarchie

### Espacement
- Suivre une échelle cohérente (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- Respirer : ne pas surcharger l'écran
- Privilégier les marges verticales généreuses

### Animations
- Durée standard : 300ms
- Durée élégante : 800ms
- Courbe d'accélération : cubic-bezier(0.16, 1, 0.3, 1)
- Toujours avec une transition fluide

## 🔗 Icônes (Lucide React)

```jsx
import { 
  Home, 
  MessageCircle, 
  Sparkles, 
  Ticket, 
  User,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react'

// Taille standard : 24px (size={24})
// Taille navigation : 26px (size={26})
// Taille décoration : 12px (size={12})
```

---

**Version:** 1.0  
**Dernière mise à jour:** 21 Décembre 2025  
**Design:** Claude Sonnet 4.5 pour SIGNARE

