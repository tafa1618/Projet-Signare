'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Send, 
  Image as ImageIcon, 
  Ruler, 
  FileText, 
  ChevronLeft,
  Scissors,
  CheckCheck,
  Sparkles,
  MessageCircle,
  Camera
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/**
 * PAGE - Messagerie SIGNARE
 * @ai-context Interface de communication riche pour collecter des données de satisfaction (Sentiment Analysis)
 * et mesurer la réactivité des tailleurs pour l'algorithme de recommandation.
 */

// --- TYPES ---
interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  type: 'text' | 'post_share' | 'measurements'
  status: 'sent' | 'delivered' | 'read'
  postData?: {
    image: string
    title: string
    price: string
  }
}

interface Conversation {
  id: string
  user: {
    name: string
    avatar: string
    role: 'client' | 'tailleur'
    status: 'online' | 'atelier' | 'offline'
  }
  lastMessage: string
  unreadCount: number
  updatedAt: string
  messages: Message[]
}

// --- MOCK DATA ---
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    user: {
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
      role: 'tailleur',
      status: 'atelier'
    },
    lastMessage: 'Votre boubou sera prêt pour l\'essayage demain.',
    unreadCount: 2,
    updatedAt: '10:30',
    messages: [
      { id: 'm1', senderId: 'user-123', text: 'Bonjour Fatou, où en est ma commande ?', timestamp: '09:00', type: 'text', status: 'read' },
      { id: 'm2', senderId: 'conv-1', text: 'Bonjour ! J\'ai presque terminé les broderies.', timestamp: '09:15', type: 'text', status: 'read' },
      { id: 'm3', senderId: 'conv-1', text: 'Votre boubou sera prêt pour l\'essayage demain.', timestamp: '10:30', type: 'text', status: 'read' },
    ]
  },
  {
    id: 'conv-2',
    user: {
      name: 'Moussa Sy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa',
      role: 'client',
      status: 'online'
    },
    lastMessage: 'J\'aime beaucoup ce modèle en basin.',
    unreadCount: 0,
    updatedAt: 'Hier',
    messages: [
      { 
        id: 'm4', 
        senderId: 'conv-2', 
        text: 'J\'aime beaucoup ce modèle en basin.', 
        timestamp: 'Hier', 
        type: 'post_share', 
        status: 'read',
        postData: {
          image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&fit=crop',
          title: 'Boubou Royale Or',
          price: '125 000 FCFA'
        }
      },
    ]
  }
]

export default function MessagesPage() {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [inputText, setInputText] = useState('')
  const currentUserId = 'user-123'

  return (
    <div className="flex h-[100dvh] bg-[#0A0A0A] overflow-hidden text-white pb-20 md:pb-0">
      {/* 1. LISTE DES CONVERSATIONS */}
      <aside className={cn(
        "w-full md:w-[380px] border-r border-[#D4AF37]/10 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#0A0A0A]",
        selectedConv ? "fixed inset-0 z-30 md:relative translate-x-[-100%] md:translate-x-0" : "flex translate-x-0"
      )}>
        <header className="p-6 pt-8 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif text-[#D4AF37] tracking-[0.1em] uppercase italic">Messages</h1>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="bg-[#D4AF37]/10 p-2.5 rounded-full text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
            >
              <Plus size={20} />
            </motion.button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 group-focus-within:text-[#D4AF37] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="RECHERCHER UN ARTISAN..." 
              className="w-full bg-transparent border-b border-[#D4AF37]/20 py-3 pl-8 pr-4 text-[10px] font-black tracking-[0.2em] uppercase outline-none focus:border-[#D4AF37] transition-all placeholder:text-white/20"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-32 px-3 space-y-1">
          {MOCK_CONVERSATIONS.map((conv, idx) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedConv(conv)}
              className={cn(
                "flex items-center gap-4 px-4 py-5 cursor-pointer rounded-2xl transition-all duration-300",
                selectedConv?.id === conv.id 
                  ? "bg-[#D4AF37]/10 border border-[#D4AF37]/20" 
                  : "hover:bg-white/[0.02] border border-transparent active:bg-white/[0.05]"
              )}
            >
              {/* Avatar avec cercle d'activité */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#D4AF37]/20 p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Image src={conv.user.avatar} alt={conv.user.name} fill className="object-cover" />
                  </div>
                </div>
                {conv.user.status === 'atelier' && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#D4AF37] rounded-full p-1.5 border-2 border-[#0A0A0A] shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                    <Scissors size={10} className="text-[#0A0A0A]" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-serif font-bold text-sm tracking-wide text-white/90 truncate">{conv.user.name}</h3>
                  <span className="text-[9px] text-[#D4AF37]/60 font-black uppercase tracking-tighter">{conv.updatedAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white/40 truncate font-light italic pr-4">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && (
                    <div className="bg-[#D4AF37] w-2 h-2 rounded-full shadow-[0_0_10px_#D4AF37] flex-shrink-0" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </aside>

      {/* 2. FENÊTRE DE CHAT */}
      <main className={cn(
        "flex-1 flex flex-col bg-[#0A0A0A] relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-40",
        selectedConv ? "fixed inset-0 md:relative translate-x-0" : "hidden md:flex translate-x-full md:translate-x-0"
      )}>
        {selectedConv ? (
          <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-[#0A0A0A]">
            {/* Header Chat Mobile-Optimized */}
            <header className="px-4 py-4 border-b border-[#D4AF37]/10 bg-[#0A0A0A]/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-50">
              <div className="flex items-center gap-3">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedConv(null)} 
                  className="md:hidden text-[#D4AF37] p-1 -ml-1 active:bg-[#D4AF37]/10 rounded-full transition-colors"
                >
                  <ChevronLeft size={32} />
                </motion.button>
                
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/30 shadow-md">
                    <Image src={selectedConv.user.avatar} alt={selectedConv.user.name} fill className="object-cover" />
                  </div>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A0A0A]",
                    selectedConv.user.status === 'online' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"
                  )} />
                </div>
                
                <div className="min-w-0">
                  <h2 className="font-serif font-bold text-sm tracking-widest text-[#D4AF37] uppercase truncate pr-2">{selectedConv.user.name}</h2>
                  <p className="text-[8px] text-white/40 uppercase tracking-[0.2em] font-black">
                    {selectedConv.user.status === 'atelier' ? '🧵 En Atelier' : 'Disponible'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="hidden sm:flex items-center gap-2 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#D4AF37]/20 transition-all active:scale-95">
                  <Ruler size={14} /> Fiche
                </button>
                <button className="p-2 text-white/30 active:text-[#D4AF37] transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Zone Messages (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar pb-40">
              {selectedConv.messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "flex flex-col max-w-[88%] sm:max-w-[75%]",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    {msg.type === 'text' && (
                      <div className={cn(
                        "px-5 py-3 rounded-2xl text-[13px] leading-relaxed relative shadow-xl border",
                        isMe 
                          ? "bg-white/[0.04] text-white/95 rounded-tr-none border-white/10" 
                          : "bg-[#0A0A0A] text-white/95 rounded-tl-none border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.03)]"
                      )}>
                        {msg.text}
                      </div>
                    )}

                    {msg.type === 'post_share' && msg.postData && (
                      <div className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-2xl w-full sm:w-64 group cursor-pointer active:scale-[0.98] transition-transform">
                        <div className="relative aspect-square w-full">
                          <Image src={msg.postData.image} alt={msg.postData.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Sparkles size={24} className="text-[#D4AF37]" />
                          </div>
                        </div>
                        <div className="p-4 space-y-1 bg-[#0A0A0A]/90 backdrop-blur-md">
                          <p className="text-[8px] text-[#D4AF37] uppercase tracking-[0.2em] font-black">Référence Style</p>
                          <p className="text-xs font-bold text-white/90 tracking-wide">{msg.postData.title}</p>
                          <p className="text-sm font-serif text-[#D4AF37]">{msg.postData.price}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 px-1">
                      <span className="text-[8px] text-white/20 font-black uppercase tracking-widest leading-none">{msg.timestamp}</span>
                      {isMe && <CheckCheck size={12} className={cn(msg.status === 'read' ? "text-[#D4AF37]" : "text-white/10")} />}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Zone Input - Sticky above BottomNav on mobile */}
            <div className="p-4 sm:p-6 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent fixed bottom-20 md:relative md:bottom-0 left-0 right-0 z-50">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar px-1">
                {['Envoyer un Devis', 'Valider Mesures', 'Essayage'].map((action) => (
                  <button key={action} className="flex-shrink-0 bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all active:scale-90">
                    {action}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-1.5 pl-5 shadow-2xl focus-within:border-[#D4AF37]/30 transition-all ring-1 ring-transparent focus-within:ring-[#D4AF37]/10">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="VOTRE MESSAGE..." 
                  className="flex-1 bg-transparent text-[10px] font-bold tracking-widest outline-none placeholder:text-white/10 text-white uppercase py-3"
                />
                <div className="flex items-center gap-1 pr-1">
                  <button className="p-2.5 text-white/20 hover:text-[#D4AF37] active:scale-90 transition-all"><Camera size={22} /></button>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="bg-[#D4AF37] p-3 rounded-xl text-[#0A0A0A] shadow-[0_0_20px_rgba(212,175,55,0.3)] ml-1"
                  >
                    <Send size={20} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center space-y-8 text-center px-10 h-full"
          >
            <div className="relative">
              <div className="bg-[#D4AF37]/5 w-32 h-32 rounded-full flex items-center justify-center border border-[#D4AF37]/10 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
                <MessageCircle size={48} className="text-[#D4AF37]/40" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 text-[#D4AF37]/30 animate-pulse" size={24} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-serif text-[#D4AF37] tracking-[0.2em] uppercase italic">Salon Privé</h2>
              <p className="text-white/30 text-[9px] font-black tracking-[0.25em] leading-relaxed max-w-[240px] mx-auto italic uppercase">
                Choisissez un atelier pour initier votre prochaine création.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
