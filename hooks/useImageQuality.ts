'use client'

import { useState, useCallback } from 'react'

/**
 * Détecte le flou d'une image côté client
 * Utilise la variance Laplacienne pour estimer la netteté
 * 
 * @returns Score de netteté (0-1) où 1 = très net, 0 = très flou
 */
export function useImageQuality() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const detectBlur = useCallback(
    async (file: File): Promise<{
      sharpness: number // 0-1 (1 = très net)
      isBlurry: boolean // true si flou (score < 0.3)
      message?: string
    }> => {
      setIsAnalyzing(true)

      try {
        return new Promise((resolve, reject) => {
          const img = new Image()
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
          }

          img.onload = () => {
            // Redimensionner pour l'analyse (plus rapide)
            const maxSize = 400
            let width = img.width
            let height = img.height

            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height * maxSize) / width
                width = maxSize
              } else {
                width = (width * maxSize) / height
                height = maxSize
              }
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)

            // Obtenir les données de l'image
            const imageData = ctx.getImageData(0, 0, width, height)
            const data = imageData.data

            // Convertir en niveaux de gris et calculer la variance Laplacienne
            const laplacianKernel = [
              [0, -1, 0],
              [-1, 4, -1],
              [0, -1, 0],
            ]

            let variance = 0
            let sum = 0
            let count = 0

            // Appliquer le kernel Laplacien
            for (let y = 1; y < height - 1; y++) {
              for (let x = 1; x < width - 1; x++) {
                let laplacian = 0

                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4
                    const gray =
                      data[idx] * 0.299 +
                      data[idx + 1] * 0.587 +
                      data[idx + 2] * 0.114
                    laplacian += gray * laplacianKernel[ky + 1][kx + 1]
                  }
                }

                sum += laplacian
                variance += laplacian * laplacian
                count++
              }
            }

            const mean = sum / count
            const varianceValue = variance / count - mean * mean

            // Normaliser le score (0-1)
            // Les valeurs typiques de variance Laplacienne sont entre 0 et ~10000
            const sharpness = Math.min(varianceValue / 1000, 1)

            const isBlurry = sharpness < 0.3
            const message = isBlurry
              ? 'L\'image semble floue. Veuillez utiliser une photo plus nette pour une meilleure qualité.'
              : undefined

            resolve({
              sharpness: Math.round(sharpness * 100) / 100,
              isBlurry,
              message,
            })
          }

          img.onerror = () => {
            reject(new Error('Failed to load image'))
          }

          // Charger l'image
          img.src = URL.createObjectURL(file)
        })
      } catch (error) {
        console.error('Error detecting blur:', error)
        return {
          sharpness: 0.5, // Valeur par défaut si erreur
          isBlurry: false,
        }
      } finally {
        setIsAnalyzing(false)
      }
    },
    []
  )

  return {
    detectBlur,
    isAnalyzing,
  }
}

