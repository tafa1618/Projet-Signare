import { NextRequest, NextResponse } from 'next/server'
import { processImage, analyzeImageQuality, getImageDimensions } from '@/lib/image-processing'
import { logError, logPerformance, logSecurity } from '@/lib/logger'
import { validateImageFile, IMAGE_UPLOAD_CONSTRAINTS } from '@/lib/validations/schemas'

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
  const startTime = Date.now()
  
  try {
    // Parser FormData
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    // ✅ Validation stricte du fichier avec helper sécurisé
    const validation = validateImageFile(file)
    if (!validation.valid) {
      logSecurity('Image upload validation failed', { 
        error: validation.error,
        fileType: file?.type,
        fileSize: file?.size,
      })
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Fichier validé, on peut continuer
    const validatedFile = file!

    // Convertir File validé en Buffer
    const arrayBuffer = await validatedFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Traiter l'image avec Sharp (contraintes de validation)
    const processed = await processImage(buffer, {
      maxWidth: IMAGE_UPLOAD_CONSTRAINTS.MAX_WIDTH,
      quality: 80,
      enhance: true,
    })

    // Analyser la qualité
    const quality = await analyzeImageQuality(processed.buffer)
    const dimensions = await getImageDimensions(processed.buffer)

    // Convertir le buffer en base64 pour le retour
    const base64 = processed.buffer.toString('base64')
    const dataUrl = `data:image/webp;base64,${base64}`

    // Logger la performance (sans données sensibles)
    const duration = Date.now() - startTime
    logPerformance('process-image', duration, { 
      size: validatedFile.size, 
      format: validatedFile.type,
      originalSize: buffer.length,
      processedSize: processed.size,
    })
    
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
    logError(error, 'Image processing')
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        error: 'Failed to process image',
        ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' }),
      },
      { status: 500 }
    )
  }
}

