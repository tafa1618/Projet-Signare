'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft,
  MapPin,
  Ruler,
  Sparkles,
  Scissors,
  Truck,
  LockKeyhole,
  Check,
} from 'lucide-react'
import type { Database, Order } from '@/shared/types/database.types'
import { cn } from '@/shared/lib/utils'
import { logMLInteraction } from '@/lib/logger'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking - Commander ce modèle
 * @ai-context Capture l'intention d'achat (conversion) et les préférences logistiques.
 */
function trackOrderInteraction(payload: UserInteractionInsert) {
  // TODO: connecter à Supabase quand auth active (insert user_interactions).
  // ✅ Utilisation du logger sécurisé
  logMLInteraction(payload)
}

type OrderProduct = {
  id: string
  title: string
  image: string
  sellerId: string
  sellerName: string
  productPrice: number
  estimatedHours?: number | null
}

const MOCK_ORDER_PRODUCTS: Record<string, OrderProduct> = {
  '1': {
    id: '1',
    title: 'Boubou Royale • Or & Basin',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=1600&fit=crop',
    sellerId: 't1',
    sellerName: 'Atelier Fatou',
    productPrice: 125000,
    estimatedHours: 40,
  },
  '2': {
    id: '2',
    title: 'Robe Wax • Mariage',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=1600&fit=crop',
    sellerId: 't2',
    sellerName: 'Maison Ndèye',
    productPrice: 75000,
    estimatedHours: 18,
  },
  '3': {
    id: '3',
    title: 'Ensemble Tailleur • Lin & Wax',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=1600&fit=crop',
    sellerId: 't3',
    sellerName: 'Couture Aminata',
    productPrice: 55000,
    estimatedHours: 12,
  },
  '4': {
    id: '4',
    title: 'Kaftan de Soirée • Signature',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=1600&fit=crop',
    sellerId: 't1',
    sellerName: 'Atelier Fatou',
    productPrice: 98000,
    estimatedHours: 22,
  },
}

type LatLng = { lat: number; lng: number }
type LocationOption = LatLng & { id: string; label: string }

// Localisations simulées (pour démo avant implémentation réelle)
const MOCK_CLIENT_LOCATIONS: LocationOption[] = [
  { id: 'plateau', label: 'Plateau (Dakar)', lat: 14.6706, lng: -17.4380 },
  { id: 'point-e', label: 'Point E (Dakar)', lat: 14.6946, lng: -17.4646 },
  { id: 'almadies', label: 'Almadies (Dakar)', lat: 14.7454, lng: -17.5256 },
]

const MOCK_TAILOR_LOCATIONS: Record<string, LocationOption> = {
  t1: { id: 't1', label: 'Atelier Fatou', lat: 14.7167, lng: -17.4677 }, // Liberté 6 (approx)
  t2: { id: 't2', label: 'Maison Ndèye', lat: 14.6928, lng: -17.4467 }, // Dakar centre (approx)
  t3: { id: 't3', label: 'Couture Aminata', lat: 14.7204, lng: -17.4472 }, // Sacré-Cœur (approx)
}

function formatFCFA(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} FCFA`
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Distance Haversine (km)
 * @ai-context Approximation suffisante pour estimer les frais de livraison (simulation).
 */
function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng

  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Calcul livraison SIGNARE (modèle Yango)
 * @ai-context Règle business stable : base 500 + 100/km + service 15% inclus.
 */
function computeShipping(distanceKm: number) {
  const base = 500
  const perKm = 100
  const km = clampNumber(distanceKm, 0, 200)
  const shipping = base + km * perKm
  return Math.round(shipping)
}

function computeTotal(productPrice: number, shipping: number) {
  const serviceFeeRate = 0.15
  // service inclus dans le prix final
  const subtotal = productPrice + shipping
  return Math.round(subtotal * (1 + serviceFeeRate))
}

export default function OrderPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  const product = MOCK_ORDER_PRODUCTS[id] ?? null

  const currentUserId = 'current-user-id'
  const sessionId = 'session-demo'

  const [distanceMode, setDistanceMode] = useState<'simulated' | 'manual'>('simulated')
  const [clientLocationId, setClientLocationId] = useState<string>('point-e')
  const [autoPosition, setAutoPosition] = useState<LatLng | null>(null)
  const [autoStatus, setAutoStatus] = useState<string | null>(null)
  const [deliveryEngineQuote, setDeliveryEngineQuote] = useState<{ distance: number; cost: number } | null>(null)
  const [manualDistanceKm, setManualDistanceKm] = useState<number>(3)
  const [useMyMeasurements, setUseMyMeasurements] = useState(true)
  const [note, setNote] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const clientLocation = useMemo(
    () => MOCK_CLIENT_LOCATIONS.find((l) => l.id === clientLocationId) ?? MOCK_CLIENT_LOCATIONS[0],
    [clientLocationId]
  )

  const tailorLocation = useMemo(() => {
    if (!product) return null
    return MOCK_TAILOR_LOCATIONS[product.sellerId] ?? null
  }, [product])

  const computedDistanceKm = useMemo(() => {
    if (!product) return manualDistanceKm
    if (deliveryEngineQuote) return clampNumber(deliveryEngineQuote.distance, 0, 200)
    if (distanceMode === 'manual') return clampNumber(manualDistanceKm, 0, 200)
    if (!tailorLocation) return clampNumber(manualDistanceKm, 0, 200)
    const km = haversineKm(clientLocation, tailorLocation)
    // arrondi 0.1 km pour UI
    return clampNumber(Math.round(km * 10) / 10, 0, 200)
  }, [clientLocation, deliveryEngineQuote, distanceMode, manualDistanceKm, product, tailorLocation])

  const shippingPrice = useMemo(() => {
    if (deliveryEngineQuote) return Math.round(deliveryEngineQuote.cost)
    return computeShipping(computedDistanceKm)
  }, [computedDistanceKm, deliveryEngineQuote])
  const totalPrice = useMemo(() => {
    if (!product) return 0
    return computeTotal(product.productPrice, shippingPrice)
  }, [product, shippingPrice])

  useEffect(() => {
    // @ai-context Vue page commande = intention forte (score 2)
    trackOrderInteraction({
      user_id: currentUserId,
      post_id: product ? String(product.id) : null,
      interaction_type: 'view',
      session_id: sessionId,
      duration_seconds: null,
      scroll_depth: null,
      came_from: 'order:order_view:score2',
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  }, [product])

  const hasLocation =
    distanceMode === 'manual'
      ? true
      : Boolean(autoPosition || deliveryEngineQuote)

  const canSubmit = Boolean(product && hasLocation)

  const fetchDeliveryEngineQuote = async (origin: LatLng, destination: LatLng) => {
    try {
      setAutoStatus('Calcul via delivery_engine…')
      const body = {
        current_position: { lat: origin.lat, lng: origin.lng },
        candidate_position: { lat: destination.lat, lng: destination.lng },
        traffic_level: 'medium',
        zone_type: 'dense',
      }
      const res = await fetch('http://localhost:8001/api/route/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('delivery_engine indisponible')
      const data = await res.json()
      setDeliveryEngineQuote({ distance: data.distance_km, cost: data.estimated_cost })
      setAutoStatus(`Distance ${data.distance_km.toFixed(1)} km • ${Math.round(data.estimated_cost).toLocaleString('fr-FR')} FCFA`)
      trackOrderInteraction({
        user_id: currentUserId,
        post_id: product ? String(product.id) : null,
        interaction_type: 'click',
        session_id: sessionId,
        duration_seconds: null,
        scroll_depth: null,
        came_from: 'order:distance:auto:delivery_engine',
        device_type: 'web',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
    } catch (e) {
      setAutoStatus('Échec API delivery_engine (mode simulé)')
      setDeliveryEngineQuote(null)
    }
  }

  const fetchIpFallback = async () => {
    try {
      setAutoStatus('Localisation réseau…')
      const res = await fetch('https://ipapi.co/json/')
      if (!res.ok) throw new Error('ipapi.co indisponible')
      const data = await res.json()
      if (data?.latitude && data?.longitude) {
        const coords = { lat: data.latitude, lng: data.longitude }
        setAutoPosition(coords)
        return coords
      }
    } catch (e) {
      setAutoStatus('Localisation refusée (fallback réseau indisponible)')
    }
    return null
  }

  const handleAutoLocate = () => {
    if (!tailorLocation) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setAutoStatus('Localisation non supportée (navigateur)')
      return
    }
    if (
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      setAutoStatus('Activer HTTPS ou utiliser localhost pour le GPS')
      return
    }

    setAutoStatus('Localisation…')
    setDeliveryEngineQuote(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setAutoPosition(coords)
        setClientLocationId('auto')
        setAutoStatus('Position détectée')
        fetchDeliveryEngineQuote(coords, tailorLocation)
      },
      async () => {
        setAutoStatus('Localisation refusée, tentative réseau…')
        setAutoPosition(null)
        const fallback = await fetchIpFallback()
        if (fallback && tailorLocation) {
          setAutoStatus('Position approx. (IP)')
          fetchDeliveryEngineQuote(fallback, tailorLocation)
        } else {
          setAutoStatus('Utiliser sélection simulée')
        }
      },
      { enableHighAccuracy: true, timeout: 6000 }
    )
  }

  const handleSubmit = async () => {
    if (!product || !canSubmit) return

    setIsPlacing(true)
    trackOrderInteraction({
      user_id: currentUserId,
      post_id: String(product.id),
      interaction_type: 'click',
      session_id: sessionId,
      duration_seconds: null,
      scroll_depth: null,
      came_from: 'order:submit',
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })

    // Simulation d'un Order conforme aux types
    const resolvedCoords = autoPosition ?? clientLocation
    const resolvedAddress =
      (autoPosition && 'Position GPS détectée') ||
      clientLocation.label

    const orderDraft: Partial<Order> = {
      buyer_id: currentUserId,
      seller_id: product.sellerId,
      post_id: String(product.id),
      mesure_id: useMyMeasurements ? 'mesure-latest' : null,
      product_price: product.productPrice,
      shipping_price: shippingPrice,
      total_price: totalPrice,
      delivery_latitude: resolvedCoords.lat,
      delivery_longitude: resolvedCoords.lng,
      delivery_address: resolvedAddress,
      distance_km: computedDistanceKm,
      validation_code: '000000',
      estimated_delivery_date: null,
      actual_delivery_date: null,
      preparation_time_hours: product.estimatedHours ?? null,
      status: 'pending',
      buyer_rating: null,
      seller_rating: null,
      quality_rating: null,
      delivery_rating: null,
      feedback_text: note || null,
      created_at: new Date().toISOString(),
      delivered_at: null,
    }

    console.log('[ORDER] draft', orderDraft)

    await new Promise((r) => setTimeout(r, 1200))
    setIsPlacing(false)
    setShowSuccess(true)

    setTimeout(() => {
      router.push(`/messages?tailor=${encodeURIComponent(product.sellerName)}`)
    }, 1400)
  }

  if (!product) {
    return (
      <div className="bg-[#0A0A0A] text-white h-[calc(100dvh-80px)] -mb-24 flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-sm font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Modèle introuvable</p>
          <button
            onClick={() => router.push('/')}
            className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors"
          >
            Retour au feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0A0A0A] text-white h-[calc(100dvh-80px)] -mb-24 overflow-hidden">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors"
          aria-label="Retour"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-sm font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Commander</h1>
        <div className="w-8" />
      </header>

      <div className="h-full overflow-y-auto pb-36">
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg mx-auto px-4 pt-4 space-y-4"
        >
          {/* Aperçu modèle (compact) */}
          <section className="max-w-lg mx-auto">
            <div className="flex gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-3">
              <div className="relative w-20 aspect-[4/5] rounded-xl overflow-hidden border border-[#D4AF37]/20 flex-shrink-0">
                <Image src={product.image} alt={product.title} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                  Modèle sélectionné
                </p>
                <p className="mt-1 text-sm font-semibold text-white/90 truncate">{product.title}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <Link
                    href={`/profil?mode=tailleur&tailor=${encodeURIComponent(product.sellerName)}`}
                    className="text-[11px] text-[#D4AF37]/90 hover:text-[#D4AF37] underline-offset-4 hover:underline truncate"
                  >
                    {product.sellerName}
                  </Link>
                  <p className="text-sm font-serif text-[#D4AF37] flex-shrink-0">{formatFCFA(product.productPrice)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Livraison */}
          <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#D4AF37]" />
              <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Livraison</h2>
            </div>

            <div className="mt-3 space-y-3">
              {/* Distance (simulation avant implémentation réelle) */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-[#D4AF37]/80" />
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                      Distance (km)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDistanceMode('simulated')
                        trackOrderInteraction({
                          user_id: currentUserId,
                          post_id: product ? String(product.id) : null,
                          interaction_type: 'click',
                          session_id: sessionId,
                          duration_seconds: null,
                          scroll_depth: null,
                          came_from: 'order:distance_mode:simulated',
                          device_type: 'web',
                          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                        })
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.22em] border transition-all",
                        distanceMode === 'simulated'
                          ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]"
                          : "bg-transparent text-white/60 border-white/10 hover:border-[#D4AF37]/30"
                      )}
                    >
                      Auto (GPS)
                    </button>
                    <button
                      onClick={() => {
                        setDistanceMode('manual')
                        trackOrderInteraction({
                          user_id: currentUserId,
                          post_id: product ? String(product.id) : null,
                          interaction_type: 'click',
                          session_id: sessionId,
                          duration_seconds: null,
                          scroll_depth: null,
                          came_from: 'order:distance_mode:manual',
                          device_type: 'web',
                          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                        })
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.22em] border transition-all",
                        distanceMode === 'manual'
                          ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]"
                          : "bg-transparent text-white/60 border-white/10 hover:border-[#D4AF37]/30"
                      )}
                    >
                      Manuel
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  {distanceMode === 'simulated' ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                            Localisation client
                          </span>
                          {autoStatus && (
                            <span className="text-[11px] text-white/60">{autoStatus}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl px-4 py-3">
                          <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                            Atelier (prérempli)
                          </span>
                          <span className="text-sm font-serif text-[#D4AF37]">
                            {tailorLocation ? tailorLocation.label : '—'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAutoLocate}
                            className="flex-1 bg-[#D4AF37] text-[#0A0A0A] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] shadow-[0_0_14px_rgba(212,175,55,0.25)] active:scale-[0.98] transition-all"
                          >
                            Récupérer ma position
                          </button>
                          <select
                            value={clientLocationId}
                            onChange={(e) => {
                              setClientLocationId(e.target.value)
                              setAutoPosition(null)
                              setDeliveryEngineQuote(null)
                              setAutoStatus('Position simulée')
                              trackOrderInteraction({
                                user_id: currentUserId,
                                post_id: product ? String(product.id) : null,
                                interaction_type: 'click',
                                session_id: sessionId,
                                duration_seconds: null,
                                scroll_depth: null,
                                came_from: `order:client_location:${e.target.value}`,
                                device_type: 'web',
                                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                              })
                              if (tailorLocation) {
                                const selected =
                                  MOCK_CLIENT_LOCATIONS.find((l) => l.id === e.target.value) ?? clientLocation
                                fetchDeliveryEngineQuote(selected, tailorLocation)
                              }
                            }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-xs w-40"
                          >
                            {MOCK_CLIENT_LOCATIONS.map((l) => (
                              <option key={l.id} value={l.id} className="bg-[#0A0A0A]">
                                {l.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl px-4 py-3">
                        <span className="text-xs text-white/60">
                          {tailorLocation ? `Atelier: ${tailorLocation.label}` : 'Atelier: —'}
                        </span>
                        <span className="text-sm font-serif text-[#D4AF37] font-bold">
                          {computedDistanceKm.toLocaleString('fr-FR')} km
                        </span>
                      </div>
                    </>
                  ) : (
                    <label className="block">
                      <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                        Distance (km)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        value={manualDistanceKm}
                        onChange={(e) => setManualDistanceKm(Number(e.target.value || 0))}
                        className="mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Mensurations */}
          <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-[#D4AF37]" />
                <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Mensurations</h2>
              </div>
              <Link
                href="/atelier"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors"
              >
                Mettre à jour
              </Link>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setUseMyMeasurements(true)
                  trackOrderInteraction({
                    user_id: currentUserId,
                    post_id: String(product.id),
                    interaction_type: 'click',
                    session_id: sessionId,
                    duration_seconds: null,
                    scroll_depth: null,
                    came_from: 'order:mesures_use_my',
                    device_type: 'web',
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                  })
                }}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] border transition-all",
                  useMyMeasurements
                    ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.25)]"
                    : "bg-white/[0.03] text-white/70 border-white/10 hover:border-[#D4AF37]/30"
                )}
              >
                Mes mesures
              </button>
              <button
                onClick={() => {
                  setUseMyMeasurements(false)
                  trackOrderInteraction({
                    user_id: currentUserId,
                    post_id: String(product.id),
                    interaction_type: 'click',
                    session_id: sessionId,
                    duration_seconds: null,
                    scroll_depth: null,
                    came_from: 'order:mesures_manual',
                    device_type: 'web',
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                  })
                }}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] border transition-all",
                  !useMyMeasurements
                    ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.25)]"
                    : "bg-white/[0.03] text-white/70 border-white/10 hover:border-[#D4AF37]/30"
                )}
              >
                Saisie
              </button>
            </div>

            {!useMyMeasurements && (
              <p className="mt-3 text-xs text-white/40 italic">
                La saisie directe sera ajoutée ensuite. Pour l’instant, utilisez vos mesures enregistrées.
              </p>
            )}
          </section>

          {/* Notes */}
          <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Scissors size={16} className="text-[#D4AF37]" />
              <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Instructions</h2>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Ajusté à la taille, manches légèrement plus longues…"
              className="mt-3 w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm leading-relaxed placeholder:text-white/20 resize-none min-h-[84px]"
            />
          </section>

          {/* Récap prix */}
          <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <LockKeyhole size={16} className="text-[#D4AF37]" />
              <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Récapitulatif</h2>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>Produit</span>
                <span className="font-semibold text-white/90">{formatFCFA(product.productPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Livraison</span>
                <span className="font-semibold text-white/90">{formatFCFA(shippingPrice)}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-[#D4AF37]/20 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.22em] font-black text-white/40">Total</span>
                <span className="text-lg font-serif text-[#D4AF37] font-bold">{formatFCFA(totalPrice)}</span>
              </div>
            </div>
          </section>

          <div className="h-6" />
        </motion.main>
      </div>

      {/* CTA fixe (conversion) */}
      <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
        <div className="max-w-lg mx-auto bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent pt-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPlacing}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-4 rounded-2xl font-black uppercase tracking-[0.22em] text-[10px] shadow-[0_0_18px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed active:scale-[0.99] transition-all"
          >
            {isPlacing ? 'Validation…' : 'Confirmer la commande'}
          </button>
          {!hasLocation && (
            <p className="mt-2 text-[11px] text-white/50 text-center">
              Active le GPS ou choisis une localisation pour continuer.
            </p>
          )}
        </div>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0A0A0A] border border-[#D4AF37]/30 p-8 rounded-3xl text-center space-y-4 max-w-sm w-full"
            >
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,175,55,0.45)]">
                <Check className="text-[#0A0A0A] w-8 h-8" strokeWidth={4} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-serif text-[#D4AF37]">Commande lancée</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Nous ouvrons le Salon Privé avec le tailleur pour finaliser.
                </p>
              </div>
              <p className="text-[10px] text-[#D4AF37]/40 uppercase tracking-[0.22em] font-black">
                Redirection…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


