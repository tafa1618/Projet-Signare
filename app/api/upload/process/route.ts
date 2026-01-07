import { NextRequest, NextResponse } from 'next/server'
import { processImage, analyzeImageQuality, getImageDimensions } from '@/lib/image-processing'

/**
 * API Route pour traiter les images avec Sharp
 * POST /api/upload/process
 * 
 * Body: FormData avec un fichier 'image'
 * 
 * Retourne: {
 *   processedImage: Buffer (base64),
 *   metadata: { width, height, size, format },
 *   quality: { brightness, contrast, sharpness }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convertir File en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Traiter l'image avec Sharp
    const processed = await processImage(buffer, {
      maxWidth: 1200,
      quality: 80,
      enhance: true,
    })

    // Analyser la qualité
    const quality = await analyzeImageQuality(processed.buffer)
    const dimensions = await getImageDimensions(processed.buffer)

    // Convertir le buffer en base64 pour le retour
    const base64 = processed.buffer.toString('base64')
    const dataUrl = `data:image/webp;base64,${base64}`

    return NextResponse.json({
      processedImage: dataUrl,
      metadata: {
        width: processed.width,
        height: processed.height,
        size: processed.size,
        format: processed.format,
        originalSize: buffer.length,
        compressionRatio: Math.round((1 - processed.size / buffer.length) * 100),
      },
      quality: {
        brightness: quality.brightness,
        contrast: quality.contrast,
        sharpness: quality.sharpness,
      },
      dimensions,
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

