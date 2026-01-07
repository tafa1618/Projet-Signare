# 🖼️ Guide d'Optimisation d'Images avec Sharp

Ce guide explique comment utiliser le système d'optimisation d'images de Signare basé sur Sharp.

## 📋 Fonctionnalités

✅ **Redimensionnement automatique** : Max 1200px de large (maintient aspect ratio)  
✅ **Conversion WebP** : Compression 80% pour optimiser la vitesse  
✅ **Auto-enhancement** : Ajustement automatique du contraste et de la netteté  
✅ **Détection de flou** : Validation côté client avant upload  
✅ **Analyse de qualité** : Brightness, contrast, sharpness scores  

## 🚀 Utilisation

### Option 1 : Hook `useImageProcessor` (Recommandé)

Le hook le plus simple qui combine tout :

```typescript
import { useImageProcessor } from '@/hooks/useImageProcessor'

function MyUploadComponent() {
  const { processImage, isProcessing, error } = useImageProcessor()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const processed = await processImage(file, {
      validateBlur: true, // Active la détection de flou
      onBlurDetected: (message) => {
        alert(message) // Avertir l'utilisateur
      }
    })

    if (processed) {
      // Utiliser processed.processedImage (data URL WebP)
      console.log('Image traitée:', processed.processedImage)
      console.log('Métadonnées:', processed.metadata)
      console.log('Qualité:', processed.quality)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {isProcessing && <p>Traitement en cours...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
```

### Option 2 : API Route directement

```typescript
import { processImageWithAPI } from '@/lib/image-upload'

const formData = new FormData()
formData.append('image', file)

const result = await processImageWithAPI(file)
// result.processedImage = data URL WebP optimisée
```

### Option 3 : Détection de flou uniquement

```typescript
import { useImageQuality } from '@/hooks/useImageQuality'

const { detectBlur } = useImageQuality()

const result = await detectBlur(file)
if (result.isBlurry) {
  console.warn(result.message)
}
```

## 📊 Résultats

Le traitement retourne :

```typescript
{
  processedImage: string, // Data URL WebP
  metadata: {
    width: number,        // Largeur finale
    height: number,       // Hauteur finale
    size: number,         // Taille en bytes (après compression)
    format: 'webp',
    originalSize: number, // Taille originale
    compressionRatio: number // % de réduction
  },
  quality: {
    brightness: number,   // 0-1
    contrast: number,     // 0-1
    sharpness: number     // 0-1
  },
  dimensions: {
    width: number,
    height: number,
    aspectRatio: number
  }
}
```

## ⚙️ Configuration

Les paramètres par défaut sont définis dans `lib/image-processing.ts` :

```typescript
export const IMAGE_CONFIG = {
  maxWidth: 1200,    // Max largeur
  quality: 80,       // Compression WebP (0-100)
  format: 'webp',    // Format de sortie
}
```

## 🔧 Intégration dans les pages existantes

### Exemple : Page de publication

```typescript
const { processMultipleImages } = useImageProcessor()

const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  // Traiter toutes les images
  const processed = await processMultipleImages(files, {
    validateBlur: true,
    onBlurDetected: (message, index) => {
      toast.warning(`Image ${index + 1}: ${message}`)
    }
  })

  // Utiliser les images traitées
  setMediaPreviews(processed.map(p => p.processedImage))
}
```

## 📝 Notes importantes

1. **Performance** : Le traitement se fait côté serveur, donc il y a un délai réseau
2. **Taille max** : Les fichiers > 10MB sont rejetés
3. **Formats** : Tous les formats image sont acceptés (JPEG, PNG, GIF, etc.)
4. **Sortie** : Toutes les images sont converties en WebP
5. **Flou** : La détection de flou est optionnelle mais recommandée

## 🐛 Dépannage

**Erreur "Failed to process image"** :
- Vérifier que Sharp est installé : `npm install sharp`
- Vérifier la taille du fichier (< 10MB)
- Vérifier que le fichier est bien une image

**Image toujours floue détectée** :
- Ajuster le seuil dans `useImageQuality.ts` (ligne ~80, changer `0.3`)
- La détection est approximative, peut donner des faux positifs

**Traitement trop lent** :
- Normal pour les grandes images
- Considérer un loader/progress bar
- Traiter en parallèle avec `processMultipleImages`

