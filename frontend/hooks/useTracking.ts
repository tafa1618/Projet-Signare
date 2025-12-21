/**
 * Hook de tracking des interactions utilisateur
 * @ai-context Collecte automatique de données pour ML
 */

import { useEffect, useRef, useState } from 'react'
import { InteractionTracker, SearchTracker } from '@/backend/services/ml-collection'

/**
 * Hook pour tracker automatiquement les vues de posts
 */
export function useTrackPostView(
  postId: string | null,
  userId: string | null,
  options: {
    enabled?: boolean
    cameFrom?: string
  } = {}
) {
  const { enabled = true, cameFrom } = options
  const hasTracked = useRef(false)
  const startTime = useRef<number>(Date.now())
  const sessionId = useSessionId()

  useEffect(() => {
    if (!enabled || !postId || !userId || hasTracked.current) return

    // Tracker la vue au mount
    InteractionTracker.trackView(userId, postId, sessionId, {
      cameFrom,
      deviceType: getDeviceType(),
    })
    hasTracked.current = true
    startTime.current = Date.now()

    // Tracker la durée au unmount
    return () => {
      const durationSeconds = Math.floor((Date.now() - startTime.current) / 1000)
      if (durationSeconds > 1) {
        InteractionTracker.track({
          userId,
          postId,
          interactionType: 'view',
          sessionId,
          durationSeconds,
          cameFrom,
          deviceType: getDeviceType(),
        })
      }
    }
  }, [enabled, postId, userId, sessionId, cameFrom])
}

/**
 * Hook pour tracker le scroll depth
 */
export function useTrackScrollDepth(
  postId: string | null,
  userId: string | null,
  enabled = true
) {
  const [scrollDepth, setScrollDepth] = useState(0)
  const sessionId = useSessionId()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!enabled || !postId || !userId) return

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY

      const depth = (scrollTop + windowHeight) / documentHeight
      setScrollDepth(Math.max(scrollDepth, depth))
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)

      // Envoyer le scroll depth au unmount
      if (scrollDepth > 0.1 && !hasTracked.current) {
        InteractionTracker.track({
          userId,
          postId,
          interactionType: 'view',
          sessionId,
          scrollDepth: Math.round(scrollDepth * 100) / 100,
          deviceType: getDeviceType(),
        })
        hasTracked.current = true
      }
    }
  }, [enabled, postId, userId, sessionId, scrollDepth])

  return scrollDepth
}

/**
 * Hook pour tracker les recherches
 */
export function useTrackSearch() {
  const [searchQueryId, setSearchQueryId] = useState<string | null>(null)
  const sessionId = useSessionId()

  const trackSearch = async (
    queryText: string,
    resultsCount: number,
    userId?: string,
    filters?: Record<string, any>
  ) => {
    try {
      const queryId = await SearchTracker.trackSearch({
        userId,
        queryText,
        filters,
        resultsCount,
        sessionId,
      })
      setSearchQueryId(queryId)
      return queryId
    } catch (error) {
      console.error('Erreur tracking search:', error)
      return null
    }
  }

  const trackSearchClick = async (postId: string) => {
    if (!searchQueryId) return

    try {
      await SearchTracker.trackSearchClick(searchQueryId, postId)
    } catch (error) {
      console.error('Erreur tracking search click:', error)
    }
  }

  return { trackSearch, trackSearchClick }
}

/**
 * Hook pour obtenir/générer un session ID
 */
function useSessionId(): string {
  const [sessionId] = useState(() => {
    // Vérifier s'il existe déjà un session ID
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('signare_session_id')
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
        sessionStorage.setItem('signare_session_id', id)
      }
      return id
    }
    return `session_${Date.now()}`
  })

  return sessionId
}

/**
 * Détecter le type de device
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Hook pour tracker l'engagement sur un post
 * @ai-context Mesure l'engagement complet (vue, durée, scroll, like, save)
 */
export function usePostEngagement(postId: string | null, userId: string | null) {
  const sessionId = useSessionId()
  const startTime = useRef(Date.now())

  // Tracker automatiquement la vue
  useTrackPostView(postId, userId, { enabled: true })

  // Tracker le scroll
  const scrollDepth = useTrackScrollDepth(postId, userId, true)

  const trackLike = async () => {
    if (!postId || !userId) return
    await InteractionTracker.trackLike(userId, postId, sessionId)
  }

  const trackUnlike = async () => {
    if (!postId || !userId) return
    await InteractionTracker.track({
      userId,
      postId,
      interactionType: 'unlike',
      sessionId,
      deviceType: getDeviceType(),
    })
  }

  const trackSave = async () => {
    if (!postId || !userId) return
    await InteractionTracker.trackSave(userId, postId, sessionId)
  }

  const trackShare = async () => {
    if (!postId || !userId) return
    await InteractionTracker.track({
      userId,
      postId,
      interactionType: 'share',
      sessionId,
      deviceType: getDeviceType(),
    })
  }

  const trackInquiry = async () => {
    if (!postId || !userId) return
    await InteractionTracker.trackInquiry(userId, postId, sessionId)
  }

  const trackZoom = async () => {
    if (!postId || !userId) return
    await InteractionTracker.track({
      userId,
      postId,
      interactionType: 'zoom',
      sessionId,
      deviceType: getDeviceType(),
    })
  }

  return {
    scrollDepth,
    timeSpent: Math.floor((Date.now() - startTime.current) / 1000),
    trackLike,
    trackUnlike,
    trackSave,
    trackShare,
    trackInquiry,
    trackZoom,
  }
}

/**
 * Hook pour tracker l'activité de session
 * @ai-context Collecte les données de session pour analyser le comportement
 */
export function useSessionTracking(userId: string | null) {
  const sessionId = useSessionId()
  const sessionStart = useRef(Date.now())
  const lastActivity = useRef(Date.now())

  useEffect(() => {
    if (!userId) return

    // Mettre à jour last_active_at toutes les 30 secondes
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastActivity.current < 60000) {
        // Actif dans la dernière minute
        updateLastActive(userId)
      }
    }, 30000)

    // Tracker l'activité
    const trackActivity = () => {
      lastActivity.current = Date.now()
    }

    window.addEventListener('mousemove', trackActivity)
    window.addEventListener('keydown', trackActivity)
    window.addEventListener('scroll', trackActivity)
    window.addEventListener('touchstart', trackActivity)

    // Au unmount, sauvegarder la durée de session
    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', trackActivity)
      window.removeEventListener('keydown', trackActivity)
      window.removeEventListener('scroll', trackActivity)
      window.removeEventListener('touchstart', trackActivity)

      const sessionDuration = Math.floor((Date.now() - sessionStart.current) / 1000)
      updateAverageSessionDuration(userId, sessionDuration)
    }
  }, [userId])

  return { sessionId, sessionStart: sessionStart.current }
}

/**
 * Mettre à jour last_active_at
 */
async function updateLastActive(userId: string) {
  try {
    const { supabase } = await import('@/backend/lib/supabase')
    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId)
  } catch (error) {
    console.error('Erreur update last_active_at:', error)
  }
}

/**
 * Mettre à jour la durée moyenne de session
 */
async function updateAverageSessionDuration(userId: string, newDuration: number) {
  try {
    const { supabase } = await import('@/backend/lib/supabase')
    const { data: profile } = await supabase
      .from('profiles')
      .select('average_session_duration, total_posts_created')
      .eq('id', userId)
      .single()

    if (profile) {
      // Calculer une moyenne pondérée (80% ancien, 20% nouveau)
      const avgDuration = Math.floor(
        profile.average_session_duration * 0.8 + newDuration * 0.2
      )

      await supabase
        .from('profiles')
        .update({ average_session_duration: avgDuration })
        .eq('id', userId)
    }
  } catch (error) {
    console.error('Erreur update session duration:', error)
  }
}

