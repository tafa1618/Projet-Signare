'use client'

import { useState, useRef } from 'react'
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
  Info
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { Post } from '@/shared/types/database.types'

/**
 * PAGE - Publication Client
 * @ai-context Interface de capture de données luxe pour le dataset de recommandation et NLP
 */

// Mock des tailleurs pour le matchmaking
const MOCK_TAILORS = [
  { id: 't1', name: 'Atelier Fatou' },
  { id: 't2', name: 'Maison Ndèye' },
  { id: 't3', name: 'Couture Aminata' },
  { id: 't4', name: 'Dakar Luxe' }
]

const STYLE_TAGS = ['#Mariage', '#Quotidien', '#Tabaski', '#Gala', '#Cérémonie']

export default function PublishPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // États du formulaire
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [selectedTailor, setSelectedTailor] = useState('')
  const [qualityRating, setQualityRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // États UI
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Gestion de l'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Gestion des tags
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Publication (Simulation)
  const handlePublish = async () => {
    if (!imagePreview || !selectedTailor) return
    
    setIsPublishing(true)
    
    // Simulation de l'objet newPost conforme aux database.types.ts
    const newPost: Partial<Post> = {
      user_id: 'current-user-id',
      image_url: imagePreview,
      caption: description,
      garment_type: 'autre', // À extraire via IA idéalement
      style_tags: selectedTags,
      quality_rating: qualityRating, // Champ personnalisé pour ML Sentiment Analysis
      is_commissioned: true,
      created_at: new Date().toISOString()
    }

    console.log('Publication de la donnée ML-Ready:', newPost)

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
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <h1 className="text-lg font-serif text-[#D4AF37] tracking-[0.1em] uppercase">Partager mon Style</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto px-6 pt-8 space-y-10"
      >
        {/* 1. UPLOAD IMAGE */}
        <section className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
              imagePreview ? "border-transparent" : "border-[#D4AF37]/30 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10"
            )}
          >
            {imagePreview ? (
              <>
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="w-10 h-10 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="bg-[#D4AF37]/20 p-4 rounded-full inline-block">
                  <Upload className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold tracking-wide">Ajouter une photo</p>
                  <p className="text-xs text-white/40 leading-relaxed">Glissez votre tenue portée ou cliquez pour parcourir</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </section>

        {/* 2. DESCRIPTION (NLP Ready) */}
        <section className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">L'histoire de votre tenue</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Racontez-nous l'occasion, les compliments reçus ou le travail de votre tailleur..."
            className="w-full bg-transparent border-b-2 border-[#D4AF37]/20 focus:border-[#D4AF37] min-h-[100px] outline-none transition-all py-2 text-sm leading-relaxed placeholder:text-white/20 resize-none"
          />
        </section>

        {/* 3. TAILLEUR (Matchmaking Ready) */}
        <section className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Qui est votre tailleur ?</label>
          <div className="relative group">
            <select
              value={selectedTailor}
              onChange={(e) => setSelectedTailor(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 appearance-none outline-none focus:border-[#D4AF37]/50 transition-all text-sm"
            >
              <option value="" disabled className="bg-[#0A0A0A]">Sélectionner un artisan</option>
              {MOCK_TAILORS.map(t => (
                <option key={t.id} value={t.id} className="bg-[#0A0A0A]">{t.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-focus-within:text-[#D4AF37]" size={18} />
          </div>
        </section>

        {/* 4. QUALITY RATING (Sentiment Analysis Ready) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Niveau de satisfaction</label>
            <span className="text-[10px] text-white/40 font-medium italic flex items-center gap-1">
              <Info size={10} /> ML Sentiment Score
            </span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setQualityRating(star)}
                  className="transition-colors"
                >
                  <Star 
                    size={32} 
                    className={cn(
                      "transition-all duration-300",
                      star <= qualityRating 
                        ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" 
                        : "text-white/10"
                    )} 
                  />
                </motion.button>
              ))}
            </div>
            <span className="text-xl font-serif text-[#D4AF37]/60">{qualityRating}/5</span>
          </div>
        </section>

        {/* 5. STYLE TAGS */}
        <section className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Style de l'événement</label>
          <div className="flex flex-wrap gap-3">
            {STYLE_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all border",
                  selectedTags.includes(tag)
                    ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0A0A] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : "bg-transparent border-white/10 text-white/40 hover:border-[#D4AF37]/30 hover:text-white/60"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* BUTTON PUBLIER */}
        <div className="pt-10">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(212,175,55,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePublish}
            disabled={isPublishing || !imagePreview || !selectedTailor}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] font-black tracking-[0.2em] uppercase py-5 rounded-2xl shadow-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:grayscale group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isPublishing ? (
                <div className="w-5 h-5 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
              ) : (
                <>PUBLIER MA CRÉATION <Sparkles size={18} /></>
              )}
            </span>
            
            {/* Glow effect */}
            {!isPublishing && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 opacity-30"
              />
            )}
          </motion.button>
        </div>
      </motion.main>

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

