'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Heart,
  Bookmark,
  Share2,
  MoreVertical,
  Flag,
  Send,
  CheckCircle2,
  Star,
  X,
  Video,
  Play,
} from 'lucide-react'
import type { Database, Post as DbPost } from '@/shared/types/database.types'
import { cn } from '@/shared/lib/utils'
import { logMLInteraction } from '@/lib/logger'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking - Product detail view
 * @ai-context Capture l'intérêt produit pour recommandation (product_detail_view => score 2).
 */
function trackProductDetailView(payload: UserInteractionInsert) {
  // TODO: connecter à Supabase quand auth active (insert user_interactions).
  // ✅ Utilisation du logger sécurisé
  logMLInteraction(payload)
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

type Comment = {
  id: number
  user: string
  avatar: string
  text: string
  time: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''

  const product = MOCK_PRODUCTS[id] ?? null

  const [activeIndex, setActiveIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(856)
  const [commentDraft, setCommentDraft] = useState('')
  const [showComments, setShowComments] = useState(true)
  const [isButtonVisible, setIsButtonVisible] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  
  // Mock comments (style FriendKit)
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: 'Awa Ndiaye', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa', text: 'Magnifique ! Où puis-je commander ?', time: '2h', likes: 12, isLiked: false },
    { id: 2, user: 'Mariama Diallo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama', text: 'Les finitions sont impeccables ✨', time: '5h', likes: 8, isLiked: true },
    { id: 3, user: 'Khadija Sy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khadija', text: 'J\'adore le tissu !', time: '1j', likes: 15, isLiked: false },
    { id: 4, user: 'Sokhna Fall', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sokhna', text: 'Le prix est-il négociable ?', time: '2j', likes: 3, isLiked: false },
  ])

  const slides = useMemo(() => {
    if (!product) return []
    return product.gallery_urls.length > 0 ? product.gallery_urls : [product.image_url]
  }, [product])

  const similarProducts = useMemo(() => {
    if (!product) return []
    const sameType = Object.values(MOCK_PRODUCTS).filter(
      (p) => p.id !== product.id && p.garment_type === product.garment_type
    )
    const sameStyle = Object.values(MOCK_PRODUCTS).filter(
      (p) => p.id !== product.id && p.style_tags.some((t) => product.style_tags.includes(t))
    )
    const merged = [...sameType, ...sameStyle].filter(
      (p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx
    )
    return merged.slice(0, 3)
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

  // Gestion de la visibilité du bouton au scroll (comme le footer)
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    const contentEl = contentRef.current
    if (!contentEl) return

    const handleScroll = () => {
      const currentScrollY = contentEl.scrollTop
      
      // Afficher si on scroll vers le bas (plus de 100px)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsButtonVisible(true)
        clearTimeout(scrollTimeout)
        // Cacher après 2 secondes d'inactivité de scroll
        scrollTimeout = setTimeout(() => {
          setIsButtonVisible(false)
        }, 2000)
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        // Cacher si on scroll vers le haut ou si on est en haut
        setIsButtonVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    contentEl.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      contentEl.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [lastScrollY])

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current
    if (!el) return
    const width = el.clientWidth
    el.scrollTo({ left: width * idx, behavior: 'smooth' })
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleCommentLike = (commentId: number) => {
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ))
  }

  const handleSendComment = () => {
    if (!commentDraft.trim()) return
    
    const newComment: Comment = {
      id: Date.now(),
      user: 'Vous',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      text: commentDraft.trim(),
      time: 'maintenant',
      likes: 0,
      isLiked: false,
    }
    
    setComments(prev => [newComment, ...prev])
    setCommentDraft('')
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
      <div ref={contentRef} className="h-full overflow-y-auto pb-40">
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
            {/* Header avec créateur - Style FriendKit */}
            <div className="flex items-start gap-3 mb-4">
              <Link
                href={`/profil?mode=tailleur&tailor=${encodeURIComponent(product.creator.name)}`}
                className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#D4AF37]/30"
              >
                <span className="text-base text-[#D4AF37] font-bold">
                  {product.creator.name.charAt(0).toUpperCase()}
                </span>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/profil?mode=tailleur&tailor=${encodeURIComponent(product.creator.name)}`}
                    className="font-serif font-bold text-base text-[#D4AF37] hover:underline decoration-[#D4AF37]/40 underline-offset-4"
                  >
                    {product.creator.name}
                  </Link>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                </div>
                <p className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold mt-0.5">
                  Maître Tailleur
                </p>
                <p className="text-[10px] text-white/40 mt-1">Il y a 2 heures</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-black">Prix</p>
                <p className="text-lg font-serif text-[#D4AF37] font-bold">{formatFCFA(product.price)}</p>
              </div>
            </div>
            
            <h2 className="text-xl font-serif text-[#D4AF37] leading-tight mb-4">
              {product.title}
            </h2>

            <p className="mt-4 text-sm text-white/90 leading-relaxed">
              {product.caption}
            </p>

            {/* Actions - Style FriendKit */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
              <motion.button 
                onClick={handleLike}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors group"
              >
                <Heart 
                  size={22} 
                  className={`transition-all ${isLiked ? "fill-[#D4AF37] text-[#D4AF37] scale-110" : "group-hover:scale-110"}`} 
                />
                <span className="text-sm font-bold">{likesCount}</span>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors group"
              >
                <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{comments.length}</span>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="hover:text-[#D4AF37] transition-colors group"
              >
                <Share2 size={22} className="group-hover:scale-110 transition-transform" />
              </motion.button>
              
              <motion.button 
                onClick={() => setIsSaved(!isSaved)}
                whileTap={{ scale: 0.9 }}
                className="hover:text-[#D4AF37] transition-colors group ml-auto"
              >
                <Bookmark 
                  size={22} 
                  className={`transition-all ${isSaved ? "fill-[#D4AF37] text-[#D4AF37] scale-110" : "group-hover:scale-110"}`} 
                />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="hover:text-[#D4AF37] transition-colors group"
              >
                <MoreVertical size={20} className="group-hover:scale-110 transition-transform" />
              </motion.button>
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

        {/* Commentaires - Style FriendKit */}
        {showComments && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="mt-4 px-4"
          >
            <div className="bg-[#0A0A0A] border-t border-[#D4AF37]/30 rounded-2xl pt-4 pb-4 max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.18em]">
                  Commentaires ({comments.length})
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* Liste des commentaires */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#D4AF37]/30">
                      <span className="text-sm text-[#D4AF37] font-bold">
                        {comment.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{comment.user}</span>
                        <span className="text-[10px] text-white/40">{comment.time}</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button 
                          onClick={() => handleCommentLike(comment.id)}
                          className="flex items-center gap-1 text-white/40 hover:text-[#D4AF37] transition-colors"
                        >
                          <Heart size={14} className={comment.isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
                          <span className="text-[10px]">{comment.likes}</span>
                        </button>
                        <button className="text-white/40 hover:text-[#D4AF37] transition-colors text-[10px]">
                          Répondre
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input commentaire */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-white/5 border border-[#D4AF37]/30 rounded-xl px-3 py-2 focus-within:border-[#D4AF37] transition-colors">
                    <textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendComment}
                    disabled={!commentDraft.trim()}
                    className="bg-[#D4AF37] text-[#0A0A0A] p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Recommandations similaires */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="mt-6 px-4 pb-36"
        >
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#D4AF37]" />
              <h3 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">
                Recommandés pour vous
              </h3>
            </div>

            {similarProducts.length === 0 && (
              <p className="text-[11px] text-white/40">
                Aucun modèle similaire pour l’instant.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {similarProducts.map((p) => (
                <motion.article
                  key={p.id}
                  whileHover={{ translateY: -2 }}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden"
                >
                  <Link
                    href={`/product/${p.id}`}
                    className="block"
                    onClick={() => {
                      trackProductDetailView({
                        user_id: 'current-user-id',
                        post_id: String(p.id),
                        interaction_type: 'click',
                        session_id: 'session-demo',
                        duration_seconds: null,
                        scroll_depth: null,
                        came_from: 'product:recommendation_click',
                        device_type: 'web',
                        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                      })
                    }}
                  >
                    <div className="relative w-full aspect-[4/5] bg-neutral-900">
                      <Image
                        src={p.image_url}
                        alt={p.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 560px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent" />
                    </div>
                    <div className="px-3 py-3 space-y-1.5">
                      <p className="text-sm font-serif text-[#D4AF37] leading-tight line-clamp-2">{p.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">
                        {p.garment_type} • {p.fabric_type ?? '—'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white/80">{formatFCFA(p.price)}</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/80 font-black">
                          Voir
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Barre d'action fixe (conversion) - Apparaît au scroll */}
      <AnimatePresence>
        {isButtonVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-20 left-0 right-0 z-50 px-4 pointer-events-none"
          >
          <div className="max-w-2xl mx-auto bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent pt-8 pb-3">
            <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-3 flex items-center gap-2 max-w-lg mx-auto pointer-events-auto shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


