'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ChevronRight,
  Package,
  Sparkles,
  Filter,
  MessageCircle,
  Plus,
} from 'lucide-react'
import type { Database, Order } from '@/shared/types/database.types'
import { cn } from '@/shared/lib/utils'

import { logMLInteraction } from '@/lib/logger'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking - Orders (tailleur)
 * @ai-context Capture l'activité business (consultation liste, filtres, ouverture détail).
 */
function trackOrdersInteraction(payload: UserInteractionInsert) {
  // ✅ Utilisation du logger sécurisé
  logMLInteraction(payload)
}

type OrderWithPreview = Order & {
  client_name: string
  client_avatar: string
  product_title: string
  product_image: string
}

const MOCK_TAILOR_ID = 't1'

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

type StatusFilter = Order['status'] | 'all'

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

function statusPillClass(status: Order['status']) {
  switch (status) {
    case 'pending': return 'border-[#D4AF37]/25 text-[#D4AF37]/90 bg-[#D4AF37]/10'
    case 'paid': return 'border-[#D4AF37]/25 text-[#D4AF37]/90 bg-[#D4AF37]/10'
    case 'in_preparation': return 'border-[#D4AF37]/25 text-[#D4AF37]/90 bg-[#D4AF37]/10'
    case 'in_delivery': return 'border-white/15 text-white/70 bg-white/5'
    case 'delivered': return 'border-white/15 text-white/70 bg-white/5'
    case 'cancelled': return 'border-white/15 text-white/50 bg-white/5'
  }
}

export default function OrdersPage() {
  const actorUserId = MOCK_TAILOR_ID
  const sessionId = 'session-demo'

  const [filter, setFilter] = useState<StatusFilter>('all')
  const [manualOrders, setManualOrders] = useState<OrderWithPreview[]>([])

  useEffect(() => {
    trackOrdersInteraction({
      user_id: actorUserId,
      post_id: null,
      interaction_type: 'view',
      session_id: sessionId,
      duration_seconds: null,
      scroll_depth: null,
      came_from: 'orders:list_view',
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  }, [])

  useEffect(() => {
    // @ai-context Simulation stockage local des commandes "hors app" (outil de travail du tailleur)
    try {
      const raw = localStorage.getItem('signare_tailor_manual_orders')
      if (!raw) return
      const parsed = JSON.parse(raw) as OrderWithPreview[]
      setManualOrders(Array.isArray(parsed) ? parsed : [])
    } catch {
      // ignore
    }
  }, [])

  const orders = useMemo(() => {
    const mine = [...manualOrders, ...MOCK_ORDERS].filter((o) => o.seller_id === actorUserId)
    if (filter === 'all') return mine
    return mine.filter((o) => o.status === filter)
  }, [filter, manualOrders])

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4AF37] p-2 rounded-lg shadow-[0_0_18px_rgba(212,175,55,0.35)]">
              <Package className="w-5 h-5 text-[#0A0A0A]" />
            </div>
            <div>
              <h1 className="text-lg font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Commandes</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Atelier</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders/new"
              onClick={() => {
                trackOrdersInteraction({
                  user_id: actorUserId,
                  post_id: null,
                  interaction_type: 'click',
                  session_id: sessionId,
                  duration_seconds: null,
                  scroll_depth: null,
                  came_from: 'orders:new_click',
                  device_type: 'web',
                  user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                })
              }}
              className="flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0A] px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.22em] shadow-[0_0_14px_rgba(212,175,55,0.25)]"
            >
              <Plus size={16} />
              Nouvelle
            </Link>
            <div className="flex items-center gap-2 text-white/40">
              <Filter size={16} className="text-[#D4AF37]/60" />
              <span className="text-[10px] uppercase tracking-[0.22em] font-black">{filter === 'all' ? 'Toutes' : statusLabel(filter)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
          {([
            { id: 'all', label: 'Toutes' },
            { id: 'pending', label: 'En attente' },
            { id: 'in_preparation', label: 'En atelier' },
            { id: 'in_delivery', label: 'Livraison' },
            { id: 'delivered', label: 'Livrées' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setFilter(t.id as StatusFilter)
                trackOrdersInteraction({
                  user_id: actorUserId,
                  post_id: null,
                  interaction_type: 'click',
                  session_id: sessionId,
                  duration_seconds: null,
                  scroll_depth: null,
                  came_from: `orders:filter:${t.id}`,
                  device_type: 'web',
                  user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                })
              }}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.22em] border transition-all",
                filter === (t.id as StatusFilter)
                  ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0A0A] shadow-[0_0_14px_rgba(212,175,55,0.25)]"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-[#D4AF37]/20"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {orders.map((o, idx) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.35 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-3"
            >
              <div className="flex gap-3">
                <div className="relative w-20 aspect-[4/5] rounded-xl overflow-hidden border border-[#D4AF37]/20 flex-shrink-0">
                  <Image src={o.product_image} alt={o.product_title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Client</p>
                      <p className="text-sm font-semibold text-white/90 truncate">{o.client_name}</p>
                      <p className="mt-1 text-[11px] text-white/60 truncate italic">{o.product_title}</p>
                    </div>
                    <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em] border", statusPillClass(o.status))}>
                      {statusLabel(o.status)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-serif text-[#D4AF37] font-bold">{formatFCFA(o.total_price)}</p>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/messages?user=${encodeURIComponent(o.client_name)}`}
                        className="p-2 rounded-xl bg-[#0A0A0A] border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                        aria-label="Discuter"
                      >
                        <MessageCircle size={16} />
                      </Link>
                      <Link
                        href={`/orders/${o.id}`}
                        onClick={() => {
                          trackOrdersInteraction({
                            user_id: actorUserId,
                            post_id: o.post_id,
                            interaction_type: 'click',
                            session_id: sessionId,
                            duration_seconds: null,
                            scroll_depth: null,
                            came_from: `orders:open_detail:${o.id}`,
                            device_type: 'web',
                            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                          })
                        }}
                        className="px-3 py-2 rounded-xl bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-black uppercase tracking-[0.22em] flex items-center gap-2 shadow-[0_0_14px_rgba(212,175,55,0.25)]"
                      >
                        Voir <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-16">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
                <Sparkles className="w-5 h-5 text-[#D4AF37]/60" />
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                Aucune commande dans cette catégorie
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


