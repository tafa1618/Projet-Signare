/**
 * API Route - Scan morphologique
 * POST /api/measurements/scan
 * Reçoit les fichiers en multipart/form-data, upload vers Supabase Storage,
 * envoie au service Python, sauvegarde le résultat en DB.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const MEASUREMENTS_API_URL =
  process.env.MEASUREMENTS_API_URL || 'http://localhost:8003/api/v1'

async function uploadToStorage(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  userId: string,
  file: File,
  label: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${Date.now()}_${label}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { data, error } = await supabase.storage
    .from('measurements-photos')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(`Upload ${label} échoué : ${error.message}`)

  // URL signée valide 1h pour le service Python
  const { data: signed, error: signError } = await supabase.storage
    .from('measurements-photos')
    .createSignedUrl(data.path, 3600)

  if (signError || !signed?.signedUrl) {
    throw new Error(`Génération URL signée échouée : ${signError?.message}`)
  }

  return signed.signedUrl
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Multipart form data invalide' }, { status: 400 })
  }

  const frontFile = formData.get('front') as File | null
  const sideFile = formData.get('side') as File | null
  const videoFile = formData.get('video') as File | null

  if (!frontFile && !videoFile) {
    return NextResponse.json(
      { error: 'Au moins une photo de face ou une vidéo est requise' },
      { status: 400 }
    )
  }

  // Upload vers Supabase Storage
  let frontUrl: string | undefined
  let sideUrl: string | undefined
  let videoUrl: string | undefined

  try {
    if (frontFile) frontUrl = await uploadToStorage(supabase, user.id, frontFile, 'front')
    if (sideFile) sideUrl = await uploadToStorage(supabase, user.id, sideFile, 'side')
    if (videoFile) videoUrl = await uploadToStorage(supabase, user.id, videoFile, 'video')
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur upload fichier' },
      { status: 500 }
    )
  }

  // Appel au service Python FastAPI
  let pythonResult: Record<string, unknown>
  try {
    const pythonResponse = await fetch(`${MEASUREMENTS_API_URL}/measurements/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        front_image_url: frontUrl ?? '',
        side_image_url: sideUrl,
        video_url: videoUrl,
        is_paid: false,
      }),
    })

    if (!pythonResponse.ok) {
      const detail = await pythonResponse.json().catch(() => ({ detail: 'Erreur service ML' }))
      throw new Error(detail.detail || `Erreur ${pythonResponse.status}`)
    }

    pythonResult = await pythonResponse.json()
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur service ML' },
      { status: 502 }
    )
  }

  const measurements = (pythonResult.measurements ?? {}) as Record<string, number>

  // Sauvegarde en base
  const { data, error: dbError } = await supabase
    .from('measurements')
    .insert({
      user_id: user.id,
      method: 'scan',
      confidence: (pythonResult.confidence as string) ?? 'estimated',
      precision_cm: (pythonResult.precision_cm as string) ?? '1.5',
      chest: measurements.chest ?? null,
      neck: measurements.neck ?? null,
      waist: measurements.waist ?? null,
      hips: measurements.hips ?? null,
      shoulders: measurements.shoulders ?? null,
      arm_length: measurements.arm_length ?? null,
      thigh: measurements.thigh ?? null,
      biceps: measurements.biceps ?? null,
      leg_length: measurements.leg_length ?? null,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: 'Erreur sauvegarde mesures' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
