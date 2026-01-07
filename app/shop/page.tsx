'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  Filter,
  Heart,
  ShoppingCart,
  Store,
  Sparkles,
  Star,
  ChevronLeft,
  X,
  CheckCircle2,
  Plus
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// Types
interface ShopProduct {
  id: string
  title: string
  description: string
  price: number
  currency: string
  image: string
  seller: {
    name: string
    avatar: string
    type: 'tailleur' | 'consumer'
    verified: boolean
    rating?: number
  }
  likes: number
  isLiked: boolean
  status: 'active' | 'pending' // pending = en attente de validation
  category?: string
  tags?: string[]
}

// Mock Data
const MOCK_PRODUCTS: ShopProduct[] = [
  {
    id: 'p1',
    title: 'Boubou Royale Wax Premium',
    description: 'Boubou de cérémonie en wax premium, finitions main, broderies dorées',
    price: 125000,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
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
  {
    id: 'p2',
    title: 'Robe Wax Moderne',
    description: 'Robe ajustée en wax, coupe contemporaine, parfaite pour tous les jours',
    price: 75000,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=1000&fit=crop',
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
  {
    id: 'p3',
    title: 'Ensemble Kaftan Soie',
    description: 'Ensemble kaftan en soie premium, finitions luxueuses, idéal pour occasions spéciales',
    price: 180000,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1520975892776-3f7c5b37c5b2?w=800&h=1000&fit=crop',
    seller: {
      name: 'Awa Ndiaye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa',
      type: 'consumer',
      verified: false
    },
    likes: 42,
    isLiked: false,
    status: 'active',
    category: 'Kaftan',
    tags: ['Soie', 'Luxe', 'Occasion']
  },
  {
    id: 'p4',
    title: 'Tenue Traditionnelle Basse',
    description: 'Tenue traditionnelle en basin, portée quelques fois, excellent état',
    price: 45000,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1520975892776-3f7c5b37c5b2?w=800&h=1000&fit=crop',
    seller: {
      name: 'Mariama Diallo',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama',
      type: 'consumer',
      verified: false
    },
    likes: 23,
    isLiked: false,
    status: 'pending',
    category: 'Tenue',
    tags: ['Basin', 'Occasion', 'C2C']
  }
]

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={s <= rounded ? "fill-current text-[#D4AF37]" : "text-white/20"}
        />
      ))}
    </div>
  )
}

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>(MOCK_PRODUCTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  const handleLike = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ))
  }

  const handleAddToCart = (productId: string) => {
    // TODO: Implémenter l'ajout au panier
    console.log('Add to cart:', productId)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-[#D4AF37] p-1 sm:p-1.5 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)] flex-shrink-0">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A]" />
              </div>
              <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em] truncate">BOUTIQUE</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/shop/publish">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#D4AF37] text-[#0A0A0A] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] shadow-[0_0_14px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center gap-1.5"
                  title="Vendre un produit"
                >
                  <Plus size={14} className="sm:w-[16px] sm:h-[16px]" strokeWidth={3} />
                  <span className="hidden xs:inline">Vendre</span>
                </motion.button>
              </Link>
              <Link href="/cart">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-1.5 sm:p-2"
                  title="Panier"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-10 sm:px-12 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-1.5"
              >
                <Filter size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3 sm:px-4 pb-3 sm:pb-4 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-[0.15em] transition-all",
                      !selectedCategory
                        ? "bg-[#D4AF37] text-[#0A0A0A]"
                        : "bg-white/5 border border-[#D4AF37]/20 text-white/70 hover:border-[#D4AF37]"
                    )}
                  >
                    Tout
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat || null)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-[0.15em] transition-all",
                        selectedCategory === cat
                          ? "bg-[#D4AF37] text-[#0A0A0A]"
                          : "bg-white/5 border border-[#D4AF37]/20 text-white/70 hover:border-[#D4AF37]"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Products Grid */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-white/50">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {filteredProducts.map((product, idx) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#D4AF37]/25 hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)] transition-all group flex flex-col"
            >
              <Link href={`/shop/${product.id}`} className="flex-1 flex flex-col">
                <div className="relative aspect-[4/5] sm:aspect-[4/5] max-h-[280px] sm:max-h-[320px] bg-neutral-900 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
                  
                  {product.status === 'pending' && (
                    <div className="absolute top-2 left-2 bg-yellow-500/95 text-[#0A0A0A] px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-[0_0_12px_rgba(234,179,8,0.5)]">
                      <Sparkles size={10} />
                      En attente
                    </div>
                  )}
                  {product.seller.type === 'tailleur' && (
                    <div className="absolute top-2 right-2 bg-[#D4AF37] text-[#0A0A0A] px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] shadow-[0_0_12px_rgba(212,175,55,0.5)]">
                      Atelier
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1.5 border border-white/10">
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleLike(product.id)
                      }}
                      whileTap={{ scale: 0.9 }}
                      className="text-white/80 hover:text-[#D4AF37] transition-colors"
                    >
                      <Heart size={14} className={product.isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
                    </motion.button>
                    <span className="text-[10px] font-bold text-white">{product.likes}</span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 flex-1 flex flex-col space-y-2 min-h-0">
                  {/* Product Title */}
                  <div className="flex-1 min-h-0">
                    <h3 className="text-xs font-bold text-white/95 line-clamp-2 mb-1 leading-snug">{product.title}</h3>
                    <p className="text-[10px] text-white/60 line-clamp-1 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Seller Info - Compact */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5 flex-shrink-0">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden border border-[#D4AF37]/30 flex-shrink-0">
                      <Image src={product.seller.avatar} alt={product.seller.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-white/70 truncate">{product.seller.name}</p>
                      {product.seller.verified && product.seller.rating && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={8} className="text-[#D4AF37] flex-shrink-0" />
                          <StarRating rating={product.seller.rating} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Price & CTA - Fixed at bottom */}
              <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 pt-2 border-t border-[#D4AF37]/20 bg-gradient-to-b from-transparent to-[#0A0A0A] flex-shrink-0">
                <div className="space-y-2">
                  {/* Price - Prominent & Centered */}
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-serif font-bold text-[#D4AF37] leading-none tracking-tight">
                      {product.price.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-[10px] sm:text-xs font-serif text-[#D4AF37]/90 mt-0.5">
                      {product.currency}
                    </p>
                  </div>
                  
                  {/* CTA Button - Full width, Premium */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.preventDefault()
                      handleAddToCart(product.id)
                    }}
                    className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)] transition-all"
                  >
                    ACHETER
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <Store className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[#D4AF37]/40" />
            <p className="text-sm sm:text-base text-white/50">Aucun produit trouvé</p>
          </div>
        )}
      </main>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-[#D4AF37] text-[#0A0A0A] px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-[0_10px_40px_rgba(212,175,55,0.45)] max-w-sm mx-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="flex-shrink-0" />
              <div>
                <p className="text-sm font-bold">Publication réussie !</p>
                <p className="text-xs text-[#0A0A0A]/70">Votre produit est en attente de validation</p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="ml-auto text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

