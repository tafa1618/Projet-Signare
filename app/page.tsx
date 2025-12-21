'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, Bookmark, Sparkles, Tag, CheckCircle2 } from 'lucide-react'

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
}

// Mock data enrichie
const mockPosts: Post[] = [
  {
    id: 1,
    type: 'tailor',
    user: {
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
      isVerified: true,
      role: 'Maître Tailleur',
    },
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
    caption: 'Nouvelle création : Boubou Royale en basin riche. Un travail de broderie de plus de 40 heures. ✨🇸🇳',
    price: '125 000 FCFA',
    likes: 856,
    comments: 45,
    isLiked: false,
    isSaved: false,
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
    caption: 'Tellement satisfaite de ma tenue pour le mariage de ma sœur ! Merci pour ce travail incroyable. 😍👜',
    likes: 1243,
    comments: 89,
    isLiked: true,
    isSaved: true,
  },
  {
    id: 3,
    type: 'tailor',
    user: {
      name: 'Couture Aminata',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
      isVerified: true,
      role: 'Designer Mode',
    },
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
    caption: 'Collection capsule : Le lin rencontre le wax. L\'élégance au quotidien. 🌿✨',
    price: '55 000 FCFA',
    likes: 432,
    comments: 24,
    isLiked: false,
    isSaved: false,
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
  },
]

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
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#D4AF37] font-semibold tracking-widest uppercase">Exploration</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          </div>
        </div>
      </motion.header>

      {/* Feed Principal */}
      <main className="max-w-2xl mx-auto pt-6">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 group"
          >
            {/* Header du Post */}
            <div className="flex items-center justify-between px-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-transparent">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#0A0A0A]">
                    <Image
                      src={post.user.avatar}
                      alt={post.user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm tracking-wide">{post.user.name}</span>
                    {post.user.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    )}
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">{post.user.role}</span>
                </div>
              </div>
              
              {/* Badge Type de Post */}
              <div className={`px-3 py-1 rounded-full border text-[9px] tracking-[0.15em] font-bold uppercase ${
                post.type === 'tailor' 
                  ? 'border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/5' 
                  : 'border-white/20 text-white/60 bg-white/5'
              }`}>
                {post.type === 'tailor' ? 'Création' : 'Client Story'}
              </div>
            </div>

            {/* Image compacte pour visibilité immédiate */}
            <div className="relative w-full aspect-square bg-neutral-900 overflow-hidden shadow-2xl">
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 672px"
              />
              
              {/* Tag Tailleur Flottant (si client) */}
              {post.type === 'client' && post.taggedTailor && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-4 left-4 z-10"
                >
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Tag className="w-2.5 h-2.5 text-[#D4AF37]" />
                    <span className="text-[9px] font-medium tracking-wide">Par <span className="text-[#D4AF37]">{post.taggedTailor.name}</span></span>
                  </div>
                </motion.div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/20 to-transparent pointer-events-none" />
            </div>

            {/* Actions & Légende condensées */}
            <div className="px-4 py-3 bg-[#0A0A0A]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-5">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 group/btn">
                    <Heart 
                      className={`w-5 h-5 transition-all ${
                        post.isLiked 
                          ? 'fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' 
                          : 'text-white/70 group-hover/btn:text-[#D4AF37]'
                      }`}
                    />
                    <span className="text-[10px] font-medium text-white/50">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 group/btn">
                    <MessageCircle className="w-5 h-5 text-white/70 group-hover/btn:text-[#D4AF37] transition-all" />
                    <span className="text-[10px] font-medium text-white/50">{post.comments}</span>
                  </button>
                  <Share2 className="w-5 h-5 text-white/70 hover:text-[#D4AF37] transition-all cursor-pointer" />
                </div>
                <button onClick={() => handleSave(post.id)}>
                  <Bookmark 
                    className={`w-5 h-5 transition-all ${
                      post.isSaved 
                        ? 'fill-[#D4AF37] text-[#D4AF37]' 
                        : 'text-white/70 hover:text-[#D4AF37]'
                    }`}
                  />
                </button>
              </div>

              {/* Légende plus compacte */}
              <div className="space-y-2">
                <p className="text-xs leading-snug text-white/80 line-clamp-2">
                  <span className="font-bold text-[#D4AF37] mr-1.5 uppercase text-[10px] tracking-tighter">{post.user.name}</span>
                  {post.caption}
                </p>
                
                <div className="flex items-center justify-between pt-1">
                  {post.type === 'tailor' && post.price ? (
                    <span className="text-sm font-serif text-[#D4AF37] tracking-tighter">{post.price}</span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[8px] text-[#D4AF37]/50 tracking-[0.1em] font-bold uppercase">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Inspiration</span>
                    </div>
                  )}
                  
                  <button className="bg-[#D4AF37] text-[#0A0A0A] px-4 py-1.5 rounded text-[9px] font-black tracking-[0.1em] uppercase hover:bg-white transition-all active:scale-95 shadow-lg">
                    {post.type === 'tailor' ? 'Commander' : 'Détails'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Divider subtil or */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent mt-8" />
          </motion.article>
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
