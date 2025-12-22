'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChevronLeft,
  User,
  Phone,
  MapPin,
  Sparkles,
  Package,
  Clock3,
  Check,
  KeyRound,
} from 'lucide-react'
import type { Database, Mesure, Order } from '@/shared/types/database.types'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

/**
 * Tracking - Ajout manuel de commande (tailleur)
 * @ai-context Permet de capturer les commandes hors-app (source externe) pour enrichir le dataset business.
 */
function trackManualOrder(payload: UserInteractionInsert) {
  console.log('[ML] user_interactions.insert', payload)
}

type ManualOrderDraft = {
  clientMode: 'signare' | 'external'
  clientId: string
  clientName: string
  clientPhone: string
  deliveryAddress: string
  distanceKm: number
  productTitle: string
  productPrice: number
  preparationHours: number
  notes: string

  // Mensurations
  mesure: {
    tour_poitrine: number
    tour_taille: number
    tour_hanches: number
    longueur_bras: number
    longueur_jambe: number
    tour_cou: number | null
    carrure: number | null
    height_cm: number | null
    weight_kg: number | null
    pattern_type: Mesure['pattern_type']
    fabric_stretch_index: number
  }
}

const MOCK_TAILOR_ID = 't1'
const MOCK_CLIENTS = [
  { id: 'u1', name: 'Awa Ndiaye' },
  { id: 'u2', name: 'Khadija Sy' },
  { id: 'u3', name: 'Mariama Diallo' },
] as const

function formatFCFA(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} FCFA`
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function computeShipping(distanceKm: number) {
  const base = 500
  const perKm = 100
  const km = clampNumber(distanceKm, 0, 200)
  return Math.round(base + km * perKm)
}

function computeTotal(productPrice: number, shipping: number) {
  const serviceFeeRate = 0.15
  const subtotal = productPrice + shipping
  return Math.round(subtotal * (1 + serviceFeeRate))
}

function generateValidationCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function estimateComplexityScore(m: ManualOrderDraft['mesure']) {
  /**
   * @ai-context Heuristique simple : plus on a de mesures optionnelles, plus la commande est susceptible
   * d’être “complexe” à traiter (retouches/ajustements). À remplacer plus tard par un modèle.
   */
  let score = 0.3
  const optionalFilled =
    Number(m.tour_cou != null) +
    Number(m.carrure != null) +
    Number(m.height_cm != null) +
    Number(m.weight_kg != null)
  score += optionalFilled * 0.05
  return clampNumber(Number(score.toFixed(2)), 0, 1)
}

function readManualMesures(): Mesure[] {
  // @ai-context Stockage local des mensurations saisies par le tailleur (hors Supabase pour l’instant).
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('signare_tailor_manual_mesures')
    const parsed = raw ? (JSON.parse(raw) as Mesure[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeManualMesure(m: Mesure) {
  // @ai-context Persistance locale d’une mesure (snapshot) pour rattacher une commande via mesure_id.
  if (typeof window === 'undefined') return
  const current = readManualMesures()
  localStorage.setItem('signare_tailor_manual_mesures', JSON.stringify([m, ...current]))
}

export default function OrdersNewPage() {
  const router = useRouter()
  const actorUserId = MOCK_TAILOR_ID
  const sessionId = 'session-demo'

  const [draft, setDraft] = useState<ManualOrderDraft>({
    clientMode: 'signare',
    clientId: MOCK_CLIENTS[0].id,
    clientName: '',
    clientPhone: '',
    deliveryAddress: '',
    distanceKm: 3,
    productTitle: '',
    productPrice: 75000,
    preparationHours: 14,
    notes: '',
    mesure: {
      tour_poitrine: 92,
      tour_taille: 72,
      tour_hanches: 98,
      longueur_bras: 58,
      longueur_jambe: 104,
      tour_cou: null,
      carrure: null,
      height_cm: null,
      weight_kg: null,
      pattern_type: 'autre',
      fabric_stretch_index: 0.35,
    },
  })

  const shippingPrice = useMemo(() => computeShipping(draft.distanceKm), [draft.distanceKm])
  const totalPrice = useMemo(() => computeTotal(draft.productPrice, shippingPrice), [draft.productPrice, shippingPrice])

  const resolvedClientName =
    draft.clientMode === 'signare'
      ? (MOCK_CLIENTS.find((c) => c.id === draft.clientId)?.name ?? '')
      : draft.clientName.trim()

  const canSave =
    resolvedClientName.trim().length >= 2 &&
    draft.deliveryAddress.trim().length >= 5 &&
    draft.productTitle.trim().length >= 3 &&
    draft.productPrice > 0

  const handleSave = () => {
    if (!canSave) return

    trackManualOrder({
      user_id: actorUserId,
      post_id: null,
      interaction_type: 'click',
      session_id: sessionId,
      duration_seconds: null,
      scroll_depth: null,
      came_from: 'orders:new_submit',
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })

    const now = new Date().toISOString()
    const buyerId =
      draft.clientMode === 'signare'
        ? draft.clientId
        : `external:${draft.clientPhone || resolvedClientName}`
    const orderId = `o-manual-${Date.now()}`
    const validationCode = generateValidationCode()

    const mesureId = `m-manual-${Date.now()}`
    const mesure: Mesure = {
      id: mesureId,
      user_id: buyerId,
      client_name: resolvedClientName,
      tour_poitrine: Math.round(draft.mesure.tour_poitrine),
      tour_taille: Math.round(draft.mesure.tour_taille),
      tour_hanches: Math.round(draft.mesure.tour_hanches),
      longueur_bras: Math.round(draft.mesure.longueur_bras),
      longueur_jambe: Math.round(draft.mesure.longueur_jambe),
      tour_cou: draft.mesure.tour_cou == null ? null : Math.round(draft.mesure.tour_cou),
      carrure: draft.mesure.carrure == null ? null : Math.round(draft.mesure.carrure),
      hauteur_poitrine: null,
      longueur_dos: null,
      tour_cuisse: null,
      body_type: null,
      height_cm: draft.mesure.height_cm == null ? null : Math.round(draft.mesure.height_cm),
      weight_kg: draft.mesure.weight_kg == null ? null : Math.round(draft.mesure.weight_kg),
      pattern_type: draft.mesure.pattern_type,
      fabric_stretch_index: clampNumber(Number(draft.mesure.fabric_stretch_index.toFixed(2)), 0, 1),
      complexity_score: estimateComplexityScore(draft.mesure),
      fit_preference: null,
      adjustments_notes: null,
      notes: draft.notes || null,
      photo_references: null,
      created_at: now,
      updated_at: now,
    }

    const order: any = {
      id: orderId,
      buyer_id: buyerId,
      seller_id: actorUserId,
      post_id: 'external',
      mesure_id: mesureId,
      product_price: Math.round(draft.productPrice),
      shipping_price: shippingPrice,
      total_price: totalPrice,
      delivery_latitude: 0,
      delivery_longitude: 0,
      delivery_address: draft.deliveryAddress,
      distance_km: draft.distanceKm,
      validation_code: validationCode,
      estimated_delivery_date: null,
      actual_delivery_date: null,
      preparation_time_hours: Math.round(draft.preparationHours),
      status: 'pending' as Order['status'],
      buyer_rating: null,
      seller_rating: null,
      quality_rating: null,
      delivery_rating: null,
      feedback_text: draft.notes || null,
      created_at: now,
      delivered_at: null,
      client_name: resolvedClientName,
      client_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(resolvedClientName)}`,
      product_title: draft.productTitle,
      product_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
    }

    try {
      const raw = localStorage.getItem('signare_tailor_manual_orders')
      const current = raw ? (JSON.parse(raw) as any[]) : []
      const next = [order, ...(Array.isArray(current) ? current : [])]
      localStorage.setItem('signare_tailor_manual_orders', JSON.stringify(next))
    } catch {
      // ignore
    }

    try {
      writeManualMesure(mesure)
    } catch {
      // ignore
    }

    router.push(`/orders/${orderId}`)
  }

  return (
    <div className="bg-[#0A0A0A] text-white h-[calc(100dvh-80px)] -mb-24 overflow-hidden">
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors"
          aria-label="Retour"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-sm font-serif text-[#D4AF37] tracking-[0.2em] uppercase">Nouvelle commande</h1>
        <div className="w-8" />
      </header>

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="h-full overflow-y-auto pb-36 px-4 pt-4 max-w-lg mx-auto space-y-4"
      >
        {/* Client */}
        <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Client</h2>
          </div>

          {/* Mode client */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, clientMode: 'signare' }))}
              className={`flex-1 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.22em] border transition-all ${
                draft.clientMode === 'signare'
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0A0A0A]'
                  : 'bg-white/5 border-white/10 text-white/70'
              }`}
            >
              Client SIGNARE
            </button>
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, clientMode: 'external' }))}
              className={`flex-1 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.22em] border transition-all ${
                draft.clientMode === 'external'
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0A0A0A]'
                  : 'bg-white/5 border-white/10 text-white/70'
              }`}
            >
              Hors app
            </button>
          </div>

          {draft.clientMode === 'signare' ? (
            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Choisir un client</span>
              <select
                value={draft.clientId}
                onChange={(e) => setDraft((d) => ({ ...d, clientId: e.target.value }))}
                className="mt-2 w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
              >
                {MOCK_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-white/35">
                Le client existe déjà dans SIGNARE (simulation). On branchera Supabase Profiles ensuite.
              </p>
            </label>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Nom</span>
                <input
                  value={draft.clientName}
                  onChange={(e) => setDraft((d) => ({ ...d, clientName: e.target.value }))}
                  placeholder="Ex: Awa Ndiaye"
                  className="mt-2 w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm placeholder:text-white/20"
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black flex items-center gap-2">
                  <Phone size={12} className="text-[#D4AF37]/80" /> Téléphone (option)
                </span>
                <input
                  value={draft.clientPhone}
                  onChange={(e) => setDraft((d) => ({ ...d, clientPhone: e.target.value }))}
                  placeholder="+221 77 000 00 00"
                  className="mt-2 w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm placeholder:text-white/20"
                />
              </label>
            </div>
          )}
        </section>

        {/* Mensurations */}
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Mensurations</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { k: 'tour_poitrine', label: 'Poitrine', suffix: 'cm' },
              { k: 'tour_taille', label: 'Taille', suffix: 'cm' },
              { k: 'tour_hanches', label: 'Hanches', suffix: 'cm' },
              { k: 'longueur_bras', label: 'Bras', suffix: 'cm' },
              { k: 'longueur_jambe', label: 'Jambe', suffix: 'cm' },
            ] as const).map((f) => (
              <label key={f.k} className="block">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">
                  {f.label}
                </span>
                <input
                  type="number"
                  min={0}
                  value={draft.mesure[f.k]}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      mesure: { ...d.mesure, [f.k]: Number(e.target.value || 0) } as any,
                    }))
                  }
                  className="mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
                />
              </label>
            ))}

            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Cou (option)</span>
              <input
                type="number"
                min={0}
                value={draft.mesure.tour_cou ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    mesure: { ...d.mesure, tour_cou: e.target.value === '' ? null : Number(e.target.value) },
                  }))
                }
                className="mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
              />
            </label>

            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Carrure (option)</span>
              <input
                type="number"
                min={0}
                value={draft.mesure.carrure ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    mesure: { ...d.mesure, carrure: e.target.value === '' ? null : Number(e.target.value) },
                  }))
                }
                className="mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Type (ML)</span>
              <select
                value={draft.mesure.pattern_type}
                onChange={(e) => setDraft((d) => ({ ...d, mesure: { ...d.mesure, pattern_type: e.target.value as Mesure['pattern_type'] } }))}
                className="mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
              >
                {(['boubou', 'robe', 'tailleur', 'pantalon', 'kaftan', 'autre'] as const).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Stretch (0–1)</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={draft.mesure.fabric_stretch_index}
                onChange={(e) => setDraft((d) => ({ ...d, mesure: { ...d.mesure, fabric_stretch_index: Number(e.target.value || 0) } }))}
                className="mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
              />
            </label>
          </div>

          <p className="text-[11px] text-white/35">
            Les mensurations seront liées à la commande via <span className="text-[#D4AF37]/80">mesure_id</span> (simulation localStorage).
          </p>
        </section>

        {/* Livraison */}
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Livraison</h2>
          </div>
          <label className="block">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Adresse</span>
            <input
              value={draft.deliveryAddress}
              onChange={(e) => setDraft((d) => ({ ...d, deliveryAddress: e.target.value }))}
              placeholder="Ex: Almadies, Dakar…"
              className="mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm placeholder:text-white/20"
            />
          </label>
          <label className="block">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black flex items-center gap-2">
              <Sparkles size={12} className="text-[#D4AF37]/80" /> Distance (km)
            </span>
            <input
              type="number"
              min={0}
              max={200}
              value={draft.distanceKm}
              onChange={(e) => setDraft((d) => ({ ...d, distanceKm: Number(e.target.value || 0) }))}
              className="mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
            />
          </label>
        </section>

        {/* Produit */}
        <section className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Commande</h2>
          </div>
          <label className="block">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Titre du modèle</span>
            <input
              value={draft.productTitle}
              onChange={(e) => setDraft((d) => ({ ...d, productTitle: e.target.value }))}
              placeholder="Ex: Kaftan de soirée"
              className="mt-2 w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm placeholder:text-white/20"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black">Prix produit (FCFA)</span>
              <input
                type="number"
                min={0}
                value={draft.productPrice}
                onChange={(e) => setDraft((d) => ({ ...d, productPrice: Number(e.target.value || 0) }))}
                className="mt-2 w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-[0.22em] font-black flex items-center gap-2">
                <Clock3 size={12} className="text-[#D4AF37]/80" /> Temps (heures)
              </span>
              <input
                type="number"
                min={0}
                value={draft.preparationHours}
                onChange={(e) => setDraft((d) => ({ ...d, preparationHours: Number(e.target.value || 0) }))}
                className="mt-2 w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm"
              />
            </label>
          </div>
        </section>

        {/* Récap */}
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Récap</h2>
          </div>
          <div className="flex items-center justify-between text-white/70">
            <span>Produit</span>
            <span className="font-semibold text-white/90">{formatFCFA(draft.productPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-white/70">
            <span>Livraison</span>
            <span className="font-semibold text-white/90">{formatFCFA(shippingPrice)}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-[#D4AF37]/20 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] font-black text-white/40">Total</span>
            <span className="text-lg font-serif text-[#D4AF37] font-bold">{formatFCFA(totalPrice)}</span>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">Notes</h2>
          </div>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Ex: Retouches, tissus, urgence…"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]/40 transition-all text-sm leading-relaxed placeholder:text-white/20 resize-none min-h-[84px]"
          />
        </section>
      </motion.main>

      {/* CTA fixe */}
      <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
        <div className="max-w-lg mx-auto bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent pt-3">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-4 rounded-2xl font-black uppercase tracking-[0.22em] text-[10px] shadow-[0_0_18px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:grayscale active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}


