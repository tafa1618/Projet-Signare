# Intégration Frontend - Microservice IA

## 🎯 Principe Fondamental

**Le frontend ne contient AUCUNE logique IA.**

- ❌ Le frontend ne génère pas de prompts
- ❌ Le frontend ne connaît pas Stable Diffusion, Replicate, ou le GPU
- ✅ Le frontend collecte, structure et valide uniquement les entrées utilisateur
- ✅ Le frontend envoie des JSON stricts au microservice
- ✅ Le microservice gère toute l'intelligence IA

## 📡 Format des Requêtes

### Inspiration Visuelle

**Endpoint** : `POST /inspiration`

**Payload Frontend** (TypeScript) :
```typescript
{
  fabric: "bazin" | "getzner" | "wax" | "soie" | "coton",
  event: "tabaski" | "mariage" | "baptême" | "travail" | "sortie",
  gender: "homme adulte" | "femme adulte" | "garçon" | "fille",
  color: "blanc" | "beige" | "bleu" | "vert" | "marron" | "noir" | "multicolore"
}
```

**Payload API** (envoyé au microservice) :
```json
{
  "tissu": "bazin",
  "evenement": "tabaski",
  "genre_age": "homme adulte",
  "couleur": "blanc"
}
```

**Réponse** :
```json
{
  "success": true,
  "image_url": "https://...",
  "prompt_used": "Tenue traditionnelle sénégalaise élégante, style premium SIGNARE, ...",
  "mode": "mock"
}
```

### Try-On (Essayage Virtuel)

**Endpoint** : `POST /tryon`

**Payload Frontend** (TypeScript) :
```typescript
{
  model_id: string,      // UUID du modèle à essayer
  tailor_id: string,     // UUID du tailleur
  user_image_path: string // Chemin vers l'image uploadée
}
```

**Payload API** (envoyé au microservice) :
```json
{
  "user_image_path": "/uploads/user_123.jpg",
  "garment_image_path": "/uploads/garment_456.jpg",
  "job_id": "tryon_20250109_001"
}
```

**Réponse** :
```json
{
  "success": true,
  "output_image_url": "https://...",
  "job_id": "tryon_20250109_001",
  "mode": "mock"
}
```

## 🔑 Valeurs Normalisées

Toutes les valeurs doivent être **strictement identiques** à celles définies dans `shared/constants/ai-tags.ts` :

### Tissu
- `wax`
- `getzner`
- `bazin`
- `soie`
- `coton`

### Événement
- `tabaski`
- `mariage`
- `baptême` (avec accent)
- `travail`
- `sortie`

### Genre / Âge
- `homme adulte`
- `femme adulte`
- `garçon` (avec accent)
- `fille`

### Couleur
- `blanc`
- `beige`
- `bleu`
- `vert`
- `marron`
- `noir`
- `multicolore`

## ⚠️ Validation Frontend

Le frontend valide uniquement :
- ✅ Présence des champs obligatoires
- ✅ Format des fichiers (images)
- ✅ Taille des fichiers (max 10MB)
- ✅ Types de données (string, etc.)

Le frontend **NE valide PAS** :
- ❌ Les crédits utilisateur
- ❌ La disponibilité du modèle
- ❌ Les permissions
- ❌ La logique métier

## 🎨 UX Mobile-First

### Inspiration
- Tags gros et cliquables
- Pastilles de couleur visuelles
- Une seule sélection par catégorie
- Bouton désactivé si sélection incomplète

### Try-On
- Upload drag & drop
- Indication claire des règles (face caméra, etc.)
- Feedback visuel immédiat
- Affichage du résultat

## 🔄 Flux de Données

```
1. User sélectionne tags (Inspiration) OU upload photo (Try-on)
   ↓
2. Frontend valide les données (présence, format)
   ↓
3. Frontend construit le payload JSON strict
   ↓
4. Frontend appelle le microservice IA (HTTP POST)
   ↓
5. Microservice construit le prompt (Inspiration) OU génère l'image (Try-on)
   ↓
6. Microservice retourne l'URL de l'image
   ↓
7. Frontend affiche l'image
```

## 📝 Exemple d'Utilisation

```typescript
import { useAIService } from '@/hooks/useAIService'
import type { InspirationPayload } from '@/shared/constants/ai-tags'

const { generateInspiration, isLoading } = useAIService()

const payload: InspirationPayload = {
  fabric: 'bazin',
  event: 'tabaski',
  gender: 'homme adulte',
  color: 'blanc'
}

const result = await generateInspiration(payload)
// result.image_url contient l'URL de l'image générée
```

## 🚨 Erreurs Communes à Éviter

1. **Ne pas construire de prompts dans le frontend**
   - ❌ `const prompt = "Tenue ${fabric} pour ${event}"`
   - ✅ Envoyer uniquement les tags

2. **Ne pas normaliser les valeurs**
   - ❌ `fabric.toLowerCase()` (déjà normalisé dans les constantes)
   - ✅ Utiliser directement les valeurs des constantes

3. **Ne pas mélanger les responsabilités**
   - ❌ Vérifier les crédits dans le frontend
   - ✅ Le backend gère les crédits

4. **Respecter le format exact**
   - ❌ `"Bazin"` (majuscule)
   - ✅ `"bazin"` (minuscule, valeur exacte)

