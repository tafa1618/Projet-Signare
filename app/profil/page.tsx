'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { 
  Settings, 
  Ruler, 
  Award, 
  Sparkles,
  LogOut,
  Star,
  Scissors,
  MessageCircle,
  Package
} from 'lucide-react'
import type { Database, Mesure } from '@/shared/types/database.types'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking d'interactions Profil (ML Ready)
 * @ai-context Les vues de profil et clics sur mensurations/galerie alimentent le dataset de recommandation.
 */
function trackProfileInteraction(payload: UserInteractionInsert) {
  // TODO: brancher vers Supabase quand l’auth est active.
  console.log('[ML] user_interactions.insert', payload)
}

type ClientProfile = {
  id: string
  name: string
  avatar: string
  bio: string
  outfitCount: number
  latestMesure: Mesure
}

const MOCK_CLIENT_PROFILE: ClientProfile = {
  id: 'c1',
  name: 'Fatou Dia',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
  bio: "Inspirée par l'élégance traditionnelle du Sénégal. J'aime les coupes nettes, le wax premium et les finitions couture.",
  outfitCount: 13,
  latestMesure: {
    id: 'm-1',
    user_id: 'c1',
    client_name: 'Fatou Dia',
    tour_poitrine: 92,
    tour_taille: 68,
    tour_hanches: 98,
    longueur_bras: 58,
    longueur_jambe: 102,
    tour_cou: 33,
    carrure: 40,
    hauteur_poitrine: null,
    longueur_dos: null,
    tour_cuisse: null,
    body_type: 'Sablier',
    height_cm: 168,
    weight_kg: null,
    pattern_type: 'robe',
    fabric_stretch_index: 2,
    complexity_score: 3,
    fit_preference: 'Ajusté',
    adjustments_notes: null,
    notes: null,
    photo_references: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

type TailorProfile = {
  id: string
  name: string
  avatar: string
  bio: string
  rating: number
  activeOrders: number
  monthlyRevenue: string
  creationsCount: number
}

const MOCK_TAILOR_PROFILE: TailorProfile = {
  id: 't1',
  name: 'Maison Aïda Sow',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aida',
  bio: 'Maîtresse Couturière — Spécialiste boubous de cérémonie & finitions couture.',
  rating: 4.9,
  activeOrders: 8,
  monthlyRevenue: '1.2M FCFA',
  creationsCount: 24,
}

type ProfileMode = 'client' | 'tailleur'

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= rounded ? "fill-current" : "text-white/20"}
          style={{ color: s <= rounded ? "#D4AF37" : undefined }}
        />
      ))}
    </div>
  )
}

export default function ProfilPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = 'session-demo'
  const [mode, setMode] = useState<ProfileMode>('client')
  const [profileOverride, setProfileOverride] = useState<{ name: string; avatar: string; id: string } | null>(null)

  // Utilisateur connecté (simulation)
  const actorUserId = MOCK_CLIENT_PROFILE.id

  const profile = mode === 'client'
    ? {
        ...MOCK_CLIENT_PROFILE,
        id: profileOverride?.id ?? MOCK_CLIENT_PROFILE.id,
        name: profileOverride?.name ?? MOCK_CLIENT_PROFILE.name,
        avatar: profileOverride?.avatar ?? MOCK_CLIENT_PROFILE.avatar,
      }
    : {
        ...MOCK_TAILOR_PROFILE,
        id: profileOverride?.id ?? MOCK_TAILOR_PROFILE.id,
        name: profileOverride?.name ?? MOCK_TAILOR_PROFILE.name,
        avatar: profileOverride?.avatar ?? MOCK_TAILOR_PROFILE.avatar,
      }

  const isOwnProfile = mode === 'client' && profile.id === actorUserId

  const gallery = useMemo(() => (
    Array.from({ length: 9 }).map((_, i) => ({
      id: `g-${i + 1}`,
      src: `https://images.unsplash.com/photo-15${i + 1}5372039744-b8f02a3ae446?w=400&h=400&fit=crop`,
    }))
  ), [])

  useEffect(() => {
    const urlMode = searchParams.get('mode')
    const urlTailor = searchParams.get('tailor')
    const urlClient = searchParams.get('client')

    if (urlMode === 'tailleur') {
      setMode('tailleur')
    } else if (urlMode === 'client') {
      setMode('client')
    }

    const overrideName = urlTailor ?? urlClient

    if (overrideName) {
      // Si on consulte un autre profil, on garde un id distinct pour gérer la confidentialité
      const overrideId = urlClient ? `client:${overrideName}` : `tailor:${overrideName}`
      setProfileOverride({
        id: overrideId,
        name: overrideName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(overrideName)}`,
      })
    } else {
      setProfileOverride(null)
    }
  }, [searchParams])

  useEffect(() => {
    // @ai-context Consultation de profil = signal d’intérêt / engagement
    trackProfileInteraction({
      user_id: actorUserId,
      post_id: null,
      interaction_type: 'view',
      session_id: sessionId,
      duration_seconds: null,
      scroll_depth: null,
      came_from: `profil:view:${mode}:target=${profile.id}`,
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  }, [actorUserId, profile.id, sessionId, mode])

  const handleLogout = () => {
    // TODO: Implémenter la déconnexion Supabase
    router.push('/welcome')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => {
            const nextMode: ProfileMode = mode === 'client' ? 'tailleur' : 'client'
            setMode(nextMode)
            trackProfileInteraction({
              user_id: actorUserId,
              post_id: null,
              interaction_type: 'click',
              session_id: sessionId,
              duration_seconds: null,
              scroll_depth: null,
              came_from: `profil:toggle_mode:${mode}->${nextMode}`,
              device_type: 'web',
              user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            })
          }}
          className="text-[10px] tracking-[0.22em] text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full uppercase font-black hover:bg-[#D4AF37]/10 transition-colors active:scale-[0.98]"
        >
          MODE {mode === 'client' ? 'CLIENT' : 'TAILLEUR'}
        </button>
        <div className="flex items-center gap-4">
          <button className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors" aria-label="Paramètres">
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all"
            aria-label="Déconnexion"
          >
            <LogOut className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto px-6 space-y-6"
      >
        {/* Header de prestige (compact) */}
        <section className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] p-1 shadow-[0_0_22px_rgba(212,175,55,0.18)]">
              <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-900">
                <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0A0A0A] px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.18em]">
              {mode === 'client' ? 'MEMBRE SIGNARE' : 'ATELIER VÉRIFIÉ'}
            </div>
          </div>

          <h1 className="mt-5 text-2xl font-serif text-[#D4AF37]">{profile.name}</h1>
          <p className="mt-2 text-xs text-white/50 italic line-clamp-2 max-w-[320px]">
            {profile.bio}
          </p>
        </section>

        {mode === 'client' ? (
          <>
            {/* CTA: Discuter (seulement si profil d'un autre client) */}
            {!isOwnProfile && (
              <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
                <button
                  onClick={() => {
                    trackProfileInteraction({
                      user_id: actorUserId,
                      post_id: null,
                      interaction_type: 'click',
                      session_id: sessionId,
                      duration_seconds: null,
                      scroll_depth: null,
                      came_from: `profil:client_message:${profile.name}`,
                      device_type: 'web',
                      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                    })
                    router.push(`/messages?user=${encodeURIComponent(profile.name)}`)
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#D4AF37]/30 text-[#D4AF37] py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] hover:bg-[#D4AF37]/10 transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={18} />
                  Discuter
                </button>
              </section>
            )}

            {/* Mes Mensurations (compact + typé Mesure) */}
            <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Mes mensurations</h2>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      trackProfileInteraction({
                        user_id: actorUserId,
                        post_id: null,
                        interaction_type: 'click',
                        session_id: sessionId,
                        duration_seconds: null,
                        scroll_depth: null,
                        came_from: 'profil:mesures_update',
                        device_type: 'web',
                        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                      })
                      router.push('/atelier')
                    }}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors"
                  >
                    <Ruler className="w-4 h-4" />
                    Mettre à jour
                  </button>
                )}
              </div>

              {isOwnProfile ? (
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { k: 'tour_poitrine', label: 'Poitrine', v: MOCK_CLIENT_PROFILE.latestMesure.tour_poitrine },
                    { k: 'tour_taille', label: 'Taille', v: MOCK_CLIENT_PROFILE.latestMesure.tour_taille },
                    { k: 'tour_hanches', label: 'Hanches', v: MOCK_CLIENT_PROFILE.latestMesure.tour_hanches },
                    { k: 'longueur_bras', label: 'Bras', v: MOCK_CLIENT_PROFILE.latestMesure.longueur_bras },
                  ] as const).map((m) => (
                    <div key={m.k} className="bg-white/[0.03] border border-[#D4AF37]/10 rounded-lg px-3 py-3 flex items-center justify-between">
                      <span className="text-[11px] text-white/40">{m.label}</span>
                      <span className="text-sm font-bold text-[#D4AF37]">{m.v} cm</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    Mensurations privées
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Seul le propriétaire du profil peut consulter ses mesures.
                  </p>
                </div>
              )}
            </section>

            {/* Patrimoine Style (compact) */}
            <section className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-xl p-4 border-l-2 border-[#D4AF37]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black">Patrimoine style</p>
                  <p className="text-xl font-serif text-white">{MOCK_CLIENT_PROFILE.outfitCount} tenues enregistrées</p>
                </div>
                <Award className="w-8 h-8 text-[#D4AF37]/40" />
              </div>
            </section>

            {/* Galerie compacte */}
            <section>
              <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase mb-3">Galerie</h2>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      trackProfileInteraction({
                        user_id: actorUserId,
                        post_id: null,
                        interaction_type: 'click',
                        session_id: sessionId,
                        duration_seconds: null,
                        scroll_depth: null,
                        came_from: `profil:gallery_open:${img.id}`,
                        device_type: 'web',
                        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                      })
                    }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <Image src={img.src} alt="Tenue" fill className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* CTA : Démarrer une discussion */}
            <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
              <button
                onClick={() => {
                  trackProfileInteraction({
                    user_id: actorUserId,
                    post_id: null,
                    interaction_type: 'click',
                    session_id: sessionId,
                    duration_seconds: null,
                    scroll_depth: null,
                    came_from: `profil:tailor_message:${profile.name}`,
                    device_type: 'web',
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                  })
                  router.push(`/messages?tailor=${encodeURIComponent(profile.name)}`)
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#D4AF37]/30 text-[#D4AF37] py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] hover:bg-[#D4AF37]/10 transition-all active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                Lancer la discussion
              </button>
            </section>

            {/* CTA : Voir les commandes (tailleur) */}
            <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
              <button
                onClick={() => {
                  trackProfileInteraction({
                    user_id: actorUserId,
                    post_id: null,
                    interaction_type: 'click',
                    session_id: sessionId,
                    duration_seconds: null,
                    scroll_depth: null,
                    came_from: 'profil:tailor_orders',
                    device_type: 'web',
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                  })
                  router.push('/orders')
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] shadow-[0_0_14px_rgba(212,175,55,0.25)] active:scale-[0.98] transition-all"
              >
                <Package size={18} />
                Mes commandes
              </button>
            </section>

            {/* Stats Atelier (compact) */}
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-[#D4AF37] text-[#0A0A0A] rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-80">Commandes</p>
                <p className="mt-1 text-2xl font-black">{MOCK_TAILOR_PROFILE.activeOrders}</p>
              </div>
              <div className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Revenus</p>
                <p className="mt-1 text-lg font-serif text-[#D4AF37]">{MOCK_TAILOR_PROFILE.monthlyRevenue}</p>
              </div>
            </section>

            {/* Rating + badge */}
            <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black flex items-center gap-2">
                  <Scissors size={14} /> Maître Tailleur
                </p>
                <p className="text-xs text-white/50">Qualité basée sur avis & réactivité</p>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={MOCK_TAILOR_PROFILE.rating} />
                <span className="text-sm font-bold text-[#D4AF37]">{MOCK_TAILOR_PROFILE.rating.toFixed(1)}</span>
              </div>
            </section>

            {/* Créations (galerie compacte) */}
            <section>
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Créations</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                  {MOCK_TAILOR_PROFILE.creationsCount} pièces
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      trackProfileInteraction({
                        user_id: currentUserId,
                        post_id: null,
                        interaction_type: 'click',
                        session_id: sessionId,
                        duration_seconds: null,
                        scroll_depth: null,
                        came_from: `profil:tailor_creation_open:${img.id}`,
                        device_type: 'web',
                        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                      })
                    }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <Image src={img.src} alt="Création" fill className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </motion.div>
    </div>
  )
}
