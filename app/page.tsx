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
  LogOut
} from 'lucide-react'
import Link from 'next/link'

// Types pour les posts
type PostType = 'tailor' | 'client'

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
  image: string
  caption: string
  price?: string
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
  taggedTailor?: {
    name: string
    id: string
  }
  garment_type: string
  fabric_type?: string
  complexity_score?: number
  quality_rating?: number
}

const mockPosts: Post[] = [
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
const TailorCard = ({ post, onLike, onSave }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void }) => {
  const trackRef = useTrackPostVisibility({
    post_id: post.id,
    interaction_type: 'post_view',
    interaction_score: 2,
    metadata: { role: 'tailleur', garment_type: post.garment_type, fabric_type: post.fabric_type },
  })

  return (
    <motion.article
      ref={trackRef as unknown as React.RefObject<HTMLElement>}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-3 mb-6 bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl overflow-hidden shadow-xl max-h-[80vh]"
    >
      {/* Image : max 50vh + object-cover (clic => détail produit) */}
      <Link
        href={`/product/${post.id}`}
        className="relative block w-full aspect-[4/5] max-h-[50vh] bg-neutral-900"
        aria-label="Voir le détail du produit"
      >
        <Image
          src={post.image}
          alt={post.caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 560px"
          priority={post.id === 1}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent pointer-events-none" />

        {/* Badge Tailleur */}
        <div className="absolute top-3 left-3">
          <span className="bg-[#D4AF37] text-[#0A0A0A] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)]">
            Atelier
          </span>
        </div>
      </Link>

      {/* Bloc compact sous image (Z-pattern) */}
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href={`/profil?mode=tailleur&tailor=${encodeURIComponent(post.user.name)}`}
                className="font-serif font-bold text-sm text-[#D4AF37] truncate hover:text-[#D4AF37] hover:underline decoration-[#D4AF37]/40 underline-offset-4"
              >
                {post.user.name}
              </Link>
              {post.user.isVerified && <CheckCircle2 className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />}
            </div>
            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold truncate">{post.user.role}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">À partir de</p>
            <p className="text-sm font-serif font-bold text-[#D4AF37] leading-none">{post.price}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-[0.18em] font-bold">
            <span className="truncate">{post.garment_type}</span>
            {post.fabric_type && (
              <>
                <span className="text-white/20">•</span>
                <span className="truncate">{post.fabric_type}</span>
              </>
            )}
          </div>
          <StarRating rating={post.complexity_score || 0} />
        </div>

        <p className="text-[11px] text-white/80 leading-snug line-clamp-2">
          {post.caption}
        </p>

        {/* Actions : Like + Devis sur la même ligne */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-white/50">
            <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors active:scale-95">
              <Heart size={18} className={post.isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
              <span className="text-[10px] font-bold">{post.likes}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <MessageSquare size={18} />
              <span className="text-[10px] font-bold">{post.comments}</span>
            </div>
            <button onClick={() => onSave(post.id)} className="hover:text-[#D4AF37] transition-colors active:scale-95">
              <Bookmark size={18} className={post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/messages?tailor=${encodeURIComponent(post.user.name)}`}
              className="bg-white/5 border border-[#D4AF37]/25 text-[#D4AF37] px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/10 transition-all active:scale-95 flex items-center gap-2"
              aria-label="Discuter avec le tailleur"
            >
              <MessageCircle size={16} />
              Discuter
            </Link>
            <button className="bg-[#D4AF37] text-[#0A0A0A] px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(212,175,55,0.35)] active:scale-95">
              Devis
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// Card Client (viewport-friendly, mention "Réalisé par...", CTA = Liker)
const ClientCard = ({ post, onLike, onSave }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void }) => {
  const trackRef = useTrackPostVisibility({
    post_id: post.id,
    interaction_type: 'post_view',
    interaction_score: 2,
    metadata: { role: 'client', garment_type: post.garment_type, tailor: post.taggedTailor?.name },
  })

  return (
    <motion.article
      ref={trackRef as unknown as React.RefObject<HTMLElement>}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-3 mb-6 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-[80vh]"
    >
      {/* Image : max 50vh + object-cover (clic => détail produit) */}
      <Link
        href={`/product/${post.id}`}
        className="relative block w-full aspect-[4/5] max-h-[50vh] bg-neutral-900"
        aria-label="Voir le détail du produit"
      >
        <Image
          src={post.image}
          alt={post.caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 560px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/55 to-transparent pointer-events-none" />
      </Link>

      {/* Bloc compact sous image (Z-pattern) */}
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href={`/profil?mode=client&client=${encodeURIComponent(post.user.name)}`}
                className="font-bold text-sm text-white/90 truncate hover:text-[#D4AF37] hover:underline decoration-[#D4AF37]/40 underline-offset-4"
              >
                {post.user.name}
              </Link>
              {post.user.isVerified && <CheckCircle2 className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />}
            </div>
            <p className="text-[9px] text-[#D4AF37]/80 uppercase tracking-[0.2em] font-black truncate">
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
          <div className="flex-shrink-0">
            <StarRating rating={post.quality_rating || 0} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-[0.18em] font-bold">
            <span className="truncate">{post.garment_type}</span>
          </div>
          <button onClick={() => onSave(post.id)} className="text-white/40 hover:text-[#D4AF37] transition-colors active:scale-95">
            <Bookmark size={18} className={post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
          </button>
        </div>

        <p className="text-[11px] text-white/80 leading-snug line-clamp-2">
          {post.caption}
        </p>

        {/* Actions : Like + Liker sur la même ligne */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-white/50">
            <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors active:scale-95">
              <Heart size={18} className={post.isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
              <span className="text-[10px] font-bold">{post.likes}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <MessageCircle size={18} />
              <span className="text-[10px] font-bold">{post.comments}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/messages?user=${encodeURIComponent(post.user.name)}`}
              className="bg-white/5 border border-[#D4AF37]/25 text-[#D4AF37] px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/10 transition-all active:scale-95 flex items-center gap-2"
              aria-label="Discuter avec ce membre"
            >
              <MessageCircle size={16} />
              Discuter
            </Link>
            <button
              onClick={() => onLike(post.id)}
              className="bg-white/5 border border-white/10 text-white/80 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.18em] hover:border-[#D4AF37]/30 hover:text-[#D4AF37] transition-all active:scale-95"
            >
              Liker
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts)
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 text-white">
      {/* Header Luxe */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-6 py-4"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4AF37] p-1.5 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Sparkles className="w-5 h-5 text-[#0A0A0A]" />
            </div>
            <h1 className="text-2xl font-serif text-[#D4AF37] tracking-[0.2em]">SIGNARE</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/publish">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-[#D4AF37] p-2 rounded-full shadow-lg"
              >
                <Plus className="w-5 h-5 text-[#0A0A0A]" strokeWidth={3} />
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
              title="Déconnexion"
            >
              <LogOut className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Feed Principal */}
      <main className="max-w-2xl mx-auto pt-6">
        {posts.map((post) => (
          post.type === 'tailor' ? (
            <TailorCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} />
          ) : (
            <ClientCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} />
          )
        ))}

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
    </div>
  )
}
