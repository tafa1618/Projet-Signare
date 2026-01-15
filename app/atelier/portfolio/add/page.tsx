'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Upload, 
  X, 
  Camera,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ImageIcon,
  Tag
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/frontend/hooks/useAuth'

const GARMENT_TYPES = [
  { id: 'boubou', label: 'Boubou' },
  { id: 'robe', label: 'Robe' },
  { id: 'kaftan', label: 'Kaftan' },
  { id: 'ensemble', label: 'Ensemble' },
  { id: 'accessoire', label: 'Accessoire' },
  { id: 'autre', label: 'Autre' },
]

const COMPLEXITY_LEVELS = [
  { id: 'simple', label: 'Simple' },
  { id: 'moyen', label: 'Moyen' },
  { id: 'complexe', label: 'Complexe' },
  { id: 'haute_couture', label: 'Haute Couture' },
]

export default function AddPortfolioItemPage() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [garmentType, setGarmentType] = useState('')
  const [complexity, setComplexity] = useState('')
  const [tags, setTags] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newFiles = [...mediaFiles, ...files]
    setMediaFiles(newFiles)

    // Générer les previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setMediaPreviews([...mediaPreviews, ...newPreviews])
  }

  const removeMedia = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => {
      const previewIndex = mediaPreviews.length - mediaFiles.length + i
      return previewIndex !== index
    })
    const newPreviews = mediaPreviews.filter((_, i) => i !== index)
    
    setMediaFiles(newFiles)
    setMediaPreviews(newPreviews)
    if (currentMediaIndex >= newPreviews.length) {
      setCurrentMediaIndex(Math.max(0, newPreviews.length - 1))
    }
  }

  const goToNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaPreviews.length)
  }

  const goToPrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaPreviews.length) % mediaPreviews.length)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mediaPreviews.length === 0) return

    setIsSubmitting(true)

    // Préparer les données du portfolio
    const portfolioData = {
      title: title.trim() || null,
      description: description.trim() || null,
      garment_type: garmentType || null,
      complexity: complexity || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      mediaFiles: mediaPreviews.length,
      // TODO: Upload des images vers Supabase Storage
      // TODO: Enregistrer dans la table portfolio ou posts
    }

    try {
      // TODO: Implémenter l'upload vers Supabase Storage
      // TODO: Créer l'entrée dans la base de données
      
      // Simulation pour l'instant
      await new Promise(resolve => setTimeout(resolve, 1500))

      setShowSuccess(true)
      setTimeout(() => {
        router.push('/profil')
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de l\'ajout au portfolio:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em]">
                Ajouter au Portfolio
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-3 sm:p-4 flex items-start gap-3"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-[#D4AF37] mb-1">Portfolio Atelier</p>
              <p className="text-[10px] sm:text-xs text-white/70">
                Ajoutez vos créations pour enrichir votre portfolio. Ces images seront visibles sur votre profil et pourront être publiées sur le shop plus tard.
              </p>
            </div>
          </motion.div>

          {/* Media Upload */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
              Photos de la création *
            </label>
            
            {mediaPreviews.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/5] sm:aspect-[3/4] max-h-[400px] sm:max-h-[450px] border-2 border-dashed border-[#D4AF37]/30 rounded-xl flex flex-col items-center justify-center gap-2 sm:gap-3 hover:border-[#D4AF37]/50 transition-colors"
              >
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37]/50" />
                <span className="text-xs text-white/50">Ajouter des photos</span>
                <span className="text-[10px] text-white/40">Jusqu'à 5 photos</span>
              </button>
            ) : (
              <div className="relative aspect-[4/5] sm:aspect-[3/4] max-h-[400px] sm:max-h-[450px] rounded-xl overflow-hidden border border-[#D4AF37]/20">
                <Image
                  src={mediaPreviews[currentMediaIndex]}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                
                {mediaPreviews.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPrevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-10"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-10"
                    >
                      <ChevronRight size={18} />
                    </button>
                    
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {mediaPreviews.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            idx === currentMediaIndex ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-white/30"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => removeMedia(currentMediaIndex)}
                  className="absolute top-2 right-2 bg-black/50 backdrop-blur-md rounded-full p-1.5 text-white/80 hover:text-red-400 transition-colors z-10"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {mediaPreviews.length > 0 && mediaPreviews.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 sm:py-2.5 border border-[#D4AF37]/30 rounded-lg text-xs text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={14} />
                Ajouter d'autres photos ({mediaPreviews.length}/5)
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleMediaChange}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Boubou Royale Brodé"
              className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          {/* Garment Type & Complexity */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                Type de vêtement
              </label>
              <select
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value)}
                className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              >
                <option value="">Sélectionner</option>
                {GARMENT_TYPES.map(type => (
                  <option key={type.id} value={type.id} className="bg-[#0A0A0A]">{type.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                Complexité
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              >
                <option value="">Sélectionner</option>
                {COMPLEXITY_LEVELS.map(level => (
                  <option key={level.id} value={level.id} className="bg-[#0A0A0A]">{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                Tags (séparés par des virgules)
              </label>
            </div>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: Broderie, Perlé, Cérémonie"
              className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-[0.15em]">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre création..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={mediaPreviews.length === 0 || isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2.5 sm:py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter au Portfolio'}
          </motion.button>
        </form>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => router.push('/profil')}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4"
            >
              <div className="bg-[#D4AF37]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37] mb-2">
                  Création ajoutée !
                </h2>
                <p className="text-sm sm:text-base text-white/70">
                  Votre création a été ajoutée à votre portfolio avec succès.
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/profil')}
                className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em]"
              >
                Voir mon profil
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

