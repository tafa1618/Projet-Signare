'use client'

import { useMemo } from 'react'
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
} from 'lucide-react'

/**
 * Page Events - Stories, Lives & Défilés
 * @ai-context Capture les intérêts utilisateurs (event_view) pour le dataset de recommandation.
 */

type Story = {
  id: string
  label: string
  type: 'live' | 'story'
  thumbnail: string
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
  { id: 'me', label: 'Ma Story', type: 'story', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { id: 'atelier', label: 'Atelier Diorane', type: 'live', thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop' },
  { id: 'defile', label: 'Défilé Dakar 2024', type: 'story', thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop' },
]

const LIVE_FEATURED: LiveEvent = {
  id: 'live-1',
  title: 'Défilé Dakar • Capsule Or & Soie',
  creators: ['Maison Saliou', 'Atelier Diorane', 'Fatou Cissé'],
  viewers: 1284,
  startsIn: '00:12:45',
  banner: 'https://images.unsplash.com/photo-1496747611180-206a5c8c26af?w=1200&h=800&fit=crop',
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

export default function EventsPage() {
  const reactions = useMemo(() => ['✨', '🔥', '😍', '👏', '❤️'], [])

  const trackInterest = (targetId: string) => {
    // @ai-context Tracking des vues d’événement pour le dataset de recommandation
    console.log('[ML] event_view', { targetId, score: 2, timestamp: new Date().toISOString() })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-[#D4AF37]/15">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4AF37] p-2 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              <Ticket className="w-5 h-5 text-[#0A0A0A]" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Events</h1>
              <p className="text-[10px] text-white/50 tracking-[0.2em] uppercase">Lives & Défilés</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]/70" />
            <span className="text-[10px] text-white/50 uppercase tracking-[0.2em]">Mode Dakar</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Stories */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Stories & Lives</h2>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Swipe →</div>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {STORIES.map((story) => (
              <motion.button
                key={story.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => trackInterest(story.id)}
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
          <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/20 bg-white/5 shadow-[0_15px_60px_rgba(0,0,0,0.35)]">
            <div className="relative h-[340px] sm:h-[420px]">
              <Image src={LIVE_FEATURED.banner} alt={LIVE_FEATURED.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/40 to-transparent backdrop-blur-[2px]" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.2em] flex items-center gap-1 shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                  <Radio size={12} /> Live
                </div>
                {LIVE_FEATURED.startsIn && (
                  <div className="bg-white/10 border border-white/15 text-white/80 text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock3 size={12} /> {LIVE_FEATURED.startsIn}
                  </div>
                )}
              </div>

              <div className="absolute bottom-5 left-5 right-5 space-y-3">
                <h3 className="text-2xl font-serif text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">{LIVE_FEATURED.title}</h3>
                <p className="text-sm text-white/80">
                  Créateurs : {LIVE_FEATURED.creators.join(' • ')}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-white/80 text-xs">
                    <Users size={14} /> {LIVE_FEATURED.viewers.toLocaleString()} spectateurs
                  </div>
                  <div className="flex items-center gap-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full text-[#D4AF37] text-xs">
                    <Sparkles size={14} /> Mode Luxe
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => trackInterest(LIVE_FEATURED.id)}
                  className="mt-1 inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                >
                  <PlayCircle size={16} /> Rejoindre le Live
                </motion.button>
              </div>
            </div>
          </div>

          {/* Réactions rapides (capturer le sentiment live) */}
          <div className="mt-3 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2 backdrop-blur-xl">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">Réactions</span>
            <div className="flex gap-2">
              {reactions.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => trackInterest(`reaction-${emoji}`)}
                  className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-lg shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Événements à venir */}
        <section className="pb-6">
          <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase mb-3">Événements à venir</h2>
          <div className="space-y-4">
            {UPCOMING.map((ev) => (
              <motion.div
                key={ev.id}
                whileTap={{ scale: 0.98 }}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl"
                onClick={() => trackInterest(ev.id)}
              >
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <Image src={ev.image} alt={ev.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] text-[#D4AF37]/80 uppercase tracking-[0.18em] flex items-center gap-1">
                      <Clock3 size={12} /> {ev.date}
                    </p>
                    <h3 className="text-sm font-semibold text-white mt-1">{ev.title}</h3>
                    <p className="text-[11px] text-white/50 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {ev.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      className="text-[11px] font-black uppercase tracking-[0.18em] bg-[#D4AF37] text-[#0A0A0A] px-3 py-2 rounded-lg shadow-[0_0_18px_rgba(212,175,55,0.35)]"
                    >
                      {ev.cta}
                    </motion.button>
                    <ArrowRight size={16} className="text-white/30" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
