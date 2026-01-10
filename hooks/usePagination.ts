/**
 * Hook de pagination native (sans React Query)
 * @security Pagination côté serveur uniquement pour prévenir la charge excessive
 * @ai-context Optimisé pour mobile-first avec infinite scroll
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { logError, logPerformance } from '@/lib/logger'
import { handleFetchError, handleHTTPError, NetworkError } from '@/lib/errors'

export interface PaginationOptions {
  pageSize?: number
  initialPage?: number
  enabled?: boolean
}

export interface PaginationResult<T> {
  data: T[]
  isLoading: boolean
  isLoadingMore: boolean
  error: Error | null
  hasMore: boolean
  currentPage: number
  totalPages?: number
  totalItems?: number
  fetchNextPage: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Hook de pagination générique avec infinite scroll
 * @template T Type des items paginés
 */
export function usePagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{
    data: T[]
    total?: number
    hasMore: boolean
  }>,
  options: PaginationOptions = {}
): PaginationResult<T> {
  const {
    pageSize = 20,
    initialPage = 1,
    enabled = true,
  } = options

  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Fonction pour charger une page
  const loadPage = useCallback(async (page: number, append: boolean = false) => {
    if (!enabled) return

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    const loadingState = append ? setIsLoadingMore : setIsLoading

    loadingState(true)
    setError(null)

    const startTime = Date.now()

    try {
      const result = await fetchFunction(page, pageSize)

      // Vérifier si la requête a été annulée
      if (controller.signal.aborted) {
        return
      }

      if (append) {
        setData((prev) => [...prev, ...result.data])
      } else {
        setData(result.data)
      }

      setHasMore(result.hasMore)
      setTotalItems(result.total)
      setCurrentPage(page)

      const duration = Date.now() - startTime
      logPerformance(`pagination-load-page-${page}`, duration, {
        pageSize,
        itemsLoaded: result.data.length,
        hasMore: result.hasMore,
      })
    } catch (err) {
      if (controller.signal.aborted) {
        return
      }

      const error = handleFetchError(err, 'Pagination')
      logError(error, `Pagination page ${page}`)
      setError(error)
    } finally {
      loadingState(false)
      abortControllerRef.current = null
    }
  }, [fetchFunction, pageSize, enabled])

  // Charger la première page au montage
  useEffect(() => {
    if (enabled) {
      loadPage(initialPage, false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Charger la page suivante
  const fetchNextPage = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore || !enabled) {
      return
    }

    await loadPage(currentPage + 1, true)
  }, [hasMore, isLoading, isLoadingMore, currentPage, loadPage, enabled])

  // Rafraîchir (recharger depuis le début)
  const refresh = useCallback(async () => {
    setCurrentPage(initialPage)
    setData([])
    setHasMore(true)
    await loadPage(initialPage, false)
  }, [initialPage, loadPage])

  // Cleanup : annuler les requêtes en cours au démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : undefined

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    currentPage,
    totalPages,
    totalItems,
    fetchNextPage,
    refresh,
  }
}

/**
 * Hook pour pagination avec infinite scroll via Intersection Observer
 */
export function useInfiniteScrollPagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{
    data: T[]
    total?: number
    hasMore: boolean
  }>,
  options: PaginationOptions & {
    threshold?: number // Distance depuis le bas pour déclencher le chargement (0.1 = 10%)
  } = {}
) {
  const {
    threshold = 0.1,
    ...paginationOptions
  } = options

  const pagination = usePagination(fetchFunction, paginationOptions)
  const observerTarget = useRef<HTMLDivElement | null>(null)

  // Observer pour détecter quand on approche du bas de la page
  useEffect(() => {
    const target = observerTarget.current
    if (!target || !pagination.hasMore || pagination.isLoadingMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && pagination.hasMore && !pagination.isLoadingMore) {
          pagination.fetchNextPage()
        }
      },
      {
        threshold,
        rootMargin: '100px', // Déclencher 100px avant d'atteindre l'élément
      }
    )

    observer.observe(target)

    return () => {
      observer.unobserve(target)
      observer.disconnect()
    }
  }, [pagination.hasMore, pagination.isLoadingMore, pagination.fetchNextPage, threshold])

  return {
    ...pagination,
    observerTarget,
  }
}

