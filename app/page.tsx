'use client'

import { useState } from 'react'
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
    className="mb-8 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl overflow-hidden shadow-2xl transition-all hover:border-[#D4AF37]/40 mx-4"
  >
    {/* Header Tailleur Compact */}
    <div className="flex items-center justify-between px-3 py-2 bg-[#D4AF37]/5">
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/30">
          <Image src={post.user.avatar} alt={post.user.name} fill className="object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-serif font-bold text-xs text-[#D4AF37] tracking-wide">{post.user.name}</span>
            {post.user.isVerified && <CheckCircle2 className="w-2.5 h-2.5 text-[#D4AF37]" />}
          </div>
          <p className="text-[8px] text-white/40 uppercase tracking-widest leading-none">{post.user.role}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <StarRating rating={post.complexity_score || 0} />
      </div>
    </div>

    {/* Image Carrée Style Instagram */}
    <div className="relative w-full aspect-square bg-neutral-900 group overflow-hidden">
      <Image
        src={post.image}
        alt={post.caption}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/40 to-transparent pointer-events-none" />
      
      {/* Slogan flottant discret */}
      <div className="absolute top-3 left-3">
        <span className="bg-[#0A0A0A]/60 backdrop-blur-md px-2 py-1 rounded-full border border-[#D4AF37]/20 text-[7px] font-medium text-[#D4AF37] uppercase tracking-wider">
          {post.user.specialty}
        </span>
      </div>
    </div>

    {/* Actions & Description Immédiate */}
    <div className="px-3 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button onClick={() => onLike(post.id)} className="flex items-center gap-1 group/btn text-white/40 hover:text-[#D4AF37] transition-all">
            <Heart size={20} className={post.isLiked ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" : ""} />
            <span className="text-[10px] font-bold">{post.likes}</span>
          </button>
          <div className="flex items-center gap-1 text-white/40">
            <MessageSquare size={20} />
            <span className="text-[10px] font-bold">{post.comments}</span>
          </div>
          <button onClick={() => onSave(post.id)} className="text-white/40 hover:text-[#D4AF37] transition-all">
            <Bookmark size={20} className={post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
          </button>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-serif text-[#D4AF37] font-bold">{post.price}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] text-white/90 leading-snug line-clamp-2">
          <span className="font-bold mr-1.5 text-[#D4AF37]">{post.user.name}</span>
          {post.caption}
        </p>
        <div className="flex gap-2 text-[8px] text-white/30 uppercase font-bold tracking-widest">
          <span>{post.garment_type}</span>
          <span>•</span>
          <span>{post.fabric_type}</span>
        </div>
      </div>

      <button className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2 rounded-lg text-[10px] font-black tracking-[0.1em] uppercase shadow-lg transition-all hover:bg-white active:scale-[0.98] mt-1">
        Demander un devis
      </button>
    </div>
  </motion.article>
)

// Card Client Révisée style Instagram
const ClientCard = ({ post, onLike, onSave }: { post: Post, onLike: (id: number) => void, onSave: (id: number) => void }) => (
  <motion.article
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="mb-10 bg-[#0A0A0A] group mx-4"
  >
    {/* Header Client Compact */}
    <div className="flex items-center justify-between px-1 mb-2">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 p-0.5">
          <Image src={post.user.avatar} alt={post.user.name} fill className="object-cover rounded-full" />
        </div>
        <div>
          <span className="font-bold text-xs tracking-wide block text-white/90">{post.user.name}</span>
          <p className="text-[8px] text-[#D4AF37] font-bold uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 size={8} className="text-[#D4AF37]"/> {post.taggedTailor?.name}
          </p>
        </div>
      </div>
      <StarRating rating={post.quality_rating || 0} />
    </div>

    {/* Image Carrée (1:1) */}
    <div className="relative w-full aspect-square bg-neutral-900 rounded-lg overflow-hidden shadow-xl group">
      <Image
        src={post.image}
        alt={post.caption}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/40 to-transparent pointer-events-none" />
      
      {/* Badge discret */}
      <div className="absolute bottom-3 left-3">
        <span className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[7px] font-bold text-white/60 uppercase tracking-widest">
          #{post.garment_type.replace(' ', '')}
        </span>
      </div>
    </div>

    {/* Actions Style Instagram */}
    <div className="px-1 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button onClick={() => onLike(post.id)} className="transition-all active:scale-90">
            <Heart size={24} className={post.isLiked ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" : "text-white/80 hover:text-[#D4AF37]"} />
          </button>
          <button className="transition-all active:scale-90">
            <MessageCircle size={24} className="text-white/80 hover:text-[#D4AF37]" />
          </button>
          <button className="transition-all active:scale-90">
            <Share2 size={24} className="text-white/80 hover:text-[#D4AF37]" />
          </button>
        </div>
        <button onClick={() => onSave(post.id)} className="transition-all active:scale-90">
          <Bookmark size={24} className={post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/80 hover:text-[#D4AF37]"} />
        </button>
      </div>

      {/* Description Immédiate */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
          {post.likes.toLocaleString()} likes
        </p>
        <p className="text-xs leading-relaxed text-white/90 line-clamp-3">
          <span className="font-bold mr-2 text-white">{post.user.name.toLowerCase().replace(' ', '_')}</span>
          {post.caption}
        </p>
        <button className="text-[10px] text-white/30 font-medium hover:text-[#D4AF37] transition-colors">
          Voir les {post.comments} commentaires
        </button>
      </div>
    </div>
  </motion.article>
)

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
