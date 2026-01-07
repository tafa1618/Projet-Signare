'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  Flag
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/shared/lib/utils'

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
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
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
    quote_comment: '🔥 À voir absolument — finitions dignes d’un défilé.',
    quote_media: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1200&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1520975892776-3f7c5b37c5b2?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1496747611180-206a5c8c26af?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1520975868797-1c3e0e012a4c?w=800&h=1000&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1520975741466-4a62dfb2d3d9?w=800&h=1000&fit=crop',
    caption: 'Un look quotidien chic. J’adore le tombé et le confort.',
    likes: 721,
    comments: 38,
    isLiked: false,
    isSaved: false,
    garment_type: 'Robe',
    quality_rating: 4,
  },
]

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
            // Placeholder ML tracking (à connecter à Supabase user_interactions)
            console.log('[ML] trackInteraction', {
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
const TailorCard = ({ post, onLike, onSave, onRepost }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void, onRepost: (id: number) => void }) => {
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
      className="mx-3 mb-6 bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#D4AF37]/25 transition-all"
    >
      {post.repostOfId && (
        <div className="px-3 pt-3">
          <div className="rounded-lg border border-[#D4AF37]/25 bg-white/5 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-black">
              Republié · <span className="text-white/70">par {post.user.name}</span>
            </p>
            {post.quote_comment && (
              <p className="text-sm text-white/80 leading-snug">{post.quote_comment}</p>
            )}
            {post.quote_media && (
              <div className="relative w-full h-32 rounded-md overflow-hidden border border-[#D4AF37]/20">
                <Image src={post.quote_media} alt="Media cité" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Carrousel de médias : max 50vh + object-cover (clic => détail produit) */}
      <div ref={mediaContainerRef} className="relative w-full aspect-[4/5] max-h-[50vh] bg-neutral-900">
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
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent pointer-events-none" />
            </div>
          ))}
          
          {/* Badge Tailleur */}
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-[#D4AF37] text-[#0A0A0A] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)]">
              Atelier
            </span>
          </div>
          
          {/* Badge Vidéo */}
          {mediaItems[currentMediaIndex]?.type === 'video' && (
            <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-full px-2.5 py-1 flex items-center gap-1.5">
              <Video size={12} className="text-[#D4AF37]" />
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/90">Vidéo</span>
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
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                aria-label="Média précédent"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
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
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
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
        </Link>
      </div>

      {/* Bloc compact sous image (Z-pattern) - Style FriendKit */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href={`/profil?mode=tailleur&tailor=${encodeURIComponent(post.user.name)}`}
              className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#D4AF37]/30"
            >
              <span className="text-sm text-[#D4AF37] font-bold">
                {post.user.name.charAt(0).toUpperCase()}
              </span>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link
                  href={`/profil?mode=tailleur&tailor=${encodeURIComponent(post.user.name)}`}
                  className="font-serif font-bold text-sm text-[#D4AF37] truncate hover:text-[#D4AF37] hover:underline decoration-[#D4AF37]/40 underline-offset-4"
                >
                  {post.user.name}
                </Link>
                {post.user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />}
              </div>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold truncate">{post.user.role}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">À partir de</p>
            <p className="text-base font-serif font-bold text-[#D4AF37] leading-none">{post.price}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold">
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

        <p className="text-sm text-white/90 leading-relaxed">
          {post.caption}
        </p>

        {/* Actions : Like + Devis sur la même ligne - Style FriendKit */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-4 text-white/50">
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
              <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
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

          <div className="flex items-center gap-2">
            <Link
              href={`/messages?tailor=${encodeURIComponent(post.user.name)}`}
              className="bg-white/5 border border-[#D4AF37]/25 text-[#D4AF37] px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/10 transition-all active:scale-95 flex items-center gap-2"
              aria-label="Discuter avec le tailleur"
            >
              <MessageCircle size={14} />
              Discuter
            </Link>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="bg-[#D4AF37] text-[#0A0A0A] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)] transition-all"
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
const ClientCard = ({ post, onLike, onSave, onRepost }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void, onRepost: (id: number) => void }) => {
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
      className="mx-3 mb-6 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#D4AF37]/20 transition-all"
    >
      {post.repostOfId && (
        <div className="px-3 pt-3">
          <div className="rounded-lg border border-[#D4AF37]/25 bg-white/5 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-black">
              Republié · <span className="text-white/70">par {post.user.name}</span>
            </p>
            {post.quote_comment && (
              <p className="text-sm text-white/80 leading-snug">{post.quote_comment}</p>
            )}
            {post.quote_media && (
              <div className="relative w-full h-32 rounded-md overflow-hidden border border-[#D4AF37]/20">
                <Image src={post.quote_media} alt="Media cité" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Carrousel de médias : max 50vh + object-cover (clic => détail produit) */}
      <div ref={mediaContainerRef} className="relative w-full aspect-[4/5] max-h-[50vh] bg-neutral-900">
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
            <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-full px-2.5 py-1 flex items-center gap-1.5">
              <Video size={12} className="text-[#D4AF37]" />
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/90">Vidéo</span>
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
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-2 text-white/80 hover:text-[#D4AF37] transition-colors z-20"
                aria-label="Média précédent"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
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
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
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
        </Link>
      </div>

      {/* Bloc compact sous image (Z-pattern) - Style FriendKit */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href={`/profil?mode=client&client=${encodeURIComponent(post.user.name)}`}
              className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#D4AF37]/30"
            >
              <span className="text-sm text-[#D4AF37] font-bold">
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
          <div className="flex-shrink-0">
            <StarRating rating={post.quality_rating || 0} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold">
            <span className="truncate">{post.garment_type}</span>
          </div>
          <button onClick={() => onSave(post.id)} className="text-white/40 hover:text-[#D4AF37] transition-colors active:scale-95">
            <Bookmark size={18} className={post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
          </button>
        </div>

        <p className="text-sm text-white/90 leading-relaxed">
          {post.caption}
        </p>

        {/* Actions : Like + Liker sur la même ligne - Style FriendKit */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-4 text-white/50">
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

          <div className="flex items-center justify-end">
            <Link
              href={`/messages?user=${encodeURIComponent(post.user.name)}`}
              className="bg-white/5 border border-[#D4AF37]/25 text-[#D4AF37] px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/10 transition-all active:scale-95 flex items-center gap-2"
              aria-label="Discuter avec ce membre"
            >
              <MessageCircle size={14} />
              Discuter
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts)
  const [repostModal, setRepostModal] = useState<{ postId: number; comment: string; media: string | null } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [commentModal, setCommentModal] = useState<{ postId: number; comments: Array<{ id: number; user: string; avatar: string; text: string; time: string; likes: number }> } | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()

  const currentRepostPost = repostModal ? posts.find((p) => p.id === repostModal.postId) : null

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const isAuthenticated = () => {
    // @ai-context Auth simulée : permet de tester le flow social (repost) sans backend.
    if (typeof window === 'undefined') return false
    return localStorage.getItem('signare_auth_demo') === '1'
  }

  const handleLogout = () => {
    // Simulation de déconnexion
    router.push('/welcome')
  }

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
  }

  const handleSave = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ))
  }

  const openCommentModal = (postId: number) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    
    // Mock comments (à remplacer par des vraies données)
    const mockComments = [
      { id: 1, user: 'Awa Ndiaye', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa', text: 'Magnifique ! Où puis-je commander ?', time: '2h', likes: 12 },
      { id: 2, user: 'Mariama Diallo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama', text: 'Les finitions sont impeccables ✨', time: '5h', likes: 8 },
      { id: 3, user: 'Khadija Sy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khadija', text: 'J\'adore le tissu !', time: '1j', likes: 15 },
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
    setPosts(posts.map(post => 
      post.id === commentModal.postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ))
    
    setCommentDraft('')
  }

  const openRepost = (postId: number) => {
    const authed = isAuthenticated()
    if (!authed) {
      // @ai-context Sauvegarde de l'intention (repost) pour reprise après login.
      try {
        localStorage.setItem('signare_intent', JSON.stringify({ type: 'repost', postId, created_at: new Date().toISOString() }))
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
    setPosts((prev) => {
      const base = prev.map((post) => {
        if (post.id !== postId) return post

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

        console.log('[ML] trackInteraction', {
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

        return {
          ...post,
          isReposted: willRepost,
          reposts: nextCount,
          quote_comment: action === 'remove' ? null : comment ?? null,
          quote_media: action === 'remove' ? null : media ?? null,
        }
      })

      if (action === 'remove') {
        setToast('Republication retirée')
        return base
      }

      const target = base.find((p) => p.id === postId)
      if (!target) return base

      const repostEntry: Post = {
        ...target,
        id: Date.now(),
        repostOfId: postId,
        repostedByMe: true,
        quote_comment: comment ?? null,
        quote_media: media ?? null,
        user: {
          ...target.user,
          name: 'Vous',
          role: 'Repost',
        },
        isReposted: true,
      }

      setToast('Republié sur votre feed')
      return [repostEntry, ...base]
    })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 text-white">
      {/* Header Luxe - Inspiré de FriendKit */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/20"
      >
        <div className="max-w-2xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="bg-[#D4AF37] p-1.5 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Sparkles className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <h1 className="text-xl font-serif text-[#D4AF37] tracking-[0.2em]">SIGNARE</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Link href="/search">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                  title="Rechercher"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              </Link>
              
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
              
              {/* Publish */}
              <Link href="/publish">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-[#D4AF37] p-2 rounded-full shadow-lg"
                  title="Publier"
                >
                  <Plus className="w-5 h-5 text-[#0A0A0A]" strokeWidth={3} />
                </motion.button>
              </Link>
            </div>
          </div>
          
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
        </div>
      </motion.header>

      {/* Feed Principal */}
      <main className="max-w-2xl mx-auto pt-6">
        {posts.map((post) => (
          post.type === 'tailor' ? (
            <TailorCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} onRepost={openRepost} />
          ) : (
            <ClientCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} onRepost={openRepost} />
          )
        ))}

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

        {/* Footer de fin de feed */}
        <div className="py-20 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
            <Sparkles className="w-5 h-5 text-[#D4AF37]/60" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
          </div>
          <p className="text-[10px] text-[#D4AF37]/50 font-serif tracking-[0.4em] uppercase">
            Signare • Dakar Luxe
          </p>
        </div>
      </main>

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
                <p className="text-xs text-white/60 mt-0.5">{commentModal.comments.length} commentaire{commentModal.comments.length > 1 ? 's' : ''}</p>
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
              {commentModal.comments.map((comment) => (
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
