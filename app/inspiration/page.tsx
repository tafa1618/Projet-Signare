'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Wand2,
  Camera,
  Sparkles,
  CheckCircle2,
  Upload,
  X,
  Loader2,
  Shirt,
  Calendar,
  Users,
  Palette,
  Scissors,
  Heart,
  Baby,
  User,
  UserCheck,
  Gift,
  Briefcase,
  PartyPopper,
  Moon,
  Sun,
  Image as ImageIcon,
  Info,
  ArrowRight,
  Check,
  ShoppingBag,
  MessageCircle,
  Star,
  MapPin,
  Verified,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  type InspirationPayload,
} from '@/shared/constants/ai-tags'
import { useAIService } from '@/hooks/useAIService'

// ==================== TYPES ====================

interface InspirationResult {
  id: string
  image_url: string
  prompt_used: string
  mode: string
  created_at: string
}

// ==================== ICÔNES POUR TAGS ====================

const FABRIC_ICONS: Record<string, any> = {
  wax: Shirt,
  getzner: Scissors,
  bazin: Sparkles,
  soie: Wand2,
  coton: Shirt,
}

const EVENT_ICONS: Record<string, any> = {
  tabaski: Moon,
  mariage: Heart,
  baptême: Gift,
  travail: Briefcase,
  sortie: PartyPopper,
}

const GENDER_ICONS: Record<string, any> = {
  'homme adulte': User,
  'femme adulte': UserCheck,
  garçon: Baby,
  fille: Baby,
}

// ==================== COMPOSANT PRINCIPAL ====================

export default function InspirationPage() {
  const [mode, setMode] = useState<'inspiration' | 'tryon'>('inspiration')
  
  // État pour l'inspiration (tags)
  const [selectedFabric, setSelectedFabric] = useState<FabricTag | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventTag | null>(null)
  const [selectedGender, setSelectedGender] = useState<GenderTag | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorTag | null>(null)
  const [inspirationResults, setInspirationResults] = useState<InspirationResult[]>([])
  
  // État pour le try-on
  const [userImage, setUserImage] = useState<string | null>(null)
  const [userImageFile, setUserImageFile] = useState<File | null>(null)
  const [modelId, setModelId] = useState<string>('')
  const [tailorId, setTailorId] = useState<string>('')
  const [tryOnResult, setTryOnResult] = useState<string | null>(null)
  
  // État UI
  const [toast, setToast] = useState<string | null>(null)
  const [selectedInspiration, setSelectedInspiration] = useState<InspirationResult | null>(null)
  const [showTailorsModal, setShowTailorsModal] = useState(false)
  
  const { generateInspiration, generateTryOn, isLoading, error } = useAIService()
  const router = useRouter()

  // Auto-dismiss toast après 3 secondes
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Mock data pour les tailleurs suggérés (à remplacer par une vraie API plus tard)
  const suggestedTailors = [
    {
      id: 'tailor-1',
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
      rating: 4.9,
      reviews: 156,
      specialty: 'Spécialiste Basin Riche & Broderie Royale',
      location: 'Dakar, Sénégal',
      verified: true,
      priceRange: 'À partir de 125 000 FCFA',
    },
    {
      id: 'tailor-2',
      name: 'Maison Ndèye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ndeye',
      rating: 4.8,
      reviews: 89,
      specialty: 'Wax Premium & Coupe Ajustée',
      location: 'Dakar, Sénégal',
      verified: true,
      priceRange: 'À partir de 75 000 FCFA',
    },
    {
      id: 'tailor-3',
      name: 'Couture Aminata',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
      rating: 4.7,
      reviews: 124,
      specialty: 'Prêt-à-porter de luxe & Wax contemporain',
      location: 'Dakar, Sénégal',
      verified: true,
      priceRange: 'À partir de 55 000 FCFA',
    },
  ]

  // ==================== VALIDATION ====================

  const isInspirationComplete = useMemo(() => {
    return selectedFabric && selectedEvent && selectedGender && selectedColor
  }, [selectedFabric, selectedEvent, selectedGender, selectedColor])

  const isTryOnReady = useMemo(() => {
    return userImageFile && modelId && tailorId
  }, [userImageFile, modelId, tailorId])

  // ==================== HANDLERS INSPIRATION ====================

  const handleTagSelect = (
    category: 'fabric' | 'event' | 'gender' | 'color',
    value: FabricTag | EventTag | GenderTag | ColorTag
  ) => {
    switch (category) {
      case 'fabric':
        setSelectedFabric(value as FabricTag)
        break
      case 'event':
        setSelectedEvent(value as EventTag)
        break
      case 'gender':
        setSelectedGender(value as GenderTag)
        break
      case 'color':
        setSelectedColor(value as ColorTag)
        break
    }
  }

  const handleGenerateInspiration = async () => {
    if (!isInspirationComplete) return

    try {
      const payload: InspirationPayload = {
        fabric: selectedFabric!,
        event: selectedEvent!,
        gender: selectedGender!,
        color: selectedColor!,
      }

      const result = await generateInspiration(payload)

      if (result.success && result.image_url) {
        setInspirationResults([
          {
            id: `inspi_${Date.now()}`,
            image_url: result.image_url,
            prompt_used: result.prompt_used || '',
            mode: result.mode,
            created_at: new Date().toISOString(),
          },
          ...inspirationResults,
        ])
        setToast('Inspiration générée avec succès !')
      } else {
        setToast(result.error || 'Erreur lors de la génération')
      }
    } catch (err) {
      setToast('Erreur lors de la génération d\'inspiration')
      logError(err, 'Inspiration generation')
    }
  }

  // ==================== HANDLERS TRY-ON ====================

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToast('Veuillez sélectionner une image')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast('L\'image est trop volumineuse (max 10MB)')
      return
    }

    setUserImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setUserImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleGenerateTryOn = async () => {
    if (!isTryOnReady || !userImageFile) return

    try {
      // TODO: Upload l'image vers le storage et récupérer le chemin
      // Pour l'instant, on simule avec un chemin
      const imagePath = `/uploads/tryon_${Date.now()}_${userImageFile.name}`

      const result = await generateTryOn({
        model_id: modelId,
        tailor_id: tailorId,
        user_image_path: imagePath,
      })

      if (result.success && result.output_image_url) {
        setTryOnResult(result.output_image_url)
        setToast('Essayage virtuel généré avec succès !')
      } else {
        setToast(result.error || 'Erreur lors de l\'essayage')
      }
    } catch (err) {
      setToast('Erreur lors de l\'essayage virtuel')
      logError(err, 'Try-on generation')
    }
  }

  // ==================== RENDU ====================

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-[#D4AF37] p-1.5 sm:p-2 rounded-lg shadow-[0_0_16px_rgba(212,175,55,0.35)]">
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                Inspiration IA
              </h1>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/40 font-black">
                Tags & Essayage
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Toggle Mode */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <p className="text-[10px] sm:text-[11px] text-white/60">
            Mode : {mode === 'inspiration' ? 'Inspiration par tags' : 'Essayage virtuel'}
          </p>
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setMode('inspiration')}
              className={cn(
                "flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] border transition-all",
                mode === 'inspiration'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]'
                  : 'bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30'
              )}
            >
              Inspiration
            </button>
            <button
              onClick={() => setMode('tryon')}
              className={cn(
                "flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] border transition-all",
                mode === 'tryon'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]'
                  : 'bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30'
              )}
            >
              Essayage
            </button>
          </div>
        </div>

        {/* PARTIE 1 : INSPIRATION PAR TAGS */}
        {mode === 'inspiration' && (
          <section className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-[#D4AF37]/20 p-1.5 sm:p-2 rounded-lg">
                <Sparkles size={16} className="sm:w-5 sm:h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.18em] uppercase">
                  Trouver votre modèle facilement
                </h2>
                <p className="text-[9px] sm:text-[10px] text-white/50 mt-0.5">
                  Choisissez vos préférences pour générer une inspiration unique
                </p>
              </div>
            </div>

            {/* Catégorie TISSU */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#D4AF37]/10 p-1.5 rounded-lg">
                  <Shirt size={14} className="sm:w-4 sm:h-4 text-[#D4AF37]" />
                </div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/80 font-black flex items-center gap-1.5">
                  <span>1. Tissu</span>
                  <span className="text-[#D4AF37]">*</span>
                  {selectedFabric && (
                    <Check size={12} className="text-[#D4AF37]" />
                  )}
                </label>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {FABRIC_TAGS.map((tag) => {
                  const Icon = FABRIC_ICONS[tag.id] || Shirt
                  return (
                    <motion.button
                      key={tag.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagSelect('fabric', tag.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 transition-all",
                        selectedFabric === tag.id
                          ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                          : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/10"
                      )}
                    >
                      <Icon size={16} className="sm:w-4 sm:h-4" />
                      <span>{tag.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Catégorie ÉVÉNEMENT */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#D4AF37]/10 p-1.5 rounded-lg">
                  <Calendar size={14} className="sm:w-4 sm:h-4 text-[#D4AF37]" />
                </div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/80 font-black flex items-center gap-1.5">
                  <span>2. Événement</span>
                  <span className="text-[#D4AF37]">*</span>
                  {selectedEvent && (
                    <Check size={12} className="text-[#D4AF37]" />
                  )}
                </label>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {EVENT_TAGS.map((tag) => {
                  const Icon = EVENT_ICONS[tag.id] || Calendar
                  return (
                    <motion.button
                      key={tag.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagSelect('event', tag.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 transition-all",
                        selectedEvent === tag.id
                          ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                          : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/10"
                      )}
                    >
                      <Icon size={16} className="sm:w-4 sm:h-4" />
                      <span>{tag.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Catégorie GENRE / ÂGE */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#D4AF37]/10 p-1.5 rounded-lg">
                  <Users size={14} className="sm:w-4 sm:h-4 text-[#D4AF37]" />
                </div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/80 font-black flex items-center gap-1.5">
                  <span>3. Genre / Âge</span>
                  <span className="text-[#D4AF37]">*</span>
                  {selectedGender && (
                    <Check size={12} className="text-[#D4AF37]" />
                  )}
                </label>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {GENDER_TAGS.map((tag) => {
                  const Icon = GENDER_ICONS[tag.id] || Users
                  return (
                    <motion.button
                      key={tag.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagSelect('gender', tag.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 transition-all",
                        selectedGender === tag.id
                          ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                          : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/10"
                      )}
                    >
                      <Icon size={16} className="sm:w-4 sm:h-4" />
                      <span>{tag.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Catégorie COULEUR */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#D4AF37]/10 p-1.5 rounded-lg">
                  <Palette size={14} className="sm:w-4 sm:h-4 text-[#D4AF37]" />
                </div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/80 font-black flex items-center gap-1.5">
                  <span>4. Couleur</span>
                  <span className="text-[#D4AF37]">*</span>
                  {selectedColor && (
                    <Check size={12} className="text-[#D4AF37]" />
                  )}
                </label>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {COLOR_TAGS.map((tag) => (
                  <motion.button
                    key={tag.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTagSelect('color', tag.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 transition-all relative overflow-hidden",
                      selectedColor === tag.id
                        ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/10"
                    )}
                  >
                    {/* Pastille couleur */}
                    <div
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all",
                        tag.id === 'multicolore' && "bg-gradient-to-br from-red-400 via-blue-400 to-orange-400",
                        selectedColor === tag.id ? "border-[#0A0A0A]" : "border-white/30"
                      )}
                      style={
                        tag.id !== 'multicolore'
                          ? { backgroundColor: tag.color }
                          : undefined
                      }
                    />
                    <span>{tag.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Indicateur de progression */}
            {!isInspirationComplete && (
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 flex items-start gap-2.5">
                <Info size={14} className="sm:w-4 sm:h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-[#D4AF37] font-semibold mb-1">
                    Sélectionnez tous les critères
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-[9px] sm:text-[10px] text-white/60">
                    {!selectedFabric && <span className="opacity-50">Tissu</span>}
                    {!selectedEvent && <span className="opacity-50">Événement</span>}
                    {!selectedGender && <span className="opacity-50">Genre</span>}
                    {!selectedColor && <span className="opacity-50">Couleur</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Bouton Générer */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={isInspirationComplete ? { scale: 1.02 } : {}}
              disabled={!isInspirationComplete || isLoading}
              onClick={handleGenerateInspiration}
              className={cn(
                "w-full bg-[#D4AF37] text-[#0A0A0A] py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-xs sm:text-sm shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2.5",
                (!isInspirationComplete || isLoading) && "opacity-40 grayscale cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Génération en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Générer l'inspiration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Résultats Inspiration */}
            {inspirationResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 pt-3 border-t border-white/5">
                {inspirationResults.map((result) => (
                  <div key={result.id} className="bg-[#0A0A0A] border border-white/10 rounded-lg sm:rounded-xl overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
                    <div className="relative aspect-[3/4] bg-neutral-900">
                      <Image
                        src={result.image_url}
                        alt="Inspiration IA"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 via-[#0A0A0A]/0 to-transparent" />
                      <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#D4AF37] font-black">
                        <Sparkles size={10} className="sm:w-3 sm:h-3" />
                        IA
                      </div>
                    </div>
                    
                    {/* CTA Commander */}
                    <div className="p-2 sm:p-2.5">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedInspiration(result)
                          setShowTailorsModal(true)
                        }}
                        className="w-full bg-[#D4AF37] text-[#0A0A0A] py-1.5 sm:py-2 rounded-lg font-black uppercase tracking-[0.18em] text-[8px] sm:text-[9px] shadow-[0_0_12px_rgba(212,175,55,0.3)] hover:shadow-[0_0_16px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5" />
                        <div className="flex flex-col items-center leading-tight">
                          <span>COMMANDER CE</span>
                          <span>MODÈLE</span>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* PARTIE 2 : TRY-ON */}
        {mode === 'tryon' && (
          <section className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Camera size={14} className="sm:w-4 sm:h-4 text-[#D4AF37]" />
              <h2 className="text-xs sm:text-sm font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.18em] uppercase">
                Essayage Virtuel
              </h2>
            </div>

            {/* Upload Photo Utilisateur */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#D4AF37]/10 p-1.5 rounded-lg">
                  <ImageIcon size={14} className="sm:w-4 sm:h-4 text-[#D4AF37]" />
                </div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/80 font-black flex items-center gap-1.5">
                  <span>Votre photo</span>
                  <span className="text-[#D4AF37]">*</span>
                  {userImage && (
                    <Check size={12} className="text-[#D4AF37]" />
                  )}
                </label>
              </div>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleImageUpload(file)
                }}
                className="block cursor-pointer"
              >
                <div className="mt-1.5 sm:mt-2 w-full bg-[#0A0A0A] border-2 border-dashed border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-6 sm:py-8 text-center flex flex-col items-center justify-center gap-2 sm:gap-3 hover:border-[#D4AF37]/40 hover:bg-white/[0.02] transition-all min-h-[200px] sm:min-h-[240px]">
                  {userImage ? (
                    <div className="relative w-full aspect-[3/4] max-w-[200px] sm:max-w-[240px] mx-auto overflow-hidden rounded-xl border-2 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                      <Image
                        src={userImage}
                        alt="Photo utilisateur"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 200px, 240px"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setUserImage(null)
                          setUserImageFile(null)
                        }}
                        className="absolute top-2 right-2 bg-[#0A0A0A]/90 backdrop-blur-md rounded-full p-1.5 text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-[#D4AF37]/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-[#0A0A0A]" />
                        <span className="text-[9px] font-bold text-[#0A0A0A] uppercase">Photo prête</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[#D4AF37]/10 p-4 rounded-full">
                        <Upload size={24} className="sm:w-7 sm:h-7 text-[#D4AF37]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base text-white/80 font-semibold">
                          Glissez votre photo ici
                        </p>
                        <p className="text-xs sm:text-sm text-white/50">
                          ou cliquez pour choisir un fichier
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                        <Info size={12} className="text-[#D4AF37]" />
                        <p className="text-[10px] sm:text-[11px] text-white/60">
                          Face caméra, buste ou corps visible
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                />
              </label>
            </div>

            {/* Champs Model ID et Tailor ID (pour l'instant en input, à remplacer par sélection) */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/60 font-black">
                ID du modèle <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="ID du modèle à essayer"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none focus:border-[#D4AF37]/40 text-xs sm:text-sm text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/60 font-black">
                ID du tailleur <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                value={tailorId}
                onChange={(e) => setTailorId(e.target.value)}
                placeholder="ID du tailleur"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none focus:border-[#D4AF37]/40 text-xs sm:text-sm text-white placeholder:text-white/30"
              />
            </div>

            {/* Indication crédit */}
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5">
              <Sparkles size={16} className="sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
              <p className="text-[10px] sm:text-[11px] text-[#D4AF37] font-semibold">
                Essayage offert par le tailleur
              </p>
            </div>

            {/* Bouton Générer Try-on */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={!isTryOnReady || isLoading}
              onClick={handleGenerateTryOn}
              className={cn(
                "w-full bg-[#D4AF37] text-[#0A0A0A] py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] shadow-[0_0_18px_rgba(212,175,55,0.35)] transition-all flex items-center justify-center gap-2",
                (!isTryOnReady || isLoading) && "opacity-40 grayscale cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Essayer ce modèle
                </>
              )}
            </motion.button>

            {/* Résultat Try-on */}
            {tryOnResult && (
              <div className="bg-[#0A0A0A] border border-white/10 rounded-lg sm:rounded-xl overflow-hidden">
                <div className="relative aspect-[3/4] bg-neutral-900">
                  <Image
                    src={tryOnResult}
                    alt="Résultat essayage"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 640px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent" />
                  <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#D4AF37] font-black">
                    <CheckCircle2 size={10} className="sm:w-3 sm:h-3" />
                    Résultat
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modal Sélection Tailleur */}
      <AnimatePresence>
        {showTailorsModal && selectedInspiration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowTailorsModal(false)
              setSelectedInspiration(null)
            }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-3 sm:px-4"
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-t-2xl sm:rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col"
            >
              {/* Header Modal */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
                <div>
                  <h2 className="text-base sm:text-lg font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.18em] uppercase">
                    Meilleurs Tailleurs
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-white/60 mt-1">
                    Sélectionnez un tailleur pour commander ce modèle
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTailorsModal(false)
                    setSelectedInspiration(null)
                  }}
                  className="p-1.5 sm:p-2 text-white/60 hover:text-[#D4AF37] hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Preview Inspiration */}
              {selectedInspiration && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-[#D4AF37]/30 flex-shrink-0">
                      <Image
                        src={selectedInspiration.image_url}
                        alt="Modèle sélectionné"
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles size={12} className="text-[#D4AF37]" />
                        <p className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-[0.1em]">
                          Modèle IA
                        </p>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-white/60 line-clamp-2">
                        {selectedInspiration.prompt_used || 'Inspiration générée par IA'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Liste des Tailleurs */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
                {suggestedTailors.map((tailor, index) => (
                  <motion.div
                    key={tailor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-[#D4AF37]/40 hover:bg-white/[0.05] transition-all group cursor-pointer"
                    onClick={() => {
                      router.push(`/messages?tailor=${encodeURIComponent(tailor.name)}`)
                    }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-colors flex-shrink-0">
                        <Image
                          src={tailor.avatar}
                          alt={tailor.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        {tailor.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-[#D4AF37] rounded-full p-0.5">
                            <Verified size={12} className="text-[#0A0A0A]" />
                          </div>
                        )}
                      </div>

                      {/* Infos Tailleur */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-sm sm:text-base font-bold text-white/90 truncate">
                            {tailor.name}
                          </h3>
                          {tailor.verified && (
                            <Verified size={14} className="text-[#D4AF37] flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-[10px] sm:text-[11px] text-white/70 mb-2 line-clamp-1">
                          {tailor.specialty}
                        </p>

                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                          {/* Rating */}
                          <div className="flex items-center gap-1.5">
                            <Star size={12} className="sm:w-3 sm:h-3 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="text-xs sm:text-sm font-bold text-[#D4AF37]">
                              {tailor.rating}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-white/50">
                              ({tailor.reviews})
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="sm:w-3 sm:h-3 text-white/40" />
                            <span className="text-[10px] sm:text-[11px] text-white/50 truncate">
                              {tailor.location}
                            </span>
                          </div>
                        </div>

                        {/* Prix */}
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <p className="text-xs sm:text-sm font-bold text-[#D4AF37]">
                            {tailor.priceRange}
                          </p>
                        </div>
                      </div>

                      {/* CTA Arrow */}
                      <div className="flex-shrink-0 self-center">
                        <div className="p-2 bg-white/5 group-hover:bg-[#D4AF37]/20 rounded-lg transition-colors">
                          <ChevronRight size={18} className="sm:w-5 sm:h-5 text-white/60 group-hover:text-[#D4AF37] transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Modal */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 bg-white/[0.02]">
                <p className="text-[10px] sm:text-[11px] text-white/50 text-center">
                  💡 Ces tailleurs sont suggérés selon votre inspiration et leurs spécialités
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-[#D4AF37] text-[#0A0A0A] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-[0_8px_24px_rgba(212,175,55,0.4)] max-w-xs mx-4"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              {toast.includes('succès') ? (
                <CheckCircle2 size={14} className="sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2.5} />
              ) : (
                <X size={14} className="sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2.5} />
              )}
              <div className="flex flex-col">
                {toast.includes('succès') && toast.includes('Inspiration') ? (
                  <>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase leading-tight">Inspiration</span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase leading-tight">générée avec</span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase leading-tight">succès !</span>
                  </>
                ) : toast.includes('Essayage') && toast.includes('succès') ? (
                  <>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase leading-tight">Essayage</span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase leading-tight">généré avec</span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase leading-tight">succès !</span>
                  </>
                ) : (
                  <p className="text-[9px] sm:text-[10px] font-black uppercase leading-tight">{toast}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
