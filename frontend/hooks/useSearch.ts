import { useState } from 'react'
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
      const errorMessage = handleFetchError(err, 'Erreur lors de la recherche')
      setError(errorMessage)
      logError({
        message: errorMessage,
        error: err instanceof Error ? err : new Error(String(err)),
        context: { query, filters },
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestions = async (query: string) => {
    try {
      const response = await fetch(
        `${SEARCH_ENGINE_URL}/search/suggestions?query=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.suggestions || []
    } catch (err) {
      logError({
        message: 'Erreur lors de la récupération des suggestions',
        error: err instanceof Error ? err : new Error(String(err)),
        context: { query },
      })
      return []
    }
  }

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

