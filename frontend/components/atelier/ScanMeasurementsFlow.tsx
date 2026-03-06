'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Video, Upload, CheckCircle2, AlertCircle, Loader2, X, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useMeasurements } from '@/frontend/hooks/useMeasurements'

type ScanStep = 'choice' | 'front' | 'side' | 'review' | 'processing'

interface MediaFiles {
  front: File | null
  side: File | null
  video: File | null
}

export default function ScanMeasurementsFlow({
  onComplete,
  onCancel,
}: {
  onComplete: () => void
  onCancel: () => void
}) {
  const [step, setStep] = useState<ScanStep>('choice')
  const [mediaType, setMediaType] = useState<'photos' | 'video'>('photos')
  const [mediaFiles, setMediaFiles] = useState<MediaFiles>({
    front: null,
    side: null,
    video: null,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const { submitScanMeasurements } = useMeasurements()

  const frontInputRef = useRef<HTMLInputElement>(null)
  const sideInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleMediaTypeSelect = (type: 'photos' | 'video') => {
    setMediaType(type)
    if (type === 'photos') {
      setStep('front')
    } else {
      setStep('review')
    }
  }

  const handleFileSelect = (type: 'front' | 'side' | 'video', file: File | null) => {
    setMediaFiles({
      ...mediaFiles,
      [type]: file,
    })
    
    if (type === 'front' && mediaType === 'photos') {
      setStep('side')
    } else if (type === 'side' && mediaType === 'photos') {
      setStep('review')
    }
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    try {
      await submitScanMeasurements({
        front: mediaFiles.front ?? undefined,
        side: mediaFiles.side ?? undefined,
        video: mediaFiles.video ?? undefined,
      })
      onComplete()
    } catch (error) {
      console.error('Erreur lors du scan:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {step === 'choice' && (
          <MediaTypeChoice
            key="choice"
            onSelectType={handleMediaTypeSelect}
            onCancel={onCancel}
          />
        )}

        {step === 'front' && (
          <PhotoCaptureStep
            key="front"
            title="Photo de face"
            description="Tenez-vous droit, face à la caméra, vêtements près du corps"
            file={mediaFiles.front}
            onFileSelect={(file) => handleFileSelect('front', file)}
            onBack={() => setStep('choice')}
            inputRef={frontInputRef}
          />
        )}

        {step === 'side' && (
          <PhotoCaptureStep
            key="side"
            title="Photo de profil"
            description="Tournez-vous de profil, gardez la même posture"
            file={mediaFiles.side}
            onFileSelect={(file) => handleFileSelect('side', file)}
            onBack={() => setStep('front')}
            inputRef={sideInputRef}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            key="review"
            mediaType={mediaType}
            mediaFiles={mediaFiles}
            onBack={() => {
              if (mediaType === 'photos') {
                setStep('side')
              } else {
                setStep('choice')
              }
            }}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
          />
        )}

        {step === 'processing' && (
          <ProcessingStep key="processing" />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MediaTypeChoice({
  onSelectType,
  onCancel,
}: {
  onSelectType: (type: 'photos' | 'video') => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-xl font-serif text-[#D4AF37] tracking-[0.1em]">
          Choisissez votre format
        </h3>
        <p className="text-sm text-white/60">
          Photos ou vidéo, c'est vous qui choisissez
        </p>
      </div>

      <div className="grid gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectType('photos')}
          className="p-6 rounded-2xl bg-white/5 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#D4AF37]/20 p-3 rounded-xl">
              <Camera className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#D4AF37] mb-1">2 Photos</h4>
              <p className="text-sm text-white/70">Face + Profil</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#D4AF37]/40" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectType('video')}
          className="p-6 rounded-2xl bg-white/5 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#D4AF37]/20 p-3 rounded-xl">
              <Video className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#D4AF37] mb-1">1 Vidéo</h4>
              <p className="text-sm text-white/70">15-30 secondes, verticale</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#D4AF37]/40" />
          </div>
        </motion.button>
      </div>

      {/* Consignes */}
      <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
          <div className="text-xs text-white/70 space-y-1">
            <p className="font-semibold">Consignes importantes :</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Vêtements près du corps</li>
              <li>Posture droite, naturelle</li>
              <li>Bonne luminosité</li>
              <li>Fond neutre si possible</li>
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={onCancel}
        className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold"
      >
        Annuler
      </button>
    </motion.div>
  )
}

function PhotoCaptureStep({
  title,
  description,
  file,
  onFileSelect,
  onBack,
  inputRef,
}: {
  title: string
  description: string
  file: File | null
  onFileSelect: (file: File | null) => void
  onBack: () => void
  inputRef: React.RefObject<HTMLInputElement>
}) {
  const [preview, setPreview] = useState<string | null>(file ? URL.createObjectURL(file) : null)

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Cleanup previous preview
      if (preview) {
        URL.revokeObjectURL(preview)
      }
      onFileSelect(selectedFile)
      const newPreview = URL.createObjectURL(selectedFile)
      setPreview(newPreview)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-serif text-[#D4AF37] tracking-[0.1em]">
          {title}
        </h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>

      {/* Preview ou placeholder */}
      <div className="relative aspect-[9/16] rounded-2xl bg-white/5 border-2 border-dashed border-[#D4AF37]/30 overflow-hidden">
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-16 h-16 text-[#D4AF37]/40" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full py-4 rounded-xl bg-[#D4AF37] text-[#0A0A0A] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-[#D4AF37]/90 transition-colors"
      >
        <Upload className="w-5 h-5" />
        {file ? 'Changer la photo' : 'Prendre une photo'}
      </button>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20"
        >
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
          <span className="text-sm text-white/80 flex-1 truncate">{file.name}</span>
          <button
            onClick={() => {
              if (preview) {
                URL.revokeObjectURL(preview)
              }
              onFileSelect(null)
              setPreview(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="text-white/40 hover:text-white/60"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold"
      >
        Retour
      </button>
    </motion.div>
  )
}

function ReviewStep({
  mediaType,
  mediaFiles,
  onBack,
  onSubmit,
  isProcessing,
}: {
  mediaType: 'photos' | 'video'
  mediaFiles: MediaFiles
  onBack: () => void
  onSubmit: () => void
  isProcessing: boolean
}) {
  const canSubmit = mediaType === 'photos' 
    ? (mediaFiles.front !== null && mediaFiles.side !== null)
    : mediaFiles.video !== null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-serif text-[#D4AF37] tracking-[0.1em]">
          Vérification
        </h3>
        <p className="text-sm text-white/60">
          Vérifiez que vos {mediaType === 'photos' ? 'photos' : 'vidéo'} sont correctes
        </p>
      </div>

      {/* Media previews */}
      <div className="space-y-4">
        {mediaType === 'photos' ? (
          <>
            {mediaFiles.front && (
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 border border-[#D4AF37]/20">
                <Image
                  src={URL.createObjectURL(mediaFiles.front)}
                  alt="Face"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#0A0A0A]/80 text-xs text-white">
                  Face
                </div>
              </div>
            )}
            {mediaFiles.side && (
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 border border-[#D4AF37]/20">
                <Image
                  src={URL.createObjectURL(mediaFiles.side)}
                  alt="Profil"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#0A0A0A]/80 text-xs text-white">
                  Profil
                </div>
              </div>
            )}
          </>
        ) : (
          mediaFiles.video && (
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 border border-[#D4AF37]/20">
              <video
                src={URL.createObjectURL(mediaFiles.video)}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          )
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-white/70">
            Les mesures seront estimées par IA. Une précision de +/- 1.5 cm est attendue. 
            Une validation manuelle est recommandée avant fabrication.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold"
        >
          Retour
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || isProcessing}
          className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#D4AF37]/90 transition-colors text-sm font-black uppercase tracking-[0.1em] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              Lancer le scan
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

function ProcessingStep() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-12"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D4AF37]/20">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-serif text-[#D4AF37] tracking-[0.1em]">
          Analyse en cours
        </h3>
        <p className="text-sm text-white/60">
          Notre IA analyse vos images pour estimer vos mesures...
        </p>
      </div>
    </motion.div>
  )
}
