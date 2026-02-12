'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ChevronLeft,
    Brain,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Lightbulb,
    BarChart3,
    Target,
    Users,
    DollarSign,
    FileText,
} from 'lucide-react'

// Mock insights data
const MOCK_INSIGHTS = [
    {
        id: 'ins-1',
        content: 'Les boubous bleu marine sont +40% plus populaires cette semaine. Suggérer aux tailleurs de prioriser cette couleur.',
        memory_type: 'trend',
        category: 'content',
        confidence_score: 0.89,
        is_actionable: true,
        created_at: '2026-02-07T08:00:00Z',
    },
    {
        id: 'ins-2',
        content: 'Le client moyen visite 4.2 profils de tailleurs avant de passer commande. Améliorer le système de comparaison pourrait augmenter les conversions.',
        memory_type: 'observation',
        category: 'user_behavior',
        confidence_score: 0.76,
        is_actionable: true,
        created_at: '2026-02-06T14:00:00Z',
    },
    {
        id: 'ins-3',
        content: 'Les prix des kaftans à Dakar varient de 25K à 150K FCFA. Signare se positionne dans le segment premium (80K+).',
        memory_type: 'insight',
        category: 'pricing',
        confidence_score: 0.92,
        is_actionable: false,
        created_at: '2026-02-05T10:00:00Z',
    },
    {
        id: 'ins-4',
        content: 'Le contenu "behind the scenes" (atelier, confection) génère 2.3x plus d\'engagement que les photos de produits finis.',
        memory_type: 'recommendation',
        category: 'content',
        confidence_score: 0.84,
        is_actionable: true,
        created_at: '2026-02-04T16:00:00Z',
    },
    {
        id: 'ins-5',
        content: 'Les tailleurs qui répondent en moins de 2h ont un taux de conversion 3x supérieur.',
        memory_type: 'insight',
        category: 'user_behavior',
        confidence_score: 0.91,
        is_actionable: true,
        created_at: '2026-02-03T09:00:00Z',
    },
]

const categoryIcons: Record<string, typeof Brain> = {
    content: FileText,
    user_behavior: Users,
    pricing: DollarSign,
    market: TrendingUp,
}

const typeColors: Record<string, string> = {
    trend: 'bg-purple-500/20 text-purple-400',
    observation: 'bg-blue-500/20 text-blue-400',
    insight: 'bg-[#D4AF37]/20 text-[#D4AF37]',
    recommendation: 'bg-emerald-500/20 text-emerald-400',
}

export default function GrowthInsightsPage() {
    const [insights, setInsights] = useState(MOCK_INSIGHTS)
    const [filter, setFilter] = useState<'all' | 'actionable'>('all')

    const filteredInsights = filter === 'actionable'
        ? insights.filter(i => i.is_actionable)
        : insights

    const handleMarkActioned = (insightId: string) => {
        setInsights(prev => prev.map(i =>
            i.id === insightId ? { ...i, is_actionable: false } : i
        ))
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/agents" className="text-white/60 hover:text-[#D4AF37] transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center">
                                <Brain className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Growth Brain Insights</h1>
                                <p className="text-xs text-white/50">{insights.length} insights en mémoire</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-white/50 text-xs mb-1">Total Insights</p>
                        <p className="text-2xl font-bold">{insights.length}</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-white/50 text-xs mb-1">Actionnables</p>
                        <p className="text-2xl font-bold text-[#D4AF37]">
                            {insights.filter(i => i.is_actionable).length}
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-white/50 text-xs mb-1">Confiance Moy.</p>
                        <p className="text-2xl font-bold">
                            {(insights.reduce((acc, i) => acc + i.confidence_score, 0) / insights.length * 100).toFixed(0)}%
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-white/50 text-xs mb-1">Cette Semaine</p>
                        <p className="text-2xl font-bold text-emerald-400">+{insights.length}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-[#D4AF37] text-black'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        Tous les insights
                    </button>
                    <button
                        onClick={() => setFilter('actionable')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'actionable'
                                ? 'bg-[#D4AF37] text-black'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        <Target className="w-4 h-4" />
                        Actionnables uniquement
                    </button>
                </div>

                {/* Insights List */}
                <div className="space-y-4">
                    {filteredInsights.map((insight, idx) => {
                        const CategoryIcon = categoryIcons[insight.category] || Lightbulb

                        return (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-5 bg-white/5 border border-white/10 rounded-2xl"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                                        <CategoryIcon className="w-5 h-5 text-[#D4AF37]" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${typeColors[insight.memory_type]}`}>
                                                {insight.memory_type}
                                            </span>
                                            <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/50">
                                                {insight.category}
                                            </span>
                                            <span className="text-xs text-white/30 ml-auto">
                                                {(insight.confidence_score * 100).toFixed(0)}% confiance
                                            </span>
                                        </div>

                                        <p className="text-white/90 leading-relaxed">
                                            {insight.content}
                                        </p>

                                        {insight.is_actionable && (
                                            <button
                                                onClick={() => handleMarkActioned(insight.id)}
                                                className="mt-3 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Marquer comme traité
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {filteredInsights.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Tout est à jour !</h3>
                        <p className="text-white/50">Aucun insight actionnable en attente.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
