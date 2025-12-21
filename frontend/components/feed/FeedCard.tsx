/**
 * FRONTEND - FeedCard Component
 * @ai-context Carte de post avec tracking automatique des interactions
 * Enregistre : vue (>3s), scroll depth, durée totale
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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
  showAnnotationButton?: boolean // Pour les admin/tailleurs
}

/**
 * Carte de post avec tracking automatique
 * @ai-context Collecte automatiquement les données d'engagement
 */
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
  const [isVisible, setIsVisible] = useState(false)
  const [viewDuration, setViewDuration] = useState(0)
  const [showAnnotationModal, setShowAnnotationModal] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const visibilityStartTime = useRef<number>(0)

  // Hook de tracking automatique
  const {
    trackLike,
    trackUnlike,
    trackSave,
    trackShare,
    trackInquiry,
  } = usePostEngagement(post.id, userId)

  // Observer pour détecter la visibilité (>3s = interaction enregistrée)
  useEffect(() => {
    if (!cardRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            visibilityStartTime.current = Date.now()
          } else if (isVisible) {
            // Calculer la durée de visibilité
            const duration = Date.now() - visibilityStartTime.current
            if (duration > 3000) {
              // Plus de 3 secondes = interaction significative
              setViewDuration(Math.floor(duration / 1000))
            }
            setIsVisible(false)
          }
        })
      },
      { threshold: 0.5 } // 50% de la carte visible
    )

    observer.observe(cardRef.current)

    return () => observer.disconnect()
  }, [isVisible])

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
    setIsSaved(!isSaved)
    onSave?.(post.id)
  }

  const handleShare = async () => {
    await trackShare()
    // Logique de partage
  }

  const handleInquiry = async () => {
    await trackInquiry()
    // Ouvrir la messagerie
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-noir border border-or/20 rounded-lg overflow-hidden shadow-gold-md mb-6"
    >
      {/* Header avec infos */}
      <div className="p-4 pb-3">
        {/* Tags culturels */}
        {post.cultural_tags && post.cultural_tags.length > 0 && (
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

        {/* Caption */}
        {post.caption && (
          <p className="text-blanc text-sm mb-2 line-clamp-2">{post.caption}</p>
        )}

        {/* Prix et type */}
        <div className="flex items-center justify-between">
          {post.price && (
            <div className="text-or font-serif text-lg">
              {post.price.toLocaleString()} FCFA
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-blanc/40">{post.garment_type}</span>
            <span className="text-xs px-2 py-0.5 bg-or/10 text-or rounded">
              {post.complexity}
            </span>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-[3/4] bg-noir-profond">
        <Image
          src={post.image_url}
          alt={post.caption || 'Post SIGNARE'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
          priority
        />

        {/* Bouton Annotation (Admin seulement) */}
        {showAnnotationButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAnnotationModal(true)}
            className="absolute top-3 right-3 bg-or/90 backdrop-blur-sm p-2 rounded-full"
          >
            <Eye className="w-4 h-4 text-noir" />
          </motion.button>
        )}

        {/* Indicateur de durée de vue (debug) */}
        {viewDuration > 0 && (
          <div className="absolute bottom-3 left-3 bg-noir/80 backdrop-blur-sm px-2 py-1 rounded text-or text-xs">
            👁️ {viewDuration}s
          </div>
        )}
      </div>

      {/* Footer avec actions */}
      <div className="p-4 pt-3">
        {/* Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex items-center gap-1.5"
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  isLiked
                    ? 'fill-or text-or drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                    : 'text-blanc/70 hover:text-or'
                )}
              />
              <span className="text-blanc/70 text-sm">{post.likes_count}</span>
            </motion.button>

            {/* Commentaires */}
            <button
              onClick={handleInquiry}
              className="flex items-center gap-1.5 text-blanc/70 hover:text-or transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments_count}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="text-blanc/70 hover:text-or transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Save */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className="p-1.5"
          >
            <Bookmark
              className={cn(
                'w-5 h-5 transition-colors',
                isSaved ? 'fill-or text-or' : 'text-blanc/70 hover:text-or'
              )}
            />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-blanc/40">
          <span>{post.views_count} vues</span>
          {post.conversion_rate && post.conversion_rate > 0 && (
            <span className="text-or/60">
              {(post.conversion_rate * 100).toFixed(1)}% conversion
            </span>
          )}
        </div>
      </div>

      {/* Modale d'annotation */}
      {userId && (
        <AnnotationModal
          post={post}
          userId={userId}
          isOpen={showAnnotationModal}
          onClose={() => setShowAnnotationModal(false)}
          onSuccess={() => {
            onAnnotate?.(post.id)
          }}
        />
      )}
    </motion.div>
  )
}

