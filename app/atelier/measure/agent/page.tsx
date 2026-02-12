'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    User,
    Bot,
    Ruler,
    Camera,
    Edit3,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/utils'

// Mock AI Logic
const INITIAL_MESSAGE = "Bonjour ! Je suis le Maître Tailleur Signare. 🧵\n\nSouhaitez-vous mettre à jour vos mensurations aujourd'hui ? Je peux vous guider."

const STEPS = [
    {
        id: 'init',
        text: INITIAL_MESSAGE,
        options: [
            { label: 'Oui, mettre à jour', action: 'update' },
            { label: 'Non, juste vérifier', action: 'check' }
        ]
    },
    {
        id: 'update_method',
        text: "Excellent. Pour garantir une précision parfaite, quelle méthode préférez-vous ?",
        options: [
            { label: '📸 Scan IA (Recommandé)', action: 'scan' },
            { label: '✏️ Saisie Manuelle', action: 'manual' }
        ]
    },
    {
        id: 'scan_redirect',
        text: "Parfait ! Je vous redirige vers notre cabine de scan virtuelle. Assurez-vous d'être dans un endroit bien éclairé.",
        action: 'redirect_scan'
    },
    {
        id: 'manual_redirect',
        text: "Très bien. Je vous ouvre le formulaire de saisie détaillée.",
        action: 'redirect_manual'
    }
]

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    options?: { label: string, action: string }[]
}

export default function MeasurementAgentPage() {
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement>(null)

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: STEPS[0].text,
            options: STEPS[0].options
        }
    ])
    const [isTyping, setIsTyping] = useState(false)

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleOptionClick = (option: { label: string, action: string }) => {
        // 1. User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: option.label
        }
        setMessages(prev => [...prev, userMsg])
        setIsTyping(true)

        // 2. AI Response Logic
        setTimeout(() => {
            let nextStep
            if (option.action === 'update') nextStep = STEPS[1]
            else if (option.action === 'check') {
                router.push('/profile') // Retour profil simple
                return
            }
            else if (option.action === 'scan') nextStep = STEPS[2]
            else if (option.action === 'manual') nextStep = STEPS[3]

            if (nextStep) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: nextStep.text,
                    options: nextStep.options
                }
                setMessages(prev => [...prev, aiMsg])
                setIsTyping(false)

                if (nextStep.action === 'redirect_scan') {
                    setTimeout(() => router.push('/atelier/measure'), 2000)
                } else if (nextStep.action === 'redirect_manual') {
                    setTimeout(() => router.push('/atelier/mesures'), 2000)
                }
            }
        }, 1000)
    }

    return (
        <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">

            {/* Header */}
            <header className="flex-shrink-0 h-16 border-b border-[#D4AF37]/20 flex items-center px-4 bg-[#0A0A0A]/90 backdrop-blur-xl z-20">
                <button onClick={() => router.back()} className="mr-4 text-white/60 hover:text-[#D4AF37]">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
                        <Ruler className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h1 className="font-serif font-bold text-[#D4AF37]">Maître Tailleur</h1>
                        <span className="text-[10px] text-green-500 uppercase tracking-widest font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En ligne
                        </span>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" ref={scrollRef}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex flex-col max-w-[85%]",
                            msg.role === 'user' ? "ml-auto items-end" : "items-start"
                        )}
                    >
                        <div className={cn(
                            "flex gap-3",
                            msg.role === 'user' ? "flex-row-reverse" : ""
                        )}>
                            {/* Avatar */}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]",
                                msg.role === 'user' ? "bg-white/10" : "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                            )}>
                                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>

                            {/* Bubble */}
                            <div className={cn(
                                "p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-lg",
                                msg.role === 'user'
                                    ? "bg-white text-black font-medium rounded-tr-none"
                                    : "bg-[#1A1A1A] border border-white/10 text-white/90 rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>

                        {/* Options (Chips) */}
                        {msg.options && (
                            <div className="mt-3 ml-11 flex flex-wrap gap-2">
                                {msg.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(option)}
                                        className="px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-full text-xs text-[#D4AF37] hover:text-black font-bold uppercase tracking-wider transition-all"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/30">
                            <Bot size={14} className="text-[#D4AF37]" />
                        </div>
                        <div className="bg-[#1A1A1A] border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" />
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
