import { useState, useCallback } from 'react'
import { handleHTTPError, handleFetchError } from '@/lib/errors'
import { logError } from '@/lib/logger'

/**
 * Hook pour la recherche via le microservice Search/Feed/Recommendation
 */

const SEARCH_ENGINE_URL = process.env.NEXT_PUBLIC_SEARCH_ENGINE_URL || 'http://localhost:8003/api/v1'

export interface SearchFilters {
  category?: string
  min_price?: number
  max_price?: number
  color?: string
  region?: string
  availability?: boolean
  tailor_id?: string
}

export interface SearchResult {
  id: string
  title: string
  description?: string
  image_url: string
  price?: number
  tailor_id: string
  tailor_name: string
  tailor_rating?: number
  rating?: number
  availability: boolean
  created_at: string
  relevance_score: number
  business_score: number
  final_score: number
}

export interface SearchResponse {
  query: string
  total_results: number
  items: SearchResult[]
  suggestions: string[]
  filters_applied: SearchFilters
  search_id: string
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [totalResults, setTotalResults] = useState(0)

  const search = async (
    query: string,
    filters?: SearchFilters,
    maxResults: number = 50
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Vérifier que l'URL est valide
      if (!SEARCH_ENGINE_URL || SEARCH_ENGINE_URL === 'http://localhost:8003/api/v1') {
        // Mode développement : retourner des résultats mockés si le service n'est pas disponible
        console.warn('Search engine not available, using mock results')
        const mockResults: SearchResult[] = [
          {
            id: 'mock-1',
            title: `Résultat pour "${query}"`,
            description: 'Service de recherche non disponible. Résultat de démonstration.',
            image_url: 'https://via.placeholder.com/300x400?text=Mock',
            price: 0,
            tailor_id: 'mock-tailor',
            tailor_name: 'Tailleur de démonstration',
            availability: true,
            created_at: new Date().toISOString(),
            relevance_score: 0.8,
            business_score: 0.7,
            final_score: 0.75,
          },
        ]
        setResults(mockResults)
        setSuggestions([])
        setTotalResults(1)
        return {
          query,
          total_results: 1,
          items: mockResults,
          suggestions: [],
          filters_applied: filters || {},
          search_id: 'mock-search',
        }
      }

      const response = await fetch(`${SEARCH_ENGINE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters: filters || {},
          context: {
            user_id: null, // À remplir avec le vrai user_id quand auth est active
            device_type: 'mobile',
          },
          max_results: maxResults,
          offset: 0,
        }),
      })

      if (!response.ok) {
        const httpError = await handleHTTPError(response)
        throw httpError
      }

      const data: SearchResponse = await response.json()

      setResults(data.items)
      setSuggestions(data.suggestions)
      setTotalResults(data.total_results)

      return data
    } catch (err) {
      // Si c'est une erreur de connexion, utiliser des résultats mockés en développement
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Search engine connection failed, using mock results')
        const mockResults: SearchResult[] = [
          {
            id: 'mock-1',
            title: `Résultat pour "${query}"`,
            description: 'Service de recherche temporairement indisponible. Résultat de démonstration.',
            image_url: 'https://via.placeholder.com/300x400?text=Mock',
            price: 0,
            tailor_id: 'mock-tailor',
            tailor_name: 'Tailleur de démonstration',
            availability: true,
            created_at: new Date().toISOString(),
            relevance_score: 0.8,
            business_score: 0.7,
            final_score: 0.75,
          },
        ]
        setResults(mockResults)
        setSuggestions([])
        setTotalResults(1)
        setError(null) // Pas d'erreur, on utilise les mocks
        return {
          query,
          total_results: 1,
          items: mockResults,
          suggestions: [],
          filters_applied: filters || {},
          search_id: 'mock-search',
        }
      }

      const errorObj = handleFetchError(err, 'Erreur lors de la recherche')
      // Convertir l'erreur en string pour l'affichage
      // Utiliser getUserMessage() si disponible, sinon message
      const errorString = errorObj instanceof Error && 'getUserMessage' in errorObj && typeof errorObj.getUserMessage === 'function'
        ? errorObj.getUserMessage()
        : errorObj.message || String(errorObj) || 'Erreur lors de la recherche'
      setError(errorString)
      logError({
        message: errorString,
        error: err instanceof Error ? err : new Error(String(err)),
        context: { query, filters },
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestions = useCallback(async (query: string) => {
    try {
      // Vérifier que l'URL est valide
      if (!SEARCH_ENGINE_URL || SEARCH_ENGINE_URL === 'http://localhost:8003/api/v1') {
        // Mode développement : retourner des suggestions mockées
        const mockSuggestions = [
          `${query} homme`,
          `${query} femme`,
          `${query} bazin`,
          `${query} wax`,
        ]
        return mockSuggestions
      }

      const response = await fetch(
        `${SEARCH_ENGINE_URL}/search/suggestions?query=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.suggestions || []
    } catch (err) {
      // En cas d'erreur, retourner des suggestions mockées plutôt que d'échouer
      const mockSuggestions = [
        `${query} homme`,
        `${query} femme`,
        `${query} bazin`,
        `${query} wax`,
      ]
      logError({
        message: 'Erreur lors de la récupération des suggestions',
        error: err instanceof Error ? err : new Error(String(err)),
        context: { query },
      })
      return mockSuggestions
    }
  }, [])

  return {
    results,
    isLoading,
    error,
    suggestions,
    totalResults,
    search,
    getSuggestions,
  }
}

