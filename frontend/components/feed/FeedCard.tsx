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
      {/* Image */}
      <div className="relative aspect-[4/5] bg-noir-profond">
        <Image
          src={post.image_url}
          alt={post.caption || 'Post SIGNARE'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
          priority
        />

        {/* Badge complexité */}
        <div className="absolute top-4 left-4 bg-noir/80 backdrop-blur-sm px-3 py-1 rounded-full border border-or/30">
          <span className="text-or text-xs font-medium">{post.complexity}</span>
        </div>

        {/* Bouton Annotation (Admin seulement) */}
        {showAnnotationButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAnnotationModal(true)}
            className="absolute top-4 right-4 bg-or/90 backdrop-blur-sm p-2 rounded-full"
          >
            <Eye className="w-5 h-5 text-noir" />
          </motion.button>
        )}

        {/* Indicateur de durée de vue (debug, à retirer en prod) */}
        {viewDuration > 0 && (
          <div className="absolute bottom-4 left-4 bg-noir/80 backdrop-blur-sm px-2 py-1 rounded text-or text-xs">
            👁️ {viewDuration}s
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Tags culturels */}
        {post.cultural_tags && post.cultural_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.cultural_tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-or/80 border border-or/30 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-blanc text-sm mb-3 line-clamp-2">{post.caption}</p>
        )}

        {/* Métadonnées ML */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-blanc/60">
          <div>
            <span className="text-blanc/40">Type :</span> {post.garment_type}
          </div>
          {post.fabric_type && (
            <div>
              <span className="text-blanc/40">Tissu :</span> {post.fabric_type}
            </div>
          )}
        </div>

        {/* Prix */}
        {post.price && (
          <div className="text-or font-serif text-xl mb-4">
            {post.price.toLocaleString()} FCFA
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart
                className={cn(
                  'w-6 h-6 transition-colors',
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
              className="flex items-center gap-2 text-blanc/70 hover:text-or transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">{post.comments_count}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="text-blanc/70 hover:text-or transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          {/* Save */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className="p-2"
          >
            <Bookmark
              className={cn(
                'w-6 h-6 transition-colors',
                isSaved ? 'fill-or text-or' : 'text-blanc/70 hover:text-or'
              )}
            />
          </motion.button>
        </div>

        {/* Vues */}
        <div className="mt-3 pt-3 border-t border-or/10 flex items-center justify-between text-xs text-blanc/40">
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

