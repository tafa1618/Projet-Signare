/**
 * Page 403 - Accès interdit
 * @ai-context Page affichée quand un utilisateur n'a pas les permissions nécessaires
 */

import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Accès interdit</h2>
        <p className="text-white/70 mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
