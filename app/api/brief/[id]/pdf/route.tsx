/**
 * API - Génération du brief en PDF
 * GET /api/brief/[id]/pdf → retourne le fichier PDF en téléchargement
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { getOrderRequest } from '@/lib/services/adminConcierge'
import BriefDocument from '@/frontend/components/brief/BriefDocument'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const request = await getOrderRequest(params.id)

  if (!request) {
    return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
  }

  const buffer = await renderToBuffer(
    React.createElement(BriefDocument, { request })
  )

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="brief-${request.ref}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
