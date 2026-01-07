'use client'

/**
 * Utilitaire pour uploader et traiter des images avec l'API Sharp
 */

export interface ProcessedImageResult {
  processedImage: string // data URL
  metadata: {
    width: number
    height: number
    size: number
    format: string
    originalSize: number
    compressionRatio: number
  }
  quality: {
    brightness: number
    contrast: number
    sharpness: number
  }
  dimensions: {
    width: number
    height: number
    aspectRatio: number
  }
}

/**
 * Traite une image via l'API Sharp
 */
export async function processImageWithAPI(
  file: File
): Promise<ProcessedImageResult> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('/api/upload/process', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to process image')
  }

  return response.json()
}

/**
 * Traite plusieurs images en parallèle
 */
export async function processMultipleImages(
  files: File[]
): Promise<ProcessedImageResult[]> {
  return Promise.all(files.map((file) => processImageWithAPI(file)))
}

