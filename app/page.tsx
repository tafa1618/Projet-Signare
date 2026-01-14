'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useInfiniteScrollPagination } from '@/hooks/usePagination'
import { Loader2 } from 'lucide-react'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  Star, 
  Eye, 
  ExternalLink,
  MessageSquare,
  Scissors,
  Plus,
  LogOut,
  Repeat2,
  Bell,
  Search,
  X,
  Send,
  MoreVertical,
  Flag,
  Video,
  Play,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Store,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/shared/lib/utils'
import CartDropdown from '@/components/CartDropdown'
import SearchModal from '@/components/SearchModal'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/frontend/hooks/useAuth'
import { logMLInteraction } from '@/lib/logger'

// Types pour les posts
type PostType = 'tailor' | 'client'

interface MediaItem {
  url: string
  type: 'image' | 'video'
}

interface Post {
  id: number
  type: PostType
  user: {
    name: string
    avatar: string
    isVerified: boolean
    role: string
    specialty?: string
  }
  image: string // Pour compatibilité avec l'ancien code
  media?: MediaItem[] // Nouveau : support multi-médias
  caption: string
  price?: string
  likes: number
  comments: number
  reposts?: number
  isLiked: boolean
  isSaved: boolean
  isReposted?: boolean
  repostOfId?: number | null
  repostedByMe?: boolean
  taggedTailor?: {
    name: string
    id: string
  }
  garment_type: string
  fabric_type?: string
  complexity_score?: number
  quality_rating?: number
  quote_comment?: string | null
  quote_media?: string | null
}

// Données mockées pour transition (sera remplacé par API Supabase)
const mockPosts: Post[] = [
  {
    id: 0,
    type: 'client',
    user: {
      name: 'Vous',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RepostDemo',
      isVerified: false,
      role: 'Repost',
    },
    repostOfId: 1,
    repostedByMe: true,
    image: 'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=800&h=1000&fit=crop&q=80',
    caption: 'Boubou Royale en basin riche. Un travail de broderie de plus de 40 heures. ✨🇸🇳',
    likes: 0,
    comments: 0,
    reposts: 1,
    isLiked: false,
    isSaved: false,
    isReposted: true,
    taggedTailor: {
      name: 'Atelier Fatou',
      id: 'tailor-fatou',
    },
    garment_type: 'Boubou',
    quality_rating: 5,
    quote_comment: "🔥 À voir absolument — finitions dignes d'un défilé.",
    quote_media: 'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=900&h=1200&fit=crop&q=80',
  },
  {
    id: 1,
    type: 'tailor',
    user: {
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
      isVerified: true,
      role: 'Maître Tailleur',
      specialty: 'Spécialiste Basin Riche & Broderie Royale',
    },
    image: 'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=800&h=1000&fit=crop&q=80',
    caption: 'Boubou Royale en basin riche. Un travail de broderie de plus de 40 heures. ✨🇸🇳',
    price: '125 000 FCFA',
    likes: 856,
    comments: 45,
    isLiked: false,
    isSaved: false,
    garment_type: 'Boubou',
    fabric_type: 'Basin Riche',
    complexity_score: 5,
  },
  {
    id: 2,
    type: 'client',
    user: {
      name: 'Mariama Diallo',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama',
      isVerified: false,
      role: 'Passionnée de Mode',
    },
    taggedTailor: {
      name: 'Maison Ndèye',
      id: 'tailor-ndeye',
    },
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1000&fit=crop&q=80',
    caption: 'Tellement satisfaite de ma tenue pour le mariage de ma sœur ! 😍👜',
    likes: 1243,
    comments: 89,
    isLiked: true,
    isSaved: true,
    garment_type: 'Robe Wax',
    quality_rating: 5,
  },
  {
    id: 3,
    type: 'tailor',
    user: {
      name: 'Couture Aminata',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
      isVerified: true,
      role: 'Designer Mode',
      specialty: 'Prêt-à-porter de luxe & Wax contemporain',
    },
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop&q=80',
    caption: 'Collection capsule : Le lin rencontre le wax. L\'élégance au quotidien. 🌿✨',
    price: '55 000 FCFA',
    likes: 432,
    comments: 24,
    isLiked: false,
    isSaved: false,
    garment_type: 'Ensemble Tailleur',
    fabric_type: 'Lin & Wax',
    complexity_score: 4,
  },
  {
    id: 4,
    type: 'client',
    user: {
      name: 'Khadija Sy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khadija',
      isVerified: true,
      role: 'Influenceuse SIGNARE',
    },
    taggedTailor: {
      name: 'Atelier Fatou',
      id: 'tailor-fatou',
    },
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop&q=80',
    caption: 'Le chic sénégalais dans toute sa splendeur. Toujours fidèle à mon tailleur préféré. ✨🇸🇳',
    likes: 3567,
    comments: 156,
    isLiked: false,
    isSaved: true,
    garment_type: 'Kaftan de Soirée',
    quality_rating: 5,
  },
  {
    id: 5,
    type: 'tailor',
    user: {
      name: 'Maison Ndèye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ndeye',
      isVerified: true,
      role: 'Atelier Vérifié',
      specialty: 'Wax Premium & Coupe Ajustée',
    },
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=1000&fit=crop&q=80',
    caption: 'Robe wax couture : tombé parfait, finitions main et ceinture signature. Élégance sobre. ✨',
    price: '75 000 FCFA',
    likes: 642,
    comments: 31,
    isLiked: false,
    isSaved: false,
    garment_type: 'Robe Wax',
    fabric_type: 'Wax Premium',
    complexity_score: 4,
  },
  {
    id: 6,
    type: 'client',
    user: {
      name: 'Awa Ndiaye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa',
      isVerified: false,
      role: 'Membre SIGNARE',
    },
    taggedTailor: {
      name: 'Couture Aminata',
      id: 'tailor-aminata',
    },
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1000&fit=crop&q=80',
    caption: 'Tenue parfaite pour la Tabaski. Broderies fines, coupe impeccable. Merci ! 🇸🇳',
    likes: 982,
    comments: 64,
    isLiked: false,
    isSaved: true,
    garment_type: 'Boubou',
    quality_rating: 5,
  },
  {
    id: 7,
    type: 'tailor',
    user: {
      name: 'Atelier Téranga',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teranga',
      isVerified: true,
      role: 'Maître Tailleur',
      specialty: 'Kaftans premium & Soie',
    },
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop&q=80',
    caption: 'Kaftan de soirée en soie : lumière, fluidité, détails couture. Une pièce premium. ✨',
    price: '98 000 FCFA',
    likes: 1240,
    comments: 77,
    isLiked: true,
    isSaved: false,
    garment_type: 'Kaftan',
    fabric_type: 'Soie',
    complexity_score: 4,
  },
  {
    id: 8,
    type: 'client',
    user: {
      name: 'Sokhna Fall',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sokhna',
      isVerified: true,
      role: 'Membre SIGNARE',
    },
    taggedTailor: {
      name: 'Atelier Fatou',
      id: 'tailor-fatou',
    },
    image: 'https://images.unsplash.com/photo-1520975868797-1c3e0e012a4c?w=800&h=1000&fit=crop&q=80',
    caption: 'Minimaliste mais royal. Le tissu est incroyable et les finitions sont nettes.',
    likes: 2103,
    comments: 102,
    isLiked: false,
    isSaved: false,
    garment_type: 'Ensemble',
    quality_rating: 4,
  },
  {
    id: 9,
    type: 'tailor',
    user: {
      name: 'Studio Dakar Luxe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DakarLuxe',
      isVerified: true,
      role: 'Designer Mode',
      specialty: 'Prêt-à-porter luxe & Lin',
    },
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=1000&fit=crop&q=80',
    caption: 'Ensemble en lin texturé : coupe moderne, confort premium, détails discrets en or.',
    price: '55 000 FCFA',
    likes: 518,
    comments: 22,
    isLiked: false,
    isSaved: true,
    garment_type: 'Ensemble',
    fabric_type: 'Lin',
    complexity_score: 3,
  },
  {
    id: 10,
    type: 'client',
    user: {
      name: 'Fatou Dia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FatouDia',
      isVerified: false,
      role: 'Membre SIGNARE',
    },
    taggedTailor: {
      name: 'Maison Ndèye',
      id: 'tailor-ndeye',
    },
    image: 'https://images.unsplash.com/photo-1542293787938-4d22170c3b99?w=800&h=1000&fit=crop&q=80',
    caption: 'Un look quotidien chic. J’adore le tombé et le confort.',
    likes: 721,
    comments: 38,
    isLiked: false,
    isSaved: false,
    garment_type: 'Robe',
    quality_rating: 4,
  },
]

// Fonction de fetch pour pagination (compatible mock + API)
const fetchPosts = async (page: number, pageSize: number): Promise<{
  data: Post[]
  total?: number
  hasMore: boolean
}> => {
  // TODO: Remplacer par appel API Supabase quand disponible
  // Pour l'instant, pagination côté client avec mockPosts pour transition
  const USE_API = false // Flag pour activer l'API Supabase
  
  if (USE_API) {
    // Appel API Supabase
    const response = await fetch(`/api/posts?page=${page}&pageSize=${pageSize}`)
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des posts')
    }
    const data = await response.json()
    return {
      data: data.data as Post[],
      total: data.total,
      hasMore: data.hasMore,
    }
  } else {
    // Pagination côté client avec mockPosts (transition)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedPosts = mockPosts.slice(startIndex, endIndex)
    const hasMore = endIndex < mockPosts.length
    
    // Simuler un délai réseau pour UX réaliste
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      data: paginatedPosts,
      total: mockPosts.length,
      hasMore,
    }
  }
}

// Helper component for Ratings (Stars)
const StarRating = ({ rating, color = "#D4AF37" }: { rating: number, color?: string }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star 
        key={s} 
        size={10} 
        className={s <= rating ? "fill-current" : "text-white/20"} 
        style={{ color: s <= rating ? color : undefined }}
      />
    ))}
  </div>
)

type InteractionPayload = {
  post_id: number
  interaction_type: 'post_view'
  interaction_score: number
  metadata?: Record<string, unknown>
}

/**
 * Tracking de visibilité (vue > 3s)
 * @ai-context Alimente le dataset de recommandation via interaction_score.
 */
function useTrackPostVisibility(payload: InteractionPayload) {
  const ref = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        if (entry.isIntersecting) {
          if (hasTrackedRef.current) return
          timerRef.current = setTimeout(() => {
            if (hasTrackedRef.current) return
            hasTrackedRef.current = true
            // ✅ ML tracking sécurisé (sanitization automatique)
            logMLInteraction({
              ...payload,
              timestamp: new Date().toISOString(),
            })
          }, 3000)
        } else {
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = null
        }
      },
      { threshold: 0.6 }
    )

    observer.observe(el)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      observer.disconnect()
    }
  }, [payload])

  return ref
}

// Card Tailleur (viewport-friendly, Z-pattern, CTA + Like sur la même ligne)
const TailorCard = ({ post, onLike, onSave, onRepost, openCommentModal }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void, onRepost: (id: number) => void, openCommentModal: (id: number) => void }) => {
  const trackRef = useTrackPostVisibility({
    post_id: post.id,
    interaction_type: 'post_view',
    interaction_score: 2,
    metadata: { role: 'tailleur', garment_type: post.garment_type, fabric_type: post.fabric_type },
  })
  
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})
  const mediaContainerRef = useRef<HTMLDivElement>(null)
  
  // Récupérer les médias (nouveau format ou ancien format pour compatibilité)
  const mediaItems: MediaItem[] = post.media && post.media.length > 0 
    ? post.media 
    : [{ url: post.image, type: 'image' }]
  
  // Autoplay pour les vidéos visibles (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Jouer la vidéo de l'index actuel si c'est une vidéo
            const currentMedia = mediaItems[currentMediaIndex]
            if (currentMedia?.type === 'video') {
              const video = videoRefs.current[currentMediaIndex]
              if (video) {
                video.play().catch(() => {
                  // Ignorer les erreurs d'autoplay (politique du navigateur)
                })
              }
            }
          } else {
            // Pauser toutes les vidéos quand la carte n'est plus visible
            Object.values(videoRefs.current).forEach((video) => {
              if (video) {
                video.pause()
              }
            })
          }
        })
      },
      { threshold: 0.5 }
    )
    
    if (mediaContainerRef.current) {
      observer.observe(mediaContainerRef.current)
    }
    
    return () => observer.disconnect()
  }, [currentMediaIndex, mediaItems])
  
  // Pauser la vidéo précédente quand on change de média
  useEffect(() => {
    const prevVideo = videoRefs.current[currentMediaIndex]
    if (prevVideo && mediaItems[currentMediaIndex]?.type === 'video') {
      prevVideo.play().catch(() => {})
    }
    
    // Pauser les autres vidéos
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (video && Number(index) !== currentMediaIndex) {
        video.pause()
      }
    })
  }, [currentMediaIndex, mediaItems])
  
  const goToNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
  }
  
  const goToPrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  return (
    <motion.article
      ref={trackRef as unknown as React.RefObject<HTMLElement>}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-2 sm:mx-3 mb-4 sm:mb-6 bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#D4AF37]/25 transition-all"
    >
      {post.repostOfId && (
        <div className="px-2 sm:px-3 pt-2 sm:pt-3">
          <div className="rounded-lg border border-[#D4AF37]/25 bg-white/5 p-2 sm:p-3 space-y-1.5 sm:space-y-2">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-black">
              Republié · <span className="text-white/70">par {post.user.name}</span>
            </p>
            {post.quote_comment && (
              <p className="text-xs sm:text-sm text-white/80 leading-snug">{post.quote_comment}</p>
            )}
            {post.quote_media && (
              <div className="relative w-full h-28 sm:h-32 rounded-md overflow-hidden border border-[#D4AF37]/20">
                <Image 
                  src={post.quote_media} 
                  alt="Media cité" 
                  fill 
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/900x1200/0A0A0A/D4AF37?text=SIGNARE'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Propriétaire de la publication - En haut avant la photo */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href={`/profil?mode=tailleur&tailor=${encodeURIComponent(post.user.name)}`}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D4AF37]/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#D4AF37]/30"
            >
              <span className="text-xs sm:text-sm text-[#D4AF37] font-bold">
                {post.user.name.charAt(0).toUpperCase()}
              </span>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <Link
                  href={`/profil?mode=tailleur&tailor=${encodeURIComponent(post.user.name)}`}
                  className="font-serif font-bold text-xs sm:text-sm text-[#D4AF37] truncate hover:text-[#D4AF37] hover:underline decoration-[#D4AF37]/40 underline-offset-4"
                >
                  {post.user.name}
                </Link>
                {post.user.isVerified && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] flex-shrink-0" />}
              </div>
              <p className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold truncate">{post.user.role}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[8px] sm:text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">À partir de</p>
            <p className="text-sm sm:text-base font-serif font-bold text-[#D4AF37] leading-none">{post.price}</p>
          </div>
        </div>
      </div>
      
      {/* Carrousel de médias : max 50vh sur mobile, limité sur desktop */}
      <div ref={mediaContainerRef} className="relative w-full aspect-[4/5] max-h-[50vh] md:max-h-[350px] md:aspect-[4/5] bg-neutral-900">
        <Link
          href={`/product/${post.id}`}
          className="relative block w-full h-full"
          aria-label="Voir le détail du produit"
        >
          {mediaItems.map((media, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                index === currentMediaIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              {media.type === 'video' ? (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el
                  }}
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  controls={false}
                />
              ) : (
                <Image
                  src={media.url}
                  alt={post.caption}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 560px"
                  priority={post.id === 1 && index === 0}
                  onError={(e) => {
                    // Fallback vers une image placeholder si l'image ne charge pas
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/800x1000/0A0A0A/D4AF37?text=SIGNARE'
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent pointer-events-none" />
            </div>
          ))}
          
          {/* Badge Tailleur */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
            <span className="bg-[#D4AF37] text-[#0A0A0A] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)]">
              Atelier
            </span>
          </div>
          
          {/* Badge Vidéo */}
          {mediaItems[currentMediaIndex]?.type === 'video' && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 bg-black/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5">
              <Video size={10} className="sm:w-3 sm:h-3 text-[#D4AF37]" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] text-white/90">Vidéo</span>
            </div>
          )}
          
          {/* Navigation carrousel */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  goToPrevMedia()
                }}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-1.5 sm:p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                aria-label="Média précédent"
              >
                <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  goToNextMedia()
                }}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-1.5 sm:p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                aria-label="Média suivant"
              >
                <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              
              {/* Indicateurs de position */}
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 z-20">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentMediaIndex(index)
                    }}
                    className={cn(
                      "h-1 sm:h-1.5 rounded-full transition-all",
                      index === currentMediaIndex
                        ? "w-5 sm:w-6 bg-[#D4AF37]"
                        : "w-1 sm:w-1.5 bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Aller au média ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </Link>
      </div>

      {/* Bloc compact sous image (Z-pattern) - Style FriendKit */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3 pt-1">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold">
            <span className="truncate">{post.garment_type}</span>
            {post.fabric_type && (
              <>
                <span className="text-white/30">•</span>
                <span className="truncate">{post.fabric_type}</span>
              </>
            )}
          </div>
          <StarRating rating={post.complexity_score || 0} />
        </div>

        <p className="text-xs sm:text-sm text-white/90 leading-relaxed break-words">
          {post.caption}
        </p>

        {/* Actions : Like + Devis sur la même ligne - Style FriendKit */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 text-white/50 flex-wrap">
            <motion.button 
              onClick={() => onLike(post.id)} 
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 sm:gap-1.5 hover:text-[#D4AF37] transition-colors group"
            >
              <Heart 
                size={18} 
                className={`sm:w-5 sm:h-5 transition-all ${post.isLiked ? "fill-[#D4AF37] text-[#D4AF37] scale-110" : "group-hover:scale-110"}`} 
              />
              <span className="text-[10px] sm:text-xs font-bold">{post.likes}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => openCommentModal(post.id)}
              className="flex items-center gap-1 sm:gap-1.5 hover:text-[#D4AF37] transition-colors group"
              aria-label="Commentaires"
            >
              <MessageSquare size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-xs font-bold">{post.comments}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onRepost(post.id)}
              className="flex items-center gap-1 sm:gap-1.5 hover:text-[#D4AF37] transition-colors group"
              aria-label="Republier"
            >
              <Repeat2 size={18} className={`sm:w-5 sm:h-5 transition-all ${post.isReposted ? "text-[#D4AF37] scale-110" : "group-hover:scale-110"}`} />
              <span className="text-[10px] sm:text-xs font-bold">{post.reposts ?? 0}</span>
            </motion.button>
            <motion.button 
              onClick={() => onSave(post.id)} 
              whileTap={{ scale: 0.9 }}
              className="hover:text-[#D4AF37] transition-colors group"
            >
              <Bookmark size={18} className={`sm:w-5 sm:h-5 transition-all ${post.isSaved ? "fill-[#D4AF37] text-[#D4AF37] scale-110" : "group-hover:scale-110"}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="hover:text-[#D4AF37] transition-colors group"
              aria-label="Plus d'options"
            >
              <MoreVertical size={16} className="sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform" />
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Link
              href={`/messages?tailor=${encodeURIComponent(post.user.name)}`}
              className="bg-white/5 border border-[#D4AF37]/25 text-[#D4AF37] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/10 transition-all active:scale-95 flex items-center gap-1.5 sm:gap-2"
              aria-label="Discuter avec le tailleur"
            >
              <MessageCircle size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="hidden xs:inline">Discuter</span>
            </Link>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="bg-[#D4AF37] text-[#0A0A0A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)] transition-all whitespace-nowrap"
            >
              Devis
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// Card Client (viewport-friendly, mention "Réalisé par...", CTA = Liker)
const ClientCard = ({ post, onLike, onSave, onRepost, openCommentModal }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void, onRepost: (id: number) => void, openCommentModal: (id: number) => void }) => {
  const trackRef = useTrackPostVisibility({
    post_id: post.id,
    interaction_type: 'post_view',
    interaction_score: 2,
    metadata: { role: 'client', garment_type: post.garment_type, tailor: post.taggedTailor?.name },
  })
  
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})
  const mediaContainerRef = useRef<HTMLDivElement>(null)
  
  // Récupérer les médias (nouveau format ou ancien format pour compatibilité)
  const mediaItems: MediaItem[] = post.media && post.media.length > 0 
    ? post.media 
    : [{ url: post.image, type: 'image' }]
  
  // Autoplay pour les vidéos visibles (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Jouer la vidéo de l'index actuel si c'est une vidéo
            const currentMedia = mediaItems[currentMediaIndex]
            if (currentMedia?.type === 'video') {
              const video = videoRefs.current[currentMediaIndex]
              if (video) {
                video.play().catch(() => {
                  // Ignorer les erreurs d'autoplay (politique du navigateur)
                })
              }
            }
          } else {
            // Pauser toutes les vidéos quand la carte n'est plus visible
            Object.values(videoRefs.current).forEach((video) => {
              if (video) {
                video.pause()
              }
            })
          }
        })
      },
      { threshold: 0.5 }
    )
    
    if (mediaContainerRef.current) {
      observer.observe(mediaContainerRef.current)
    }
    
    return () => observer.disconnect()
  }, [currentMediaIndex, mediaItems])
  
  // Pauser la vidéo précédente quand on change de média
  useEffect(() => {
    const prevVideo = videoRefs.current[currentMediaIndex]
    if (prevVideo && mediaItems[currentMediaIndex]?.type === 'video') {
      prevVideo.play().catch(() => {})
    }
    
    // Pauser les autres vidéos
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (video && Number(index) !== currentMediaIndex) {
        video.pause()
      }
    })
  }, [currentMediaIndex, mediaItems])
  
  const goToNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
  }
  
  const goToPrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  return (
    <motion.article
      ref={trackRef as unknown as React.RefObject<HTMLElement>}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-2 sm:mx-3 mb-4 sm:mb-6 bg-[#0A0A0A] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#D4AF37]/20 transition-all"
    >
      {post.repostOfId && (
        <div className="px-2 sm:px-3 pt-2 sm:pt-3">
          <div className="rounded-lg border border-[#D4AF37]/25 bg-white/5 p-2 sm:p-3 space-y-1.5 sm:space-y-2">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-black">
              Republié · <span className="text-white/70">par {post.user.name}</span>
            </p>
            {post.quote_comment && (
              <p className="text-xs sm:text-sm text-white/80 leading-snug">{post.quote_comment}</p>
            )}
            {post.quote_media && (
              <div className="relative w-full h-28 sm:h-32 rounded-md overflow-hidden border border-[#D4AF37]/20">
                <Image 
                  src={post.quote_media} 
                  alt="Media cité" 
                  fill 
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/900x1200/0A0A0A/D4AF37?text=SIGNARE'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Propriétaire de la publication - En haut avant la photo */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link
              href={`/profil?mode=client&client=${encodeURIComponent(post.user.name)}`}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D4AF37]/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#D4AF37]/30"
            >
              <span className="text-xs sm:text-sm text-[#D4AF37] font-bold">
                {post.user.name.charAt(0).toUpperCase()}
              </span>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link
                  href={`/profil?mode=client&client=${encodeURIComponent(post.user.name)}`}
                  className="font-bold text-sm text-white/90 truncate hover:text-[#D4AF37] hover:underline decoration-[#D4AF37]/40 underline-offset-4"
                >
                  {post.user.name}
                </Link>
                {post.user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />}
              </div>
              <p className="text-[10px] text-[#D4AF37]/80 uppercase tracking-[0.15em] font-semibold truncate">
                Réalisé par{' '}
                {post.taggedTailor?.name ? (
                  <Link
                    href={`/profil?mode=tailleur&tailor=${encodeURIComponent(post.taggedTailor.name)}`}
                    className="hover:text-[#D4AF37] hover:underline decoration-[#D4AF37]/40 underline-offset-4"
                  >
                    {post.taggedTailor.name}
                  </Link>
                ) : (
                  '—'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Carrousel de médias : max 50vh sur mobile, limité sur desktop */}
      <div ref={mediaContainerRef} className="relative w-full aspect-[4/5] max-h-[50vh] md:max-h-[350px] md:aspect-[4/5] bg-neutral-900">
        <Link
          href={`/product/${post.id}`}
          className="relative block w-full h-full"
          aria-label="Voir le détail du produit"
        >
          {mediaItems.map((media, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                index === currentMediaIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              {media.type === 'video' ? (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el
                  }}
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  controls={false}
                />
              ) : (
                <Image
                  src={media.url}
                  alt={post.caption}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 560px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/55 to-transparent pointer-events-none" />
            </div>
          ))}
          
          {/* Badge Vidéo */}
          {mediaItems[currentMediaIndex]?.type === 'video' && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 bg-black/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5">
              <Video size={10} className="sm:w-3 sm:h-3 text-[#D4AF37]" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] text-white/90">Vidéo</span>
            </div>
          )}
          
          {/* Navigation carrousel */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  goToPrevMedia()
                }}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-1.5 sm:p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                aria-label="Média précédent"
              >
                <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  goToNextMedia()
                }}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-1.5 sm:p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                aria-label="Média suivant"
              >
                <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              
              {/* Indicateurs de position */}
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 z-20">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentMediaIndex(index)
                    }}
                    className={cn(
                      "h-1 sm:h-1.5 rounded-full transition-all",
                      index === currentMediaIndex
                        ? "w-5 sm:w-6 bg-[#D4AF37]"
                        : "w-1 sm:w-1.5 bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Aller au média ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </Link>
      </div>

      {/* Bloc compact sous image (Z-pattern) - Style FriendKit */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold">
            <span className="truncate">{post.garment_type}</span>
          </div>
          <div className="flex items-center gap-3">
            <StarRating rating={post.quality_rating || 0} />
            <button onClick={() => onSave(post.id)} className="text-white/40 hover:text-[#D4AF37] transition-colors active:scale-95">
              <Bookmark size={18} className={post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/90 leading-relaxed break-words">
          {post.caption}
        </p>

        {/* Actions : Like + Liker sur la même ligne - Style FriendKit */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4 text-white/50 flex-wrap">
            <motion.button 
              onClick={() => onLike(post.id)} 
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors group"
            >
              <Heart 
                size={20} 
                className={`transition-all ${post.isLiked ? "fill-[#D4AF37] text-[#D4AF37] scale-110" : "group-hover:scale-110"}`} 
              />
              <span className="text-xs font-bold">{post.likes}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => openCommentModal(post.id)}
              className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors group"
              aria-label="Commentaires"
            >
              <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">{post.comments}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onRepost(post.id)}
              className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors group"
              aria-label="Republier"
            >
              <Repeat2 size={20} className={`transition-all ${post.isReposted ? "text-[#D4AF37] scale-110" : "group-hover:scale-110"}`} />
              <span className="text-xs font-bold">{post.reposts ?? 0}</span>
            </motion.button>
            <motion.button 
              onClick={() => onSave(post.id)} 
              whileTap={{ scale: 0.9 }}
              className="hover:text-[#D4AF37] transition-colors group"
            >
              <Bookmark size={20} className={`transition-all ${post.isSaved ? "fill-[#D4AF37] text-[#D4AF37] scale-110" : "group-hover:scale-110"}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="hover:text-[#D4AF37] transition-colors group"
              aria-label="Plus d'options"
            >
              <MoreVertical size={18} className="group-hover:scale-110 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function HomePage() {
  // ✅ Pagination automatique avec infinite scroll (scroll infini automatique)
  const {
    data: paginatedPosts,
    isLoading,
    isLoadingMore,
    hasMore,
    error: paginationError,
    observerTarget,
  } = useInfiniteScrollPagination<Post>(fetchPosts, {
    pageSize: 5, // 5 posts par page pour UX mobile
    initialPage: 1,
    enabled: true,
    threshold: 0.1, // Déclencher à 10% du bas de l'écran
  })

  // État local pour gérer les modifications (likes, saves, reposts, etc.)
  const [postModifications, setPostModifications] = useState<Map<number, Partial<Post>>>(new Map())
  
  // Combiner les posts paginés avec les modifications locales
  const posts = useMemo(() => {
    return paginatedPosts.map(post => {
      const modifications = postModifications.get(post.id)
      return modifications ? { ...post, ...modifications } : post
    })
  }, [paginatedPosts, postModifications])

  const [repostModal, setRepostModal] = useState<{ postId: number; comment: string; media: string | null } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [commentModal, setCommentModal] = useState<{ postId: number; comments: Array<{ id: number; user: string; avatar: string; text: string; time: string; likes: number }> } | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const router = useRouter()

  const currentRepostPost = repostModal ? posts.find((p) => p.id === repostModal.postId) : null

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])


  // ✅ Utilisation de Supabase Auth au lieu de localStorage
  const { user, isLoading: authLoading, signOut } = useAuth()

  const handleLogout = async () => {
    // ✅ Déconnexion via Supabase Auth
    await signOut()
    router.push('/welcome')
  }

  const handleLike = (postId: number) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    
    setPostModifications(prev => {
      const newMap = new Map(prev)
      const currentMods = newMap.get(postId) || {}
      const wasLiked = currentMods.isLiked ?? post.isLiked
      const currentLikes = currentMods.likes ?? post.likes
      
      newMap.set(postId, {
        ...currentMods,
        isLiked: !wasLiked,
        likes: wasLiked ? currentLikes - 1 : currentLikes + 1,
      })
      return newMap
    })
  }

  const handleSave = (postId: number) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    
    setPostModifications(prev => {
      const newMap = new Map(prev)
      const currentMods = newMap.get(postId) || {}
      const wasSaved = currentMods.isSaved ?? post.isSaved
      
      newMap.set(postId, {
        ...currentMods,
        isSaved: !wasSaved,
      })
      return newMap
    })
  }

  const openCommentModal = (postId: number) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    
    // Mock comments (à remplacer par des vraies données)
    const mockComments = [
      { id: 1, user: 'Awa Ndiaye', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa', text: 'Magnifique ! Où puis-je commander ?', time: '2h', likes: 12 },
      { id: 2, user: 'Mariama Diallo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama', text: 'Les finitions sont impeccables ✨', time: '5h', likes: 8 },
      { id: 3, user: 'Khadija Sy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khadija', text: "J'adore le tissu !", time: '1j', likes: 15 },
    ]
    
    setCommentModal({ postId, comments: mockComments })
  }

  const handleSendComment = () => {
    if (!commentModal || !commentDraft.trim()) return
    
    const newComment = {
      id: Date.now(),
      user: 'Vous',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      text: commentDraft.trim(),
      time: 'maintenant',
      likes: 0,
    }
    
    setCommentModal({
      ...commentModal,
      comments: [newComment, ...commentModal.comments],
    })
    
    // Mettre à jour le nombre de commentaires du post
    const post = posts.find(p => p.id === commentModal.postId)
    if (post) {
      setPostModifications(prev => {
        const newMap = new Map(prev)
        const currentMods = newMap.get(commentModal.postId) || {}
        const currentComments = currentMods.comments ?? post.comments
        
        newMap.set(commentModal.postId, {
          ...currentMods,
          comments: currentComments + 1,
        })
        return newMap
      })
    }
    
    setCommentDraft('')
  }

  const openRepost = (postId: number) => {
    // ✅ Vérification d'authentification via Supabase Auth
    if (!user) {
      // Sauvegarde de l'intention (repost) pour reprise après login
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('signare_intent', JSON.stringify({ type: 'repost', postId, created_at: new Date().toISOString() }))
        }
      } catch {
        // ignore
      }
      router.push(`/login?next=${encodeURIComponent('/')}&intent=repost&postId=${postId}`)
      return
    }

    const found = posts.find((p) => p.id === postId)
    setRepostModal({ postId, comment: found?.quote_comment ?? '', media: found?.quote_media ?? null })
  }

  const applyRepost = (postId: number, action: 'instant' | 'quote' | 'remove', comment?: string, media?: string | null) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    const wasReposted = post.isReposted ?? false
    const willRepost = action === 'remove' ? false : true
    const currentCount = post.reposts ?? 0
    const nextCount =
      action === 'remove'
        ? Math.max(0, currentCount - (wasReposted ? 1 : 0))
        : currentCount + (wasReposted ? 0 : 1)

    const payloadType =
      action === 'remove' ? 'unrepost' : action === 'quote' ? 'repost_quote' : 'repost'
    const interactionScore = action === 'remove' ? 1 : action === 'quote' ? 4 : 3

    // ✅ ML tracking sécurisé
    logMLInteraction({
      post_id: postId,
      interaction_type: payloadType,
      interaction_score: interactionScore,
      metadata: { source: 'feed', role: post.type, garment_type: post.garment_type, quote: comment?.length ? true : false, media: !!media },
      timestamp: new Date().toISOString(),
    })

    try {
      const raw = localStorage.getItem('signare_reposts')
      const current = raw ? (JSON.parse(raw) as any[]) : []
      const actor = 'demo-user'
      if (action === 'remove') {
        const next = Array.isArray(current)
          ? current.filter((r) => !(r.user_id === actor && r.post_id === String(postId)))
          : []
        localStorage.setItem('signare_reposts', JSON.stringify(next))
      } else {
        const item = { user_id: actor, post_id: String(postId), comment: comment ?? null, media: media ?? null, created_at: new Date().toISOString() }
        const next = [item, ...(Array.isArray(current) ? current.filter((r) => !(r.user_id === actor && r.post_id === String(postId))) : [])]
        localStorage.setItem('signare_reposts', JSON.stringify(next))
      }
    } catch {
      // ignore
    }

    // Mettre à jour les modifications locales
    setPostModifications(prev => {
      const newMap = new Map(prev)
      const currentMods = newMap.get(postId) || {}
      
      newMap.set(postId, {
        ...currentMods,
        isReposted: willRepost,
        reposts: nextCount,
        quote_comment: action === 'remove' ? null : comment ?? null,
        quote_media: action === 'remove' ? null : media ?? null,
      })
      return newMap
    })

    if (action === 'remove') {
      setToast('Republication retirée')
      return
    }

    // Pour les reposts avec quote, on peut ajouter un nouveau post dans le feed
    // TODO: Implémenter l'ajout d'un nouveau post de repost dans le feed si nécessaire
    setToast('Republié sur votre feed')
  }

  const onRepost = (postId: number) => {
    openRepost(postId)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20 text-white">
        <div className="max-w-2xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-[#D4AF37] p-1 sm:p-1.5 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)] flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A]" />
              </div>
              <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em] truncate">SIGNARE</h1>
            </div>
            
            {/* Desktop: Tous les boutons visibles */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(true)}
                className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                title="Rechercher"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              
              {/* Shop */}
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                  title="Boutique"
                >
                  <Store className="w-5 h-5" />
                </motion.button>
              </Link>
              
              {/* Panier */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCartOpen(!cartOpen)
                  }}
                  className="relative text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                  title="Panier"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                  )}
                </motion.button>
                {cartOpen && <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />}
              </div>
              
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
              </motion.button>
              
              {/* Messages */}
              <Link href="/messages">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                  title="Messages"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                </motion.button>
              </Link>
              
              {/* Avatar Profil */}
              <Link href="/profil">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden flex-shrink-0"
                  title="Profil"
                >
                  <span className="text-sm text-[#D4AF37] font-bold">
                    U
                  </span>
                </motion.button>
              </Link>
              
              {/* Publish */}
              <Link href="/publish">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-[#D4AF37] p-2 rounded-full shadow-lg flex-shrink-0"
                  title="Publier"
                >
                  <Plus className="w-5 h-5 text-[#0A0A0A]" strokeWidth={3} />
                </motion.button>
              </Link>
            </div>
            
            {/* Mobile: Boutons essentiels + Menu Hamburger */}
            <div className="flex md:hidden items-center gap-1.5">
              {/* Publish - Toujours visible */}
              <Link href="/publish">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-[#D4AF37] p-1.5 rounded-full shadow-lg flex-shrink-0"
                  title="Publier"
                >
                  <Plus className="w-4 h-4 text-[#0A0A0A]" strokeWidth={3} />
                </motion.button>
              </Link>
              
              {/* Search Button - Visible à côté du + */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(true)}
                className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors p-1.5"
                title="Rechercher"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              
              {/* Avatar Profil - Toujours visible */}
              <Link href="/profil">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden flex-shrink-0"
                  title="Profil"
                >
                  <span className="text-xs text-[#D4AF37] font-bold">
                    U
                  </span>
                </motion.button>
              </Link>
              
              {/* Menu Hamburger */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-1.5"
                title="Menu"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          
          {/* Menu Hamburger Mobile */}
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-[#D4AF37]/20 bg-[#0A0A0A] px-4 py-3"
            >
              <div className="grid grid-cols-2 gap-3">
                {/* Le bouton Rechercher n'est plus dans le menu, mais reste pour accès rapide */}
                
                <Link
                  href="/shop"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors"
                >
                  <Store className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-white">Boutique</span>
                </Link>
                
                <motion.button
                  onClick={() => {
                    setCartOpen(true)
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors relative"
                >
                  <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-white">Panier</span>
                  {totalItems > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                  )}
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen)
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                </motion.button>
                
                <Link
                  href="/messages"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors relative"
                >
                  <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-white">Messages</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                </Link>
              </div>
            </motion.div>
          )}
          
          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-[#D4AF37]/20 bg-[#0A0A0A] px-4 py-3 max-h-[60vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.18em]">Notifications</h2>
                <button onClick={() => setNotificationsOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { user: 'Atelier Fatou', action: 'a aimé votre publication', time: '30 min' },
                  { user: 'Mariama Diallo', action: 'a commenté votre publication', time: '2h' },
                  { user: 'Khadija Sy', action: 'a republié votre publication', time: '5h' },
                ].map((notif, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80">
                        <span className="font-bold text-[#D4AF37]">{notif.user}</span> {notif.action}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/notifications" className="block text-center text-xs text-[#D4AF37] mt-3 py-2 hover:underline">
                Voir tout
              </Link>
            </motion.div>
          )}
      {/* Feed Principal */}
      <main className="max-w-2xl mx-auto">
        {/* Indicateur de chargement initial */}
        {isLoading && posts.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        )}

        {/* Liste des posts */}
        {posts.map((post) => (
          post.type === 'tailor' ? (
            <TailorCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} onRepost={openRepost} openCommentModal={openCommentModal} />
          ) : (
            <ClientCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} onRepost={openRepost} openCommentModal={openCommentModal} />
          )
        ))}

        {/* Indicateur de chargement pour infinite scroll (automatique) */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-8" ref={observerTarget}>
            <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
            <span className="ml-2 text-sm text-white/60">Chargement...</span>
          </div>
        )}

        {/* Élément déclencheur pour infinite scroll (visible seulement si on charge plus) */}
        {!isLoadingMore && hasMore && (
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            <div className="w-1 h-1 bg-transparent" aria-hidden="true" />
          </div>
        )}

        {/* Message d'erreur */}
        {paginationError && (
          <div className="flex items-center justify-center py-8 px-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-red-400">
                {paginationError instanceof Error && 'getUserMessage' in paginationError
                  ? (paginationError as any).getUserMessage()
                  : 'Erreur lors du chargement des posts'}
              </p>
            </div>
          </div>
        )}

        {/* Footer de fin de feed (quand tout est chargé) */}
        {!hasMore && posts.length > 0 && !isLoading && (
          <div className="py-20 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
              <Sparkles className="w-5 h-5 text-[#D4AF37]/60" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
            </div>
            <p className="text-[10px] text-[#D4AF37]/50 font-serif tracking-[0.4em] uppercase">
              Signare • Dakar Luxe
            </p>
            <p className="text-[9px] text-white/30 mt-2">Vous avez vu tous les posts</p>
          </div>
        )}
      </main>

      {repostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setRepostModal(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#D4AF37] font-black">Republier</p>
                <p className="text-sm text-white/80 mt-1">Comme sur Twitter : republier direct ou citer.</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                {repostModal.media && (
                  <div className="w-full rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-white/5">
                    <div className="relative w-full h-40">
                      <Image src={repostModal.media} alt="Media ajouté" fill className="object-cover" />
                    </div>
                  </div>
                )}
                <textarea
                  value={repostModal.comment}
                  onChange={(e) => setRepostModal({ ...repostModal, comment: e.target.value.slice(0, 240) })}
                  placeholder="Ajouter un commentaire (optionnel)..."
                  className="w-full bg-white/5 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                  rows={3}
                />
                <div className="flex items-center justify-between text-[11px] text-white/50">
                  <span>{repostModal.comment.trim().length} / 240</span>
                  <span className="text-white/30">Citation optionnelle</span>
                </div>
                <div>
                  <label className="flex items-center justify-center gap-2 w-full border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-[11px] text-[#D4AF37] uppercase tracking-[0.18em] bg-white/5 hover:bg-[#D4AF37]/10 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          setRepostModal((prev) => prev ? { ...prev, media: reader.result as string } : prev)
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                    <span>Ajouter une photo</span>
                  </label>
                  {repostModal.media && (
                    <button
                      onClick={() => setRepostModal({ ...repostModal, media: null })}
                      className="mt-2 text-[10px] text-white/60 hover:text-white"
                    >
                      Retirer la photo
                    </button>
                  )}
                </div>
              </div>
              <div className="px-5 pb-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    applyRepost(repostModal.postId, 'instant', repostModal.comment.trim() || undefined, repostModal.media)
                    setRepostModal(null)
                  }}
                  className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] shadow-[0_0_18px_rgba(212,175,55,0.35)] active:scale-[0.98] transition-all"
                >
                  Republier sans commentaire
                </button>
                <button
                  disabled={!(repostModal.comment.trim() || repostModal.media)}
                  onClick={() => {
                    applyRepost(
                      repostModal.postId,
                      'quote',
                      repostModal.comment.trim() || undefined,
                      repostModal.media
                    )
                    setRepostModal(null)
                  }}
                  className="w-full bg-white/5 border border-[#D4AF37]/40 text-[#D4AF37] py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Citer et republier
                </button>
                {currentRepostPost?.isReposted && (
                  <button
                    onClick={() => {
                      applyRepost(repostModal.postId, 'remove')
                      setRepostModal(null)
                    }}
                    className="w-full bg-white/5 border border-white/15 text-white/70 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] active:scale-[0.98] transition-all"
                  >
                    Retirer la republication
                  </button>
                )}
                <button
                  onClick={() => setRepostModal(null)}
                  className="w-full text-white/60 hover:text-white text-[10px] font-black uppercase tracking-[0.22em] py-2"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}


      {/* Modal Commentaires - Inspiré de FriendKit */}
      {commentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-end"
          onClick={() => {
            setCommentModal(null)
            setCommentDraft('')
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-h-[85vh] bg-[#0A0A0A] border-t border-[#D4AF37]/30 rounded-t-2xl shadow-[0_-25px_80px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.18em]">Commentaires</h3>
                <p className="text-xs text-white/60 mt-0.5">{commentModal?.comments.length || 0} commentaire{(commentModal?.comments.length || 0) > 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => {
                  setCommentModal(null)
                  setCommentDraft('')
                }}
                className="text-white/40 hover:text-white transition-colors p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {commentModal?.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-[#D4AF37] font-bold">
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
                      <button className="flex items-center gap-1 text-white/40 hover:text-[#D4AF37] transition-colors">
                        <Heart size={14} />
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
            
            {/* Input */}
            <div className="px-5 py-4 border-t border-white/5">
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
          </motion.div>
        </motion.div>
      )}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-[130] bg-[#D4AF37] text-[#0A0A0A] px-4 py-2 rounded-lg shadow-[0_10px_40px_rgba(212,175,55,0.45)] text-sm font-semibold"
        >
          {toast}
        </motion.div>
      )}
    </div>
  )
}
