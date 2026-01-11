'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { logError } from '@/lib/logger'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Composant d'erreur global pour les erreurs critiques (root layout)
 * @security Logging sécurisé des erreurs critiques
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // ✅ Logging sécurisé de l'erreur critique
    logError(error, 'Global Error Boundary (Critical)', {
      digest: error.digest,
      critical: true,
    })
  }, [error])

  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full text-center"
          >
            {/* Icône d'alerte critique */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex justify-center mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </motion.div>

            {/* Titre */}
            <h1 className="font-serif text-2xl sm:text-3xl text-white mb-3">
              Erreur critique
            </h1>

            {/* Message */}
            <p className="text-white/70 text-sm sm:text-base mb-2">
              Une erreur critique s'est produite dans l'application.
            </p>
            <p className="text-white/50 text-xs sm:text-sm mb-8">
              {error.message || 'Veuillez rafraîchir la page ou contacter le support si le problème persiste.'}
            </p>

            {/* Action */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#D4AF37]/90 transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir l'application
            </motion.button>

            {/* Code d'erreur (dev uniquement) */}
            {error.digest && (
              <p className="text-white/30 text-xs mt-8 font-mono break-all">
                Digest: {error.digest}
              </p>
            )}
          </motion.div>
        </div>
      </body>
    </html>
  )
}

