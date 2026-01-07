'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Heart,
  ShoppingCart,
  Share2,
  ChevronLeft,
  CheckCircle2,
  Star,
  Store,
  Sparkles
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// Mock data - En production, récupérer depuis l'API
const MOCK_PRODUCT = {
  id: 'p1',
  title: 'Boubou Royale Wax Premium',
  description: 'Boubou de cérémonie en wax premium, finitions main, broderies dorées. Pièce unique, confectionnée avec soin par notre atelier.',
  price: 125000,
  currency: 'FCFA',
  images: [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=1000&fit=crop',
  ],
  seller: {
    name: 'Maison Aïda Sow',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aida',
    type: 'tailleur' as const,
    verified: true,
    rating: 4.9
  },
  likes: 147,
  isLiked: false,
  status: 'active' as const,
  category: 'Boubou',
  tags: ['Wax', 'Cérémonie', 'Premium']
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= rounded ? "fill-current text-[#D4AF37]" : "text-white/20"}
        />
      ))}
    </div>
  )
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(MOCK_PRODUCT.isLiked)
  const [likesCount, setLikesCount] = useState(MOCK_PRODUCT.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleAddToCart = () => {
    // TODO: Implémenter l'ajout au panier
    console.log('Add to cart:', params.id)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Store className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em] truncate">
                Détail Produit
              </h1>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="p-2 text-white/60 hover:text-[#D4AF37] transition-colors"
            >
              <Heart size={22} className={isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* Image Carousel */}
        <div className="relative aspect-[3/4] bg-neutral-900">
          <Image
            src={MOCK_PRODUCT.images[currentImageIndex]}
            alt={MOCK_PRODUCT.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
          
          {MOCK_PRODUCT.status === 'pending' && (
            <div className="absolute top-3 left-3 bg-yellow-500/90 text-[#0A0A0A] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
              <Sparkles size={12} />
              En attente de validation
            </div>
          )}
          
          {MOCK_PRODUCT.seller.type === 'tailleur' && (
            <div className="absolute top-3 right-3 bg-[#D4AF37] text-[#0A0A0A] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em]">
              Atelier
            </div>
          )}

          {MOCK_PRODUCT.images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + MOCK_PRODUCT.images.length) % MOCK_PRODUCT.images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % MOCK_PRODUCT.images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
              >
                <ChevronLeft size={20} className="rotate-180" />
              </button>
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {MOCK_PRODUCT.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      idx === currentImageIndex ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-white/30"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Seller Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#D4AF37]/30">
              <Image src={MOCK_PRODUCT.seller.avatar} alt={MOCK_PRODUCT.seller.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profil?mode=${MOCK_PRODUCT.seller.type === 'tailleur' ? 'tailleur' : 'client'}&${MOCK_PRODUCT.seller.type === 'tailleur' ? 'tailor' : 'client'}=${encodeURIComponent(MOCK_PRODUCT.seller.name)}`}
                  className="text-sm sm:text-base font-bold text-white/90 hover:text-[#D4AF37] transition-colors truncate"
                >
                  {MOCK_PRODUCT.seller.name}
                </Link>
                {MOCK_PRODUCT.seller.verified && (
                  <CheckCircle2 size={16} className="text-[#D4AF37] flex-shrink-0" />
                )}
              </div>
              {MOCK_PRODUCT.seller.rating && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={MOCK_PRODUCT.seller.rating} />
                  <span className="text-xs text-white/50">{MOCK_PRODUCT.seller.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37] mb-2">{MOCK_PRODUCT.title}</h1>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">
              {MOCK_PRODUCT.price.toLocaleString('fr-FR')} {MOCK_PRODUCT.currency}
            </p>
          </div>

          {/* Category & Tags */}
          <div className="flex flex-wrap gap-2">
            {MOCK_PRODUCT.category && (
              <span className="px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] text-[#D4AF37]">
                {MOCK_PRODUCT.category}
              </span>
            )}
            {MOCK_PRODUCT.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] text-white/70">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-bold text-white/90 mb-2">Description</h2>
            <p className="text-sm text-white/70 leading-relaxed">{MOCK_PRODUCT.description}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="flex-1 bg-[#D4AF37] text-[#0A0A0A] py-3 sm:py-4 rounded-xl text-sm sm:text-base font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)] transition-all"
            >
              Ajouter au panier
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-3 sm:p-4 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  )
}

