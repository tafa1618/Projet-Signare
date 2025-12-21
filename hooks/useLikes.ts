import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Hook pour gérer les likes avec retour haptique visuel
 * @ai-context Système de like avec animation Or pour feedback utilisateur
 */
export function useLikes(postId: string, userId: string | null) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Vérifier si l'utilisateur a déjà liké
    const checkLike = async () => {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      setIsLiked(!!data)
    }

    // Récupérer le nombre de likes
    const fetchLikesCount = async () => {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

      setLikesCount(count || 0)
    }

    checkLike()
    fetchLikesCount()
  }, [postId, userId])

  const toggleLike = async () => {
    if (!userId || isLoading) return

    setIsLoading(true)

    try {
      if (isLiked) {
        // Retirer le like
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        setIsLiked(false)
        setLikesCount((prev) => Math.max(0, prev - 1))
      } else {
        // Ajouter le like
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: userId })

        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Erreur lors du toggle like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { isLiked, likesCount, toggleLike, isLoading }
}

