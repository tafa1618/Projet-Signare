'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  Upload,
  Camera,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  X,
  Search,
  User,
  Star,
  MapPin,
  Scissors
} from 'lucide-react'
import { useAuth } from '@/frontend/hooks/useAuth'

// Mock data - À remplacer par les vraies données Supabase
const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Boubou Royale Brodé',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    price: 75000,
    tailor: {
      id: 'tailor-1',
      name: 'Tapha Tailleur',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tapha',
      rating: 4.9,
      location: 'Dakar, Plateau',
    },
  },
  {
    id: 'prod-2',
    name: 'Kaftan Soie Premium',
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop',
    price: 95000,
    tailor: {
      id: 'tailor-1',
      name: 'Tapha Tailleur',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tapha',
      rating: 4.9,
      location: 'Dakar, Plateau',
    },
  },
  {
    id: 'prod-3',
    name: 'Robe Cérémonie Perlé',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    price: 120000,
    tailor: {
      id: 'tailor-2',
      name: 'Aminata Couture',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
      rating: 4.8,
      location: 'Dakar, Almadies',
    },
  },
]

const MOCK_TAILORS = [
  {
    id: 'tailor-1',
    name: 'Tapha Tailleur',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tapha',
    rating: 4.9,
    location: 'Dakar, Plateau',
    specialties: ['Boubou', 'Kaftan', 'Ensemble'],
    completedOrders: 1247,
  },
  {
    id: 'tailor-2',
    name: 'Aminata Couture',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
    rating: 4.8,
    location: 'Dakar, Almadies',
    specialties: ['Robe', 'Ensemble', 'Accessoires'],
    completedOrders: 892,
  },
  {
    id: 'tailor-3',
    name: 'Moussa Artisan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa',
    rating: 4.7,
    location: 'Thiès',
    specialties: ['Boubou', 'Tenue traditionnelle'],
    completedOrders: 654,
  },
]

type Step = 'photo' | 'model' | 'tailor' | 'result'

export default function EssayagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Récupérer les IDs depuis les query params si disponibles (depuis le badge "Essayer ce modèle")
  const productIdFromUrl = searchParams.get('productId')
  const tailorIdFromUrl = searchParams.get('tailorId')
  
  const [currentStep, setCurrentStep] = useState<Step>('photo')
  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(
    productIdFromUrl ? MOCK_PRODUCTS.find(p => p.id === productIdFromUrl) || null : null
  )
  const [selectedTailor, setSelectedTailor] = useState<typeof MOCK_TAILORS[0] | null>(
    tailorIdFromUrl ? MOCK_TAILORS.find(t => t.id === tailorIdFromUrl) || null : null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)

  // Si un produit est pré-sélectionné depuis l'URL, passer directement à l'étape photo
  const initialStep = productIdFromUrl && tailorIdFromUrl ? 'photo' : 'model'

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUserPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleNext = () => {
    if (currentStep === 'photo' && photoPreview) {
      if (selectedProduct && selectedTailor) {
        setCurrentStep('result')
        generateTryOn()
      } else if (selectedProduct) {
        setCurrentStep('tailor')
      } else {
        setCurrentStep('model')
      }
    } else if (currentStep === 'model' && selectedProduct) {
      setCurrentStep('tailor')
    } else if (currentStep === 'tailor' && selectedTailor) {
      setCurrentStep('result')
      generateTryOn()
    }
  }

  const generateTryOn = async () => {
    if (!userPhoto || !selectedProduct || !selectedTailor) return
    
    setIsGenerating(true)
    try {
      // TODO: Appel à l'API d'essayage virtuel
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulation
      
      // Mock result
      setResultImage('https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop')
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const filteredProducts = MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.tailor.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTailors = MOCK_TAILORS.filter(tailor =>
    tailor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tailor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tailor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
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
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em]">
                Essayage Virtuel
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['photo', 'model', 'tailor', 'result'] as Step[]).map((step, idx) => {
            const stepNames = { photo: 'Photo', model: 'Modèle', tailor: 'Tailleur', result: 'Résultat' }
            const isActive = currentStep === step
            const isCompleted = 
              (step === 'photo' && photoPreview) ||
              (step === 'model' && selectedProduct) ||
              (step === 'tailor' && selectedTailor) ||
              (step === 'result' && resultImage)
            
            return (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isActive 
                    ? 'bg-[#D4AF37] text-[#0A0A0A]' 
                    : isCompleted 
                    ? 'bg-[#D4AF37]/30 text-[#D4AF37]' 
                    : 'bg-white/5 text-white/30'
                }`}>
                  {isCompleted && !isActive ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                {idx < 3 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    isCompleted ? 'bg-[#D4AF37]' : 'bg-white/10'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Upload Photo */}
          {currentStep === 'photo' && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-3">
                  <Camera className="w-4 h-4" />
                  Votre Photo *
                </label>
                
                {photoPreview ? (
                  <div className="relative aspect-[3/4] max-h-[500px] rounded-xl overflow-hidden border border-[#D4AF37]/20">
                    <Image
                      src={photoPreview}
                      alt="Votre photo"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => {
                        setPhotoPreview(null)
                        setUserPhoto(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="absolute top-2 right-2 bg-black/50 backdrop-blur-md rounded-full p-2 text-white/80 hover:text-red-400 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[3/4] max-h-[500px] border-2 border-dashed border-[#D4AF37]/30 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#D4AF37]/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-[#D4AF37]/50" />
                    <div className="text-center">
                      <p className="text-sm text-white/70 mb-1">Glissez votre photo ici</p>
                      <p className="text-xs text-white/50">ou cliquez pour choisir un fichier</p>
                    </div>
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                
                <div className="mt-3 flex items-start gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg p-3">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/70">
                    <strong className="text-[#D4AF37]">Conseil :</strong> Face caméra, buste ou corps visible. Photo claire et bien éclairée pour un meilleur résultat.
                  </p>
                </div>
              </div>

              {selectedProduct && selectedTailor && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">Sélection actuelle</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#D4AF37]/20">
                      <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{selectedProduct.name}</p>
                      <p className="text-xs text-white/60">Par {selectedTailor.name}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!photoPreview}
                className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {selectedProduct && selectedTailor ? 'Générer l\'essayage' : 'Continuer'}
              </button>
            </motion.div>
          )}

          {/* Step 2: Select Model */}
          {currentStep === 'model' && (
            <motion.div
              key="model"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-3">
                  <Sparkles className="w-4 h-4" />
                  Choisir un Modèle *
                </label>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un modèle ou un tailleur..."
                    className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product)
                        setSelectedTailor(product.tailor)
                      }}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30'
                          : 'border-white/10 hover:border-[#D4AF37]/30'
                      }`}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-xs font-bold text-white mb-1">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full overflow-hidden border border-[#D4AF37]/30">
                            <Image src={product.tailor.avatar} alt={product.tailor.name} width={16} height={16} className="object-cover" />
                          </div>
                          <p className="text-[10px] text-white/70">{product.tailor.name}</p>
                        </div>
                        {selectedProduct?.id === product.id && (
                          <div className="absolute top-2 right-2 bg-[#D4AF37] rounded-full p-1">
                            <CheckCircle2 size={16} className="text-[#0A0A0A]" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!selectedProduct}
                className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continuer
              </button>
            </motion.div>
          )}

          {/* Step 3: Select Tailor (si pas déjà sélectionné via le produit) */}
          {currentStep === 'tailor' && (
            <motion.div
              key="tailor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-3">
                  <Scissors className="w-4 h-4" />
                  Choisir un Tailleur *
                </label>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un tailleur..."
                    className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                {/* Tailors List */}
                <div className="space-y-3">
                  {filteredTailors.map((tailor) => (
                    <button
                      key={tailor.id}
                      onClick={() => setSelectedTailor(tailor)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        selectedTailor?.id === tailor.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/30'
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/30">
                        <Image src={tailor.avatar} alt={tailor.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-white">{tailor.name}</p>
                          {selectedTailor?.id === tailor.id && (
                            <CheckCircle2 size={16} className="text-[#D4AF37]" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
                          <Star size={12} className="text-[#D4AF37] fill-current" />
                          <span>{tailor.rating}</span>
                          <span className="text-white/30">•</span>
                          <MapPin size={12} />
                          <span>{tailor.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tailor.specialties.slice(0, 3).map((specialty, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full text-[#D4AF37]">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!selectedTailor}
                className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Générer l'essayage
              </button>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {currentStep === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-white/70">Génération de votre essayage virtuel en cours...</p>
                </div>
              ) : resultImage ? (
                <>
                  <div className="relative aspect-[3/4] max-h-[600px] rounded-xl overflow-hidden border border-[#D4AF37]/20">
                    <Image
                      src={resultImage}
                      alt="Résultat essayage virtuel"
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">Modèle essayé</p>
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#D4AF37]/20">
                        <Image src={selectedProduct!.image} alt={selectedProduct!.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{selectedProduct!.name}</p>
                        <p className="text-xs text-white/60">Par {selectedTailor!.name}</p>
                        <p className="text-sm text-[#D4AF37] font-bold mt-1">{selectedProduct!.price.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push(`/shop/${selectedProduct!.id}`)}
                      className="flex items-center justify-center gap-2 bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/10 transition-all"
                    >
                      Voir le produit
                    </button>
                    <button
                      onClick={() => {
                        setCurrentStep('photo')
                        setPhotoPreview(null)
                        setUserPhoto(null)
                        setResultImage(null)
                      }}
                      className="flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:bg-[#D4AF37]/90 transition-all"
                    >
                      Nouvel essayage
                    </button>
                  </div>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

