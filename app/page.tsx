'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, Bookmark, Sparkles } from 'lucide-react'

// Mock data pour les posts
const mockPosts = [
  {
    id: 1,
    user: {
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
      isVerified: true,
    },
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
    caption: 'Boubou traditionnel en basin brodé or. Pièce unique confectionnée à la main 🇸🇳✨',
    price: '75 000 FCFA',
    likes: 342,
    comments: 28,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 2,
    user: {
      name: 'Maison Ndèye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ndeye',
      isVerified: true,
    },
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop',
    caption: 'Robe moderne en wax coloré. Design contemporain inspiré de la mode sénégalaise 🌺',
    price: '45 000 FCFA',
    likes: 567,
    comments: 42,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 3,
    user: {
      name: 'Couture Aminata',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
      isVerified: true,
    },
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
    caption: 'Ensemble tailleur en basin noir. Style professionnel et élégant 🖤✨',
    price: '65 000 FCFA',
    likes: 234,
    comments: 19,
    isLiked: false,
    isSaved: false,
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
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-[#D4AF37]/20"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-2xl font-serif text-[#D4AF37] tracking-[0.15em]">
              SIGNARE
            </h1>
          </div>
          <p className="text-xs text-white/50 tracking-wide">
            HAUTE COUTURE
          </p>
        </div>
      </motion.header>

      {/* Feed */}
      <div className="max-w-2xl mx-auto">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="mb-8 bg-[#0A0A0A] border-b border-[#D4AF37]/10 pb-4"
          >
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <Image
                  src={post.user.avatar}
                  alt={post.user.name}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-[#D4AF37]/30"
                />
                {post.user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] rounded-full p-0.5">
                    <Sparkles className="w-3 h-3 text-[#0A0A0A]" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm flex items-center gap-1">
                  {post.user.name}
                </h3>
                <p className="text-white/50 text-xs">Artisan vérifiée</p>
              </div>
            </div>

            {/* Image */}
            <div className="relative w-full aspect-[4/5] bg-[#0A0A0A]">
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2"
                >
                  <Heart 
                    className={`w-6 h-6 transition-all duration-300 ${
                      post.isLiked 
                        ? 'fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' 
                        : 'text-white/70 hover:text-[#D4AF37]'
                    }`}
                  />
                  <span className="text-white/70 text-sm">{post.likes}</span>
                </motion.button>

                <button className="flex items-center gap-2 text-white/70 hover:text-[#D4AF37] transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm">{post.comments}</span>
                </button>

                <button className="text-white/70 hover:text-[#D4AF37] transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSave(post.id)}
              >
                <Bookmark 
                  className={`w-6 h-6 transition-all duration-300 ${
                    post.isSaved 
                      ? 'fill-[#D4AF37] text-[#D4AF37]' 
                      : 'text-white/70 hover:text-[#D4AF37]'
                  }`}
                />
              </motion.button>
            </div>

            {/* Caption */}
            <div className="px-4">
              <p className="text-white/90 text-sm mb-2">
                <span className="font-semibold text-white mr-2">{post.user.name}</span>
                {post.caption}
              </p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[#D4AF37] font-serif text-lg font-semibold">
                  {post.price}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#D4AF37] text-[#0A0A0A] px-6 py-2 rounded-lg text-xs font-bold tracking-wider hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300"
                >
                  COMMANDER
                </motion.button>
              </div>
            </div>
          </motion.article>
        ))}

        {/* End message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center py-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
            <Sparkles className="w-4 h-4 text-[#D4AF37]/40" />
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
          </div>
          <p className="text-white/40 text-sm">
            ✨ Vous êtes à jour
          </p>
        </motion.div>
      </div>
    </div>
  )
}
