'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Ruler, Sparkles, ChevronLeft, CheckCircle2, Camera, Video, Upload, AlertCircle } from 'lucide-react'
import ManualMeasurementsWizard from '@/frontend/components/atelier/ManualMeasurementsWizard'
import ScanMeasurementsFlow from '@/frontend/components/atelier/ScanMeasurementsFlow'
import { useAuth } from '@/frontend/hooks/useAuth'

type MeasurementMethod = 'choice' | 'manual' | 'scan'

export default function MesuresPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [method, setMethod] = useState<MeasurementMethod>('choice')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="text-center">
          <Ruler className="w-16 h-16 mx-auto mb-4 text-[#D4AF37]/40" />
          <h2 className="text-xl font-serif text-white/70 mb-2">Connexion requise</h2>
          <p className="text-white/50 text-sm">Connectez-vous pour accéder aux mesures</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (method === 'choice') {
                  router.push('/atelier')
                } else {
                  setMethod('choice')
                }
              }}
              className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg font-serif text-[#D4AF37] tracking-[0.15em]">
                {method === 'choice' ? 'PRISES DE MESURES' : method === 'manual' ? 'MESURES MANUELLES' : 'SCAN AUTOMATIQUE'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {method === 'choice' && (
            <MethodChoiceScreen key="choice" onSelectMethod={setMethod} />
          )}
          {method === 'manual' && (
            <ManualMeasurementsWizard
              key="manual"
              onComplete={() => {
                setMethod('choice')
                // TODO: Afficher un toast de succès
              }}
              onCancel={() => setMethod('choice')}
            />
          )}
          {method === 'scan' && (
            <ScanMeasurementsFlow
              key="scan"
              userId={user.id}
              onComplete={() => {
                setMethod('choice')
                // TODO: Afficher un toast de succès
              }}
              onCancel={() => setMethod('choice')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MethodChoiceScreen({ onSelectMethod }: { onSelectMethod: (method: 'manual' | 'scan') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Introduction */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-serif text-[#D4AF37] tracking-[0.1em]">
          Comment souhaitez-vous prendre vos mesures ?
        </h2>
        <p className="text-sm text-white/60">
          Choisissez la méthode qui vous convient le mieux
        </p>
      </div>

      {/* Cartes de choix */}
      <div className="grid gap-4">
        {/* Méthode Manuelle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMethod('manual')}
          className="relative p-6 rounded-2xl bg-white/5 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-[#D4AF37]/20 p-3 rounded-xl group-hover:bg-[#D4AF37]/30 transition-colors">
              <Ruler className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-serif text-[#D4AF37] mb-2 tracking-[0.1em]">
                Prendre mes mesures manuellement
              </h3>
              <p className="text-sm text-white/70 mb-3">
                Guidé étape par étape avec un mètre. Méthode classique et précise.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#D4AF37]/80">
                <CheckCircle2 className="w-4 h-4" />
                <span>Gratuit • Précision maximale</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-[#D4AF37]/40 rotate-180" />
          </div>
        </motion.button>

        {/* Méthode Automatique */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMethod('scan')}
          className="relative p-6 rounded-2xl bg-white/5 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-[#D4AF37]/20 p-3 rounded-xl group-hover:bg-[#D4AF37]/30 transition-colors">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-serif text-[#D4AF37] mb-2 tracking-[0.1em]">
                Mesures automatiques par scan
              </h3>
              <p className="text-sm text-white/70 mb-3">
                Scan du corps assisté par IA. Plus rapide et moderne.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#D4AF37]/80 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>1er scan gratuit • Scans suivants : 1$</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/50">
                <AlertCircle className="w-3 h-3" />
                <span>Mesures estimées par IA – validation recommandée</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-[#D4AF37]/40 rotate-180" />
          </div>
        </motion.button>
      </div>

      {/* Information rassurante */}
      <div className="mt-8 p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
        <p className="text-xs text-white/70 text-center">
          💡 Vous pouvez changer de méthode à tout moment. Vos mesures sont sécurisées et confidentielles.
        </p>
      </div>
    </motion.div>
  )
}

