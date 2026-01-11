'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { logError } from '@/lib/logger'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Composant d'erreur global pour Next.js App Router
 * @security Logging sécurisé des erreurs (sanitization via logError)
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // ✅ Logging sécurisé de l'erreur
    logError(error, 'App Error Boundary', {
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Icône d'erreur */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
        </motion.div>

        {/* Titre */}
        <h1 className="font-serif text-2xl sm:text-3xl text-white mb-3">
          Une erreur est survenue
        </h1>

        {/* Message */}
        <p className="text-white/70 text-sm sm:text-base mb-8">
          {error.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#D4AF37]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </motion.button>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              Accueil
            </motion.button>
          </Link>
        </div>

        {/* Code d'erreur (dev uniquement) */}
        {error.digest && (
          <p className="text-white/30 text-xs mt-8 font-mono">
            Code: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  )
}

