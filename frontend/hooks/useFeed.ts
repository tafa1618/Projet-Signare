/**
 * HOOK PARTAGÉ - useFeed
 * @ai-context Hook React pour récupérer le feed depuis Supabase
 * Utilisable par web (Next.js) et mobile (React Native)
 * 
 * IMPORTANT : Garantit que web et mobile ont le même feed en production
 */

import { useState, useEffect } from 'react'
import { getFeed, toggleLike, toggleSave, repostPost } from '../../shared/services/feedService'
import type { FeedPost } from '../../shared/services/feedService'

interface UseFeedOptions {
  supabaseClient: any // SupabaseClient (web ou mobile)
  userId?: string
  limit?: number
  enabled?: boolean
}

export function useFeed({ supabaseClient, userId, limit = 20, enabled = true }: UseFeedOptions) {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFeed = async () => {
    if (!enabled || !supabaseClient) return

    setLoading(true)
    setError(null)

    try {
      const feedPosts = await getFeed(supabaseClient, userId, limit)
      setPosts(feedPosts)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du chargement du feed'))
      console.error('[useFeed] Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [supabaseClient, userId, limit, enabled])

  const handleLike = async (postId: string) => {
    if (!userId || !supabaseClient) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const newIsLiked = await toggleLike(supabaseClient, postId, userId, post.isLiked)
    
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: newIsLiked,
              likes: newIsLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
            }
          : p
      )
    )
  }

  const handleSave = async (postId: string) => {
    if (!userId || !supabaseClient) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const newIsSaved = await toggleSave(supabaseClient, postId, userId, post.isSaved)
    
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, isSaved: newIsSaved } : p
      )
    )
  }

  const handleRepost = async (postId: string, comment?: string) => {
    if (!userId || !supabaseClient) return

    const success = await repostPost(supabaseClient, postId, userId, comment)
    if (success) {
      // Recharger le feed pour inclure le nouveau repost
      await fetchFeed()
    }
    return success
  }

  return {
    posts,
    loading,
    error,
    refetch: fetchFeed,
    handleLike,
    handleSave,
    handleRepost,
  }
}

