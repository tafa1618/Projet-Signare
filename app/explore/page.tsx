'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { Search, X, Heart, Bookmark, ChevronLeft, ChevronRight, Scissors } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { mockPosts, mockReels, type Reel } from '@/lib/mocks'
import { Post } from '@/app/page'

// ─── SEARCH ALGORITHM (conservé) ────────────────────────────────────────────

interface SearchResult {
  item: Post
  score: number
}

function performDeepSearch(query: string, items: Post[]): SearchResult[] {
  if (!query.trim()) return items.map(item => ({ item, score: 1 }))

  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0)
  const WEIGHTS = { exact_garment: 8, exact_fabric: 8, exact_tailor: 5, partial_caption: 2, partial_tailor: 3 }

  return items.map(item => {
    let score = 0
    const caption = item.caption?.toLowerCase() || ''
    const garment = item.garment_type?.toLowerCase() || ''
    const fabric = item.fabric_type?.toLowerCase() || ''
    const tailorName = item.user.name.toLowerCase()
    const specialty = item.user.specialty?.toLowerCase() || ''

    terms.forEach(term => {
      if (caption.includes(term)) score += WEIGHTS.partial_caption
      if (garment.includes(term)) score += WEIGHTS.exact_garment
      if (fabric.includes(term)) score += WEIGHTS.exact_fabric
      if (tailorName.includes(term)) score += WEIGHTS.exact_tailor
      if (specialty.includes(term)) score += WEIGHTS.partial_tailor
    })
    if (item.quality_rating === 5) score += 2

    return { item, score }
  })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const FABRIC_FILTERS = ['Tout', 'Basin', 'Wax', 'Soie', 'Kaftan', 'Boubou', 'Mariage', 'Broderie', 'Lin']
type SourceFilter = 'all' | 'tailor' | 'client'

// ─── REEL MODAL ──────────────────────────────────────────────────────────────

function ReelModal({
  reels,
  initialIndex,
  onClose,
}: {
  reels: Reel[]
  initialIndex: number
  onClose: () => void
}) {
  const reducedMotion = useReducedMotion()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reel = reels[currentIndex]
  const TICK = 50 // ms

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= reels.length) { onClose(); return }
    setCurrentIndex(index)
    setProgress(0)
  }, [reels.length, onClose])

  // Progression automatique
  useEffect(() => {
    setProgress(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          goTo(currentIndex + 1)
          return 0
        }
        return p + (TICK / (reel.duration * 1000)) * 100
      })
    }, TICK)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [currentIndex, reel.duration, goTo])

  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX
    const half = window.innerWidth / 2
    if (x < half) goTo(currentIndex - 1)
    else goTo(currentIndex + 1)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        initial={reducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Image plein écran */}
        <div
          className="relative w-full h-full max-w-sm mx-auto cursor-pointer select-none"
          onClick={handleTap}
        >
          <Image
            src={reel.mediaUrl}
            alt={reel.caption}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />

          {/* Gradient haut */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
          {/* Gradient bas */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

          {/* Barres de progression */}
          <div className="absolute top-0 inset-x-0 flex gap-1 px-3 pt-3 pointer-events-none">
            {reels.map((_, i) => (
              <div key={i} className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-none"
                  style={{
                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header : avatar + nom + close */}
          <div className="absolute top-8 inset-x-0 flex items-center justify-between px-4 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#D4AF37] relative shrink-0">
                <Image src={reel.user.avatar} alt={reel.user.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none">{reel.user.name}</p>
                <p className="text-white/60 text-[10px] mt-0.5">{reel.user.role}</p>
              </div>
            </div>
            <button
              className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); onClose() }}
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Footer : info + actions */}
          <div className="absolute bottom-8 inset-x-0 px-4 flex items-end justify-between pointer-events-none">
            <div className="flex-1 pr-4">
              <div className="flex gap-1.5 mb-2">
                <span className="bg-[#D4AF37] text-black text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase">
                  {reel.garment_type}
                </span>
                {reel.fabric_type && (
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-sm">
                    {reel.fabric_type}
                  </span>
                )}
              </div>
              <p className="text-white text-sm leading-snug line-clamp-3">{reel.caption}</p>
              <button
                className="mt-3 bg-[#D4AF37] text-black text-xs font-bold px-4 py-2 rounded-full pointer-events-auto active:scale-95 transition-transform"
                onClick={(e) => e.stopPropagation()}
              >
                Commander ce style
              </button>
            </div>

            {/* Actions droite */}
            <div className="flex flex-col items-center gap-4 pointer-events-auto">
              <button
                className="flex flex-col items-center gap-1"
                onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [reel.id]: !prev[reel.id] })) }}
              >
                <Heart
                  size={28}
                  className={cn('transition-colors', liked[reel.id] ? 'fill-red-500 stroke-red-500' : 'stroke-white')}
                />
                <span className="text-white text-[10px]">{(reel.likes + (liked[reel.id] ? 1 : 0)).toLocaleString()}</span>
              </button>
              <button
                className="flex flex-col items-center gap-1"
                onClick={(e) => { e.stopPropagation(); setSaved(prev => ({ ...prev, [reel.id]: !prev[reel.id] })) }}
              >
                <Bookmark
                  size={26}
                  className={cn('transition-colors', saved[reel.id] ? 'fill-[#D4AF37] stroke-[#D4AF37]' : 'stroke-white')}
                />
                <span className="text-white text-[10px]">Sauver</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── MASONRY CARD ────────────────────────────────────────────────────────────

function MasonryCard({ item, index }: { item: Post; index: number }) {
  const reducedMotion = useReducedMotion()
  const isTall = item.type === 'tailor'

  return (
    <motion.div
      className={cn('break-inside-avoid mb-3 rounded-xl overflow-hidden bg-[#1A1A1A] relative group cursor-pointer', isTall ? 'aspect-[4/5]' : 'aspect-[3/4]')}
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Image
        src={item.image}
        alt={item.caption ?? ''}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* Gradient bas permanent */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Contenu */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {item.garment_type && (
            <span className="bg-[#D4AF37]/90 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
              {item.garment_type}
            </span>
          )}
          {item.fabric_type && (
            <span className="bg-white/20 backdrop-blur-sm text-white/90 text-[8px] px-1.5 py-0.5 rounded-sm">
              {item.fabric_type}
            </span>
          )}
        </div>

        <p className="text-white text-[11px] leading-snug line-clamp-2 font-medium">
          {item.caption}
        </p>

        {/* Tailleur tagué (pour les posts clients) */}
        {item.type === 'client' && item.taggedTailor && (
          <div className="flex items-center gap-1 mt-1.5">
            <Scissors size={9} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-[9px]">{item.taggedTailor.name}</span>
          </div>
        )}

        {/* Avatar + nom sur hover */}
        <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-5 h-5 rounded-full overflow-hidden relative border border-white/30 shrink-0">
            <Image src={item.user.avatar} alt={item.user.name} fill className="object-cover" />
          </div>
          <span className="text-white/70 text-[9px] truncate">{item.user.name}</span>
          {item.type === 'tailor' && item.price && (
            <span className="ml-auto text-[#D4AF37] text-[9px] font-bold shrink-0">{item.price}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [fabricFilter, setFabricFilter] = useState('Tout')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [reelIndex, setReelIndex] = useState<number | null>(null)
  const [seenReels, setSeenReels] = useState<Set<number>>(new Set())
  const [searchFocused, setSearchFocused] = useState(false)

  const openReel = (index: number) => {
    setReelIndex(index)
    setSeenReels(prev => new Set(prev).add(mockReels[index].id))
  }

  // Filtrage + recherche combinés
  const displayedPosts = useMemo(() => {
    let items: Post[] = mockPosts

    if (sourceFilter !== 'all') {
      items = items.filter(p => p.type === sourceFilter)
    }

    if (fabricFilter !== 'Tout') {
      const f = fabricFilter.toLowerCase()
      items = items.filter(p =>
        (p.fabric_type?.toLowerCase().includes(f) ?? false) ||
        (p.garment_type?.toLowerCase().includes(f) ?? false)
      )
    }

    if (query.trim()) {
      return performDeepSearch(query, items).map(r => r.item)
    }

    return items
  }, [query, fabricFilter, sourceFilter])

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pb-24 w-full max-w-[100vw] overflow-x-hidden">

      {/* ── HEADER STICKY ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10 px-4 pt-5 pb-4 w-full">
        <h1 className="text-xl font-serif font-bold text-[#D4AF37] mb-4 tracking-widest text-center">EXPLORER</h1>

        {/* Barre de recherche */}
        <motion.div
          className="relative max-w-2xl mx-auto mb-4"
          animate={searchFocused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow doré derrière */}
          <AnimatePresence>
            {searchFocused && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: '0 0 0 1px rgba(212,175,55,0.5), 0 0 20px rgba(212,175,55,0.12)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Rechercher un style, un tissu, un tailleur..."
            className={cn(
              'w-full rounded-2xl py-3 pl-12 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all duration-200',
              searchFocused
                ? 'bg-[#1E1E1E] border border-[#D4AF37]/50'
                : 'bg-[#1A1A1A]/80 border border-white/10 hover:border-white/20'
            )}
          />
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            animate={{ color: searchFocused || query ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}
            transition={{ duration: 0.2 }}
          >
            <Search size={18} />
          </motion.div>
          <AnimatePresence>
            {query && (
              <motion.button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
              >
                <X size={12} className="text-white/60" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Filtres tissu */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-2xl mx-auto">
          {FABRIC_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFabricFilter(f)}
              className={cn(
                'whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] border transition-all shrink-0',
                fabricFilter === f
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-[#D4AF37]/40 hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Toggle source */}
        <div className="flex justify-center mt-3">
          <div className="flex bg-white/5 border border-white/10 rounded-full p-0.5 gap-0.5">
            {(['all', 'tailor', 'client'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-[11px] font-medium transition-all',
                  sourceFilter === s
                    ? 'bg-[#D4AF37] text-black'
                    : 'text-white/50 hover:text-white'
                )}
              >
                {s === 'all' ? 'Tout' : s === 'tailor' ? 'Tailleurs' : 'Clients'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── REELS BAR ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {mockReels.map((reel, i) => {
            const isSeen = seenReels.has(reel.id) || reel.isSeen
            return (
              <button
                key={reel.id}
                onClick={() => openReel(i)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                {/* Anneau gradient */}
                <div className={cn(
                  'w-16 h-16 rounded-full p-[2.5px]',
                  isSeen
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br from-[#D4AF37] via-[#F0D060] to-[#A08020]'
                )}>
                  <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-[#0A0A0A]">
                    <Image src={reel.user.avatar} alt={reel.user.name} fill className="object-cover" />
                  </div>
                </div>
                <span className={cn('text-[9px] max-w-[64px] text-center truncate', isSeen ? 'text-white/40' : 'text-white/80')}>
                  {reel.user.name}
                </span>
                <span className={cn(
                  'text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full',
                  reel.user.isVerified
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    : 'bg-white/10 text-white/40'
                )}>
                  {reel.user.role}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Séparateur */}
      <div className="mx-4 mt-3 mb-4 border-t border-white/5" />

      {/* ── MASONRY GRID ─────────────────────────────────────────────── */}
      <main className="px-3 max-w-5xl mx-auto">

        {/* Compteur */}
        <p className="text-white/30 text-xs mb-3 px-1">
          {displayedPosts.length} création{displayedPosts.length > 1 ? 's' : ''}
          {fabricFilter !== 'Tout' ? ` — ${fabricFilter}` : ''}
          {sourceFilter === 'tailor' ? ' — Tailleurs' : sourceFilter === 'client' ? ' — Clients' : ''}
        </p>

        {displayedPosts.length > 0 ? (
          <div className="columns-2 md:columns-3 gap-3">
            {displayedPosts.map((item, i) => (
              <MasonryCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm font-serif">Aucune création trouvée</p>
            <p className="text-white/20 text-xs mt-1">Essayez "Boubou", "Wax" ou "Mariage"</p>
          </div>
        )}
      </main>

      {/* ── REEL MODAL ───────────────────────────────────────────────── */}
      {reelIndex !== null && (
        <ReelModal
          reels={mockReels}
          initialIndex={reelIndex}
          onClose={() => setReelIndex(null)}
        />
      )}
    </div>
  )
}
