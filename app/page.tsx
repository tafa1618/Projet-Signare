'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image' // Added missing import
import { Loader2 } from 'lucide-react'
import {
  Heart,
  MessageCircle,
  Bookmark,
  CheckCircle2,
  Star,
  MessageSquare,
  Repeat2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  Store,
  ShoppingCart,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/shared/lib/utils'
import { logMLInteraction } from '@/lib/logger'
import { mockPosts } from '@/lib/mocks'

// --- Types ---
export type PostType = 'tailor' | 'client'

export interface MediaItem {
  url: string
  type: 'image' | 'video'
}

export interface Post {
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
  media?: MediaItem[]
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


// --- Helper Components ---

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

// --- Card Components ---

const MediaCarousel = ({ mediaItems, post }: { mediaItems: MediaItem[], post: Post }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentMedia = mediaItems[currentMediaIndex]
            if (currentMedia?.type === 'video') {
              videoRefs.current[currentMediaIndex]?.play().catch(() => { })
            }
          } else {
            Object.values(videoRefs.current).forEach(video => video?.pause())
          }
        })
      },
      { threshold: 0.5 }
    )

    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [currentMediaIndex, mediaItems])

  useEffect(() => {
    const prevVideo = videoRefs.current[currentMediaIndex]
    if (prevVideo && mediaItems[currentMediaIndex]?.type === 'video') {
      prevVideo.play().catch(() => { })
    }
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (video && Number(index) !== currentMediaIndex) video.pause()
    })
  }, [currentMediaIndex, mediaItems])

  const next = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
  }
  const prev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  return (
    <div ref={containerRef} className="relative w-full aspect-square bg-neutral-900 group/media">
      {mediaItems.map((media, index) => (
        <div key={index} className={cn("absolute inset-0 transition-opacity duration-500", index === currentMediaIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
          {media.type === 'video' ? (
            <video
              ref={el => { videoRefs.current[index] = el }}
              src={media.url} className="w-full h-full object-cover" muted loop playsInline
            />
          ) : (
            <Image src={media.url} alt={post.caption} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-60" />
        </div>
      ))}

      {/* Badges */}
      {post.type === 'tailor' && (
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <span className="bg-[#D4AF37]/90 backdrop-blur-sm text-black px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg border border-[#D4AF37]/20">
            Atelier
          </span>
        </div>
      )}

      {/* Navigation */}
      {mediaItems.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/80 opacity-0 group-hover/media:opacity-100 transition-opacity z-20 hover:bg-black/40">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/80 opacity-0 group-hover/media:opacity-100 transition-opacity z-20 hover:bg-black/40">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
            {mediaItems.map((_, idx) => (
              <div key={idx} className={cn("h-1 rounded-full transition-all duration-300", idx === currentMediaIndex ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-white/40")} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const PostActions = ({ post, onLike, onSave, onRepost, openCommentModal }: any) => (
  <div className="flex items-center justify-between pt-3 border-t border-white/5">
    <div className="flex items-center gap-4">
      <motion.button onClick={(e) => { e.stopPropagation(); onLike(post.id) }} whileTap={{ scale: 0.9 }} className="flex gap-1.5 items-center group">
        <Heart size={20} className={cn("transition-colors", post.isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/60 group-hover:text-white")} />
        <span className="text-xs font-medium text-white/60">{post.likes}</span>
      </motion.button>
      <motion.button onClick={(e) => { e.stopPropagation(); openCommentModal(post.id) }} whileTap={{ scale: 0.9 }} className="flex gap-1.5 items-center group">
        <MessageSquare size={20} className="text-white/60 group-hover:text-white transition-colors" />
        <span className="text-xs font-medium text-white/60">{post.comments}</span>
      </motion.button>
      <motion.button onClick={(e) => { e.stopPropagation(); onRepost(post.id) }} whileTap={{ scale: 0.9 }} className="flex gap-1.5 items-center group">
        <Repeat2 size={20} className={cn("transition-colors", post.isReposted ? "text-[#D4AF37]" : "text-white/60 group-hover:text-white")} />
        <span className="text-xs font-medium text-white/60">{post.reposts || 0}</span>
      </motion.button>
    </div>
    <div className="flex items-center gap-3">
      <motion.button onClick={(e) => { e.stopPropagation(); onSave(post.id) }} whileTap={{ scale: 0.9 }} className="group">
        <Bookmark size={20} className={cn("transition-colors", post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/60 group-hover:text-white")} />
      </motion.button>
      <button className="text-white/60 hover:text-white" onClick={(e) => e.stopPropagation()}>
        <MoreVertical size={20} />
      </button>
    </div>
  </div>
)

const UnifiedPostCard = ({ post, ...actions }: any) => {
  const trackRef = useTrackPostVisibility({
    post_id: post.id,
    interaction_type: 'post_view',
    interaction_score: 2,
    metadata: { role: post.type },
  })

  const mediaItems: MediaItem[] = post.media && post.media.length > 0 ? post.media : [{ url: post.image, type: 'image' }]

  return (
    <motion.article
      ref={trackRef as unknown as React.RefObject<HTMLElement>}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="w-full bg-[#111] border border-white/5 rounded-2xl overflow-hidden mb-6 hover:border-[#D4AF37]/30 transition-colors duration-300 shadow-xl"
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profil?user=${post.user.name}`} className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative">
              <Image src={post.user.avatar} alt={post.user.name} fill className="object-cover" />
            </div>
            {post.user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-[1px]">
                <CheckCircle2 size={12} className="text-[#D4AF37] fill-black" />
              </div>
            )}
          </Link>
          <div>
            <Link href={`/profil?user=${post.user.name}`} className="block text-sm font-bold text-white hover:text-[#D4AF37] transition-colors">{post.user.name}</Link>
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{post.user.role}</p>
          </div>
        </div>
        {post.price && (
          <div className="text-right">
            <span className="block text-[9px] text-white/40 uppercase tracking-widest font-bold">À partir de</span>
            <span className="text-[#D4AF37] font-serif font-bold">{post.price}</span>
          </div>
        )}
      </div>

      {/* Media */}
      <MediaCarousel mediaItems={mediaItems} post={post} />

      {/* Content */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-white/40">
            <span>{post.garment_type}</span>
            {post.fabric_type && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{post.fabric_type}</span>
              </>
            )}
          </div>
          {post.complexity_score && <StarRating rating={post.complexity_score} />}
          {post.quality_rating && <StarRating rating={post.quality_rating} />}
        </div>

        <p className="text-sm text-white/90 leading-relaxed mb-4 font-light">
          {post.caption}
          {post.taggedTailor && (
            <Link href={`/profil?tailor=${post.taggedTailor.id}`} className="text-[#D4AF37] hover:underline ml-1">
              @{post.taggedTailor.name}
            </Link>
          )}
        </p>

        <PostActions post={post} {...actions} />
      </div>

      {/* Tailor specific CTA */}
      {post.type === 'tailor' && (
        <div className="px-4 pb-4 pt-0">
          <button
            onClick={(e) => { e.stopPropagation(); /* TODO: handle contact logic */ }}
            className="w-full py-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center gap-2 group"
          >
            <MessageCircle size={14} className="group-hover:stroke-black" />
            <span>Contacter l'atelier</span>
          </button>
        </div>
      )}
    </motion.article>
  )
}

// --- Main Page Component ---

// --- Modal Component ---

const PostModal = ({ post, onClose, onLike, onSave, onRepost }: { post: Post, onClose: () => void, onLike: (id: number) => void, onSave: (id: number) => void, onRepost: (id: number) => void }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLInputElement>(null)
  const [comments, setComments] = useState([
    { id: 1, user: "User 1", text: "Magnifique travail ! 😍 C'est disponible ?", time: "2h", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, user: "User 2", text: "Quel est le prix pour ce modèle ?", time: "3h", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: 3, user: "User 3", text: "Incroyable les détails, bravo !", time: "4h", avatar: "https://i.pravatar.cc/150?u=3" },
  ])
  const [newComment, setNewComment] = useState("")

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment = {
      id: Date.now(),
      user: "Moi", // Mock authenticated user
      text: newComment,
      time: "À l'instant",
      avatar: "https://i.pravatar.cc/150?u=me" // Placeholder
    }
    setComments([comment, ...comments])
    setNewComment("")
    // Scroll to top of comment list if needed, or just let it render
  }

  const handleContact = () => {
    // Mock contact action
    alert(`Message envoyé à ${post.user.name} !`)
  }

  const mediaItems: MediaItem[] = post.media && post.media.length > 0 ? post.media : [{ url: post.image, type: 'image' }]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-[110]">
        <MoreVertical size={32} className="rotate-45" /> {/* Use X icon if available, or rotated More/Plus */}
      </button>

      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#111] w-full max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-white/10"
      >
        {/* Media Section (Left/Top) */}
        <div className="w-full lg:w-[60%] bg-black relative flex items-center justify-center aspect-square lg:aspect-auto min-h-[40vh] lg:min-h-full">
          <MediaCarousel mediaItems={mediaItems} post={post} />
        </div>

        {/* Details Section (Right/Bottom) */}
        <div className="w-full lg:w-[40%] flex flex-col h-full bg-[#111] max-h-[50vh] lg:max-h-auto">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Link href={`/profil?user=${post.user.name}`} className="relative block">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative">
                  <Image src={post.user.avatar} alt={post.user.name} fill className="object-cover" />
                </div>
                {post.user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-[1px]">
                    <CheckCircle2 size={12} className="text-[#D4AF37] fill-black" />
                  </div>
                )}
              </Link>
              <div>
                <Link href={`/profil?user=${post.user.name}`} className="font-bold text-sm text-white hover:text-[#D4AF37] transition-colors">{post.user.name}</Link>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{post.user.role}</p>
              </div>
            </div>

            {post.type === 'tailor' && (
              <button
                onClick={handleContact}
                className="px-4 py-2 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
                Contacter
              </button>
            )}
          </div>

          {/* Scrollable Content (Caption + Comments) */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Caption */}
            <div className="mb-6 pb-6 border-b border-white/5">
              <div className="flex gap-3">
                <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden relative border border-white/10">
                  <Image src={post.user.avatar} alt={post.user.name} fill className="object-cover" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm leading-relaxed">
                    <span className="font-bold mr-2">{post.user.name}</span>
                    <span className="text-white/90 font-light">{post.caption}</span>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.fabric_type && (
                      <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/60 uppercase tracking-wide">
                        Tissu: <span className="text-[#D4AF37]">{post.fabric_type}</span>
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/60 uppercase tracking-wide">
                      Type: <span className="text-white/90">{post.garment_type}</span>
                    </span>
                  </div>

                  <div className="text-[10px] text-white/40 uppercase tracking-widest pt-1">Il y a 2h</div>
                </div>
              </div>
            </div>

            {/* Comments (Dynamic) */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/10 relative overflow-hidden">
                    <Image src={comment.avatar} alt={comment.user} fill className="object-cover opacity-60" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-bold mr-2 text-white/80">{comment.user}</span>
                      <span className="text-white/60 font-light">{comment.text}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30 font-semibold tracking-wide">
                      <span>{comment.time}</span>
                      <button className="hover:text-white">Répondre</button>
                      <button className="hover:text-white group-hover:block hidden">Signaler</button>
                    </div>
                  </div>
                  <button className="text-white/20 hover:text-[#D4AF37] self-start pt-1">
                    <Heart size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex-shrink-0 p-4 border-t border-white/5 bg-[#111]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <motion.button onClick={() => onLike(post.id)} whileTap={{ scale: 0.9 }} className="hover:text-[#D4AF37] transition-colors">
                  <Heart size={24} className={cn(post.isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/80")} />
                </motion.button>
                <button className="hover:text-[#D4AF37] transition-colors text-white/80">
                  <MessageCircle size={24} />
                </button>
                <button className="hover:text-[#D4AF37] transition-colors text-white/80">
                  <Repeat2 size={24} />
                </button>
              </div>
              <motion.button onClick={() => onSave(post.id)} whileTap={{ scale: 0.9 }}>
                <Bookmark size={24} className={cn("transition-colors", post.isSaved ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/80 hover:text-white")} />
              </motion.button>
            </div>
            <div className="mb-3">
              <p className="text-sm font-bold text-white">{post.likes} J'aime</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 text-white/40 flex items-center justify-center flex-shrink-0">
                <span className="text-xs">😊</span>
              </div>
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Ajouter un commentaire..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder-white/30"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:text-white transition-colors disabled:cursor-not-allowed">
                Publier
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- Main Page Component ---

export default function Home() {
  const router = useRouter()
  // Mock API Hooks (would be real hooks in prod)
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null) // Modal State
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  const loadMorePosts = useCallback(async () => {
    setLoading(true)
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600))

    const PAGE_SIZE = 4
    const startIndex = (page - 1) * PAGE_SIZE
    const newPosts = mockPosts.slice(startIndex, startIndex + PAGE_SIZE)

    if (newPosts.length < PAGE_SIZE) {
      setHasMore(false)
    }

    // Prevent duplicates
    setPosts(prev => {
      const ids = new Set(prev.map(p => p.id))
      const filteredNew = newPosts.filter(p => !ids.has(p.id))
      return [...prev, ...filteredNew]
    })

    setPage(prev => prev + 1)
    setLoading(false)
  }, [page])

  useEffect(() => {
    // Load initial posts
    loadMorePosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handlers
  const handleLike = (id: number) => {
    setPosts(current => current.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p))
    // Update selectedPost if open - crude sync
    if (selectedPost && selectedPost.id === id) {
      setSelectedPost(prev => prev ? { ...prev, isLiked: !prev.isLiked, likes: !prev.isLiked ? prev.likes + 1 : prev.likes - 1 } : null)
    }
  }
  const handleSave = (id: number) => {
    setPosts(current => current.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p))
    if (selectedPost && selectedPost.id === id) {
      setSelectedPost(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null)
    }
  }
  const handleRepost = (id: number) => {
    setPosts(current => current.map(p => p.id === id ? { ...p, isReposted: !p.isReposted, reposts: (p.reposts || 0) + (p.isReposted ? -1 : 1) } : p))
  }
  const openCommentModal = (id: number) => {
    const post = posts.find(p => p.id === id)
    if (post) setSelectedPost(post)
  }

  // Override UnifiedPostCard Link Behavior for Modal
  const handlePostClick = (post: Post) => {
    setSelectedPost(post)
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      {/* Modal */}
      <AnimatePresence>
        {selectedPost && (
          <PostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onLike={handleLike}
            onSave={handleSave}
            onRepost={handleRepost}
          />
        )}
      </AnimatePresence>



      <div className="flex gap-8 pt-4 lg:pt-0 px-0 lg:px-4 w-full h-full">

        {/* Main Feed - Center */}
        <section className="flex-1 w-full max-w-[600px] border-r border-white/5 mx-auto lg:mx-0 min-h-screen">



          {/* Desktop Tabs "Pour vous" / "Abonnements" */}
          <div className="hidden lg:flex sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex-1 hover:bg-white/5 cursor-pointer transition-colors h-[53px] flex items-center justify-center relative">
              <span className="font-bold text-sm text-white">Pour vous</span>
              <div className="absolute bottom-0 w-14 h-1 rounded-full bg-[#D4AF37]" />
            </div>
            <div className="flex-1 hover:bg-white/5 cursor-pointer transition-colors h-[53px] flex items-center justify-center">
              <span className="font-medium text-sm text-white/50">Abonnements</span>
            </div>
          </div>

          {/* "Quoi de neuf?" Composer */}
          <div className="hidden lg:flex p-4 border-b border-white/5 gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 relative overflow-hidden flex-shrink-0">
              <Image src="https://i.pravatar.cc/150?u=me" alt="Me" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Quoi de neuf ?!"
                className="w-full bg-transparent border-none text-xl placeholder-white/30 text-white focus:ring-0 px-0 py-2"
              />
              <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-3">
                <div className="flex gap-4 text-[#D4AF37]">
                  {/* Icons for Media, GIF, Poll, etc */}
                  <div className="w-5 h-5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50" />
                  <div className="w-5 h-5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50" />
                  <div className="w-5 h-5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50" />
                </div>
                <button className="px-4 py-1.5 bg-[#D4AF37] text-black font-bold text-sm rounded-full opacity-50 cursor-not-allowed">
                  Poster
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Filters (Scrollable) */}
          <div className="flex gap-3 overflow-x-auto py-3 px-4 border-b border-white/5 no-scrollbar">
            {['Tout', 'Basin', 'Wax', 'Broderie', 'Mariages', 'Accessoires'].map((filter, i) => (
              <button key={i} className={cn("whitespace-nowrap px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all", i === 0 ? "bg-white text-black border-white" : "bg-transparent border-white/20 text-white/60 hover:bg-white/10 hover:text-white")}>
                {filter}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="flex flex-col items-center gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="cursor-pointer w-full max-w-[420px] border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-colors overflow-hidden"
              >
                <UnifiedPostCard
                  post={post}
                  onLike={handleLike}
                  onSave={handleSave}
                  onRepost={handleRepost}
                  openCommentModal={() => openCommentModal(post.id)}
                />
              </div>
            ))}
          </div>

          {/* Loader */}
          <div className="py-8 flex flex-col items-center gap-4 border-t border-white/5">
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 text-[#D4AF37]">
                <Loader2 size={24} className="animate-spin" />
              </motion.div>
            )}
            {!loading && hasMore && (
              <button onClick={loadMorePosts} className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:underline">
                Afficher plus
              </button>
            )}
          </div>

        </section>

        {/* Right Sidebar (Desktop - Trending & Suggestions) */}
        <aside className="hidden xl:flex w-[350px] flex-col pl-6 pt-4 sticky top-0 h-screen gap-6 overflow-y-auto no-scrollbar pb-10">

          {/* Search Bar */}
          <div className="sticky top-0 bg-black z-20 pb-2">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#D4AF37] transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Chercher sur Signare"
                className="w-full bg-[#202327] border-none rounded-full py-3 pl-12 pr-4 text-sm text-white placeholder-white/40 focus:bg-black focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>
          </div>

          {/* Direct on Signare (Premium Card) */}
          <div className="bg-[#16181C] rounded-2xl p-4 border border-white/5">
            <h3 className="font-bold text-lg text-white mb-2">Abonnez-vous à Premium</h3>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">Abonnez-vous pour profiter de nouvelles fonctionnalités et recevoir une part des revenus.</p>
            <button className="px-5 py-2 rounded-full bg-[#D4AF37] text-black font-bold text-sm hover:bg-[#F4CF57] transition-colors">
              Souscrire
            </button>
          </div>

          {/* Trending Section */}
          <div className="bg-[#16181C] rounded-2xl overflow-hidden border border-white/5">
            <h2 className="text-xl font-black text-white p-4 pb-2">Tendances pour vous</h2>
            {[
              { category: "Mode · Tendances", topic: "#Tabaski2024", posts: "12,4 k posts" },
              { category: "Sénégal · Culture", topic: "Grand Magal", posts: "45,2 k posts" },
              { category: "Artisanat", topic: "Maison Saula", posts: "2 340 posts" },
              { category: "Tendance", topic: "#RobeSoirée", posts: "8 900 posts" },
              { category: "Musique", topic: "Wally Seck", posts: "15,1 k posts" },
            ].map((trend, i) => (
              <div key={i} className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors relative">
                <div className="flex justify-between items-start text-xs text-white/40 mb-0.5">
                  <span>{trend.category}</span>
                  <MoreVertical size={14} className="hover:text-[#D4AF37]" />
                </div>
                <p className="font-bold text-white text-sm is-full">{trend.topic}</p>
                <p className="text-xs text-white/40 mt-0.5">{trend.posts}</p>
              </div>
            ))}
            <div className="p-4 pt-2 cursor-pointer hover:bg-white/5 transition-colors">
              <span className="text-[#D4AF37] text-sm font-medium">Voir plus</span>
            </div>
          </div>

          {/* Suggestions Tailors */}
          <div className="bg-[#16181C] rounded-2xl overflow-hidden border border-white/5">
            <h2 className="text-xl font-black text-white p-4 pb-2">Ateliers à suivre</h2>
            {[
              { name: "Maison Saula", role: "@MaisonSaula", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" },
              { name: "Atelier Kara", role: "@KaraFashion", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
              { name: "Sow Design", role: "@SowDesignDK", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" }
            ].map((s, i) => (
              <div key={i} className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image src={s.img} alt={s.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate hover:underline">{s.name}</p>
                    <p className="text-xs text-white/40 truncate">{s.role}</p>
                  </div>
                </div>
                <button className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#D4AF37] transition-colors">
                  Suivre
                </button>
              </div>
            ))}
            <div className="p-4 pt-2 cursor-pointer hover:bg-white/5 transition-colors">
              <span className="text-[#D4AF37] text-sm font-medium">Voir plus</span>
            </div>
          </div>

          {/* Footer Legals */}
          <div className="px-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/30">
            <a href="#" className="hover:underline">Conditions d'utilisation</a>
            <a href="#" className="hover:underline">Politique de confidentialité</a>
            <a href="#" className="hover:underline">Politique relative aux cookies</a>
            <a href="#" className="hover:underline">Accessibilité</a>
            <a href="#" className="hover:underline">Informations sur les publicités</a>
            <span>© 2024 Signare, Inc.</span>
          </div>

        </aside>

      </div>
    </main>
  )
}
