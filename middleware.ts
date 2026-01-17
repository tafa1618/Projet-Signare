/**
 * Middleware - Protection des routes admin
 * @ai-context Vérification de l'authentification et des permissions pour /admin
 * 
 * Note: En développement, l'authentification est gérée côté client via useAuth
 * Le middleware vérifie uniquement que la route /admin est accessible
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ne protéger que les routes /admin
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // En développement, on laisse passer
  // L'authentification sera vérifiée dans le layout admin
  // En production, ajouter ici la vérification du token JWT
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
