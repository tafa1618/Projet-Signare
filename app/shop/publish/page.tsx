'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { 
  Upload, 
  X, 
  Camera,
  Store,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  Shirt,
  Calendar,
  Users,
  Palette
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  FABRIC_TAGS,
  EVENT_TAGS,
  GENDER_TAGS,
  COLOR_TAGS,
  type FabricTag,
  type EventTag,
  type GenderTag,
  type ColorTag,
} from '@/shared/constants/ai-tags'

type SellerType = 'tailleur' | 'consumer'

export default function ShopPublishPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [sellerType, setSellerType] = useState<SellerType>('consumer')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Métadonnées optionnelles pour améliorer les recommandations IA
  const [selectedFabric, setSelectedFabric] = useState<FabricTag | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventTag | null>(null)
  const [selectedGender, setSelectedGender] = useState<GenderTag | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorTag | null>(null)

  // Récupérer l'image depuis les query params si c'est un tailleur
  useEffect(() => {
    const imageParam = searchParams.get('image')
    const typeParam = searchParams.get('type')
    
    if (imageParam && typeParam === 'tailleur') {
      setSellerType('tailleur')
      setMediaPreviews([imageParam])
    }
  }, [searchParams])

  const categories = ['Boubou', 'Robe', 'Kaftan', 'Tenue', 'Accessoire', 'Autre']

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
    if (!title.trim() || !price.trim() || mediaPreviews.length === 0) return

    setIsSubmitting(true)

    // Préparer les données avec métadonnées optionnelles
    const productData = {
      title: title.trim(),
      description: description.trim() || null, // Optionnel
      price: parseFloat(price),
      category: category || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      // Métadonnées optionnelles pour améliorer les recommandations IA
      metadata: {
        fabric: selectedFabric || null,
        event: selectedEvent || null,
        gender: selectedGender || null,
        color: selectedColor || null,
      },
      sellerType,
      mediaFiles: mediaPreviews.length,
    }

    // Envoyer les données à l'API
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la publication')
      }

      // Afficher le message de succès
      setShowSuccess(true)
      setTimeout(() => {
        router.push('/shop')
      }, 2000)
    } catch (error) {
      console.error('Erreur publication:', error)
      // TODO: Afficher un toast d'erreur
      setIsSubmitting(false)
    }

    setIsSubmitting(false)
    setShowSuccess(true)

    // Rediriger après 3 secondes
    setTimeout(() => {
      router.push('/shop')
    }, 3000)
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
              <Store className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em]">
                {sellerType === 'tailleur' ? 'Publier sur le Shop' : 'Vendre un Produit'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Seller Type Info */}
          {sellerType === 'consumer' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-yellow-500 mb-1">Vente C2C</p>
                <p className="text-[10px] sm:text-xs text-white/70">
                  Votre produit sera publié après validation par notre équipe. Vous recevrez une notification une fois approuvé.
                </p>
              </div>
            </motion.div>
          )}

          {/* Media Upload */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
              Photos du produit {sellerType === 'tailleur' && '(déjà sélectionnée)'}
            </label>
            
            {mediaPreviews.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/5] sm:aspect-[3/4] max-h-[400px] sm:max-h-[450px] border-2 border-dashed border-[#D4AF37]/30 rounded-xl flex flex-col items-center justify-center gap-2 sm:gap-3 hover:border-[#D4AF37]/50 transition-colors"
              >
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37]/50" />
                <span className="text-xs text-white/50">Ajouter des photos</span>
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
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Boubou Royale Wax Premium"
              className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
              required
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="75000"
                className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              >
                <option value="">Sélectionner</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0A0A0A]">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Métadonnées optionnelles pour améliorer les recommandations IA */}
          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#D4AF37]" />
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                Métadonnées (optionnel) - Pour améliorer les recommandations IA
              </label>
            </div>
            <p className="text-[10px] sm:text-[11px] text-white/50">
              Ces informations aident notre IA à mieux recommander votre produit aux clients intéressés
            </p>

            {/* Tissu */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shirt size={12} className="text-[#D4AF37]" />
                <label className="text-[10px] sm:text-[11px] text-white/70 uppercase tracking-[0.1em]">
                  Tissu
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {FABRIC_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedFabric(selectedFabric === tag.id ? null : tag.id)}
                    className={cn(
                      "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition-all",
                      selectedFabric === tag.id
                        ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30"
                    )}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Événement */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-[#D4AF37]" />
                <label className="text-[10px] sm:text-[11px] text-white/70 uppercase tracking-[0.1em]">
                  Événement
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {EVENT_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedEvent(selectedEvent === tag.id ? null : tag.id)}
                    className={cn(
                      "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition-all",
                      selectedEvent === tag.id
                        ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30"
                    )}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users size={12} className="text-[#D4AF37]" />
                <label className="text-[10px] sm:text-[11px] text-white/70 uppercase tracking-[0.1em]">
                  Genre / Âge
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {GENDER_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedGender(selectedGender === tag.id ? null : tag.id)}
                    className={cn(
                      "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition-all",
                      selectedGender === tag.id
                        ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30"
                    )}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Couleur */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette size={12} className="text-[#D4AF37]" />
                <label className="text-[10px] sm:text-[11px] text-white/70 uppercase tracking-[0.1em]">
                  Couleur
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedColor(selectedColor === tag.id ? null : tag.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition-all",
                      selectedColor === tag.id
                        ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30"
                    )}
                  >
                    {tag.id !== 'multicolore' && (
                      <div
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    {tag.id === 'multicolore' && (
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 via-blue-400 to-orange-400 border border-white/30" />
                    )}
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags (ancien champ) */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
              Tags supplémentaires (séparés par des virgules)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: Premium, Broderie, Main"
              className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          {/* Description - Déplacée en bas et non obligatoire */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-[0.15em]">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre produit (optionnel)..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!title.trim() || !price.trim() || mediaPreviews.length === 0 || isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2.5 sm:py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Publication...' : sellerType === 'tailleur' ? 'Publier sur le Shop' : 'Mettre en vente'}
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
            onClick={() => router.push('/shop')}
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
                  Publication réussie !
                </h2>
                {sellerType === 'consumer' ? (
                  <p className="text-sm sm:text-base text-white/70">
                    Votre produit est en attente de validation par notre équipe. Vous recevrez une notification une fois approuvé.
                  </p>
                ) : (
                  <p className="text-sm sm:text-base text-white/70">
                    Votre création a été publiée sur le shop avec succès !
                  </p>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/shop')}
                className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em]"
              >
                Voir le shop
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

