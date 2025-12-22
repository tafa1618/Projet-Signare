'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Bookmark, MessageCircle, Share2, Eye } from 'lucide-react'
import { usePostEngagement } from '@/frontend/hooks/useTracking'
import { AnnotationModal } from '@/frontend/components/annotation/AnnotationModal'
import { cn } from '@/shared/lib/utils'
import type { Post } from '@/shared/types/database.types'

interface FeedCardProps {
  post: Post
  userId: string | null
  onLike?: (postId: string) => void
  onSave?: (postId: string) => void
  onAnnotate?: (postId: string) => void
  showAnnotationButton?: boolean
}

export function FeedCard({
  post,
  userId,
  onLike,
  onSave,
  onAnnotate,
  showAnnotationButton = false,
}: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [viewDuration, setViewDuration] = useState(0)
  const [showAnnotationModal, setShowAnnotationModal] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const visibilityStartRef = useRef<number | null>(null)
  const hasTrackedViewRef = useRef(false)

  const {
    trackLike,
    trackUnlike,
    trackSave,
    trackShare,
    trackInquiry,
  } = usePostEngagement(post.id, userId)

  /**
   * VISIBILITY TRACKING
   * - seuil bas (15%)
   * - une seule vue trackée par card
   * - aucun scroll forcé
   */
  useEffect(() => {
    if (!cardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          visibilityStartRef.current = Date.now()
        }

        if (!entry.isIntersecting && visibilityStartRef.current) {
          const duration = Date.now() - visibilityStartRef.current

          if (duration >= 3000) {
            setViewDuration(Math.floor(duration / 1000))
            hasTrackedViewRef.current = true
          }

          visibilityStartRef.current = null
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  /* =======================
     ACTIONS
     ======================= */

  const handleLike = async () => {
    if (!userId) return

    if (isLiked) {
      await trackUnlike()
      setIsLiked(false)
    } else {
      await trackLike()
      setIsLiked(true)
    }

    onLike?.(post.id)
  }

  const handleSave = async () => {
    if (!userId) return
    await trackSave()
    setIsSaved((v) => !v)
    onSave?.(post.id)
  }

  const handleShare = async () => {
    await trackShare()
  }

  const handleInquiry = async () => {
    await trackInquiry()
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-noir border border-or/20 rounded-lg overflow-hidden shadow-gold-md mb-6"
    >
      {/* ===== HEADER ===== */}
      <div className="p-4 pb-3">
        {post.cultural_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {post.cultural_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-or/80 border border-or/30 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.caption && (
          <p className="text-blanc text-sm mb-2 line-clamp-2">
            {post.caption}
          </p>
        )}

        <div className="flex items-center justify-between">
          {post.price && (
            <div className="text-or font-serif text-lg">
              {post.price.toLocaleString()} FCFA
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-blanc/40">
              {post.garment_type}
            </span>
            <span className="text-xs px-2 py-0.5 bg-or/10 text-or rounded">
              {post.complexity}
            </span>
          </div>
        </div>
      </div>

      {/* ===== IMAGE ===== */}
      <div className="relative aspect-[3/4] bg-noir-profond">
        <Image
          src={post.image_url}
          alt={post.caption || 'Post SIGNARE'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />

        {showAnnotationButton && (
          <button
            onClick={() => setShowAnnotationModal(true)}
            className="absolute top-3 right-3 bg-or/90 p-2 rounded-full"
          >
            <Eye className="w-4 h-4 text-noir" />
          </button>
        )}

        {viewDuration > 0 && (
          <div className="absolute bottom-3 left-3 bg-noir/80 px-2 py-1 rounded text-or text-xs">
            👁️ {viewDuration}s
          </div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5"
            >
              <Heart
                className={cn(
                  'w-5 h-5',
                  isLiked
                    ? 'fill-or text-or'
                    : 'text-blanc/70 hover:text-or'
                )}
              />
              <span className="text-sm text-blanc/70">
                {post.likes_count}
              </span>
            </button>

            <button
              onClick={handleInquiry}
              className="flex items-center gap-1.5 text-blanc/70 hover:text-or"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">
                {post.comments_count}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="text-blanc/70 hover:text-or"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <button onClick={handleSave}>
            <Bookmark
              className={cn(
                'w-5 h-5',
                isSaved
                  ? 'fill-or text-or'
                  : 'text-blanc/70 hover:text-or'
              )}
            />
          </button>
        </div>

        <div className="flex justify-between text-xs text-blanc/40">
          <span>{post.views_count} vues</span>
          {post.conversion_rate && post.conversion_rate > 0 && (
            <span className="text-or/60">
              {(post.conversion_rate * 100).toFixed(1)}% conversion
            </span>
          )}
        </div>
      </div>

      {userId && (
        <AnnotationModal
          post={post}
          userId={userId}
          isOpen={showAnnotationModal}
          onClose={() => setShowAnnotationModal(false)}
          onSuccess={() => onAnnotate?.(post.id)}
        />
      )}
    </motion.div>
  )
}
