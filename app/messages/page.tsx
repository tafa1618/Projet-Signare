'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Sparkles,
  User,
  Bot,
  ChevronLeft,
  MoreVertical,
  Paperclip,
  Smile,
  Phone,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/utils'

// Mock AI Responses
const AI_RESPONSES: Record<string, string> = {
  default: "Je suis l'Assistant Signare. Je peux vous aider à suivre une commande, choisir un tissu ou prendre vos mesures.",
  "hello": "Bonjour ! Ravi de vous revoir. Comment puis-je sublimer votre style aujourd'hui ?",
  "bonjour": "Bonjour ! Ravi de vous revoir. Comment puis-je sublimer votre style aujourd'hui ?",
  "commande": "Vous avez 1 commande en cours : 'Boubous Tabaski Luxe'. Elle est actuellement à l'étape de broderie. Livraison estimée : Mardi.",
  "mesure": "Pour prendre vos mesures, nous pouvons utiliser notre assistant virtuel. Voulez-vous lancer une session ?",
  "humain": "Je comprends. Je vais transférer cette conversation à notre responsable clientèle. Un instant..."
}

type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  status?: 'sending' | 'sent' | 'read'
}

export default function ConciergePage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Bonjour ! Je suis Sig, votre Concierge personnel Signare. ⚜️\n\nJe suis là pour garantir que votre expérience sur-mesure soit parfaite. Je gère la liaison avec tous nos ateliers partenaires.\n\nComment puis-je vous aider aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    }
  ])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI Latency
    setTimeout(() => {
      const lowerInput = userMsg.content.toLowerCase()
      let responseText = AI_RESPONSES.default

      if (lowerInput.includes('bonjour') || lowerInput.includes('salut')) responseText = AI_RESPONSES['hello']
      else if (lowerInput.includes('commande') || lowerInput.includes('suivi')) responseText = AI_RESPONSES['commande']
      else if (lowerInput.includes('mesure')) responseText = AI_RESPONSES['mesure']
      else if (lowerInput.includes('humain') || lowerInput.includes('prob')) responseText = AI_RESPONSES['humain']

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      }

      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden relative">

      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b border-[#D4AF37]/20 flex items-center justify-between px-4 bg-[#0A0A0A]/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-[#D4AF37] p-0.5 bg-black">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C7321] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-[#D4AF37] leading-tight">Concierge Signare</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse" />
              IA Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white/60 hover:text-[#D4AF37] transition-colors"><Phone size={20} /></button>
          <button className="text-white/60 hover:text-[#D4AF37] transition-colors"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" ref={scrollRef}>

        <div className="text-center py-6">
          <span className="text-[10px] text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
            Aujourd'hui
          </span>
        </div>

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
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
              <div className={cn(
                "text-[9px] mt-1.5 flex items-center gap-1 opacity-50",
                msg.role === 'user' ? "text-black justify-end" : "text-white"
              )}>
                {msg.timestamp}
                {msg.role === 'user' && msg.status === 'read' && <CheckCircle2 size={10} />}
              </div>
            </div>
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

      {/* Quick Actions (Chips) */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {['📦 Suivre ma commande', '📏 Prendre mes mesures', '🧵 Parler à un humain'].map((action, i) => (
          <button
            key={i}
            onClick={() => setInput(action)}
            className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/30 rounded-lg text-xs text-white/70 hover:text-[#D4AF37] transition-all whitespace-nowrap"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <footer className="p-4 bg-[#0A0A0A] border-t border-[#D4AF37]/10 z-20">
        <div className="flex items-end gap-3 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 focus-within:border-[#D4AF37]/50 transition-colors">
          <button className="p-2 text-white/40 hover:text-[#D4AF37] transition-colors rounded-xl hover:bg-white/5">
            <Paperclip size={20} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Écrivez à votre concierge..."
            className="flex-1 bg-transparent border-none text-white placeholder-white/30 resize-none max-h-32 py-2 focus:ring-0 text-sm custom-scrollbar"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-[#D4AF37] text-black rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  )
}
