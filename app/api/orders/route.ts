/**
 * API - Création d'une demande de commande via la conciergerie
 * POST /api/orders → ajoute dans la queue conciergerie
 */

import { NextRequest, NextResponse } from 'next/server'
import { createOrderRequest, type CreateOrderPayload } from '@/lib/services/adminConcierge'

export async function POST(req: NextRequest) {
  const body = await req.json() as CreateOrderPayload

  if (!body.garment_type || !body.occasion) {
    return NextResponse.json(
      { error: 'garment_type et occasion sont requis' },
      { status: 400 }
    )
  }

  const order = await createOrderRequest(body)

  return NextResponse.json({ ref: order.ref, id: order.id }, { status: 201 })
}
