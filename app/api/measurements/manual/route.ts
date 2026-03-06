/**
 * API Route - Mesures manuelles
 * POST /api/measurements/manual
 * Sauvegarde les mesures manuelles dans Supabase (table measurements)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface ManualMeasurementsBody {
  chest?: number | null
  neck?: number | null
  waist?: number | null
  hips?: number | null
  shoulders?: number | null
  arm_length?: number | null
  thigh?: number | null
  biceps?: number | null
  leg_length?: number | null
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Vérifier l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: ManualMeasurementsBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  // Au moins une mesure requise
  const hasMeasurement = Object.values(body).some(
    (v) => v !== null && v !== undefined && typeof v === 'number'
  )
  if (!hasMeasurement) {
    return NextResponse.json({ error: 'Au moins une mesure est requise' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('measurements')
    .insert({
      user_id: user.id,
      method: 'manual',
      confidence: 'exact',
      precision_cm: '0',
      chest: body.chest ?? null,
      neck: body.neck ?? null,
      waist: body.waist ?? null,
      hips: body.hips ?? null,
      shoulders: body.shoulders ?? null,
      arm_length: body.arm_length ?? null,
      thigh: body.thigh ?? null,
      biceps: body.biceps ?? null,
      leg_length: body.leg_length ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
