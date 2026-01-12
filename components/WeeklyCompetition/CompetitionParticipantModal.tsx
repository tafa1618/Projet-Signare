'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Image as ImageIcon, Video, Camera, User, Scissors, Check, Share2 } from 'lucide-react'
import Image from 'next/image'

export type MediaFormat = 'photos' | 'video'
export type CategoryType = 'homme' | 'femme' | 'tailleur'

interface ParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ParticipantSubmission) => void
  hasParticipated: boolean
}

export interface ParticipantSubmission {
  format: MediaFormat
  media: (File | string)[]
  category: CategoryType
  tailorId: string
  tailorName: string
  addToFeed?: boolean // Option pour ajouter au feed
}

export default function CompetitionParticipantModal({
  isOpen,
  onClose,
  onSubmit,
  hasParticipated,
}: ParticipantModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [format, setFormat] = useState<MediaFormat | null>(null)
  const [mediaFiles, setMediaFiles] = useState<(File | string)[]>([])
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [tailorId, setTailorId] = useState('')
  const [tailorName, setTailorName] = useState('')
  const [addToFeed, setAddToFeed] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Données mockées pour les tailleurs (sera remplacé par API)
  const tailors = [
    { id: 'tailor-1', name: 'Atelier Fatou' },
    { id: 'tailor-2', name: 'Maison Saliou' },
    { id: 'tailor-3', name: 'Studio Dakar Luxe' },
  ]

  const resetForm = () => {
    setStep(1)
    setFormat(null)
    setMediaFiles([])
    setCategory(null)
    setTailorId('')
    setTailorName('')
    setAddToFeed(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFormatSelect = (selectedFormat: MediaFormat) => {
    setFormat(selectedFormat)
    setMediaFiles([])
    setStep(2)
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!format) return

    if (format === 'photos') {
      // 2-3 photos maximum
      const allowedFiles = files.slice(0, 3 - mediaFiles.length)
      setMediaFiles([...mediaFiles, ...allowedFiles])
    } else {
      // 1 vidéo uniquement
      if (files.length > 0) {
        setMediaFiles([files[0]])
      }
    }
  }

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index))
  }

  const handleCategorySelect = (selectedCategory: CategoryType) => {
    setCategory(selectedCategory)
    setStep(3)
  }

  const handleTailorSelect = (id: string, name: string) => {
    setTailorId(id)
    setTailorName(name)
    setStep(4)
  }

  const handleSubmit = () => {
    if (!format || !category || !tailorId || mediaFiles.length === 0) return

    onSubmit({
      format,
      media: mediaFiles,
      category,
      tailorId,
      tailorName,
      addToFeed,
    })
    resetForm()
    onClose()
  }

  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return format !== null
      case 2:
        if (format === 'photos') {
          return mediaFiles.length >= 2 && mediaFiles.length <= 3
        } else {
          return mediaFiles.length === 1
        }
      case 3:
        return category !== null
      case 4:
        return tailorId !== ''
      default:
        return false
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto bg-[#0A0A0A] border-t sm:border border-[#D4AF37]/20 z-[210] sm:rounded-2xl sm:max-w-lg sm:w-full sm:max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#D4AF37]/10">
              <h2 className="text-lg font-serif text-[#D4AF37] tracking-[0.15em]">
                Participer
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Progress */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-1 rounded-full ${
                      s <= step ? 'bg-[#D4AF37]' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {/* Step 1: Format Selection */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-white/70 text-sm mb-6">
                    Choisissez votre format de participation
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFormatSelect('photos')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        format === 'photos'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                      }`}
                    >
                      <ImageIcon className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                      <p className="text-white font-semibold mb-1">Photos</p>
                      <p className="text-white/50 text-xs">2 à 3 photos</p>
                      <p className="text-white/40 text-[10px] mt-1">Vue de face obligatoire</p>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFormatSelect('video')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        format === 'video'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                      }`}
                    >
                      <Video className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                      <p className="text-white font-semibold mb-1">Vidéo</p>
                      <p className="text-white/50 text-xs">15-30 secondes</p>
                      <p className="text-white/40 text-[10px] mt-1">Format vertical</p>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Media Upload */}
              {step === 2 && format && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/70 text-sm">
                      {format === 'photos' ? 'Ajoutez 2 à 3 photos' : 'Ajoutez votre vidéo'}
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-[#D4AF37] text-xs uppercase tracking-[0.18em]"
                    >
                      Retour
                    </button>
                  </div>

                  {/* Media Preview */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-white/5 border border-[#D4AF37]/20">
                        {typeof file === 'string' ? (
                          <Image src={file} alt={`Preview ${index + 1}`} fill className="object-cover" />
                        ) : format === 'video' ? (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        )}
                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Upload Button */}
                  {((format === 'photos' && mediaFiles.length < 3) || (format === 'video' && mediaFiles.length === 0)) && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (format === 'photos') {
                          fileInputRef.current?.click()
                        } else {
                          videoInputRef.current?.click()
                        }
                      }}
                      className="w-full p-6 border-2 border-dashed border-[#D4AF37]/40 rounded-xl hover:border-[#D4AF37] transition-colors"
                    >
                      <Camera className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-white/70 text-sm">
                        {format === 'photos' ? 'Ajouter des photos' : 'Ajouter une vidéo'}
                      </p>
                    </motion.button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </motion.div>
              )}

              {/* Step 3: Category Selection */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/70 text-sm">Choisissez une catégorie</p>
                    <button
                      onClick={() => setStep(2)}
                      className="text-[#D4AF37] text-xs uppercase tracking-[0.18em]"
                    >
                      Retour
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(['homme', 'femme', 'tailleur'] as CategoryType[]).map((cat) => (
                      <motion.button
                        key={cat}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(cat)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          category === cat
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold capitalize">
                              {cat === 'homme' ? 'Ndanane' : cat === 'femme' ? 'SIGNARE' : 'Tailleur'} de la semaine
                            </p>
                            <p className="text-white/50 text-xs mt-1">
                              {cat === 'tailleur' ? 'Pour les ateliers' : 'Pour les participants'}
                            </p>
                          </div>
                          {category === cat && <Check className="w-5 h-5 text-[#D4AF37]" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Tailor Selection */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/70 text-sm">Sélectionnez le tailleur</p>
                    <button
                      onClick={() => setStep(3)}
                      className="text-[#D4AF37] text-xs uppercase tracking-[0.18em]"
                    >
                      Retour
                    </button>
                  </div>
                  <div className="space-y-3">
                    {tailors.map((tailor) => (
                      <motion.button
                        key={tailor.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTailorSelect(tailor.id, tailor.name)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          tailorId === tailor.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
                              <Scissors className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">{tailor.name}</p>
                            </div>
                          </div>
                          {tailorId === tailor.id && <Check className="w-5 h-5 text-[#D4AF37]" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {step === 4 && (
              <div className="px-4 py-4 border-t border-[#D4AF37]/10 space-y-3">
                {/* Option pour ajouter au feed */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAddToFeed(!addToFeed)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    addToFeed
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                      : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Share2 className={`w-5 h-5 ${addToFeed ? 'text-[#D4AF37]' : 'text-white/60'}`} />
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">Ajouter au feed</p>
                      <p className="text-white/50 text-xs">Votre participation apparaîtra dans le feed principal</p>
                    </div>
                  </div>
                  {addToFeed && <Check className="w-5 h-5 text-[#D4AF37]" />}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!canProceedToNext() || hasParticipated}
                  className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl font-black uppercase tracking-[0.18em] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasParticipated ? 'Déjà participé cette semaine' : 'Valider ma participation'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

