import sharp from 'sharp'

/**
 * Configuration d'optimisation d'image selon les règles Signare
 */
export const IMAGE_CONFIG = {
  maxWidth: 1200,
  quality: 80, // Compression WebP
  format: 'webp' as const,
}

/**
 * Traite une image avec Sharp selon les règles Signare :
 * - Redimensionne à max 1200px de large
 * - Convertit en WebP avec compression 80%
 * - Améliore automatiquement contraste et netteté
 */
export async function processImage(
  buffer: Buffer,
  options?: {
    maxWidth?: number
    quality?: number
    enhance?: boolean
  }
): Promise<{
  buffer: Buffer
  width: number
  height: number
  size: number
  format: string
}> {
  const maxWidth = options?.maxWidth ?? IMAGE_CONFIG.maxWidth
  const quality = options?.quality ?? IMAGE_CONFIG.quality
  const enhance = options?.enhance ?? true

  // Obtenir les métadonnées de l'image originale
  const metadata = await sharp(buffer).metadata()
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0

  // Calculer les nouvelles dimensions (maintenir aspect ratio)
  let targetWidth = originalWidth
  let targetHeight = originalHeight

  if (originalWidth > maxWidth) {
    targetWidth = maxWidth
    targetHeight = Math.round((originalHeight * maxWidth) / originalWidth)
  }

  // Pipeline de traitement Sharp
  let pipeline = sharp(buffer)

  // Redimensionner si nécessaire
  if (targetWidth !== originalWidth || targetHeight !== originalHeight) {
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      withoutEnlargement: true,
      fit: 'inside',
    })
  }

  // Auto-enhancement (contraste et netteté)
  if (enhance) {
    pipeline = pipeline
      .normalize() // Ajuste automatiquement le contraste
      .sharpen({
        sigma: 1,
        flat: 1,
        jagged: 2,
      }) // Améliore la netteté
  }

  // Convertir en WebP avec compression
  const processedBuffer = await pipeline
    .webp({ quality })
    .toBuffer()

  return {
    buffer: processedBuffer,
    width: targetWidth,
    height: targetHeight,
    size: processedBuffer.length,
    format: 'webp',
  }
}

/**
 * Analyse la qualité d'une image (brightness, contrast)
 * Utile pour le ML et la validation
 */
export async function analyzeImageQuality(
  buffer: Buffer
): Promise<{
  brightness: number // 0-1
  contrast: number // 0-1
  sharpness: number // 0-1 (score de netteté)
}> {
  const image = sharp(buffer)
  const stats = await image.stats()

  // Calculer la luminosité moyenne
  const channels = stats.channels
  const brightness =
    channels.reduce((sum, channel) => sum + channel.mean, 0) /
    (channels.length * 255)

  // Calculer le contraste (écart-type)
  const contrast =
    channels.reduce((sum, channel) => sum + channel.stdev, 0) /
    (channels.length * 255)

  // Score de netteté basique (variance Laplacienne simplifiée)
  const { data, info } = await image
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  let sharpness = 0
  if (data && info.width && info.height) {
    let variance = 0
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length

    for (let i = 0; i < data.length; i++) {
      variance += Math.pow(data[i] - mean, 2)
    }
    variance /= data.length

    // Normaliser le score de netteté (0-1)
    sharpness = Math.min(variance / 10000, 1)
  }

  return {
    brightness: Math.round(brightness * 100) / 100,
    contrast: Math.round(contrast * 100) / 100,
    sharpness: Math.round(sharpness * 100) / 100,
  }
}

/**
 * Extrait les dimensions d'une image
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number; aspectRatio: number }> {
  const metadata = await sharp(buffer).metadata()
  const width = metadata.width || 0
  const height = metadata.height || 0
  const aspectRatio = width / height

  return { width, height, aspectRatio: Math.round(aspectRatio * 100) / 100 }
}

