'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Heart,
  Share2,
  ChevronLeft,
  CheckCircle2,
  Star,
  Store,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useCart } from '@/hooks/useCart'

// Mock data - En production, récupérer depuis l'API
const MOCK_PRODUCTS: Record<string, {
  id: string
  title: string
  description: string
  price: number
  currency: string
  images: string[]
  seller: {
    name: string
    avatar: string
    type: 'tailleur' | 'consumer'
    verified: boolean
    rating?: number
  }
  likes: number
  isLiked: boolean
  status: 'active' | 'pending'
  category?: string
  tags?: string[]
}> = {
  'p1': {
    id: 'p1',
    title: 'Boubou Royale Wax Premium',
    description: 'Boubou de cérémonie en wax premium, finitions main, broderies dorées. Pièce unique, confectionnée avec soin par notre atelier. Matériaux de première qualité, coupe sur mesure disponible.',
    price: 125000,
    currency: 'FCFA',
    images: [
      'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=800&h=1000&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=1000&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1000&fit=crop&q=80',
    ],
    seller: {
      name: 'Maison Aïda Sow',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aida',
      type: 'tailleur',
      verified: true,
      rating: 4.9
    },
    likes: 147,
    isLiked: false,
    status: 'active',
    category: 'Boubou',
    tags: ['Wax', 'Cérémonie', 'Premium']
  },
  'p2': {
    id: 'p2',
    title: 'Robe Wax Moderne',
    description: 'Robe ajustée en wax, coupe contemporaine, parfaite pour tous les jours',
    price: 75000,
    currency: 'FCFA',
    images: [
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=1000&fit=crop&q=80',
    ],
    seller: {
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
      type: 'tailleur',
      verified: true,
      rating: 4.8
    },
    likes: 89,
    isLiked: false,
    status: 'active',
    category: 'Robe',
    tags: ['Wax', 'Moderne', 'Quotidien']
  },
  'p3': {
    id: 'p3',
    title: 'Ensemble Kaftan Soie',
    description: 'Ensemble kaftan en soie premium, finitions luxueuses, idéal pour occasions spéciales',
    price: 180000,
    currency: 'FCFA',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1000&fit=crop&q=80',
    ],
    seller: {
      name: 'Awa Ndiaye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa',
      type: 'consumer',
      verified: false
    },
    likes: 42,
    isLiked: false,
    status: 'pending',
    category: 'Kaftan',
    tags: ['Soie', 'Premium', 'Cérémonie']
  }
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={cn(
            "transition-colors",
            s <= rounded ? "fill-current text-[#D4AF37]" : "text-white/20"
          )}
        />
      ))}
    </div>
  )
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  
  const product = MOCK_PRODUCTS[params.id] || MOCK_PRODUCTS['p1']
  const [isLiked, setIsLiked] = useState(product.isLiked)
  const [likesCount, setLikesCount] = useState(product.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleAddToCart = () => {
    addToCart({
      productId: parseInt(product.id.replace('p', '')) || 1,
      title: product.title,
      image: product.images[0],
      price: product.price,
      currency: product.currency,
      seller: {
        name: product.seller.name,
        avatar: product.seller.avatar
      }
    })
    setToast('Produit ajouté au panier')
  }

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000)
      return () => clearTimeout(t)
    }
  }, [toast])

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="p-1.5 sm:p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </motion.button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
              <h1 className="text-base sm:text-lg font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em] truncate">
                Détail Produit
              </h1>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="p-1.5 sm:p-2 text-white/60 hover:text-[#D4AF37] transition-colors relative"
            >
              <Heart size={18} className={cn("sm:w-5 sm:h-5 transition-all", isLiked && "fill-[#D4AF37] text-[#D4AF37]")} />
              {likesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {likesCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* Image Carousel - Compact on PC */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] max-h-[70vh] sm:max-h-[500px] bg-neutral-900 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={product.images[currentImageIndex]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://via.placeholder.com/800x1000/0A0A0A/D4AF37?text=SIGNARE'
                }}
              />
            </motion.div>
          </AnimatePresence>
          
          {product.status === 'pending' && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-yellow-500/95 text-[#0A0A0A] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-[0_0_12px_rgba(234,179,8,0.5)]">
              <Sparkles size={10} className="sm:w-3 sm:h-3" />
              <span className="hidden xs:inline">En attente de validation</span>
              <span className="xs:hidden">En attente</span>
            </div>
          )}
          
          {product.seller.type === 'tailleur' && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#D4AF37] text-[#0A0A0A] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] shadow-[0_0_12px_rgba(212,175,55,0.5)]">
              Atelier
            </div>
          )}

          {product.images.length > 1 && (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1.5 sm:p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-10"
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1.5 sm:p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-10"
              >
                <ChevronRight size={16} className="sm:w-5 sm:h-5" />
              </motion.button>
              
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      idx === currentImageIndex ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-white/40"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info - Compact & Responsive */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* Seller Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-white/5">
            <Link
              href={`/profil?mode=${product.seller.type === 'tailleur' ? 'tailleur' : 'client'}&${product.seller.type === 'tailleur' ? 'tailor' : 'client'}=${encodeURIComponent(product.seller.name)}`}
              className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-colors flex-shrink-0"
            >
              <Image 
                src={product.seller.avatar} 
                alt={product.seller.name} 
                fill 
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'
                }}
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href={`/profil?mode=${product.seller.type === 'tailleur' ? 'tailleur' : 'client'}&${product.seller.type === 'tailleur' ? 'tailor' : 'client'}=${encodeURIComponent(product.seller.name)}`}
                  className="text-xs sm:text-sm font-bold text-white/90 hover:text-[#D4AF37] transition-colors truncate"
                >
                  {product.seller.name}
                </Link>
                {product.seller.verified && (
                  <CheckCircle2 size={12} className="text-[#D4AF37] flex-shrink-0 sm:w-4 sm:h-4" />
                )}
              </div>
              {product.seller.rating && (
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                  <StarRating rating={product.seller.rating} />
                  <span className="text-[10px] sm:text-xs text-white/50">{product.seller.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-[#D4AF37] mb-1.5 sm:mb-2 leading-tight">
              {product.title}
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#D4AF37] leading-none">
              {product.price.toLocaleString('fr-FR')} <span className="text-sm sm:text-base md:text-lg">{product.currency}</span>
            </p>
          </div>

          {/* Category & Tags */}
          {(product.category || product.tags?.length) && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {product.category && (
                <span className="px-2.5 sm:px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-[#D4AF37]">
                  {product.category}
                </span>
              )}
              {product.tags?.map(tag => (
                <span key={tag} className="px-2.5 sm:px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white/90 mb-1.5 sm:mb-2">Description</h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{product.description}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleAddToCart}
              className="flex-1 bg-[#D4AF37] text-[#0A0A0A] py-2.5 sm:py-3 md:py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)] transition-all"
            >
              Ajouter au panier
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="p-2.5 sm:p-3 md:p-4 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
            >
              <Share2 size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
      </main>

      {/* Toast pour ajout au panier */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-[#D4AF37] text-[#0A0A0A] px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-[0_10px_40px_rgba(212,175,55,0.45)] max-w-sm mx-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-bold">{toast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

