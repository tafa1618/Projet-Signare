'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, Ruler, Loader2 } from 'lucide-react'
import { useMeasurements } from '@/frontend/hooks/useMeasurements'

interface MeasurementStep {
  id: string
  label: string
  field: keyof MeasurementsData
  unit: string
  icon?: string
  description?: string
}

interface MeasurementsData {
  chest: number | null // Tour de poitrine
  neck: number | null // Tour de cou
  thigh: number | null // Tour de cuisse
  waist: number | null // Tour de taille
  hips: number | null // Tour de hanches
  shoulders: number | null // Largeur épaules
  arm_length: number | null // Longueur bras
  biceps: number | null // Tour de biceps
  leg_length: number | null // Longueur pantalon
}

const MEASUREMENT_STEPS: MeasurementStep[] = [
  {
    id: 'chest',
    label: 'Tour de poitrine',
    field: 'chest',
    unit: 'cm',
    description: 'Mesurez autour de la poitrine, au niveau le plus large',
  },
  {
    id: 'neck',
    label: 'Tour de cou',
    field: 'neck',
    unit: 'cm',
    description: 'Mesurez autour du cou, à la base',
  },
  {
    id: 'waist',
    label: 'Tour de taille',
    field: 'waist',
    unit: 'cm',
    description: 'Au niveau le plus étroit de la taille',
  },
  {
    id: 'hips',
    label: 'Tour de hanches',
    field: 'hips',
    unit: 'cm',
    description: 'Autour des hanches, au niveau le plus large',
  },
  {
    id: 'shoulders',
    label: 'Largeur épaules',
    field: 'shoulders',
    unit: 'cm',
    description: 'D\'une épaule à l\'autre',
  },
  {
    id: 'arm_length',
    label: 'Longueur bras',
    field: 'arm_length',
    unit: 'cm',
    description: 'De l\'épaule jusqu\'au poignet',
  },
  {
    id: 'biceps',
    label: 'Tour de biceps',
    field: 'biceps',
    unit: 'cm',
    description: 'Autour du biceps, au niveau le plus large',
  },
  {
    id: 'thigh',
    label: 'Tour de cuisse',
    field: 'thigh',
    unit: 'cm',
    description: 'Autour de la cuisse, au niveau le plus large',
  },
  {
    id: 'leg_length',
    label: 'Longueur pantalon',
    field: 'leg_length',
    unit: 'cm',
    description: 'De la taille jusqu\'à la cheville',
  },
]

export default function ManualMeasurementsWizard({
  onComplete,
  onCancel,
}: {
  onComplete: () => void
  onCancel: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [measurements, setMeasurements] = useState<MeasurementsData>({
    chest: null,
    neck: null,
    thigh: null,
    waist: null,
    hips: null,
    shoulders: null,
    arm_length: null,
    biceps: null,
    leg_length: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { submitManualMeasurements } = useMeasurements()

  const currentMeasurement = MEASUREMENT_STEPS[currentStep]
  const isLastStep = currentStep === MEASUREMENT_STEPS.length - 1
  const canProceed = measurements[currentMeasurement.field] !== null && measurements[currentMeasurement.field]! > 0

  const handleNext = () => {
    if (canProceed && !isLastStep) {
      setCurrentStep(currentStep + 1)
    } else if (isLastStep && canProceed) {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Convertir les données au format attendu par l'API
      const payload = {
        method: 'manual' as const,
        measurements: {
          chest: measurements.chest,
          neck: measurements.neck,
          waist: measurements.waist,
          hips: measurements.hips,
          shoulders: measurements.shoulders,
          arm_length: measurements.arm_length,
          thigh: measurements.thigh,
          biceps: measurements.biceps,
          leg_length: measurements.leg_length,
        },
      }

      await submitManualMeasurements(payload)
      onComplete()
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      // TODO: Afficher un toast d'erreur
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateMeasurement = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    setMeasurements({
      ...measurements,
      [currentMeasurement.field]: numValue,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span>Étape {currentStep + 1} sur {MEASUREMENT_STEPS.length}</span>
          <span>{Math.round(((currentStep + 1) / MEASUREMENT_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#D4AF37] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / MEASUREMENT_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white/5 rounded-2xl p-6 border border-[#D4AF37]/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/20 mb-4">
            <Ruler className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h3 className="text-xl font-serif text-[#D4AF37] mb-2 tracking-[0.1em]">
            {currentMeasurement.label}
          </h3>
          {currentMeasurement.description && (
            <p className="text-sm text-white/60">{currentMeasurement.description}</p>
          )}
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={measurements[currentMeasurement.field] || ''}
              onChange={(e) => updateMeasurement(e.target.value)}
              placeholder="0"
              className="w-full text-4xl font-bold text-center bg-white/5 border-2 border-[#D4AF37]/30 rounded-xl py-6 px-4 text-[#D4AF37] focus:border-[#D4AF37] focus:outline-none transition-colors"
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-white/40">
              {currentMeasurement.unit}
            </div>
          </div>

          {/* Validation indicator */}
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-[#D4AF37]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mesure enregistrée</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentStep === 0 ? 'Annuler' : 'Précédent'}
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#D4AF37]/90 transition-colors text-sm font-black uppercase tracking-[0.1em] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Envoi...
            </>
          ) : isLastStep ? (
            <>
              Valider
              <CheckCircle2 className="w-4 h-4" />
            </>
          ) : (
            <>
              Suivant
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

