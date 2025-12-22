'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircle,
  Medal,
  Scissors,
  Sparkles,
  Tag,
  ShoppingBag,
} from 'lucide-react'
import type { Database, Post as DbPost } from '@/shared/types/database.types'
import { cn } from '@/shared/lib/utils'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking - Product detail view
 * @ai-context Capture l'intérêt produit pour recommandation (product_detail_view => score 2).
 */
function trackProductDetailView(payload: UserInteractionInsert) {
  // TODO: connecter à Supabase quand auth active (insert user_interactions).
  console.log('[ML] user_interactions.insert', payload)
}

type ProductDetail = Pick<
  DbPost,
  | 'id'
  | 'user_id'
  | 'image_url'
  | 'caption'
  | 'price'
  | 'garment_type'
  | 'complexity'
  | 'estimated_hours'
  | 'fabric_type'
  | 'cultural_tags'
  | 'style_tags'
  | 'occasion_tags'
> & {
  title: string
  creator: { id: string; name: string }
  gallery_urls: string[]
}

const MOCK_PRODUCTS: Record<string, ProductDetail> = {
  '1': {
    id: '1',
    user_id: 't1',
    title: 'Boubou Royale • Or & Basin',
    creator: { id: 't1', name: 'Atelier Fatou' },
    image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=1600&fit=crop',
    gallery_urls: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=1600&fit=crop',
      'https://images.unsplash.com/photo-1520975958225-12b1f1f1d9a7?w=1200&h=1600&fit=crop',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200&h=1600&fit=crop',
    ],
    caption: 'Boubou en basin riche, broderie royale et finitions main. Une pièce signature pour les grandes occasions.',
    price: 125000,
    garment_type: 'boubou',
    complexity: 'haute_couture',
    estimated_hours: 40,
    fabric_type: 'Bazin Riche',
    cultural_tags: ['dakar', 'traditionnel'],
    style_tags: ['luxe', 'royal'],
    occasion_tags: ['mariage', 'cérémonie'],
  },
  '2': {
    id: '2',
    user_id: 't2',
    title: 'Robe Wax • Mariage',
    creator: { id: 't2', name: 'Maison Ndèye' },
    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=1600&fit=crop',
    gallery_urls: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=1600&fit=crop',
      'https://images.unsplash.com/photo-1520975693410-55b2f6e3f246?w=1200&h=1600&fit=crop',
    ],
    caption: 'Robe wax contemporaine, coupe ajustée et détails couture. Élégance sans effort.',
    price: 75000,
    garment_type: 'robe',
    complexity: 'complexe',
    estimated_hours: 18,
    fabric_type: 'Wax Premium',
    cultural_tags: ['moderne'],
    style_tags: ['chic'],
    occasion_tags: ['mariage'],
  },
  '3': {
    id: '3',
    user_id: 't3',
    title: 'Ensemble Tailleur • Lin & Wax',
    creator: { id: 't3', name: 'Couture Aminata' },
    image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=1600&fit=crop',
    gallery_urls: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=1600&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=1600&fit=crop',
    ],
    caption: 'Lin texturé + wax accent. Un équilibre entre classicisme et identité.',
    price: 55000,
    garment_type: 'ensemble',
    complexity: 'moyen',
    estimated_hours: 12,
    fabric_type: 'Lin & Wax',
    cultural_tags: ['mixte'],
    style_tags: ['casual', 'luxe'],
    occasion_tags: ['quotidien'],
  },
  '4': {
    id: '4',
    user_id: 't1',
    title: 'Kaftan de Soirée • Signature',
    creator: { id: 't1', name: 'Atelier Fatou' },
    image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=1600&fit=crop',
    gallery_urls: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=1600&fit=crop',
      'https://images.unsplash.com/photo-1520975741466-4a62dfb2d3d9?w=1200&h=1600&fit=crop',
    ],
    caption: 'Kaftan de soirée aux lignes fluides, finitions haut de gamme. Pensé pour capturer la lumière.',
    price: 98000,
    garment_type: 'kaftan',
    complexity: 'complexe',
    estimated_hours: 22,
    fabric_type: 'Soie',
    cultural_tags: ['soirée'],
    style_tags: ['premium'],
    occasion_tags: ['gala'],
  },
}

function formatFCFA(value: number | null) {
  if (!value) return 'Sur devis'
  return `${value.toLocaleString('fr-FR')} FCFA`
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''

  const product = MOCK_PRODUCTS[id] ?? null

  const [activeIndex, setActiveIndex] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const slides = useMemo(() => {
    if (!product) return []
    return product.gallery_urls.length > 0 ? product.gallery_urls : [product.image_url]
  }, [product])

  useEffect(() => {
    // @ai-context La simple ouverture de la page détail = signal d'intérêt fort
    trackProductDetailView({
      user_id: 'current-user-id',
      post_id: product ? String(product.id) : null,
      interaction_type: 'view',
      session_id: 'session-demo',
      duration_seconds: null,
      scroll_depth: null,
      came_from: 'product:product_detail_view:score2',
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  }, [product])

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current
    if (!el) return
    const width = el.clientWidth
    el.scrollTo({ left: width * idx, behavior: 'smooth' })
  }

  if (!product) {
    return (
      <div className="bg-[#0A0A0A] text-white h-[calc(100dvh-80px)] -mb-24 flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Produit introuvable</p>
          <button
            onClick={() => router.push('/')}
            className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors"
          >
            Retour au feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0A0A0A] text-white h-[calc(100dvh-80px)] -mb-24 overflow-hidden">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors"
          aria-label="Retour"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-sm font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Détails</h1>
        <div className="w-8" />
      </header>

      {/* Contenu (mobile-first : max-w-md comme Feed/Messages) */}
      <div className="h-full overflow-y-auto pb-36">
        {/* Galerie */}
        <section className="pt-4 px-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 max-w-lg mx-auto">
            <div
              ref={scrollerRef}
              onScroll={() => {
                const el = scrollerRef.current
                if (!el) return
                const idx = Math.round(el.scrollLeft / el.clientWidth)
                if (idx !== activeIndex) setActiveIndex(idx)
              }}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
            >
              {slides.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="snap-start min-w-full"
                >
                  {/* Mobile-first, un peu plus généreux */}
                  <div className="relative w-full aspect-[4/5] max-h-[55vh]">
                    <Image
                      src={src}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 560px"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/55 to-transparent pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 pointer-events-none">
              <button
                onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                className="pointer-events-auto p-2 rounded-full bg-black/40 border border-white/10 text-white/80 hover:text-[#D4AF37] transition-colors disabled:opacity-30"
                aria-label="Image précédente"
                disabled={activeIndex === 0}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollToIndex(Math.min(slides.length - 1, activeIndex + 1))}
                className="pointer-events-auto p-2 rounded-full bg-black/40 border border-white/10 text-white/80 hover:text-[#D4AF37] transition-colors disabled:opacity-30"
                aria-label="Image suivante"
                disabled={activeIndex === slides.length - 1}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === activeIndex ? "w-8 bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.45)]" : "w-2 bg-white/20"
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Fiche technique */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 px-4"
        >
          <div className="bg-[#0A0A0A] border-t border-[#D4AF37]/30 rounded-2xl pt-4 pb-4 max-w-lg mx-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-serif text-[#D4AF37] leading-tight">
                  {product.title}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-black">
                    Créateur
                  </span>
                  <Link
                    href="/profil"
                    className="text-[11px] text-white/80 hover:text-[#D4AF37] transition-colors font-semibold truncate"
                  >
                    {product.creator.name}
                  </Link>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-black">Prix</p>
                <p className="text-lg font-serif text-[#D4AF37] font-bold">{formatFCFA(product.price)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Tag size={14} />
                  <p className="text-[9px] uppercase tracking-[0.22em] font-black text-[#D4AF37]/80">Tissu</p>
                </div>
                <p className="mt-2 text-xs text-white/80 truncate">{product.fabric_type ?? '—'}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Scissors size={14} />
                  <p className="text-[9px] uppercase tracking-[0.22em] font-black text-[#D4AF37]/80">Complexité</p>
                </div>
                <p className="mt-2 text-xs text-white/80 truncate">{product.complexity}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Clock3 size={14} />
                  <p className="text-[9px] uppercase tracking-[0.22em] font-black text-[#D4AF37]/80">Temps</p>
                </div>
                <p className="mt-2 text-xs text-white/80 truncate">
                  {product.estimated_hours ? `${product.estimated_hours}h` : '—'}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-white/75 leading-relaxed">
              {product.caption}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[...product.occasion_tags, ...product.style_tags].slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] bg-[#0A0A0A] border border-[#D4AF37]/20 text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Barre d'action fixe (conversion) */}
      <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
        <div className="max-w-2xl mx-auto bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent pt-3">
          <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-3 flex items-center gap-2 max-w-lg mx-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/order/${product.id}`)}
              className="flex-1 bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl font-black uppercase tracking-[0.18em] text-[10px] shadow-[0_0_18px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Commander ce modèle
            </motion.button>

            <Link
              href="/messages"
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] bg-[#0A0A0A] hover:bg-[#D4AF37]/10 transition-colors"
              aria-label="Envoyer un message"
            >
              <MessageCircle size={18} />
            </Link>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                trackProductDetailView({
                  user_id: 'current-user-id',
                  post_id: String(product.id),
                  interaction_type: 'save',
                  session_id: 'session-demo',
                  duration_seconds: null,
                  scroll_depth: null,
                  came_from: 'product:save_to_patrimoine',
                  device_type: 'web',
                  user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                })
              }}
              className="flex items-center justify-center px-3 py-3 rounded-xl border border-white/10 text-[#D4AF37] bg-white/[0.03] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all"
              aria-label="Enregistrer dans mon Patrimoine Style"
            >
              <Medal size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}


