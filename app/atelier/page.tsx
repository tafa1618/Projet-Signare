/**
 * PAGE - Atelier (Gestion des mesures)
 * @ai-context Page de saisie de mesures avec calculs ML automatiques
 */

'use client'

import { motion } from 'framer-motion'
import { Ruler, Plus, ChevronRight } from 'lucide-react'
import { MesureForm } from '@/frontend/components/atelier/MesureForm'
import { useAuth } from '@/frontend/hooks/useAuth'
import Link from 'next/link'

export default function AtelierPage() {
  const { user, profile } = useAuth()

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center p-6">
        <div className="text-center">
          <Ruler className="w-16 h-16 mx-auto mb-4 text-or/40" />
          <h2 className="text-xl font-serif text-blanc/70 mb-2">
            Connexion requise
          </h2>
          <p className="text-blanc/50 text-sm">
            Connectez-vous pour accéder à l'atelier
          </p>
        </div>
      </div>
    )
  }

  const isTailor = profile.is_tailor && profile.tailor_status === 'verified'

  return (
    <div className="min-h-screen bg-noir pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-noir/95 backdrop-blur-sm border-b border-or/20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Ruler className="w-6 h-6 text-or" />
            <div>
              <h1 className="text-2xl font-serif text-or">Atelier</h1>
              <p className="text-xs text-blanc/60">Gestion des mesures</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* CTA pour prendre ses mesures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/atelier/mesures">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border-2 border-[#D4AF37]/30 rounded-2xl hover:border-[#D4AF37] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#D4AF37]/20 p-3 rounded-xl">
                    <Ruler className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-[#D4AF37] mb-1 tracking-[0.1em]">
                      Prendre mes mesures
                    </h3>
                    <p className="text-sm text-white/70">
                      Manuelle ou automatique par scan IA
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-[#D4AF37]/60" />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Intro - Uniquement pour les tailleurs */}
        {isTailor && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-noir border border-or/20 rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-or/10 rounded-full">
                  <Plus className="w-6 h-6 text-or" />
                </div>
                <div>
                  <h2 className="text-lg font-serif text-or mb-2">
                    Nouvelle fiche de mesures
                  </h2>
                  <p className="text-blanc/60 text-sm mb-3">
                    Enregistrez les mesures de votre client. Les scores de complexité
                    et d'élasticité sont calculés automatiquement pour l'IA.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-or/70">
                    <div className="w-2 h-2 rounded-full bg-or animate-pulse" />
                    <span>Données ML enregistrées automatiquement</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulaire - Uniquement pour les tailleurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-noir border border-or/20 rounded-lg p-6"
            >
              <MesureForm userId={user.id} />
            </motion.div>
          </>
        )}

        {/* Info ML */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-noir border border-or/10 rounded-lg"
        >
          <h3 className="text-sm font-medium text-or mb-2">
            📊 Calculs automatiques ML
          </h3>
          <ul className="space-y-2 text-xs text-blanc/60">
            <li>
              • <span className="text-blanc/80">Complexity Score</span> : Basé
              sur le type de vêtement et le nombre de mesures spéciales
            </li>
            <li>
              • <span className="text-blanc/80">Fabric Stretch Index</span> :
              Estimé selon le pattern et les préférences de coupe
            </li>
            <li>
              • <span className="text-blanc/80">Body Type</span> : Détecté
              automatiquement (sablier, pomme, poire, rectangle)
            </li>
          </ul>
        </motion.div>
      </main>
    </div>
  )
}
