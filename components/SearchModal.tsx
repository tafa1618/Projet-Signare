'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter, SlidersHorizontal, Loader2, Star } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/frontend/hooks/useSearch'
import type { SearchFilters } from '@/frontend/hooks/useSearch'
import { logMLInteraction } from '@/lib/logger'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const { results, isLoading, error, suggestions, totalResults, search, getSuggestions } = useSearch()
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])

  // Focus sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Récupérer les suggestions quand la requête change
  useEffect(() => {
    if (query.length > 2) {
      getSuggestions(query).then(setSearchSuggestions)
    } else {
      setSearchSuggestions([])
    }
  }, [query, getSuggestions])

  // Rechercher quand Enter est pressé
  const handleSearch = async () => {
    if (query.trim().length === 0) return

    logMLInteraction({
      user_id: null,
      post_id: null,
      interaction_type: 'search',
      session_id: 'session-demo',
      duration_seconds: null,
      scroll_depth: null,
      came_from: 'header:search',
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })

    await search(query, filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleResultClick = (itemId: string) => {
    logMLInteraction({
      user_id: null,
      post_id: itemId,
      interaction_type: 'click',
      session_id: 'session-demo',
      duration_seconds: null,
      scroll_depth: null,
      came_from: 'search:result_click',
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })

    router.push(`/product/${itemId}`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 bg-[#0A0A0A] border-b border-[#D4AF37]/20 z-50 max-h-screen flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 border-b border-[#D4AF37]/10">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] z-10" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Rechercher un modèle, une tenue..."
                  className="w-full bg-white/20 sm:bg-white/5 border-2 border-[#D4AF37] sm:border border-[#D4AF37]/20 rounded-xl pl-11 sm:pl-12 pr-4 py-3 sm:py-3 text-white text-base sm:text-base placeholder-white/70 sm:placeholder-white/40 focus:outline-none focus:border-[#D4AF37] focus:bg-white/25 sm:focus:bg-white/10 focus:ring-2 focus:ring-[#D4AF37]/30 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] sm:shadow-none"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border transition-colors flex-shrink-0 ${
                  showFilters
                    ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]'
                    : 'bg-white/10 sm:bg-white/5 border-[#D4AF37]/40 sm:border-[#D4AF37]/20 text-[#D4AF37]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 sm:bg-white/5 border border-[#D4AF37]/40 sm:border-[#D4AF37]/20 text-[#D4AF37] hover:bg-white/15 sm:hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Filtres */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-[#D4AF37]/10"
                >
                  <div className="px-4 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/60 mb-1 block">Catégorie</label>
                        <select
                          value={filters.category || ''}
                          onChange={(e) =>
                            setFilters({ ...filters, category: e.target.value || undefined })
                          }
                          className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                        >
                          <option value="">Toutes</option>
                          <option value="boubou">Boubou</option>
                          <option value="robe">Robe</option>
                          <option value="kaftan">Kaftan</option>
                          <option value="ensemble">Ensemble</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-white/60 mb-1 block">Couleur</label>
                        <select
                          value={filters.color || ''}
                          onChange={(e) =>
                            setFilters({ ...filters, color: e.target.value || undefined })
                          }
                          className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                        >
                          <option value="">Toutes</option>
                          <option value="blanc">Blanc</option>
                          <option value="bleu">Bleu</option>
                          <option value="vert">Vert</option>
                          <option value="marron">Marron</option>
                          <option value="noir">Noir</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-white/60 mb-1 block">Prix min (FCFA)</label>
                        <input
                          type="number"
                          value={filters.min_price || ''}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              min_price: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          placeholder="0"
                          className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 mb-1 block">Prix max (FCFA)</label>
                        <input
                          type="number"
                          value={filters.max_price || ''}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              max_price: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          placeholder="100000"
                          className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSearch}
                      className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2 rounded-lg text-sm font-black uppercase tracking-[0.18em]"
                    >
                      Appliquer les filtres
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions */}
            {searchSuggestions.length > 0 && query.length > 2 && results.length === 0 && (
              <div className="px-3 sm:px-4 py-3 border-b border-[#D4AF37]/10">
                <p className="text-xs text-white/50 mb-2 uppercase tracking-[0.18em]">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(suggestion)
                        handleSearch()
                      }}
                      className="px-2.5 sm:px-3 py-1.5 bg-white/5 border border-[#D4AF37]/20 rounded-lg text-xs sm:text-sm text-white/70 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Résultats */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-white/60">{error}</p>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-white/60">
                      {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {results.map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => handleResultClick(item.id)}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex gap-3 p-3 bg-white/5 border border-[#D4AF37]/10 rounded-xl hover:border-[#D4AF37]/30 transition-colors text-left"
                      >
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm sm:text-base line-clamp-1">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-white/60 text-xs mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {item.price && (
                              <span className="text-[#D4AF37] font-bold text-sm">
                                {item.price.toLocaleString()} FCFA
                              </span>
                            )}
                            {item.tailor_rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-[#D4AF37] fill-current" />
                                <span className="text-white/60 text-xs">{item.tailor_rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-white/40">{item.tailor_name}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : query.length > 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/60">Aucun résultat trouvé pour "{query}"</p>
                  <p className="text-white/40 text-sm mt-2">
                    Essayez avec d'autres mots-clés ou modifiez les filtres
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-[#D4AF37]/30 mx-auto mb-4" />
                  <p className="text-white/60">Commencez à rechercher...</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

