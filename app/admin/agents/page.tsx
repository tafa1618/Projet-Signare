'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Bot,
    Activity,
    TrendingUp,
    Brain,
    Users,
    Coins,
    AlertTriangle,
    CheckCircle2,
    Clock,
    RefreshCcw,
    ChevronRight,
    ChevronLeft,
    Zap,
    Eye,
    BarChart3,
    Power,
    Pause,
    Play,
    Settings,
} from 'lucide-react'

// Mock data for demo
const MOCK_STATS = {
    orchestrator: { isRunning: true, lastAction: '2 min ago' },
    personas: {
        active: 3,
        totalActions: 247,
        todayActions: 12,
        list: [
            { id: '1', name: 'Fatou Diallo', type: 'elegant', actions: 89, lastAction: '2 min ago', isActive: true },
            { id: '2', name: 'Aïssatou Ndiaye', type: 'trendy', actions: 102, lastAction: '8h ago', isActive: true },
            { id: '3', name: 'Moussa Sow', type: 'classic', actions: 56, lastAction: '1j ago', isActive: true },
        ],
    },
    trendHunter: {
        lastScan: '6h ago',
        pendingTwins: 8,
        approvedToday: 3,
    },
    growthBrain: {
        totalInsights: 42,
        actionable: 7,
        lastReport: '3 jours ago',
    },
    budget: {
        used: 234500,
        limit: 1000000,
        percentUsed: 23.45,
    },
}

type Tab = 'overview' | 'personas' | 'hunter' | 'growth' | 'logs'

export default function AgentsDashboardPage() {
    const [stats, setStats] = useState(MOCK_STATS)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('overview')

    const refreshStats = async () => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
    }

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
        { id: 'personas', label: 'Personas', icon: Users },
        { id: 'hunter', label: 'Trend Hunter', icon: TrendingUp },
        { id: 'growth', label: 'Growth Brain', icon: Brain },
        { id: 'logs', label: 'Logs', icon: Activity },
    ]

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-white/60 hover:text-[#D4AF37] transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center">
                                <Bot className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Agent Command Center</h1>
                                <p className="text-xs text-white/50">Gestion des Agents IA</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${stats.orchestrator.isRunning
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${stats.orchestrator.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {stats.orchestrator.isRunning ? 'SYSTÈME ACTIF' : 'SYSTÈME ARRÊTÉ'}
                        </div>
                        <button
                            onClick={refreshStats}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-[#D4AF37] border-[#D4AF37]'
                                    : 'text-white/60 border-transparent hover:text-white/80'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Budget Alert */}
                        {stats.budget.percentUsed > 80 && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <span className="text-red-200">
                                    Budget LLM à {stats.budget.percentUsed.toFixed(1)}% - Attention au dépassement !
                                </span>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <span className="text-[#D4AF37] font-bold">{stats.personas.todayActions} aujourd'hui</span>
                                </div>
                                <h3 className="text-2xl font-bold">{stats.personas.active} Personas</h3>
                                <p className="text-white/50 text-sm">{stats.personas.totalActions} actions totales</p>
                            </div>

                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-amber-400 font-bold">{stats.trendHunter.pendingTwins} à valider</span>
                                </div>
                                <h3 className="text-2xl font-bold">Trend Hunter</h3>
                                <p className="text-white/50 text-sm">Dernier scan: {stats.trendHunter.lastScan}</p>
                            </div>

                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                                        <Brain className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <span className="text-emerald-400 font-bold">{stats.growthBrain.actionable} actionnables</span>
                                </div>
                                <h3 className="text-2xl font-bold">{stats.growthBrain.totalInsights} Insights</h3>
                                <p className="text-white/50 text-sm">Dernier rapport: {stats.growthBrain.lastReport}</p>
                            </div>

                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Coins className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold">{stats.budget.percentUsed.toFixed(0)}%</h3>
                                <p className="text-white/50 text-sm">Budget LLM utilisé</p>
                                <div className="mt-2 w-full h-2 bg-white/10 rounded-full">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#D4AF37]"
                                        style={{ width: `${stats.budget.percentUsed}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/admin/twins">
                                <div className="p-5 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-purple-200">Valider les Twins</h3>
                                            <p className="text-sm text-white/50 mt-1">
                                                {stats.trendHunter.pendingTwins} suggestions en attente de validation
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>

                            <Link href="/admin/growth">
                                <div className="p-5 bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-2xl cursor-pointer hover:border-[#D4AF37]/40 transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-[#D4AF37]">Voir les Insights</h3>
                                            <p className="text-sm text-white/50 mt-1">
                                                {stats.growthBrain.actionable} recommandations actionnables
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Personas Tab */}
                {activeTab === 'personas' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Agents Persona</h2>
                            <span className="text-white/50 text-sm">Durée de vie: 90 jours</span>
                        </div>

                        <div className="grid gap-4">
                            {stats.personas.list.map((persona, idx) => (
                                <motion.div
                                    key={persona.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-5 bg-white/5 border border-white/10 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-black font-bold">
                                                {persona.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{persona.name}</h3>
                                                <p className="text-sm text-white/50">
                                                    Type: <span className="text-[#D4AF37]">{persona.type}</span> • {persona.actions} actions
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-white/30 text-sm">{persona.lastAction}</span>
                                            <button className={`p-2 rounded-lg transition-colors ${persona.isActive
                                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                }`}>
                                                {persona.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Hunter Tab */}
                {activeTab === 'hunter' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Trend Hunter</h2>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#B8860B] transition-colors">
                                <TrendingUp className="w-4 h-4" />
                                Lancer un Scan
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-white/50 text-sm mb-1">Dernier Scan</p>
                                <p className="text-2xl font-bold">{stats.trendHunter.lastScan}</p>
                            </div>
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-white/50 text-sm mb-1">En Attente</p>
                                <p className="text-2xl font-bold text-amber-400">{stats.trendHunter.pendingTwins}</p>
                            </div>
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-white/50 text-sm mb-1">Approuvés Aujourd'hui</p>
                                <p className="text-2xl font-bold text-emerald-400">{stats.trendHunter.approvedToday}</p>
                            </div>
                        </div>

                        <Link href="/admin/twins">
                            <button className="w-full p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-200 font-medium hover:bg-purple-500/20 transition-colors">
                                Voir les {stats.trendHunter.pendingTwins} suggestions en attente →
                            </button>
                        </Link>
                    </motion.div>
                )}

                {/* Growth Tab */}
                {activeTab === 'growth' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Growth Brain</h2>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#B8860B] transition-colors">
                                <Brain className="w-4 h-4" />
                                Générer Rapport
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-white/50 text-sm mb-1">Total Insights</p>
                                <p className="text-2xl font-bold">{stats.growthBrain.totalInsights}</p>
                            </div>
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-white/50 text-sm mb-1">Actionnables</p>
                                <p className="text-2xl font-bold text-[#D4AF37]">{stats.growthBrain.actionable}</p>
                            </div>
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-white/50 text-sm mb-1">Dernier Rapport</p>
                                <p className="text-2xl font-bold">{stats.growthBrain.lastReport}</p>
                            </div>
                        </div>

                        <Link href="/admin/growth">
                            <button className="w-full p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl text-[#D4AF37] font-medium hover:bg-[#D4AF37]/20 transition-colors">
                                Voir tous les Insights →
                            </button>
                        </Link>
                    </motion.div>
                )}

                {/* Logs Tab */}
                {activeTab === 'logs' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <h2 className="text-lg font-bold">Activité Récente</h2>

                        <div className="space-y-2">
                            {[
                                { agent: 'persona:fatou', action: 'like', target: 'post #123', time: '2 min', success: true },
                                { agent: 'trend_hunter', action: 'scan', target: 'Instagram', time: '6h', success: true },
                                { agent: 'persona:aissatou', action: 'comment', target: 'post #119', time: '8h', success: true },
                                { agent: 'growth_brain', action: 'report', target: 'weekly', time: '3j', success: true },
                                { agent: 'orchestrator', action: 'schedule', target: '15 tasks', time: '3j', success: true },
                            ].map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl font-mono text-sm"
                                >
                                    <span className={`w-2 h-2 rounded-full ${log.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    <span className="text-blue-400">[{log.agent}]</span>
                                    <span className="text-white/70">{log.action}</span>
                                    <span className="text-[#D4AF37]">{log.target}</span>
                                    <span className="ml-auto text-white/30">{log.time}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
