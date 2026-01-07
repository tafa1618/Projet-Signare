'use client'

import { useState, useCallback } from 'react'
import { useImageQuality } from './useImageQuality'
import { processImageWithAPI, ProcessedImageResult } from '@/lib/image-upload'

export interface ProcessedImage extends ProcessedImageResult {
  file: File
  originalUrl: string
}

/**
 * Hook complet pour le traitement d'images avec Sharp
 * Combine la détection de flou côté client et le traitement serveur
 */
export function useImageProcessor() {
  const { detectBlur, isAnalyzing: isDetectingBlur } = useImageQuality()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Traite une image : détection de flou + traitement Sharp
   */
  const processImage = useCallback(
    async (
      file: File,
      options?: {
        validateBlur?: boolean // Si true, vérifie le flou avant traitement
        onBlurDetected?: (message: string) => void // Callback si image floue
      }
    ): Promise<ProcessedImage | null> => {
      setIsProcessing(true)
      setError(null)

      try {
        // 1. Détection de flou côté client (optionnel)
        if (options?.validateBlur) {
          const blurResult = await detectBlur(file)
          if (blurResult.isBlurry && blurResult.message) {
            if (options.onBlurDetected) {
              options.onBlurDetected(blurResult.message)
            } else {
              setError(blurResult.message)
            }
            // On continue quand même le traitement, mais l'utilisateur est averti
          }
        }

        // 2. Traitement avec Sharp via API
        const result = await processImageWithAPI(file)

        // 3. Créer l'objet ProcessedImage
        const originalUrl = URL.createObjectURL(file)
        const processed: ProcessedImage = {
          ...result,
          file,
          originalUrl,
        }

        return processed
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors du traitement'
        setError(errorMessage)
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [detectBlur]
  )

  /**
   * Traite plusieurs images en parallèle
   */
  const processMultipleImages = useCallback(
    async (
      files: File[],
      options?: {
        validateBlur?: boolean
        onBlurDetected?: (message: string, fileIndex: number) => void
      }
    ): Promise<ProcessedImage[]> => {
      setIsProcessing(true)
      setError(null)

      try {
        const results = await Promise.all(
          files.map(async (file, index) => {
            // Détection de flou si activée
            if (options?.validateBlur) {
              const blurResult = await detectBlur(file)
              if (blurResult.isBlurry && blurResult.message) {
                if (options.onBlurDetected) {
                  options.onBlurDetected(blurResult.message, index)
                }
              }
            }

            // Traitement avec Sharp
            const result = await processImageWithAPI(file)
            const originalUrl = URL.createObjectURL(file)

            return {
              ...result,
              file,
              originalUrl,
            } as ProcessedImage
          })
        )

        return results
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors du traitement'
        setError(errorMessage)
        return []
      } finally {
        setIsProcessing(false)
      }
    },
    [detectBlur]
  )

  return {
    processImage,
    processMultipleImages,
    isProcessing: isProcessing || isDetectingBlur,
    error,
    clearError: () => setError(null),
  }
}

