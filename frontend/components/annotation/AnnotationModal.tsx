/**
 * FRONTEND - Modale d'Annotation
 * @ai-context Système de labeling manuel pour créer des données supervisées
 * Alimente la table post_annotations pour entraînement IA
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Star } from 'lucide-react'
import { AnnotationService } from '@/backend/services/ml-collection'
import type { Post } from '@/shared/types/database.types'
import Image from 'next/image'

interface AnnotationModalProps {
  post: Post
  userId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Modale de labeling/annotation pour les experts
 * @ai-context Crée des données supervisées de qualité pour le ML
 */
export function AnnotationModal({
  post,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: AnnotationModalProps) {
  const [verifiedGarmentType, setVerifiedGarmentType] = useState(
    post.garment_type
  )
  const [verifiedFabricType, setVerifiedFabricType] = useState(
    post.fabric_type || ''
  )
  const [verifiedComplexity, setVerifiedComplexity] = useState(post.complexity)
  const [imageQuality, setImageQuality] = useState(4)
  const [culturalAuthenticity, setCulturalAuthenticity] = useState(4)
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await AnnotationService.annotate({
        postId: post.id,
        annotatorId: userId,
        verifiedGarmentType,
        verifiedFabricType: verifiedFabricType || undefined,
        verifiedComplexity,
        imageQualityScore: imageQuality,
        culturalAuthenticityScore: culturalAuthenticity,
        notes: notes || undefined,
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Erreur annotation:', error)
      alert('Erreur lors de l\'annotation')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-noir/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-noir border-2 border-or/30 rounded-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-or/20 flex items-center justify-between">
              <h2 className="text-xl font-serif text-or">
                Vérification & Labeling
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-or/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-blanc/70" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Image preview */}
              <div className="relative aspect-[4/5] mb-6 rounded-lg overflow-hidden">
                <Image
                  src={post.image_url}
                  alt="Post à annoter"
                  fill
                  className="object-cover"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de vêtement vérifié */}
                <div>
                  <label className="block text-or text-sm font-medium mb-2">
                    Type de vêtement (vérifié)
                  </label>
                  <select
                    value={verifiedGarmentType}
                    onChange={(e) => setVerifiedGarmentType(e.target.value as any)}
                    className="w-full bg-noir border border-or/30 rounded-lg px-4 py-3 text-blanc focus:outline-none focus:border-or"
                  >
                    <option value="boubou">Boubou</option>
                    <option value="robe">Robe</option>
                    <option value="kaftan">Kaftan</option>
                    <option value="ensemble">Ensemble</option>
                    <option value="accessoire">Accessoire</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Type de tissu vérifié */}
                <div>
                  <label className="block text-or text-sm font-medium mb-2">
                    Type de tissu (vérifié)
                  </label>
                  <input
                    type="text"
                    value={verifiedFabricType}
                    onChange={(e) => setVerifiedFabricType(e.target.value)}
                    placeholder="Ex: basin, wax, dentelle, soie..."
                    className="w-full bg-noir border border-or/30 rounded-lg px-4 py-3 text-blanc placeholder-blanc/30 focus:outline-none focus:border-or"
                  />
                </div>

                {/* Complexité vérifiée */}
                <div>
                  <label className="block text-or text-sm font-medium mb-2">
                    Complexité (vérifiée)
                  </label>
                  <select
                    value={verifiedComplexity}
                    onChange={(e) => setVerifiedComplexity(e.target.value as any)}
                    className="w-full bg-noir border border-or/30 rounded-lg px-4 py-3 text-blanc focus:outline-none focus:border-or"
                  >
                    <option value="simple">Simple</option>
                    <option value="moyen">Moyen</option>
                    <option value="complexe">Complexe</option>
                    <option value="haute_couture">Haute Couture</option>
                  </select>
                </div>

                {/* Qualité de l'image */}
                <div>
                  <label className="block text-or text-sm font-medium mb-2">
                    Qualité de l'image : {imageQuality}/5
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setImageQuality(score)}
                        className="p-2 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            score <= imageQuality
                              ? 'fill-or text-or'
                              : 'text-blanc/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-blanc/40 mt-2">
                    Netteté, éclairage, cadrage
                  </p>
                </div>

                {/* Authenticité culturelle */}
                <div>
                  <label className="block text-or text-sm font-medium mb-2">
                    Authenticité culturelle : {culturalAuthenticity}/5
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setCulturalAuthenticity(score)}
                        className="p-2 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            score <= culturalAuthenticity
                              ? 'fill-or text-or'
                              : 'text-blanc/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-blanc/40 mt-2">
                    Respect des traditions sénégalaises
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-blanc/70 text-sm mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Observations, corrections, détails..."
                    className="w-full bg-noir border border-or/30 rounded-lg px-4 py-3 text-blanc placeholder-blanc/30 focus:outline-none focus:border-or resize-none"
                  />
                </div>

                {/* Info ML */}
                <div className="p-3 bg-or/10 border border-or/30 rounded-lg">
                  <p className="text-xs text-or/80">
                    <span className="font-medium">📊 Contribution ML :</span> Vos
                    annotations créent des données supervisées de qualité pour
                    entraîner les modèles d'IA.
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-or/30 rounded-lg text-blanc/70 hover:bg-or/10 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-or text-noir rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-or-clair transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-noir/20 border-t-noir rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Valider l'annotation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

