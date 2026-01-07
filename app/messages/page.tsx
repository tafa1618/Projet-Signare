'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Search, 
  Plus,
  MoreVertical, 
  Send, 
  Ruler, 
  FileText, 
  ChevronLeft,
  Scissors,
  CheckCheck,
  Sparkles,
  MessageCircle,
  Camera,
  Mic,
  Star,
  Phone,
  Video
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { Database } from '@/shared/types/database.types'
import { useSearchParams } from 'next/navigation'

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
    rankLabel: string
    rating?: number
    isMasterTailor?: boolean
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
      rankLabel: 'Maître Tailleur',
      rating: 4.9,
      isMasterTailor: true,
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
      rankLabel: 'Client SIGNARE',
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

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking d'interactions (ML Ready)
 * @ai-context Utilise le schéma `user_interactions` pour capturer l'engagement dans la messagerie
 * (ex: sélection conversation, actions rapides, envoi).
 */
function trackInteraction(payload: UserInteractionInsert) {
  // TODO: Brancher sur Supabase (insert) quand l'auth est active.
  // Respect du schéma: pas de metadata arbitraire ici; on encode le contexte dans `came_from`.
  console.log('[ML] user_interactions.insert', payload)
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={s <= rounded ? "fill-current" : "text-white/20"}
          style={{ color: s <= rounded ? "#D4AF37" : undefined }}
        />
      ))}
    </div>
  )
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [inputText, setInputText] = useState('')
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)
  const currentUserId = 'user-123'
  const sessionId = 'session-demo'

  const containerHeightClass = 'h-[calc(100dvh-80px)] md:h-[calc(100vh-80px)] -mb-24'

  const quickActions = useMemo(() => ([
    { id: 'ref', label: 'Modèle de référence', icon: Sparkles },
    { id: 'mes', label: 'Fiche de mesures', icon: Ruler },
  ]), [])

  useEffect(() => {
    const tailorName = searchParams.get('tailor')
    const userName = searchParams.get('user')
    const targetName = tailorName ?? userName
    if (!targetName) return

    const normalized = targetName.trim().toLowerCase()
    if (!normalized) return

    // Si déjà sélectionnée, ne rien faire
    if (selectedConv && selectedConv.user.name.toLowerCase() === normalized) return

    const existing = conversations.find((c) => c.user.name.toLowerCase() === normalized)
    if (existing) {
      setSelectedConv(existing)
      trackInteraction({
        user_id: currentUserId,
        post_id: null,
        interaction_type: 'click',
        session_id: sessionId,
        duration_seconds: null,
        scroll_depth: null,
        came_from: tailorName ? 'messages:deeplink_tailor_existing' : 'messages:deeplink_user_existing',
        device_type: 'web',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
      return
    }

    const isTailor = Boolean(tailorName)
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      user: {
        name: targetName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetName)}`,
        role: isTailor ? 'tailleur' : 'client',
        rankLabel: isTailor ? 'Atelier' : 'Client SIGNARE',
        rating: isTailor ? 4.8 : undefined,
        isMasterTailor: isTailor ? true : false,
        status: 'offline',
      },
      lastMessage: 'Bonjour, je souhaite discuter d’un modèle.',
      unreadCount: 0,
      updatedAt: 'Maintenant',
      messages: [
        {
          id: `m-${Date.now()}`,
          senderId: currentUserId,
          text: 'Bonjour, je souhaite discuter d’un modèle.',
          timestamp: 'Maintenant',
          type: 'text',
          status: 'sent',
        },
      ],
    }

    setConversations((prev) => [newConv, ...prev])
    setSelectedConv(newConv)
    trackInteraction({
      user_id: currentUserId,
      post_id: null,
      interaction_type: 'click',
      session_id: sessionId,
      duration_seconds: null,
      scroll_depth: null,
      came_from: tailorName ? 'messages:deeplink_tailor_new' : 'messages:deeplink_user_new',
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  }, [searchParams, conversations, currentUserId, sessionId, selectedConv])

  return (
    <div className={cn("bg-[#0A0A0A] text-white overflow-hidden", containerHeightClass)}>
      <div className="h-full w-full max-w-2xl mx-auto flex">
      {/* 1. LISTE DES CONVERSATIONS */}
      <aside className={cn(
        "w-full md:w-[340px] border-r border-[#D4AF37]/20 flex flex-col bg-[#0A0A0A]",
        selectedConv ? "hidden md:flex" : "flex"
      )}>
        <header className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em] uppercase">MESSAGES</h1>
            <button className="p-1.5 sm:p-2 text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">
              <Plus size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="relative mt-3 sm:mt-4">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 w-3.5 h-3.5 sm:w-4 sm:h-4" size={14} />
            <input
              type="text"
              placeholder="RECHERCHER..."
              className="w-full bg-transparent border-b border-[#D4AF37]/20 py-2 sm:py-2.5 pl-6 sm:pl-7 pr-2 sm:pr-3 text-[9px] sm:text-[10px] font-black tracking-[0.18em] sm:tracking-[0.22em] uppercase outline-none focus:border-[#D4AF37] placeholder:text-white/20"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2">
          {conversations.map((conv, idx) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.35 }}
              onClick={() => {
                setSelectedConv(conv)
                trackInteraction({
                  user_id: currentUserId,
                  post_id: null,
                  interaction_type: 'click',
                  session_id: sessionId,
                  duration_seconds: null,
                  scroll_depth: null,
                  came_from: 'messages:conversation_select',
                  device_type: 'web',
                  user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                })
              }}
              className={cn(
                "w-full text-left flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300",
                "border-transparent hover:border-[#D4AF37]/15",
                "hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent",
                "active:scale-[0.99]"
              )}
            >
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border p-0.5",
                  conv.user.isMasterTailor ? "border-[#D4AF37]/50" : "border-white/10"
                )}>
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-900">
                    <Image src={conv.user.avatar} alt={conv.user.name} fill className="object-cover" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5 sm:mb-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-xs sm:text-sm tracking-wide text-white/90 truncate">{conv.user.name}</h3>
                    <p className="text-[7px] sm:text-[8px] text-[#D4AF37]/70 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black truncate">
                      {conv.user.rankLabel}
                    </p>
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-white/30 font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] flex-shrink-0 ml-2">{conv.updatedAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] sm:text-xs text-white/40 truncate pr-2 sm:pr-4 italic">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && (
                    <div className="bg-[#D4AF37] w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.7)] flex-shrink-0" />
                  )}
                </div>
                {typeof conv.user.rating === 'number' && (
                  <div className="mt-0.5 sm:mt-1">
                    <StarRating rating={conv.user.rating} />
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* 2. FENÊTRE DE CHAT */}
      <main className={cn(
        "flex-1 flex flex-col bg-[#0A0A0A] relative",
        !selectedConv && "hidden md:flex"
      )}>
        <AnimatePresence mode="wait">
          {selectedConv ? (
            <motion.div
              key={selectedConv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col h-full"
            >
              {/* Header Chat (Feed-like) */}
              <header className="px-3 sm:px-6 py-3 sm:py-4 border-b border-[#D4AF37]/20 bg-[#0A0A0A]/90 backdrop-blur-xl flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1.5 -ml-1 text-[#D4AF37] active:bg-[#D4AF37]/10 rounded-full flex-shrink-0"
                    aria-label="Retour"
                  >
                    <ChevronLeft size={22} className="sm:w-6 sm:h-6" />
                  </button>

                  <div className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border p-0.5 flex-shrink-0",
                    selectedConv.user.isMasterTailor ? "border-[#D4AF37]/50" : "border-white/10"
                  )}>
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-900">
                      <Image src={selectedConv.user.avatar} alt={selectedConv.user.name} fill className="object-cover" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <h2 className="font-serif font-bold text-xs sm:text-sm text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.18em] uppercase truncate">
                        {selectedConv.user.name}
                      </h2>
                      {selectedConv.user.status === 'atelier' && (
                        <div className="flex items-center gap-1 text-[#D4AF37] flex-shrink-0">
                          <Scissors size={10} className="sm:w-3 sm:h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <p className="text-[8px] sm:text-[9px] text-white/40 uppercase tracking-[0.18em] sm:tracking-[0.22em] font-black truncate">
                        {selectedConv.user.rankLabel}
                      </p>
                      {typeof selectedConv.user.rating === 'number' && <StarRating rating={selectedConv.user.rating} />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 ml-2 sm:ml-4 flex-shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      trackInteraction({
                        user_id: currentUserId,
                        post_id: null,
                        interaction_type: 'click',
                        session_id: sessionId,
                        duration_seconds: null,
                        scroll_depth: null,
                        came_from: 'messages:call_audio',
                        device_type: 'web',
                        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                      })
                    }}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] bg-[#0A0A0A] hover:bg-[#D4AF37]/10 transition-colors text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] flex items-center gap-1 sm:gap-1.5"
                  >
                    <Phone size={12} className="sm:w-[14px] sm:h-[14px]" />
                    <span className="hidden xs:inline">Appel</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      trackInteraction({
                        user_id: currentUserId,
                        post_id: null,
                        interaction_type: 'click',
                        session_id: sessionId,
                        duration_seconds: null,
                        scroll_depth: null,
                        came_from: 'messages:call_video',
                        device_type: 'web',
                        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                      })
                    }}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] bg-[#0A0A0A] hover:bg-[#D4AF37]/10 transition-colors text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] flex items-center gap-1 sm:gap-1.5"
                  >
                    <Video size={12} className="sm:w-[14px] sm:h-[14px]" />
                    <span className="hidden xs:inline">Vidéo</span>
                  </motion.button>
                  <button className="p-1.5 sm:p-2 text-white/30 hover:text-[#D4AF37] transition-colors flex-shrink-0">
                    <MoreVertical size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
                {selectedConv.messages.map((msg) => {
                  const isMe = msg.senderId === currentUserId
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn("flex", isMe ? "justify-end" : "justify-start")}
                    >
                      <div className={cn(
                        "max-w-[78%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed border",
                        isMe
                          ? "bg-[#141414] text-white/90 border-white/10 rounded-tr-none"
                          : "bg-[#0A0A0A] text-white/90 border-[#D4AF37]/20 rounded-tl-none"
                      )}>
                        {msg.type === 'post_share' && msg.postData ? (
                          <div className="space-y-2">
                            <p className="text-[9px] uppercase tracking-[0.22em] font-black text-[#D4AF37]/80">
                              Modèle de référence
                            </p>
                            <div className="relative aspect-[4/5] w-full max-h-[180px] rounded-xl overflow-hidden border border-[#D4AF37]/20">
                              <Image src={msg.postData.image} alt={msg.postData.title} fill className="object-cover" />
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-bold truncate">{msg.postData.title}</p>
                              <p className="text-sm font-serif text-[#D4AF37] flex-shrink-0">{msg.postData.price}</p>
                            </div>
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Input compact (no-scroll global) */}
              <div className="sticky bottom-0 border-t border-[#D4AF37]/20 bg-[#0A0A0A]/95 backdrop-blur-xl px-3 sm:px-6 py-2.5 sm:py-3">
                <div className="relative">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2">
                    <button
                      onClick={() => {
                        setShowQuickMenu((v) => !v)
                        trackInteraction({
                          user_id: currentUserId,
                          post_id: null,
                          interaction_type: 'click',
                          session_id: sessionId,
                          duration_seconds: null,
                          scroll_depth: null,
                          came_from: 'messages:quick_plus_toggle',
                          device_type: 'web',
                          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                        })
                      }}
                      className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[#D4AF37]/80 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex-shrink-0"
                      aria-label="Actions rapides"
                    >
                      <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="VOTRE MESSAGE..."
                      className="flex-1 bg-transparent text-[10px] sm:text-[11px] font-black tracking-[0.18em] sm:tracking-[0.22em] uppercase outline-none placeholder:text-white/15 min-w-0"
                    />

                    <button
                      className="p-1.5 sm:p-2 text-white/20 hover:text-[#D4AF37] transition-colors flex-shrink-0"
                      aria-label="Message vocal"
                      onClick={() => {
                        trackInteraction({
                          user_id: currentUserId,
                          post_id: null,
                          interaction_type: 'click',
                          session_id: sessionId,
                          duration_seconds: null,
                          scroll_depth: null,
                          came_from: 'messages:voice_mic',
                          device_type: 'web',
                          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                        })
                        // TODO: implémenter enregistrement audio (MediaRecorder) + upload Supabase Storage
                      }}
                    >
                      <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>

                    <button className="p-1.5 sm:p-2 text-white/20 hover:text-[#D4AF37] transition-colors flex-shrink-0" aria-label="Photo">
                      <Camera size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        if (!inputText.trim()) return
                        trackInteraction({
                          user_id: currentUserId,
                          post_id: null,
                          interaction_type: 'click',
                          session_id: sessionId,
                          duration_seconds: null,
                          scroll_depth: null,
                          came_from: 'messages:send',
                          device_type: 'web',
                          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                        })
                        setInputText('')
                      }}
                      className="bg-[#D4AF37] text-[#0A0A0A] p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-[0_0_18px_rgba(212,175,55,0.35)] flex-shrink-0"
                      aria-label="Envoyer"
                    >
                      <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showQuickMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-[56px] left-0 w-[240px] bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl overflow-hidden shadow-2xl"
                      >
                        {quickActions.map((action) => {
                          const Icon = action.icon
                          return (
                            <button
                              key={action.id}
                              onClick={() => {
                                setShowQuickMenu(false)
                                trackInteraction({
                                  user_id: currentUserId,
                                  post_id: null,
                                  interaction_type: 'click',
                                  session_id: sessionId,
                                  duration_seconds: null,
                                  scroll_depth: null,
                                  came_from: `messages:quick_${action.id}`,
                                  device_type: 'web',
                                  user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                                })
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#D4AF37]/10 transition-colors"
                            >
                              <Icon size={16} className="text-[#D4AF37]" />
                              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/80">
                                {action.label}
                              </span>
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:flex h-full items-center justify-center text-center px-10">
              <div className="space-y-4">
                <div className="bg-[#D4AF37]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/20">
                  <MessageCircle size={32} className="text-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Salon Privé</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                    Sélectionnez une conversation
                  </p>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  )
}
