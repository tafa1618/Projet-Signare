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
  Package,
  Bike,
  Store,
  Upload,
  UserPlus,
  Camera,
  Heart,
  Eye,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar,
  Shield,
  Zap,
  Medal,
  Briefcase,
  Building2
} from 'lucide-react'
import type { Database, Mesure } from '@/shared/types/database.types'
import { cn } from '@/shared/lib/utils'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking d'interactions Profil (ML Ready)
 * @ai-context Les vues de profil et clics sur mensurations/galerie alimentent le dataset de recommandation.
 */
import { logMLInteraction } from '@/lib/logger'
import { useAuth } from '@/frontend/hooks/useAuth'

function trackProfileInteraction(payload: UserInteractionInsert) {
  // TODO: brancher vers Supabase quand l'auth est active.
  // ✅ Utilisation du logger sécurisé
  logMLInteraction(payload)
}

type ClientProfile = {
  id: string
  name: string
  avatar: string
  coverImage?: string
  bio: string
  outfitCount: number
  followersCount: number
  followingCount: number
  postsCount: number
  latestMesure: Mesure
}

// Profils mockés basés sur les numéros de téléphone
const MOCK_CLIENT_PROFILE: ClientProfile = {
  id: 'client-771111111',
  name: 'Aminata Ndiaye',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
  coverImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=400&fit=crop',
  bio: "Inspirée par l'élégance traditionnelle du Sénégal. J'aime les coupes nettes, le wax premium et les finitions couture.",
  outfitCount: 13,
  followersCount: 1247,
  followingCount: 89,
  postsCount: 87,
  latestMesure: {
    id: 'm-1',
    user_id: 'client-771111111',
    client_name: 'Aminata Ndiaye',
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
  coverImage?: string
  bio: string
  rating: number
  activeOrders: number
  monthlyRevenue: string
  creationsCount: number
  followersCount: number
  followingCount: number
  postsCount: number
  // Nouvelles propriétés pour l'atelier virtuel
  experienceYears: number
  specialties: string[]
  location: string
  workshopPhotos?: string[]
  certifications?: string[]
  workingHours: string
  responseTime: string
  satisfactionRate: number
  averageDeliveryDays: number
  totalClients: number
  completedOrders: number
  about: string
}

const MOCK_TAILOR_PROFILE: TailorProfile = {
  id: 'tailor-772222222',
  name: 'Tapha Tailleur',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tapha',
  coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop',
  bio: 'Maître Tailleur — Spécialiste boubous de cérémonie & finitions couture.',
  rating: 4.9,
  activeOrders: 8,
  monthlyRevenue: '1.2M FCFA',
  creationsCount: 24,
  followersCount: 3421,
  followingCount: 156,
  postsCount: 124,
  experienceYears: 12,
  specialties: ['Boubou de cérémonie', 'Broderie perlé', 'Kaftan luxe', 'Ensemble traditionnel'],
  location: 'Dakar, Plateau',
  workshopPhotos: [
    'https://images.unsplash.com/photo-1585128792330-5b0c0b0b5b0b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1585128792330-5b0c0b0b5b0b?w=400&h=300&fit=crop',
  ],
  certifications: ['Maître Artisan', 'Formation École de Mode Dakar'],
  workingHours: 'Lun - Sam, 9h - 19h',
  responseTime: '< 2 heures',
  satisfactionRate: 98,
  averageDeliveryDays: 7,
  totalClients: 342,
  completedOrders: 1247,
  about: 'Atelier familial depuis 3 générations. Spécialisé dans la haute couture sénégalaise avec une attention particulière aux finitions et aux détails. Chaque pièce est créée avec passion et respect des traditions.',
}

const MOCK_TAILOR_ORDERS = [
  {
    id: 'ord-101',
    client: 'Fatou Dia',
    model: 'Boubou perlé Soirée',
    status: 'En cours',
    measures: { poitrine: 92, taille: 68, hanches: 98 },
  },
  {
    id: 'ord-102',
    client: 'Aïssatou Ndiaye',
    model: 'Grand boubou brodé',
    status: 'À livrer',
    measures: { poitrine: 96, taille: 72, hanches: 104 },
  },
  {
    id: 'ord-103',
    client: 'Mame Diarra',
    model: 'Kaftan soie',
    status: 'Patronage',
    measures: { poitrine: 88, taille: 66, hanches: 94 },
  },
]

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

// Mapping des numéros de téléphone vers les profils
const PHONE_TO_PROFILE: Record<string, { type: ProfileMode; profileId: string }> = {
  '+771111111': { type: 'client', profileId: 'client-771111111' },
  '771111111': { type: 'client', profileId: 'client-771111111' },
  '+772222222': { type: 'tailleur', profileId: 'tailor-772222222' },
  '772222222': { type: 'tailleur', profileId: 'tailor-772222222' },
}

export default function ProfilPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const sessionId = 'session-demo'
  const [profileOverride, setProfileOverride] = useState<{ name: string; avatar: string; id: string } | null>(null)
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null)

  // Détecter le type d'utilisateur basé sur le numéro de téléphone connecté
  const currentUserPhone = user?.phone || user?.user_metadata?.phone || null
  const userProfileInfo = currentUserPhone ? PHONE_TO_PROFILE[currentUserPhone] : null
  const mode: ProfileMode = userProfileInfo?.type || 'client'
  const actorUserId = userProfileInfo?.profileId || MOCK_CLIENT_PROFILE.id

  const profile = mode === 'client'
    ? {
        ...MOCK_CLIENT_PROFILE,
        id: profileOverride?.id ?? MOCK_CLIENT_PROFILE.id,
        name: profileOverride?.name ?? MOCK_CLIENT_PROFILE.name,
        avatar: profileOverride?.avatar ?? MOCK_CLIENT_PROFILE.avatar,
        coverImage: MOCK_CLIENT_PROFILE.coverImage,
        followersCount: MOCK_CLIENT_PROFILE.followersCount,
        followingCount: MOCK_CLIENT_PROFILE.followingCount,
        postsCount: MOCK_CLIENT_PROFILE.postsCount,
      }
    : {
        ...MOCK_TAILOR_PROFILE,
        id: profileOverride?.id ?? MOCK_TAILOR_PROFILE.id,
        name: profileOverride?.name ?? MOCK_TAILOR_PROFILE.name,
        avatar: profileOverride?.avatar ?? MOCK_TAILOR_PROFILE.avatar,
        coverImage: MOCK_TAILOR_PROFILE.coverImage,
        followersCount: MOCK_TAILOR_PROFILE.followersCount,
        followingCount: MOCK_TAILOR_PROFILE.followingCount,
        postsCount: MOCK_TAILOR_PROFILE.postsCount,
      }

  const isOwnProfile = profile.id === actorUserId

  const gallery = useMemo(() => (
    Array.from({ length: 9 }).map((_, i) => ({
      id: `g-${i + 1}`,
      src: `https://images.unsplash.com/photo-15${i + 1}5372039744-b8f02a3ae446?w=400&h=400&fit=crop`,
    }))
  ), [])

  useEffect(() => {
    // Support pour consulter d'autres profils via URL (optionnel)
    const urlTailor = searchParams.get('tailor')
    const urlClient = searchParams.get('client')

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

  const simulateDeliveryQuote = async () => {
    try {
      setDeliveryStatus('Calcul en cours...')
      // Simulation d’appel au micro-service delivery_engine
      const payload = {
        distance_km: 6.2,
        traffic_level: 'medium',
        zone_type: 'dense',
        delivery_datetime: new Date().toISOString(),
      }
      const res = await fetch('http://localhost:8001/api/cost/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Delivery engine indisponible')
      const data = await res.json()
      setDeliveryStatus(`Total: ${data.total_cost.toFixed ? data.total_cost.toFixed(0) : data.total_cost} FCFA (base ${data.base_cost.toFixed ? data.base_cost.toFixed(0) : data.base_cost})`)
      trackProfileInteraction({
        user_id: actorUserId,
        post_id: null,
        interaction_type: 'click',
        session_id: sessionId,
        duration_seconds: null,
        scroll_depth: null,
        came_from: 'profil:tailor_delivery_quote',
        device_type: 'web',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
    } catch (e) {
      setDeliveryStatus('Erreur: impossible de joindre delivery_engine (simu)')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex-1" />
          <div className="flex items-center gap-3 sm:gap-4">
            {isOwnProfile && (
              <button 
                onClick={() => router.push('/settings')}
                className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors" 
                aria-label="Paramètres"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all"
                aria-label="Déconnexion"
              >
                <LogOut className="w-4 h-4 text-[#D4AF37]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto"
      >
        {/* Cover Image + Profile Header (inspiré FriendKit) */}
        <section className="relative">
          {/* Cover Image */}
          <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-[#D4AF37]/20 to-[#0A0A0A] overflow-hidden">
            {profile.coverImage ? (
              <Image 
                src={profile.coverImage} 
                alt={`Couverture ${profile.name}`}
                fill
                className="object-cover opacity-40"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/10 via-[#0A0A0A] to-[#0A0A0A]" />
            )}
            {isOwnProfile && (
              <button
                className="absolute top-3 right-3 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#D4AF37]/30 text-[#D4AF37] p-2 rounded-lg hover:bg-[#D4AF37]/10 transition-all"
                aria-label="Modifier la couverture"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Profile Avatar (centré sur la couverture) */}
          <div className="relative -mt-16 sm:-mt-20 flex flex-col items-center">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#0A0A0A] p-1 shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-[#0A0A0A]">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-900">
                  <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
                </div>
              </div>
              {isOwnProfile && (
                <button
                  className="absolute bottom-0 right-0 bg-[#D4AF37] text-[#0A0A0A] p-2 rounded-full border-2 border-[#0A0A0A] hover:bg-[#D4AF37]/90 transition-all shadow-lg"
                  aria-label="Modifier la photo de profil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Badge */}
            <div className="mt-2 bg-[#D4AF37] text-[#0A0A0A] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em]">
              {mode === 'client' ? 'MEMBRE SIGNARE' : 'ATELIER VÉRIFIÉ'}
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 mt-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#D4AF37] font-bold">{profile.name}</h1>
            <p className="mt-2 text-sm text-white/70 max-w-md mx-auto leading-relaxed">
              {profile.bio}
            </p>
          </div>

          {/* Stats (inspiré FriendKit) */}
          <div className="px-4 sm:px-6 mt-6 flex items-center justify-center gap-6 sm:gap-8 border-t border-[#D4AF37]/10 pt-6">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-serif text-[#D4AF37] font-bold">
                {mode === 'client' 
                  ? (profile as ClientProfile).outfitCount 
                  : (profile as TailorProfile).creationsCount}
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black mt-1">
                {mode === 'client' ? 'Tenues' : 'Créations'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-serif text-[#D4AF37] font-bold">
                {(profile as ClientProfile | TailorProfile).followersCount}
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black mt-1">
                Abonnés
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-serif text-[#D4AF37] font-bold">
                {(profile as ClientProfile | TailorProfile).followingCount}
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black mt-1">
                Abonnements
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 sm:px-6 mt-6 flex items-center gap-3">
            {!isOwnProfile ? (
              <>
                <button
                  onClick={() => {
                    trackProfileInteraction({
                      user_id: actorUserId,
                      post_id: null,
                      interaction_type: 'click',
                      session_id: sessionId,
                      duration_seconds: null,
                      scroll_depth: null,
                      came_from: `profil:follow:${profile.name}`,
                      device_type: 'web',
                      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                    })
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_14px_rgba(212,175,55,0.25)] hover:bg-[#D4AF37]/90 transition-all active:scale-[0.98]"
                >
                  <UserPlus size={18} />
                  Suivre
                </button>
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
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#D4AF37]/30 text-[#D4AF37] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/10 transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={18} />
                  Message
                </button>
              </>
            ) : (
              <>
                {mode === 'tailleur' && (
                  <button
                    onClick={() => {
                      trackProfileInteraction({
                        user_id: actorUserId,
                        post_id: null,
                        interaction_type: 'click',
                        session_id: sessionId,
                        duration_seconds: null,
                        scroll_depth: null,
                        came_from: 'profil:tailleur_add_product',
                        device_type: 'web',
                        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                      })
                      router.push('/shop/publish?type=tailleur')
                    }}
                    className="flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] px-4 py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_14px_rgba(212,175,55,0.25)] hover:bg-[#D4AF37]/90 transition-all active:scale-[0.98]"
                  >
                    <Plus size={18} />
                    Ajouter un article
                  </button>
                )}
                <button
                  onClick={() => router.push('/settings')}
                  className={cn(
                    "flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#D4AF37]/30 text-[#D4AF37] py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/10 transition-all active:scale-[0.98]",
                    mode === 'tailleur' ? "flex-1" : "w-full"
                  )}
                >
                  <Settings size={18} />
                  Modifier le profil
                </button>
              </>
            )}
          </div>
        </section>

        <div className="px-4 sm:px-6 mt-8 space-y-6">

        {mode === 'client' ? (
          <>

            {/* Mes Mensurations (compact + typé Mesure) - Uniquement si c'est mon profil */}
            {isOwnProfile && (
              <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Mes mensurations</h2>
                  </div>
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
                </div>

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
              </section>
            )}

            {/* Patrimoine Style (compact) */}
            <section className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-xl p-4 sm:p-5 border-l-2 border-[#D4AF37]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black">Patrimoine style</p>
                  <p className="text-xl sm:text-2xl font-serif text-white mt-1">{MOCK_CLIENT_PROFILE.outfitCount} tenues enregistrées</p>
                </div>
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37]/40" />
              </div>
            </section>

            {/* Galerie compacte */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm sm:text-base font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Galerie</h2>
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">
                  {gallery.length} photos
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-[#D4AF37]/40 transition-all group"
                  >
                    <Image src={img.src} alt="Tenue" fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Stats Atelier Premium - En haut pour tailleur */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#D4AF37] text-[#0A0A0A] rounded-xl p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-80">Commandes</p>
                <p className="mt-1 text-2xl font-black">{MOCK_TAILOR_PROFILE.activeOrders}</p>
              </div>
              <div className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Clients</p>
                <p className="mt-1 text-xl font-serif text-[#D4AF37]">{MOCK_TAILOR_PROFILE.totalClients || 342}</p>
              </div>
              <div className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Satisfaction</p>
                <p className="mt-1 text-xl font-serif text-[#D4AF37]">{MOCK_TAILOR_PROFILE.satisfactionRate || 98}%</p>
              </div>
              <div className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Note</p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <StarRating rating={MOCK_TAILOR_PROFILE.rating} />
                  <span className="text-sm font-bold text-[#D4AF37] ml-1">{MOCK_TAILOR_PROFILE.rating.toFixed(1)}</span>
                </div>
              </div>
            </section>

            {/* Badge Maître Tailleur + Expérience */}
            <section className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-2 border-[#D4AF37] rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="bg-[#D4AF37] p-3 rounded-xl">
                  <Medal className="w-6 h-6 text-[#0A0A0A]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-serif text-[#D4AF37] font-bold">Maître Tailleur</p>
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <p className="text-xs text-white/70 mb-2">{MOCK_TAILOR_PROFILE.experienceYears || 12} ans d'expérience • {MOCK_TAILOR_PROFILE.completedOrders || 1247} commandes réalisées</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MOCK_TAILOR_PROFILE.certifications?.map((cert, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] font-black uppercase tracking-[0.12em]">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* À propos de l'atelier */}
            <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">À propos de l'atelier</h3>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                {MOCK_TAILOR_PROFILE.about || 'Atelier familial depuis 3 générations. Spécialisé dans la haute couture sénégalaise avec une attention particulière aux finitions et aux détails. Chaque pièce est créée avec passion et respect des traditions.'}
              </p>
              
              {/* Spécialités */}
              <div className="mt-4 pt-4 border-t border-[#D4AF37]/10">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black mb-2">Spécialités</p>
                <div className="flex flex-wrap gap-2">
                  {MOCK_TAILOR_PROFILE.specialties?.map((specialty, idx) => (
                    <span key={idx} className="text-[11px] px-3 py-1.5 bg-white/5 border border-[#D4AF37]/20 rounded-lg text-white/90 font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Informations pratiques */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Localisation */}
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black">Localisation</p>
                </div>
                <p className="text-sm text-white/90">{MOCK_TAILOR_PROFILE.location || 'Dakar, Plateau'}</p>
              </div>

              {/* Horaires */}
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black">Horaires</p>
                </div>
                <p className="text-sm text-white/90">{MOCK_TAILOR_PROFILE.workingHours || 'Lun - Sam, 9h - 19h'}</p>
              </div>

              {/* Réactivité */}
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black">Réactivité</p>
                </div>
                <p className="text-sm text-white/90">{MOCK_TAILOR_PROFILE.responseTime || '< 2 heures'}</p>
              </div>

              {/* Délai moyen */}
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black">Délai moyen</p>
                </div>
                <p className="text-sm text-white/90">{MOCK_TAILOR_PROFILE.averageDeliveryDays || 7} jours</p>
              </div>
            </section>

            {/* Photos de l'atelier */}
            {MOCK_TAILOR_PROFILE.workshopPhotos && MOCK_TAILOR_PROFILE.workshopPhotos.length > 0 && (
              <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Visite de l'atelier</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {MOCK_TAILOR_PROFILE.workshopPhotos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#D4AF37]/20">
                      <Image src={photo} alt={`Atelier ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Badges de qualité */}
            <section className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.02] border border-[#D4AF37]/20 rounded-lg p-3 text-center">
                <Shield className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-black">Garantie</p>
                <p className="text-[10px] text-[#D4AF37] font-bold mt-0.5">Qualité</p>
              </div>
              <div className="bg-white/[0.02] border border-[#D4AF37]/20 rounded-lg p-3 text-center">
                <Zap className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-black">Réactivité</p>
                <p className="text-[10px] text-[#D4AF37] font-bold mt-0.5">Rapide</p>
              </div>
              <div className="bg-white/[0.02] border border-[#D4AF37]/20 rounded-lg p-3 text-center">
                <TrendingUp className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-black">Performance</p>
                <p className="text-[10px] text-[#D4AF37] font-bold mt-0.5">Top</p>
              </div>
            </section>

            {/* Commandes atelier : accès direct + aperçu détaillé */}
            <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black">Commandes actives</p>
                  <p className="text-xs text-white/60">{MOCK_TAILOR_PROFILE.activeOrders} en cours • {MOCK_TAILOR_PROFILE.completedOrders || 1247} réalisées</p>
                </div>
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
                  className="flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0A] px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.18em] shadow-[0_0_14px_rgba(212,175,55,0.25)] active:scale-[0.98] transition-all"
                >
                  <Package size={16} />
                  Voir tout
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {MOCK_TAILOR_ORDERS.map((order) => (
                  <div
                    key={order.id}
                    className="border border-[#D4AF37]/20 rounded-xl p-3 bg-white/[0.02] hover:border-[#D4AF37]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-[#D4AF37] uppercase tracking-[0.18em] font-black">{order.client}</p>
                        <p className="text-sm text-white mt-0.5">{order.model}</p>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] font-black uppercase tracking-[0.18em]">
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-white/70">
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3 h-3 text-[#D4AF37]" />
                        {order.measures.poitrine} / {order.measures.taille} / {order.measures.hanches} cm
                      </span>
                      <span className="text-white/30">Poitrine / Taille / Hanches</span>
                    </div>
                    <button
                      onClick={() => {
                        trackProfileInteraction({
                          user_id: actorUserId,
                          post_id: null,
                          interaction_type: 'click',
                          session_id: sessionId,
                          duration_seconds: null,
                          scroll_depth: null,
                          came_from: `profil:tailor_order_open:${order.id}`,
                          device_type: 'web',
                          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                        })
                        router.push(`/order/${order.id}`)
                      }}
                      className="mt-3 w-full text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg px-3 py-2 hover:bg-[#D4AF37]/10 transition-all active:scale-[0.99]"
                    >
                      Ouvrir la commande
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Témoignages clients */}
            <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Témoignages clients</h3>
                </div>
                <span className="text-[10px] text-white/50">4.9/5 • 342 avis</span>
              </div>
              
              <div className="space-y-3">
                {[
                  {
                    client: 'Aminata Diallo',
                    rating: 5,
                    comment: 'Travail exceptionnel ! Mon boubou de mariage était parfait, les finitions sont impeccables. Je recommande vivement.',
                    date: 'Il y a 2 semaines',
                  },
                  {
                    client: 'Moussa Ndiaye',
                    rating: 5,
                    comment: 'Professionnel et réactif. Le délai a été respecté et la qualité est au rendez-vous. Un vrai maître artisan.',
                    date: 'Il y a 1 mois',
                  },
                  {
                    client: 'Fatou Sarr',
                    rating: 5,
                    comment: 'Service client au top, conseils personnalisés. Le résultat dépasse mes attentes. Merci !',
                    date: 'Il y a 3 semaines',
                  },
                ].map((testimonial, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-[#D4AF37]/10 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-white">{testimonial.client}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              className={s <= testimonial.rating ? "fill-current text-[#D4AF37]" : "text-white/20"}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-white/40">{testimonial.date}</span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">{testimonial.comment}</p>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  trackProfileInteraction({
                    user_id: actorUserId,
                    post_id: null,
                    interaction_type: 'click',
                    session_id: sessionId,
                    duration_seconds: null,
                    scroll_depth: null,
                    came_from: 'profil:tailor_reviews',
                    device_type: 'web',
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                  })
                }}
                className="w-full text-center text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.2em] py-2 border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/10 transition-all"
              >
                Voir tous les avis (342)
              </button>
            </section>

            {/* CTA : Livrer (simulation delivery_engine) */}
            <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.22em] font-black">Livraison express</p>
                {deliveryStatus && (
                  <span className="text-[11px] text-white/70">{deliveryStatus}</span>
                )}
              </div>
              <button
                onClick={simulateDeliveryQuote}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] shadow-[0_0_14px_rgba(212,175,55,0.25)] active:scale-[0.98] transition-all"
              >
                <Bike size={18} />
                Livrer (simu API)
              </button>
            </section>


            {/* Processus de travail */}
            <section className="bg-gradient-to-br from-[#D4AF37]/5 to-transparent border border-[#D4AF37]/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Notre processus</h3>
              </div>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Consultation', desc: 'Échange sur vos besoins et préférences' },
                  { step: '2', title: 'Prise de mesures', desc: 'Mesures précises via notre système' },
                  { step: '3', title: 'Patronage', desc: 'Création du patron sur-mesure' },
                  { step: '4', title: 'Confection', desc: 'Réalisation avec matériaux premium' },
                  { step: '5', title: 'Finitions', desc: 'Détails et ajustements parfaits' },
                  { step: '6', title: 'Livraison', desc: 'Remise en main propre ou livraison express' },
                ].map((process) => (
                  <div key={process.step} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center text-[10px] font-black">
                      {process.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{process.title}</p>
                      <p className="text-[11px] text-white/60 mt-0.5">{process.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Créations (galerie compacte) */}
            <section>
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Portfolio</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                  {MOCK_TAILOR_PROFILE.creationsCount} pièces
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((img) => (
                  <div key={img.id} className="relative group">
                    <button
                      onClick={() => {
                        trackProfileInteraction({
                          user_id: actorUserId,
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
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-[#D4AF37]/40 transition-colors w-full"
                    >
                      <Image src={img.src} alt="Création" fill className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        trackProfileInteraction({
                          user_id: actorUserId,
                          post_id: null,
                          interaction_type: 'click',
                          session_id: sessionId,
                          duration_seconds: null,
                          scroll_depth: null,
                          came_from: `profil:tailor_publish_to_shop:${img.id}`,
                          device_type: 'web',
                          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                        })
                        router.push(`/shop/publish?image=${encodeURIComponent(img.src)}&type=tailleur`)
                      }}
                      className="absolute bottom-1.5 right-1.5 bg-[#D4AF37] text-[#0A0A0A] p-1.5 rounded-lg shadow-[0_0_12px_rgba(212,175,55,0.5)] opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Publier sur le shop"
                    >
                      <Store size={12} />
                    </motion.button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
        </div>
      </motion.div>
    </div>
  )
}
