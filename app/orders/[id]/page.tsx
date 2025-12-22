'use client'

import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChevronLeft,
  MapPin,
  Sparkles,
  MessageCircle,
  Package,
  Clock3,
  ShieldCheck,
} from 'lucide-react'
import type { Database, Mesure, Order } from '@/shared/types/database.types'
import { cn } from '@/shared/lib/utils'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking - Order detail (tailleur)
 * @ai-context Capture la consultation d’une commande précise (priorisation, retard, conversion).
 */
function trackOrderDetailInteraction(payload: UserInteractionInsert) {
  console.log('[ML] user_interactions.insert', payload)
}

type OrderWithPreview = Order & {
  client_name: string
  client_avatar: string
  product_title: string
  product_image: string
}

// Même mock que /orders (on garde la page autonome)
const MOCK_TAILOR_ID = 't1'
function readManualOrders(): OrderWithPreview[] {
  // @ai-context Lecture locale des commandes ajoutées manuellement (client hors app)
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('signare_tailor_manual_orders')
    const parsed = raw ? (JSON.parse(raw) as OrderWithPreview[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readManualMesures(): Mesure[] {
  // @ai-context Lecture locale des mensurations saisies par le tailleur (liées par mesure_id)
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('signare_tailor_manual_mesures')
    const parsed = raw ? (JSON.parse(raw) as Mesure[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
const MOCK_ORDERS: OrderWithPreview[] = [
  {
    id: 'o-1001',
    buyer_id: 'client:Khadija Sy',
    seller_id: MOCK_TAILOR_ID,
    post_id: '4',
    mesure_id: 'mesure-latest',
    product_price: 98000,
    shipping_price: 800,
    total_price: 113020,
    delivery_latitude: 14.6946,
    delivery_longitude: -17.4646,
    delivery_address: 'Point E, Dakar',
    distance_km: 3.0,
    validation_code: '394812',
    estimated_delivery_date: null,
    actual_delivery_date: null,
    preparation_time_hours: 22,
    status: 'in_preparation',
    buyer_rating: null,
    seller_rating: null,
    quality_rating: null,
    delivery_rating: null,
    feedback_text: 'Manches légèrement plus longues.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    delivered_at: null,
    client_name: 'Khadija Sy',
    client_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khadija',
    product_title: 'Kaftan de Soirée • Signature',
    product_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop',
  },
  {
    id: 'o-1002',
    buyer_id: 'client:Mariama Diallo',
    seller_id: MOCK_TAILOR_ID,
    post_id: '1',
    mesure_id: 'mesure-latest',
    product_price: 125000,
    shipping_price: 900,
    total_price: 145885,
    delivery_latitude: 14.6706,
    delivery_longitude: -17.4380,
    delivery_address: 'Plateau, Dakar',
    distance_km: 4.0,
    validation_code: '184205',
    estimated_delivery_date: null,
    actual_delivery_date: null,
    preparation_time_hours: 40,
    status: 'pending',
    buyer_rating: null,
    seller_rating: null,
    quality_rating: null,
    delivery_rating: null,
    feedback_text: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    delivered_at: null,
    client_name: 'Mariama Diallo',
    client_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama',
    product_title: 'Boubou Royale • Or & Basin',
    product_image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
  },
  {
    id: 'o-1003',
    buyer_id: 'client:Fatou Dia',
    seller_id: MOCK_TAILOR_ID,
    post_id: '2',
    mesure_id: 'mesure-latest',
    product_price: 75000,
    shipping_price: 700,
    total_price: 87205,
    delivery_latitude: 14.7454,
    delivery_longitude: -17.5256,
    delivery_address: 'Almadies, Dakar',
    distance_km: 2.0,
    validation_code: '775191',
    estimated_delivery_date: null,
    actual_delivery_date: null,
    preparation_time_hours: 18,
    status: 'delivered',
    buyer_rating: 5,
    seller_rating: 5,
    quality_rating: 5,
    delivery_rating: 5,
    feedback_text: 'Parfait, très satisfait.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    delivered_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    client_name: 'Fatou Dia',
    client_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FatouDia',
    product_title: 'Robe Wax • Mariage',
    product_image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop',
  },
]

function formatFCFA(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} FCFA`
}

function statusLabel(status: Order['status']) {
  switch (status) {
    case 'pending': return 'En attente'
    case 'paid': return 'Payée'
    case 'in_preparation': return 'En atelier'
    case 'in_delivery': return 'En livraison'
    case 'delivered': return 'Livrée'
    case 'cancelled': return 'Annulée'
  }
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''

  const actorUserId = MOCK_TAILOR_ID
  const sessionId = 'session-demo'

  const order = useMemo(() => {
    const manual = readManualOrders()
    return [...manual, ...MOCK_ORDERS].find((o) => o.id === id) ?? null
  }, [id])

  const mesure = useMemo(() => {
    if (!order?.mesure_id) return null
    const all = readManualMesures()
    return all.find((m) => m.id === order.mesure_id) ?? null
  }, [order?.mesure_id])

  useEffect(() => {
    trackOrderDetailInteraction({
      user_id: actorUserId,
      post_id: order?.post_id ?? null,
      interaction_type: 'view',
      session_id: sessionId,
      duration_seconds: null,
      scroll_depth: null,
      came_from: `orders:detail_view:${id}`,
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  }, [id, order])

  if (!order) {
    return (
      <div className="bg-[#0A0A0A] text-white min-h-screen pb-24">
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Commande introuvable</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/80 hover:text-[#D4AF37]"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors"
          aria-label="Retour"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-sm font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Détail commande</h1>
        <div className="w-8" />
      </header>

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto px-4 pt-4 space-y-4"
      >
        {/* En-tête commande */}
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#D4AF37] p-2 rounded-lg shadow-[0_0_14px_rgba(212,175,55,0.25)]">
                <Package className="w-4 h-4 text-[#0A0A0A]" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Commande</p>
                <p className="text-sm font-semibold text-white/90">{order.id}</p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.18em] border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]">
              {statusLabel(order.status)}
            </span>
          </div>
        </section>

        {/* Produit */}
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
          <div className="flex gap-3">
            <div className="relative w-24 aspect-[4/5] rounded-xl overflow-hidden border border-[#D4AF37]/20 flex-shrink-0">
              <Image src={order.product_image} alt={order.product_title} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Modèle</p>
              <p className="mt-1 text-sm font-semibold text-white/90 truncate">{order.product_title}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-sm font-serif text-[#D4AF37] font-bold">{formatFCFA(order.total_price)}</p>
                <Link
                  href={`/product/${order.post_id}`}
                  className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/80 hover:text-[#D4AF37] flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  Voir produit
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Client */}
        <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-900">
                  <Image src={order.client_avatar} alt={order.client_name} fill className="object-cover" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Client</p>
                <p className="text-sm font-semibold text-white/90 truncate">{order.client_name}</p>
              </div>
            </div>
            <Link
              href={`/messages?user=${encodeURIComponent(order.client_name)}`}
              className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-2"
            >
              <MessageCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.22em]">Discuter</span>
            </Link>
          </div>
        </section>

        {/* Mensurations */}
        {mesure && (
          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#D4AF37]" />
                <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Mensurations</h2>
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                {mesure.pattern_type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { k: 'tour_poitrine', label: 'Poitrine', v: mesure.tour_poitrine },
                { k: 'tour_taille', label: 'Taille', v: mesure.tour_taille },
                { k: 'tour_hanches', label: 'Hanches', v: mesure.tour_hanches },
                { k: 'longueur_bras', label: 'Bras', v: mesure.longueur_bras },
                { k: 'longueur_jambe', label: 'Jambe', v: mesure.longueur_jambe },
                { k: 'tour_cou', label: 'Cou', v: mesure.tour_cou },
                { k: 'carrure', label: 'Carrure', v: mesure.carrure },
              ] as const).map((m) => (
                <div key={m.k} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-3 flex items-center justify-between">
                  <span className="text-[11px] text-white/40">{m.label}</span>
                  <span className="text-sm font-bold text-[#D4AF37]">{m.v ?? '—'}{m.v == null ? '' : ' cm'}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl px-3 py-3 flex items-center justify-between">
                <span className="text-[11px] text-white/40">Stretch</span>
                <span className="text-sm font-bold text-[#D4AF37]">{mesure.fabric_stretch_index.toFixed(2)}</span>
              </div>
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl px-3 py-3 flex items-center justify-between">
                <span className="text-[11px] text-white/40">Complexité</span>
                <span className="text-sm font-bold text-[#D4AF37]">{mesure.complexity_score.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[11px] text-white/35">
              Snapshot local (simulation). Plus tard : insertion Supabase `mesures` + RLS.
            </p>
          </section>
        )}

        {/* Livraison */}
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Livraison</h2>
          </div>
          <div className="text-sm text-white/70">
            <p className="font-semibold text-white/90">{order.delivery_address}</p>
            <p className="text-[11px] text-white/40 mt-1">
              Distance: {order.distance_km.toLocaleString('fr-FR')} km
            </p>
          </div>
        </section>

        {/* Sécurité */}
        <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Validation</h2>
          </div>
          <p className="text-xs text-white/50">
            Le code client est requis à la livraison pour débloquer les fonds.
          </p>
          <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Code client</span>
            <span className="text-sm font-serif text-[#D4AF37] font-bold tracking-[0.2em]">{order.validation_code}</span>
          </div>
        </section>

        {/* Notes */}
        {order.feedback_text && (
          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-[#D4AF37]" />
              <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Instructions</h2>
            </div>
            <p className="text-sm text-white/70 italic">{order.feedback_text}</p>
          </section>
        )}
      </motion.main>
    </div>
  )
}


