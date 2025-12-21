/**
 * PAGE - Atelier (Gestion des mesures)
 * @ai-context Page de saisie de mesures avec calculs ML automatiques
 */

'use client'

import { motion } from 'framer-motion'
import { Ruler, Plus } from 'lucide-react'
import { MesureForm } from '@/frontend/components/atelier/MesureForm'
import { useAuth } from '@/frontend/hooks/useAuth'

export default function AtelierPage() {
  const { user } = useAuth()

  if (!user) {
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
        {/* Intro */}
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

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-noir border border-or/20 rounded-lg p-6"
        >
          <MesureForm userId={user.id} />
        </motion.div>

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
