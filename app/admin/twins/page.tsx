'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
    ChevronLeft,
    Check,
    X,
    ExternalLink,
    Instagram,
    Image as ImageIcon,
    Sparkles,
    AlertCircle,
} from 'lucide-react'

// Mock pending twins
const MOCK_PENDING_TWINS = [
    {
        id: 'tw-1',
        source_url: 'https://instagram.com/p/mock1',
        source_platform: 'instagram',
        image_url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600',
        detected_tags: {
            colors: ['bleu marine', 'or'],
            style: 'cérémonie',
            garment_type: 'grand_boubou',
            confidence: 0.92,
        },
        ai_description: 'Grand boubou bleu marine avec broderie dorée, parfait pour les cérémonies.',
        priority_score: 0.92,
        created_at: '2026-02-07T10:00:00Z',
    },
    {
        id: 'tw-2',
        source_url: 'https://pinterest.com/pin/mock2',
        source_platform: 'pinterest',
        image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
        detected_tags: {
            colors: ['wax multicolore', 'jaune'],
            style: 'moderne',
            garment_type: 'robe',
            confidence: 0.88,
        },
        ai_description: 'Robe moderne en wax coloré, coupe contemporaine et élégante.',
        priority_score: 0.88,
        created_at: '2026-02-07T09:30:00Z',
    },
    {
        id: 'tw-3',
        source_url: 'https://instagram.com/p/mock3',
        source_platform: 'instagram',
        image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
        detected_tags: {
            colors: ['blanc', 'argent'],
            style: 'cérémonie',
            garment_type: 'kaftan',
            confidence: 0.95,
        },
        ai_description: 'Kaftan blanc immaculé avec broderies argentées, idéal pour mariages.',
        priority_score: 0.95,
        created_at: '2026-02-07T08:00:00Z',
    },
]

export default function TwinsValidationPage() {
    const [twins, setTwins] = useState(MOCK_PENDING_TWINS)
    const [selectedTwin, setSelectedTwin] = useState<typeof MOCK_PENDING_TWINS[0] | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)

    const handleApprove = (twinId: string) => {
        // TODO: Call API to approve
        setTwins(prev => prev.filter(t => t.id !== twinId))
        setSelectedTwin(null)
    }

    const handleReject = (twinId: string) => {
        // TODO: Call API to reject with reason
        setTwins(prev => prev.filter(t => t.id !== twinId))
        setShowRejectModal(false)
        setRejectReason('')
        setSelectedTwin(null)
    }

    const PlatformIcon = ({ platform }: { platform: string }) => {
        if (platform === 'instagram') return <Instagram className="w-4 h-4" />
        return <ImageIcon className="w-4 h-4" />
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
                        <div>
                            <h1 className="text-xl font-bold">Validation des Twins</h1>
                            <p className="text-xs text-white/50">{twins.length} suggestions en attente</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {twins.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Tout est validé !</h2>
                        <p className="text-white/50">Aucune suggestion en attente de validation.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {twins.map((twin, idx) => (
                            <motion.div
                                key={twin.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group"
                            >
                                {/* Image */}
                                <div className="relative aspect-square">
                                    <Image
                                        src={twin.image_url}
                                        alt={twin.ai_description}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${twin.source_platform === 'instagram'
                                                ? 'bg-pink-500/80 text-white'
                                                : 'bg-red-500/80 text-white'
                                            }`}>
                                            <PlatformIcon platform={twin.source_platform} />
                                            {twin.source_platform}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className="px-2 py-1 bg-black/60 rounded-full text-xs font-bold text-[#D4AF37]">
                                            {(twin.priority_score * 100).toFixed(0)}% confiance
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <p className="text-sm text-white/80 mb-3 line-clamp-2">
                                        {twin.ai_description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-xs">
                                            {twin.detected_tags.garment_type}
                                        </span>
                                        <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs">
                                            {twin.detected_tags.style}
                                        </span>
                                        {twin.detected_tags.colors.slice(0, 2).map(color => (
                                            <span key={color} className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs">
                                                {color}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(twin.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                            Approuver
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedTwin(twin)
                                                setShowRejectModal(true)
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Rejeter
                                        </button>
                                    </div>

                                    {/* Source Link */}
                                    <a
                                        href={twin.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 flex items-center justify-center gap-2 text-xs text-white/40 hover:text-[#D4AF37] transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Voir la source
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && selectedTwin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                        onClick={() => setShowRejectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold">Rejeter cette suggestion ?</h3>
                            </div>

                            <p className="text-white/60 mb-4">
                                Indiquez la raison du rejet (optionnel) :
                            </p>

                            <textarea
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                placeholder="Ex: Image de mauvaise qualité, pas assez africain, doublon..."
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#D4AF37]/50"
                                rows={3}
                            />

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleReject(selectedTwin.id)}
                                    className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Confirmer le rejet
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
