'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Ticket, 
  Radio, 
  Sparkles, 
  Clock3, 
  Users, 
  MapPin, 
  PlayCircle,
  ArrowRight,
  Heart,
  Laugh,
  Star,
  Bookmark,
  MessageSquare,
} from 'lucide-react'
import mesureImg from '../../Assets/prise de mesure.jpg'
import atelierImg from '../../Assets/unnamed (1).jpg'
import lookbookImg from '../../Assets/unnamed.jpg'
import WeeklyCompetition from '@/components/WeeklyCompetition'
import type { ParticipantSubmission, Participant } from '@/components/WeeklyCompetition/ParticipantCard'
import { Plus } from 'lucide-react'

/**
 * Page Events - Stories, Lives & Défilés
 * @ai-context Capture les intérêts utilisateurs (event_view) pour le dataset de recommandation.
 */

type Story = {
  id: string
  label: string
  type: 'live' | 'story'
  thumbnail: string
  media?: string
}

type StoryComment = {
  id: string
  author: string
  text: string
  timestamp: string
}

type LiveEvent = {
  id: string
  title: string
  creators: string[]
  viewers: number
  startsIn?: string
  banner: string
}

type UpcomingEvent = {
  id: string
  title: string
  date: string
  location: string
  cta: 'M’inscrire' | 'Rappeler'
  image: string
}

const STORIES: Story[] = [
  { id: 'me', label: 'Ma Story', type: 'story', thumbnail: mesureImg.src, media: mesureImg.src },
  { id: 'atelier', label: 'Atelier Diorane', type: 'live', thumbnail: atelierImg.src, media: atelierImg.src },
  { id: 'defile', label: 'Défilé Dakar 2024', type: 'story', thumbnail: lookbookImg.src, media: lookbookImg.src },
]

const LIVE_FEATURED: LiveEvent = {
  id: 'live-1',
  title: 'Défilé Dakar • Capsule Or & Soie',
  creators: ['Maison Saliou', 'Atelier Diorane', 'Fatou Cissé'],
  viewers: 1284,
  startsIn: '00:12:45',
  banner: lookbookImg.src,
}

const UPCOMING: UpcomingEvent[] = [
  {
    id: 'event-1',
    title: 'Soirée Wax Royale',
    date: '12 Jan • 20:00',
    location: 'Dakar • Corniche Ouest',
    cta: 'M’inscrire',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=400&fit=crop',
  },
  {
    id: 'event-2',
    title: 'Atelier Broderie Luxe',
    date: '18 Jan • 15:00',
    location: 'Saint-Louis • Atelier Téranga',
    cta: 'Rappeler',
    image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=600&h=400&fit=crop',
  },
  {
    id: 'event-3',
    title: 'Masterclass Soie & Or',
    date: '26 Jan • 10:00',
    location: 'Abidjan • Plateau',
    cta: 'M’inscrire',
    image: 'https://images.unsplash.com/photo-1542293787938-4d22170c3b99?w=600&h=400&fit=crop',
  },
]

// Données mockées pour la compétition
const MOCK_PARTICIPANTS: {
  homme: Participant[]
  femme: Participant[]
  tailleur: Participant[]
} = {
  homme: [
    {
      id: 'h1',
      name: 'Moussa Diallo',
      media: ['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=800&fit=crop'],
      format: 'photos',
      likes: 1240,
      tailorId: 'tailor-1',
      tailorName: 'Atelier Fatou',
      category: 'homme',
      position: 1,
    },
    {
      id: 'h2',
      name: 'Amadou Ndiaye',
      media: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop'],
      format: 'video',
      likes: 892,
      tailorId: 'tailor-2',
      tailorName: 'Maison Saliou',
      category: 'homme',
      position: 2,
    },
    {
      id: 'h3',
      name: 'Ibrahima Ba',
      media: ['https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=600&h=800&fit=crop'],
      format: 'photos',
      likes: 654,
      tailorId: 'tailor-3',
      tailorName: 'Studio Dakar Luxe',
      category: 'homme',
      position: 3,
    },
  ],
  femme: [
    {
      id: 'f1',
      name: 'Aïssatou Sow',
      media: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop'],
      format: 'photos',
      likes: 2156,
      tailorId: 'tailor-1',
      tailorName: 'Atelier Fatou',
      category: 'femme',
      position: 1,
    },
    {
      id: 'f2',
      name: 'Fatou Diallo',
      media: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop'],
      format: 'video',
      likes: 1834,
      tailorId: 'tailor-2',
      tailorName: 'Maison Saliou',
      category: 'femme',
      position: 2,
    },
    {
      id: 'f3',
      name: 'Khadija Fall',
      media: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop'],
      format: 'photos',
      likes: 1456,
      tailorId: 'tailor-3',
      tailorName: 'Studio Dakar Luxe',
      category: 'femme',
      position: 3,
    },
  ],
  tailleur: [
    {
      id: 't1',
      name: 'Atelier Fatou',
      media: ['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=800&fit=crop'],
      format: 'photos',
      likes: 3421,
      tailorId: 'tailor-1',
      tailorName: 'Atelier Fatou',
      category: 'tailleur',
      position: 1,
    },
    {
      id: 't2',
      name: 'Maison Saliou',
      media: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop'],
      format: 'video',
      likes: 2890,
      tailorId: 'tailor-2',
      tailorName: 'Maison Saliou',
      category: 'tailleur',
      position: 2,
    },
    {
      id: 't3',
      name: 'Studio Dakar Luxe',
      media: ['https://images.unsplash.com/photo-1520975868797-1c3e0e012a4c?w=600&h=800&fit=crop'],
      format: 'photos',
      likes: 2234,
      tailorId: 'tailor-3',
      tailorName: 'Studio Dakar Luxe',
      category: 'tailleur',
      position: 3,
    },
  ],
}

const MOCK_WINNERS = {
  homme: MOCK_PARTICIPANTS.homme[0],
  femme: MOCK_PARTICIPANTS.femme[0],
  tailleur: MOCK_PARTICIPANTS.tailleur[0],
}

export default function EventsPage() {
  const reactions = useMemo(() => ['✨', '🔥', '😍', '👏', '❤️'], [])
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [savedBookmark, setSavedBookmark] = useState<boolean>(false)
  const [commentSheetOpen, setCommentSheetOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [hasParticipated, setHasParticipated] = useState(false)
  const [competitionModalOpen, setCompetitionModalOpen] = useState(false)
  const [comments, setComments] = useState<Record<string, StoryComment[]>>(() => ({
    me: [
      { id: 'c1', author: 'Aïssatou', text: 'Tellement élégant, j’adore !', timestamp: 'il y a 5 min' },
    ],
    atelier: [
      { id: 'c2', author: 'Moussa', text: 'Les broderies sont folles 🔥', timestamp: 'il y a 2 min' },
    ],
    defile: [
      { id: 'c3', author: 'Khadija', text: 'On dirait un vrai runway Paris-Dakar.', timestamp: 'il y a 10 min' },
    ],
  }))

  const activeStory = STORIES.find((s) => s.id === activeStoryId) ?? null

  const trackInterest = (targetId: string) => {
    // @ai-context Tracking des vues d'événement pour le dataset de recommandation
    // TODO: Implémenter logMLInteraction quand disponible
    console.log('Event view tracked:', targetId)
  }

  const openStory = (id: string) => {
    setActiveStoryId(id)
    setProgress(0)
    setSelectedReaction(null)
    setSavedBookmark(false)
    setCommentSheetOpen(false)
    trackInterest(`story-open:${id}`)
  }

  const closeStory = () => {
    setActiveStoryId(null)
    setProgress(0)
    setSelectedReaction(null)
    setSavedBookmark(false)
    setCommentSheetOpen(false)
  }

  const goNextStory = () => {
    if (!activeStoryId) return
    const idx = STORIES.findIndex((s) => s.id === activeStoryId)
    const next = STORIES[(idx + 1) % STORIES.length]
    setActiveStoryId(next.id)
    setProgress(0)
    setSelectedReaction(null)
    setSavedBookmark(false)
    setCommentSheetOpen(false)
    trackInterest(`story-next:${next.id}`)
  }

  const goPrevStory = () => {
    if (!activeStoryId) return
    const idx = STORIES.findIndex((s) => s.id === activeStoryId)
    const prev = STORIES[(idx - 1 + STORIES.length) % STORIES.length]
    setActiveStoryId(prev.id)
    setProgress(0)
    setSelectedReaction(null)
    setSavedBookmark(false)
    setCommentSheetOpen(false)
    trackInterest(`story-prev:${prev.id}`)
  }

  const handleSendComment = () => {
    if (!activeStoryId) return
    const text = commentDraft.trim()
    if (!text) return
    const newComment: StoryComment = {
      id: `local-${Date.now()}`,
      author: 'Vous',
      text,
      timestamp: "à l'instant",
    }
    setComments((prev) => ({
      ...prev,
      [activeStoryId]: [newComment, ...(prev[activeStoryId] ?? [])],
    }))
    setCommentDraft('')
    trackInterest(`story-comment:${activeStoryId}`)
  }

  // Handlers pour la compétition
  const handleParticipate = (data: ParticipantSubmission) => {
    // Frontend uniquement - envoi des données sans validation
    console.log('Participation:', data)
    setHasParticipated(true)
    trackInterest('competition-participate')
  }

  const handleLike = (participantId: string) => {
    // Frontend uniquement - appel API à implémenter
    console.log('Like participant:', participantId)
    trackInterest(`competition-like:${participantId}`)
  }

  useEffect(() => {
    if (!activeStoryId) return
    setProgress(0)
    const totalMs = 5500
    const step = 55
    const increment = 100 / (totalMs / step)
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + increment
        if (next >= 100) {
          clearInterval(timer)
          goNextStory()
        }
        return next
      })
    }, step)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoryId])

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 sticky top-0 z-40 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-[#D4AF37]/15">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-[#D4AF37] p-1.5 sm:p-2 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Events</h1>
              <p className="text-[9px] sm:text-[10px] text-white/50 tracking-[0.2em] uppercase">Lives & Défilés</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]/70" />
            <span className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-[0.2em] hidden sm:inline">Mode Dakar</span>
            <span className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-[0.2em] sm:hidden">Dakar</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
        {/* Stories */}
        <section className="pt-2 sm:pt-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-xs sm:text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Stories & Lives</h2>
            <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-[0.2em]">Swipe →</div>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
            {STORIES.map((story) => (
              <motion.button
                key={story.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => openStory(story.id)}
                className="flex flex-col items-center gap-2 min-w-[72px]"
              >
                <motion.div
                  animate={story.type === 'live' ? { rotate: 360 } : {}}
                  transition={story.type === 'live' ? { repeat: Infinity, duration: 8, ease: 'linear' } : {}}
                  className={story.type === 'live'
                    ? 'p-[2px] rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#D4AF37]/60 to-transparent'
                    : 'p-[2px] rounded-full border border-[#D4AF37]/40'}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-black relative">
                    <Image src={story.thumbnail} alt={story.label} fill className="object-cover" />
                    {story.type === 'live' && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(212,175,55,0.6)]">
                        Live
                      </div>
                    )}
                  </div>
                </motion.div>
                <span className="text-[10px] text-white/60 uppercase tracking-[0.15em] text-center leading-tight w-16 line-clamp-2">
                  {story.label}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Live à la Une */}
        <section>
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-[#D4AF37]/20 bg-white/5 shadow-[0_15px_60px_rgba(0,0,0,0.35)]">
            <div className="relative h-[280px] sm:h-[340px] md:h-[420px]">
              <Image src={LIVE_FEATURED.banner} alt={LIVE_FEATURED.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/40 to-transparent backdrop-blur-[2px]" />

              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
                <div className="bg-[#D4AF37] text-[#0A0A0A] text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-[0.2em] flex items-center gap-1 shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                  <Radio size={10} className="sm:w-3 sm:h-3" /> Live
                </div>
                {LIVE_FEATURED.startsIn && (
                  <div className="bg-white/10 border border-white/15 text-white/80 text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                    <Clock3 size={10} className="sm:w-3 sm:h-3" /> {LIVE_FEATURED.startsIn}
                  </div>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl md:text-2xl font-serif text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">{LIVE_FEATURED.title}</h3>
                <p className="text-xs sm:text-sm text-white/80">
                  Créateurs : {LIVE_FEATURED.creators.join(' • ')}
                </p>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1 bg-white/10 border border-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white/80 text-[10px] sm:text-xs">
                    <Users size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">{LIVE_FEATURED.viewers.toLocaleString()} spectateurs</span><span className="sm:hidden">{LIVE_FEATURED.viewers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[#D4AF37] text-[10px] sm:text-xs">
                    <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" /> Mode Luxe
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => trackInterest(LIVE_FEATURED.id)}
                  className="mt-1 inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] px-4 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                >
                  <PlayCircle size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Rejoindre le Live</span><span className="sm:hidden">Rejoindre</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Réactions rapides (capturer le sentiment live) */}
          <div className="mt-2 sm:mt-3 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-xl">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/50">Réactions</span>
            <div className="flex gap-1.5 sm:gap-2">
              {reactions.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => trackInterest(`reaction-${emoji}`)}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-base sm:text-lg shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Sagnsé & Ndanane de la semaine */}
        <section className="pt-4">
          <WeeklyCompetition
            hasParticipated={hasParticipated}
            daysRemaining={3}
            topParticipants={MOCK_PARTICIPANTS}
            winners={MOCK_WINNERS}
            onParticipate={handleParticipate}
            onLike={handleLike}
            externalModalOpen={competitionModalOpen}
            onModalOpenChange={setCompetitionModalOpen}
          />
        </section>

        {/* Événements à venir */}
        <section className="pb-4 sm:pb-6">
          <h2 className="text-xs sm:text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase mb-2 sm:mb-3">Événements à venir</h2>
          <div className="space-y-3 sm:space-y-4">
            {UPCOMING.map((ev) => (
              <motion.div
                key={ev.id}
                whileTap={{ scale: 0.98 }}
                className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl"
                onClick={() => trackInterest(ev.id)}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0">
                  <Image src={ev.image} alt={ev.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#D4AF37]/80 uppercase tracking-[0.18em] flex items-center gap-1">
                      <Clock3 size={10} className="sm:w-3 sm:h-3" /> {ev.date}
                    </p>
                    <h3 className="text-xs sm:text-sm font-semibold text-white mt-0.5 sm:mt-1 line-clamp-2">{ev.title}</h3>
                    <p className="text-[10px] sm:text-[11px] text-white/50 flex items-center gap-1 mt-0.5 sm:mt-1">
                      <MapPin size={10} className="sm:w-3 sm:h-3" /> <span className="line-clamp-1">{ev.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] bg-[#D4AF37] text-[#0A0A0A] px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-[0_0_18px_rgba(212,175,55,0.35)]"
                    >
                      {ev.cta}
                    </motion.button>
                    <ArrowRight size={14} className="sm:w-4 sm:h-4 text-white/30 shrink-0" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {activeStory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-sm"
          onClick={closeStory}
        >
          <div className="absolute inset-0 flex justify-center items-center px-4">
            <div
              className="relative w-full max-w-[320px] max-h-[88vh] bg-white/5 border border-[#D4AF37]/20 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pt-3 pb-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/40">
                      <Image src={activeStory.thumbnail} alt={activeStory.label} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-serif text-white">{activeStory.label}</p>
                      <p className="text-[11px] text-white/50 uppercase tracking-[0.18em]">{activeStory.type === 'live' ? 'Live en cours' : 'Story'}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeStory}
                    className="text-white/60 hover:text-white text-sm px-2"
                  >
                    Fermer
                  </button>
                </div>
                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37]"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="relative aspect-[9/16] w-full bg-black max-h-[60vh] shrink-0">
                <Image
                  src={activeStory.media ?? activeStory.thumbnail}
                  alt={activeStory.label}
                  fill
                  className="object-cover"
                  priority
                />
                {activeStory.type === 'live' && (
                  <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.18em] shadow-[0_0_14px_rgba(212,175,55,0.4)]">
                    Live
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <button
                    onClick={goPrevStory}
                    className="w-16 h-full bg-gradient-to-r from-black/30 to-transparent text-white/60 hover:text-white"
                    aria-label="Story précédente"
                  />
                  <button
                    onClick={goNextStory}
                    className="w-16 h-full bg-gradient-to-l from-black/30 to-transparent text-white/60 hover:text-white"
                    aria-label="Story suivante"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 px-4 py-3 text-[#D4AF37] shrink-0">
                {[{ icon: Heart, id: 'heart' }, { icon: Laugh, id: 'laugh' }, { icon: Star, id: 'star' }, { icon: Bookmark, id: 'save' }].map(({ icon: Icon, id }) => {
                  const isActive = id === 'save' ? savedBookmark : selectedReaction === id
                  return (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.8, rotate: -6 }}
                      onClick={() => {
                        if (id === 'save') {
                          const next = !savedBookmark
                          setSavedBookmark(next)
                          trackInterest(`story-save:${next ? 'on' : 'off'}:${activeStory?.id ?? ''}`)
                          return
                        }
                        setSelectedReaction(id)
                        trackInterest(`story-react:${id}:${activeStory?.id ?? ''}`)
                      }}
                      className={
                        `p-2 rounded-full transition-all border ${
                          isActive
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0A0A0A]'
                            : 'bg-white/5 border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 text-[#D4AF37]'
                        }`
                      }
                      aria-label={`Réaction ${id}`}
                    >
                      <Icon size={18} />
                    </motion.button>
                  )
                })}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setCommentSheetOpen(true)}
                  className="ml-1 p-2 rounded-full border border-[#D4AF37]/35 bg-black/40 text-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.25)]"
                  aria-label="Ouvrir les commentaires"
                >
                  <MessageSquare size={18} strokeWidth={1.75} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {commentSheetOpen && activeStory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <motion.div
            initial={{ y: 240 }}
            animate={{ y: 0 }}
            exit={{ y: 240 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="pointer-events-auto absolute inset-x-0 bottom-0 px-3 pb-4"
          >
            <div className="mx-auto w-full max-w-[420px] bg-[#0A0A0A]/95 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.55)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/40 relative">
                    <Image src={activeStory.thumbnail} alt={activeStory.label} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-serif text-white">{activeStory.label}</p>
                    <p className="text-[11px] text-white/50 uppercase tracking-[0.18em]">Commentaires</p>
                  </div>
                </div>
                <button
                  onClick={() => setCommentSheetOpen(false)}
                  className="text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white px-2"
                >
                  Fermer
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {(comments[activeStory.id] ?? []).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-[#D4AF37]/15 bg-white/5 px-3 py-2 text-sm text-white/80"
                  >
                    <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
                      <span className="font-semibold text-white/80">{c.author}</span>
                      <span>{c.timestamp}</span>
                    </div>
                    <p className="leading-snug">{c.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <textarea
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Ajouter un commentaire…"
                  className="flex-1 bg-white/5 border border-[#D4AF37]/25 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37] resize-none h-12"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendComment}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0A0A0A] text-xs font-black uppercase tracking-[0.18em] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_18px_rgba(212,175,55,0.35)]"
                  disabled={!commentDraft.trim()}
                >
                  Envoyer
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bouton sticky mobile "+ Participer" */}
      {!hasParticipated && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 left-0 right-0 z-40 md:hidden px-4"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCompetitionModalOpen(true)}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-4 rounded-xl font-black uppercase tracking-[0.18em] text-sm shadow-[0_0_30px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Participer
          </motion.button>
        </motion.div>
      )}

    </div>
  )
}
