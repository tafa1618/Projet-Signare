'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Sparkles, TrendingUp, Filter, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { mockPosts } from '@/lib/mocks'

// --- TYPES & UTILS ---

interface SearchResult {
    item: typeof mockPosts[0]
    score: number
    matches: string[]
}

// Algorithme de recherche "Fuzzy" orienté Fashion Africa
// Inspiré de la logique Python (backend) mais adapté au client
function performDeepSearch(query: string, items: typeof mockPosts): SearchResult[] {
    if (!query.trim()) return items.map(item => ({ item, score: 1, matches: [] }))

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0)

    // Poids des attributs
    const WEIGHTS = {
        exact_caption: 10,
        exact_garment: 8,
        exact_fabric: 8,
        exact_tailor: 5,
        partial_caption: 2,
        partial_tailor: 3,
        tag_match: 6
    }

    return items.map(item => {
        let score = 0
        const matches: string[] = []

        // Normalisation des champs
        const caption = item.caption?.toLowerCase() || ''
        const garment = item.garment_type?.toLowerCase() || ''
        const fabric = item.fabric_type?.toLowerCase() || ''
        const tailorName = item.user.name.toLowerCase()
        const specialty = item.user.specialty?.toLowerCase() || ''

        terms.forEach(term => {
            // 1. Recherche dans le Caption
            if (caption.includes(term)) {
                score += WEIGHTS.partial_caption
                const index = caption.indexOf(term)
                matches.push(item.caption!.substring(Math.max(0, index - 10), Math.min(caption.length, index + term.length + 10)))
            }

            // 2. Garment Type (Boubou, Kaftan...) - Boost important
            if (garment.includes(term)) score += WEIGHTS.exact_garment

            // 3. Fabric Type (Bazin, Wax, Soie...) - Boost important
            if (fabric.includes(term)) score += WEIGHTS.exact_fabric

            // 4. Tailleur
            if (tailorName.includes(term)) score += WEIGHTS.exact_tailor
            if (specialty.includes(term)) score += WEIGHTS.partial_tailor
        })

        // Boost Récence & Qualité (Simulé)
        if (item.quality_rating === 5) score += 2

        return { item, score, matches }
    })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
}

const TRENDING_TAGS = [
    "Bazin Riche", "Tabaski 2024", "Wax Moderne", "Mariage",
    "Kaftan Soie", "Broderie", "Boubou Homme", "Signare"
]

export default function ExplorePage() {
    const [query, setQuery] = useState('')
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)

    // Combined Search Logic
    const results = useMemo(() => {
        let effectiveQuery = query
        if (activeTag && !query) effectiveQuery = activeTag

        // Si une tag est active ET une query, on combine ? 
        // Pour l'instant on priorise la query explicite, ou le tag si pas de query

        return performDeepSearch(effectiveQuery, mockPosts)
    }, [query, activeTag])

    return (
        <div className="bg-[#0A0A0A] min-h-screen text-white pb-20 w-full max-w-[100vw] overflow-x-hidden">
            {/* HEADER RECHERCHE */}
            <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10 px-4 pt-6 pb-6 w-full">
                <h1 className="text-2xl font-serif font-bold text-[#D4AF37] mb-6 tracking-wider text-center drop-shadow-md">EXPLORER</h1>

                <div className="relative max-w-2xl mx-auto">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setIsSearching(true)
                            }}
                            placeholder="Rechercher un style, un tailleur, un tissu..."
                            className="relative w-full bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 rounded-2xl py-4 pl-14 pr-12 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all duration-300 shadow-xl group-focus-within:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#D4AF37] transition-colors duration-300" size={22} />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* TRENDING TAGS */}
                <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar max-w-2xl mx-auto pb-2 px-2 mask-linear">
                    <div className="flex items-center gap-1.5 text-[#D4AF37] pr-2 shrink-0">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Tendances</span>
                    </div>
                    {TRENDING_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => {
                                setActiveTag(activeTag === tag ? null : tag)
                                setQuery('') // Reset typed query to focus on tag
                            }}
                            className={cn(
                                "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] border transition-all",
                                activeTag === tag
                                    ? "bg-[#D4AF37] text-black border-[#D4AF37] font-bold"
                                    : "bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/50 hover:text-white"
                            )}
                        >
                            #{tag.replace(/\s+/g, '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* RESULTS GRID */}
            <main className="px-4 py-6 max-w-5xl mx-auto space-y-8">

                {/* Résumé des résultats */}
                <div className="flex items-end justify-between px-2">
                    <h2 className="text-sm font-medium text-white/50">
                        {results.length} Résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                    </h2>
                    <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg transition-colors">
                        <Filter size={12} />
                        Filtres Avancés
                    </button>
                </div>

                {/* Masonry-like Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {results.map(({ item, score }, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-[#1A1A1A] cursor-pointer"
                            >
                                <Image
                                    src={item.image}
                                    alt={item.caption}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-1 mb-1.5">
                                        {item.garment_type && (
                                            <span className="bg-[#D4AF37]/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                                                {item.garment_type}
                                            </span>
                                        )}
                                        {item.fabric_type && (
                                            <span className="bg-white/20 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded-sm">
                                                {item.fabric_type}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-white text-xs line-clamp-2 font-medium leading-snug mb-1">
                                        {item.caption}
                                    </p>

                                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <div className="w-5 h-5 rounded-full overflow-hidden relative border border-white/30">
                                            <Image src={item.user.avatar} alt={item.user.name} fill className="object-cover" />
                                        </div>
                                        <span className="text-[10px] text-white/80 truncate">{item.user.name}</span>
                                    </div>
                                </div>

                                {/* Special "Match" Badge for search results */}
                                {(query || activeTag) && score > 5 && (
                                    <div className="absolute top-2 right-2 bg-[#D4AF37] text-black text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg transform scale-90">
                                        <Sparkles size={10} />
                                        TOP MATCH
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {results.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-white/20" />
                        </div>
                        <h3 className="text-lg font-serif text-white/40">Aucun résultat trouvé</h3>
                        <p className="text-sm text-white/20 mt-2">Essayez des termes comme "Boubou", "Soie" ou "Mariage"</p>
                    </div>
                )}
            </main>
        </div>
    )
}
