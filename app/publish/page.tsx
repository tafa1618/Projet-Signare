'use client'

import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Camera, 
  Upload, 
  X, 
  Star, 
  Check, 
  Sparkles, 
  ChevronDown,
  Info,
  Video,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { Post } from '@/shared/types/database.types'

/**
 * PAGE - Publication Client
 * @ai-context Interface de capture de données luxe pour le dataset de recommandation et NLP
 */

type TailorOption = {
  id: string
  name: string
  avatar: string
  isMasterTailor?: boolean
}

// Mock des tailleurs (Salon Privé-like)
const MOCK_TAILORS: TailorOption[] = [
  { id: 't1', name: 'Atelier Fatou', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou', isMasterTailor: true },
  { id: 't2', name: 'Maison Ndèye', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ndeye', isMasterTailor: true },
  { id: 't3', name: 'Couture Aminata', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata' },
  { id: 't4', name: 'Dakar Luxe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dakar' }
]

const EVENT_STYLES = ['Mariage', 'Quotidien', 'Tabaski', 'Gala', 'Cérémonie'] as const

export default function PublishPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // États du formulaire
  const [mediaFiles, setMediaFiles] = useState<Array<{ id: string; url: string; type: 'image' | 'video' }>>([])
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [description, setDescription] = useState('')
  const [selectedTailorId, setSelectedTailorId] = useState<string>('')
  const [eventStyle, setEventStyle] = useState<(typeof EVENT_STYLES)[number] | ''>('')
  const [qualityRating, setQualityRating] = useState(0)
  const [showTailorMenu, setShowTailorMenu] = useState(false)
  
  // États UI
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Gestion des médias multiples (photos et vidéos)
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach((file) => {
      const reader = new FileReader()
      const isVideo = file.type.startsWith('video/')
      
      reader.onloadend = () => {
        setMediaFiles((prev) => [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            url: reader.result as string,
            type: isVideo ? 'video' : 'image',
          },
        ])
      }
      
      if (isVideo) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  const removeMedia = (id: string) => {
    setMediaFiles((prev) => {
      const newFiles = prev.filter((f) => f.id !== id)
      if (currentMediaIndex >= newFiles.length && newFiles.length > 0) {
        setCurrentMediaIndex(newFiles.length - 1)
      } else if (newFiles.length === 0) {
        setCurrentMediaIndex(0)
      }
      return newFiles
    })
  }

  const goToNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaFiles.length)
  }

  const goToPrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaFiles.length) % mediaFiles.length)
  }

  const selectedTailor = useMemo(
    () => MOCK_TAILORS.find((t) => t.id === selectedTailorId) ?? null,
    [selectedTailorId]
  )

  // Publication (Simulation)
  const handlePublish = async () => {
    if (mediaFiles.length === 0 || !selectedTailorId || !eventStyle) return
    
    setIsPublishing(true)
    
    // Simulation de l'objet newPost conforme aux database.types.ts
    const newPost: Partial<Post> = {
      user_id: 'current-user-id',
      image_url: mediaFiles[0].url, // Première image/vidéo comme principale
      caption: description,
      garment_type: 'autre', // À extraire via IA idéalement
      event_style: eventStyle,
      quality_rating: qualityRating || null,
      // pour rester compatible avec le schéma ML-Ready existant
      occasion_tags: eventStyle ? [eventStyle.toLowerCase()] : [],
      style_tags: eventStyle ? [eventStyle.toLowerCase()] : [],
      is_commissioned: true,
      created_at: new Date().toISOString(),
      // Stocker tous les médias (à adapter selon le schéma DB)
      // media_urls: mediaFiles.map(m => m.url),
    }

    console.log('Publication de la donnée ML-Ready:', newPost)
    console.log('Médias:', mediaFiles)

    // Simulation de délai réseau
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsPublishing(false)
    setShowSuccess(true)
    
    // Redirection après 3 secondes
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  return (
    <div className="bg-[#0A0A0A] text-white overflow-hidden h-[calc(100dvh-80px)] -mb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <h1 className="text-lg font-serif text-[#D4AF37] tracking-[0.2em] uppercase">PARTAGER MON STYLE</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto px-6 pt-5 pb-28 h-full overflow-y-auto space-y-5"
      >
        {/* 1. UPLOAD MÉDIAS MULTIPLES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37] font-black">
              {mediaFiles.length > 0 ? `${mediaFiles.length} média${mediaFiles.length > 1 ? 's' : ''}` : 'Photos & Vidéos'}
            </label>
            {mediaFiles.length > 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] text-[#D4AF37] hover:underline uppercase tracking-[0.18em] font-bold"
              >
                + Ajouter
              </button>
            )}
          </div>
          
          {mediaFiles.length > 0 ? (
            <div className="relative">
              {/* Carrousel de médias */}
              <div className="relative aspect-[4/5] max-h-[40vh] overflow-hidden rounded-2xl bg-neutral-900">
                {mediaFiles.map((media, index) => (
                  <div
                    key={media.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-300",
                      index === currentMediaIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                  >
                    {media.type === 'video' ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <Image src={media.url} alt={`Média ${index + 1}`} fill className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    
                    {/* Bouton supprimer */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeMedia(media.id)
                      }}
                      className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                      aria-label="Retirer le média"
                    >
                      <X size={16} />
                    </button>
                    
                    {/* Badge type */}
                    {media.type === 'video' && (
                      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-full px-2.5 py-1 flex items-center gap-1.5 z-20">
                        <Video size={12} className="text-[#D4AF37]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/90">Vidéo</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Navigation carrousel */}
                {mediaFiles.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        goToPrevMedia()
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                      aria-label="Média précédent"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        goToNextMedia()
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                      aria-label="Média suivant"
                    >
                      <ChevronRight size={18} />
                    </button>
                    
                    {/* Indicateurs de position */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                      {mediaFiles.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentMediaIndex(index)
                          }}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            index === currentMediaIndex
                              ? "w-6 bg-[#D4AF37]"
                              : "w-1.5 bg-white/30 hover:bg-white/50"
                          )}
                          aria-label={`Aller au média ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Miniatures en bas */}
              {mediaFiles.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {mediaFiles.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={cn(
                        "relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                        index === currentMediaIndex
                          ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      {media.type === 'video' ? (
                        <>
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play size={12} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <Image src={media.url} alt={`Mini ${index + 1}`} fill className="object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border border-dashed border-[#D4AF37]/30 cursor-pointer transition-all bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/20 p-2.5 rounded-xl">
                    <Upload className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Ajouter des photos ou vidéos</p>
                    <p className="text-xs text-white/40">Glissez-déposez ou cliquez (plusieurs fichiers)</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-[#D4AF37]/50" />
              </div>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaChange}
            className="hidden"
            accept="image/*,video/*"
            multiple
          />
        </section>

        {/* 2. DESCRIPTION (NLP Ready) */}
        <AnimatePresence>
          {mediaFiles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <label className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37] font-black">L’histoire</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Occasion, compliments reçus, finitions du tailleur…"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm leading-relaxed placeholder:text-white/20 resize-none min-h-[84px]"
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* 3. TAILLEUR + STYLE (grille 2 colonnes) */}
        <AnimatePresence>
          {mediaFiles.length > 0 && description.trim().length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <label className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37] font-black">Détails</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tailleur picker (Salon Privé-like) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTailorMenu((v) => !v)}
                    className="w-full flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-3 hover:border-[#D4AF37]/20 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-full overflow-hidden border p-0.5 flex-shrink-0",
                        selectedTailor?.isMasterTailor ? "border-[#D4AF37]/50" : "border-white/10"
                      )}>
                        <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-900">
                          <Image
                            src={selectedTailor?.avatar ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Signare'}
                            alt="Tailleur"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-[9px] text-[#D4AF37]/70 uppercase tracking-[0.22em] font-black">Tailleur</p>
                        <p className="text-sm font-semibold text-white/90 truncate">
                          {selectedTailor?.name ?? 'Sélectionner'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown size={18} className="text-white/30" />
                  </button>

                  <AnimatePresence>
                    {showTailorMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute z-50 mt-2 w-full bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl overflow-hidden shadow-2xl"
                      >
                        {MOCK_TAILORS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedTailorId(t.id)
                              setShowTailorMenu(false)
                            }}
                            className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-[#D4AF37]/10 transition-colors"
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-full overflow-hidden border p-0.5",
                              t.isMasterTailor ? "border-[#D4AF37]/50" : "border-white/10"
                            )}>
                              <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-900">
                                <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white/90 truncate">{t.name}</p>
                              <p className="text-[9px] text-white/40 uppercase tracking-[0.22em] font-black">
                                {t.isMasterTailor ? 'Maître Tailleur' : 'Atelier'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Event style pills */}
                <div className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-3">
                  <p className="text-[9px] text-[#D4AF37]/70 uppercase tracking-[0.22em] font-black mb-2">Style d’événement</p>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_STYLES.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setEventStyle(eventStyle === tag ? '' : tag)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border",
                          eventStyle === tag
                            ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0A0A] shadow-[0_0_14px_rgba(212,175,55,0.25)]"
                            : "bg-[#0A0A0A] border-[#D4AF37]/20 text-white/60 hover:border-[#D4AF37]/40 hover:text-white/80"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 4. QUALITY RATING (Sentiment Analysis Ready) */}
        <AnimatePresence>
          {mediaFiles.length > 0 && description.trim().length > 0 && selectedTailorId && eventStyle && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37] font-black">Satisfaction</label>
                <span className="text-[10px] text-[#D4AF37] font-black tracking-[0.18em]">{qualityRating}/5</span>
              </div>

              <div className="flex items-center justify-between bg-white/[0.03] px-4 py-3 rounded-2xl border border-white/10">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQualityRating(star)}
                      className="transition-colors"
                      aria-label={`Note ${star}`}
                    >
                      <Star
                        size={22}
                        className={cn(
                          "transition-all duration-200",
                          star <= qualityRating
                            ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.35)]"
                            : "text-white/15"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>

                <span className="text-[10px] text-white/40 font-medium italic flex items-center gap-1">
                  <Info size={10} /> ML Sentiment
                </span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="h-10" />
      </motion.main>

      {/* Bouton Publier fixé (toujours accessible) */}
      <div className="fixed bottom-20 left-0 right-0 z-50 px-6">
        <div className="max-w-md mx-auto bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent pt-4">
          <motion.button
            whileHover={{ scale: 1.01, boxShadow: '0 0 28px rgba(212,175,55,0.35)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePublish}
            disabled={isPublishing || mediaFiles.length === 0 || !selectedTailorId || !eventStyle}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] font-black tracking-[0.22em] uppercase py-4 rounded-2xl shadow-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:grayscale"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isPublishing ? (
                <div className="w-5 h-5 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
              ) : (
                <>PUBLIER <Sparkles size={18} /></>
              )}
            </span>
          </motion.button>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0A0A0A] border border-[#D4AF37]/30 p-10 rounded-3xl text-center space-y-6 max-w-sm"
            >
              <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                <Check className="text-[#0A0A0A] w-10 h-10" strokeWidth={4} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif text-[#D4AF37]">Magnifique !</h2>
                <p className="text-white/60 text-sm leading-relaxed px-4">Votre création a été ajoutée avec succès à la collection Signare.</p>
              </div>
              <div className="pt-4">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                    className="h-full bg-[#D4AF37]"
                  />
                </div>
                <p className="text-[10px] text-[#D4AF37]/40 uppercase tracking-widest mt-4 font-bold">Retour au feed...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

