'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  Plus
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

// Card Tailleur Révisée
const TailorCard = ({ post, onLike, onSave }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void }) => (
  <motion.article
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="mb-10 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl overflow-hidden shadow-2xl transition-all hover:border-[#D4AF37]/40 mx-4"
  >
    {/* Header Tailleur */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#D4AF37]/5">
      <div className="flex items-center gap-2.5">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/30">
          <Image src={post.user.avatar} alt={post.user.name} fill className="object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-serif font-bold text-sm text-[#D4AF37] tracking-wide">{post.user.name}</span>
            {post.user.isVerified && <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />}
          </div>
          <p className="text-[9px] text-white/40 uppercase tracking-widest">{post.user.role}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[8px] text-[#D4AF37]/60 uppercase font-bold tracking-[0.2em]">Complexité</span>
        <StarRating rating={post.complexity_score || 0} />
      </div>
    </div>

    {/* Image Compacte (3/4) */}
    <div className="relative w-full aspect-[3/4] bg-neutral-900 group overflow-hidden">
      <Image
        src={post.image}
        alt={post.caption}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent pointer-events-none" />
      
      {/* Slogan/Spécialité flottant */}
      <div className="absolute top-4 left-4 right-4">
        <span className="bg-[#0A0A0A]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#D4AF37]/20 text-[9px] font-medium text-[#D4AF37] tracking-wide inline-block">
          {post.user.specialty}
        </span>
      </div>
    </div>

    {/* Info sous l'image - Visible sans scroll */}
    <div className="px-4 py-4 space-y-3">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1">
          <p className="text-xs text-white/90 leading-snug line-clamp-2">{post.caption}</p>
          <div className="flex gap-3 text-[9px] text-white/40 uppercase font-bold tracking-widest">
            <span className="flex items-center gap-1"><Tag size={10} className="text-[#D4AF37]/60"/> {post.garment_type}</span>
            <span className="flex items-center gap-1"><Sparkles size={10} className="text-[#D4AF37]/60"/> {post.fabric_type}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[8px] text-white/40 uppercase tracking-widest mb-0.5">À partir de</p>
          <p className="text-sm font-serif text-[#D4AF37] font-bold tracking-tighter">{post.price}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#D4AF37]/10 pt-3">
        <div className="flex gap-5">
          <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 group/btn text-white/40 hover:text-[#D4AF37] transition-all">
            <Heart size={18} className={post.isLiked ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" : ""} />
            <span className="text-[10px]">{post.likes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-white/40">
            <MessageSquare size={18} />
            <span className="text-[10px]">{post.comments}</span>
          </div>
          <button onClick={() => onSave(post.id)} className="text-white/40 hover:text-[#D4AF37] transition-all">
            <Bookmark size={18} className={post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
          </button>
        </div>
        <button className="bg-[#D4AF37] text-[#0A0A0A] px-5 py-2 rounded-lg text-[9px] font-black tracking-[0.1em] uppercase shadow-lg transition-all hover:bg-white active:scale-95">
          Demander un devis
        </button>
      </div>
    </div>
  </motion.article>
)

// Card Client Révisée
const ClientCard = ({ post, onLike, onSave }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void }) => (
  <motion.article
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="mb-14 bg-[#0A0A0A] group mx-4"
  >
    {/* Header Client - Plus aéré */}
    <div className="flex items-center justify-between px-2 mb-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 p-0.5">
          <Image src={post.user.avatar} alt={post.user.name} fill className="object-cover rounded-full" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-wide block text-white/90">{post.user.name}</span>
          <p className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 size={10} className="text-[#D4AF37]"/> Confectionné par {post.taggedTailor?.name}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[8px] text-white/30 uppercase font-bold tracking-[0.2em]">Avis Client</span>
        <StarRating rating={post.quality_rating || 0} />
      </div>
    </div>

    {/* Image (3/4) */}
    <div className="relative w-full aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden shadow-xl group">
      <Image
        src={post.image}
        alt={post.caption}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/40 to-transparent pointer-events-none" />
      
      {/* Badge garment type floating */}
      <div className="absolute bottom-4 left-4">
        <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[8px] font-bold text-white/60 uppercase tracking-widest">
          #{post.garment_type.replace(' ', '')}
        </span>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={() => onSave(post.id)} className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 hover:border-[#D4AF37]/50 transition-all">
          <Bookmark size={16} className={post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/70"} />
        </button>
      </div>
    </div>

    {/* Info sous l'image */}
    <div className="px-2 py-4 flex justify-between items-start gap-6">
      <div className="space-y-2 flex-1">
        <p className="text-sm leading-relaxed text-white/80 font-medium">
          "{post.caption}"
        </p>
        <div className="flex items-center gap-4 text-white/20">
          <span className="text-[9px] flex items-center gap-1 uppercase tracking-widest"><Eye size={12} className="text-[#D4AF37]/40"/> 1.2k vues</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 border-l border-white/5 pl-6 flex-shrink-0">
        <button onClick={() => onLike(post.id)} className="flex flex-col items-center gap-1.5 group/btn transition-all active:scale-90">
          <Heart size={24} className={post.isLiked ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" : "text-white/30 group-hover/btn:text-[#D4AF37]"} />
          <span className="text-[10px] font-bold text-white/30 tracking-tighter">{post.likes}</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 transition-all active:scale-90">
          <MessageSquare size={22} className="text-white/30 hover:text-[#D4AF37]" />
          <span className="text-[10px] font-bold text-white/30 tracking-tighter">{post.comments}</span>
        </button>
      </div>
    </div>
  </motion.article>
)

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts)

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
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#D4AF37] font-semibold tracking-widest uppercase">Exploration</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            </div>
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
