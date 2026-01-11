import { Home, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'

/**
 * Page 404 - Page non trouvée
 * @design Style SIGNARE (Noir/Or, mobile-first)
 * @note Server Component - pas d'animations framer-motion (CSS uniquement)
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center">
        {/* Icône décorative */}
        <div className="flex justify-center mb-6 animate-in slide-in-from-top-4 duration-700">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <Search className="w-12 h-12 text-[#D4AF37]" />
            </div>
            <div className="absolute -top-2 -right-2 animate-spin-slow">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
        </div>

        {/* Code 404 */}
        <h1 className="font-serif text-6xl sm:text-7xl text-[#D4AF37] mb-4 animate-in fade-in duration-700 delay-200">
          404
        </h1>

        {/* Titre */}
        <h2 className="font-serif text-2xl sm:text-3xl text-white mb-3">
          Page introuvable
        </h2>

        {/* Message */}
        <p className="text-white/70 text-sm sm:text-base mb-8 max-w-sm mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <button className="flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#D4AF37]/90 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </button>
          </Link>

          <Link href="/shop">
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              Découvrir la boutique
            </button>
          </Link>
        </div>

        {/* Décoratif */}
        <div className="mt-12 flex items-center justify-center gap-4 animate-in fade-in duration-700 delay-400">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
          <Sparkles className="w-4 h-4 text-[#D4AF37]/60" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
        </div>
      </div>
    </div>
  )
}

