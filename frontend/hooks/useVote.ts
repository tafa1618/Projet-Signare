/**
 * Hook pour gérer les votes (likes) sur les participations
 * @dev Mode mock pour le développement
 */

import { useState, useCallback } from 'react'

interface VoteState {
  hasVoted: boolean
  likesCount: number
}

// Stockage mock en mémoire (pour le développement)
const mockVotes: Map<string, VoteState> = new Map()

/**
 * Hook pour gérer les votes d'une participation
 * @dev Mode mock - utilise localStorage pour persister
 */
export function useVote(participationId: string | null, initialLikesCount: number = 0) {
  // Initialiser l'état depuis localStorage ou mock en mémoire
  const [state, setState] = useState<VoteState>(() => {
    if (!participationId) {
      return { hasVoted: false, likesCount: initialLikesCount }
    }
    
    // Vérifier dans le mock en mémoire en premier
    if (mockVotes.has(participationId)) {
      return mockVotes.get(participationId)!
    }
    
    // Vérifier localStorage si disponible
    if (typeof window !== 'undefined') {
      const storageKey = `vote_${participationId}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Mettre à jour le mock en mémoire
          mockVotes.set(participationId, parsed)
          return parsed
        } catch {
          // Ignorer les erreurs de parsing
        }
      }
    }
    
    return { hasVoted: false, likesCount: initialLikesCount }
  })
  
  const storageKey = participationId ? `vote_${participationId}` : null

  const vote = useCallback(async () => {
    if (!participationId || state.hasVoted) return

    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 300))

    const newState: VoteState = {
      hasVoted: true,
      likesCount: state.likesCount + 1,
    }

    setState(newState)

    // Persister dans mock et localStorage
    if (storageKey && typeof window !== 'undefined') {
      mockVotes.set(participationId, newState)
      localStorage.setItem(storageKey, JSON.stringify(newState))
    }
  }, [participationId, state.hasVoted, state.likesCount, storageKey])

  const unvote = useCallback(async () => {
    if (!participationId || !state.hasVoted) return

    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 300))

    const newState: VoteState = {
      hasVoted: false,
      likesCount: Math.max(0, state.likesCount - 1),
    }

    setState(newState)

    // Persister dans mock et localStorage
    if (storageKey && typeof window !== 'undefined') {
      mockVotes.set(participationId, newState)
      localStorage.setItem(storageKey, JSON.stringify(newState))
    }
  }, [participationId, state.hasVoted, state.likesCount, storageKey])

  const toggleVote = useCallback(async () => {
    if (state.hasVoted) {
      await unvote()
    } else {
      await vote()
    }
  }, [state.hasVoted, vote, unvote])

  return {
    hasVoted: state.hasVoted,
    likesCount: state.likesCount,
    vote,
    unvote,
    toggleVote,
    isLoading: false,
  }
}

