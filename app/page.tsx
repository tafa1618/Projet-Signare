/**
 * PAGE - Feed d'accueil avec tracking automatique
 * @ai-context Page principale collectant automatiquement les données d'engagement
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp } from 'lucide-react'
import { FeedCard } from '@/frontend/components/feed/FeedCard'
import { useAuth } from '@/frontend/hooks/useAuth'
import { useSessionTracking } from '@/frontend/hooks/useTracking'
import { supabase } from '@/backend/lib/supabase'
import type { Post } from '@/shared/types/database.types'

export default function HomePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<number>(50)

  // Tracking automatique de la session
  useSessionTracking(user?.id || null)

  // Charger les posts
  useEffect(() => {
    loadPosts()
    if (user) {
      loadUserRole()
    }
  }, [user])

  async function loadPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Erreur chargement posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadUserRole() {
    if (!user) return

    try {
      const { data } = await supabase
        .from('profiles')
        .select('role_score')
        .eq('id', user.id)
        .single()

      if (data) {
        setUserRole(data.role_score)
      }
    } catch (error) {
      console.error('Erreur chargement role:', error)
    }
  }

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
      )
    )

    // Update in DB via like hook (déjà géré dans FeedCard)
  }

  const handleSave = async (postId: string) => {
    // Update saves_count (géré dans FeedCard)
  }

  // Détermine si l'utilisateur peut annoter (admin ou tailleur)
  const canAnnotate = userRole >= 70

  return (
    <div className="min-h-screen bg-noir pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-noir/95 backdrop-blur-sm border-b border-or/20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-serif text-or"
            >
              SIGNARE
            </motion.h1>

            {user && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-or/60" />
                <span className="text-xs text-blanc/60">
                  Score: {userRole}
                </span>
              </div>
            )}
          </div>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-blanc/60 mt-1"
          >
            Mode sénégalaise de luxe
          </motion.p>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-noir border border-or/20 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/5] bg-noir-profond" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-or/20 rounded w-3/4" />
                  <div className="h-4 bg-or/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          // État vide
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Sparkles className="w-16 h-16 text-or/40 mb-4" />
            <h2 className="text-xl font-serif text-blanc/70 mb-2">
              Aucun post pour le moment
            </h2>
            <p className="text-blanc/50 text-sm">
              Soyez le premier à partager votre création
            </p>
          </motion.div>
        ) : (
          // Liste des posts
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <FeedCard
                  post={post}
                  userId={user?.id || null}
                  onLike={handleLike}
                  onSave={handleSave}
                  showAnnotationButton={canAnnotate}
                />
              </motion.div>
            ))}

            {/* Message de fin */}
            {posts.length >= 20 && (
              <div className="text-center py-8">
                <p className="text-blanc/40 text-sm">
                  ✨ Vous êtes à jour
                </p>
              </div>
            )}
          </div>
        )}

        {/* Indicateur ML (Debug, à retirer en prod) */}
        {user && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 p-4 bg-noir border border-or/10 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-or animate-pulse" />
              <span className="text-xs text-or/80 font-medium">
                Collecte ML Active
              </span>
            </div>
            <p className="text-xs text-blanc/40">
              Vues, durées, scrolls et interactions enregistrés automatiquement
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
