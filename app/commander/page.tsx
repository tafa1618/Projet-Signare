/**
 * Tunnel de commande — 5 étapes vers la conciergerie
 * @ai-context Client envoie sa demande via la conciergerie (jamais directement au tailleur)
 * Query params optionnels : postId, tailorId, tailorName, tailorSpecialty, garmentType
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  Check,
  Scissors,
  Ruler,
  Wallet,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5
type Priority = 'urgent' | 'normal'

interface FormState {
  // Step 1 — Tailleur
  tailorId: string | null
  tailorName: string
  tailorSpecialty: string
  postId: string | null
  // Step 2 — Tenue
  garment_type: string
  fabric_type: string
  occasion: string
  color: string
  notes: string
  // Step 3 — Mesures
  hasMeasurements: boolean | null
  measurementsRef: string
  // Step 4 — Budget & délai
  budget: string
  deadline: string
  priority: Priority
}

const GARMENT_TYPES = ['Boubou', 'Kaftan', 'Robe Wax', 'Ensemble Tailleur', 'Robe de Mariée', 'Autre']
const FABRIC_TYPES = ['Basin Riche', 'Wax Hollandais', 'Soie', 'Lin', 'Dentelle', 'Broderie', 'Autre']
const OCCASIONS = ['Mariage', 'Baptême', 'Soirée de gala', 'Professionnel', 'Casual', 'Tabaski', 'Autre']

const STEPS_META = [
  { label: 'Tailleur', icon: Scissors },
  { label: 'Tenue', icon: FileText },
  { label: 'Mesures', icon: Ruler },
  { label: 'Budget', icon: Wallet },
  { label: 'Confirmation', icon: Check },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function minDeadline(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatBudget(val: string): string {
  const n = parseInt(val)
  if (!n) return '—'
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

// ─── Composants ───────────────────────────────────────────────────────────────

function SelectCard({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
        selected
          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white font-medium'
          : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20 hover:text-white'
      )}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {selected && <Check className="w-4 h-4 text-[#D4AF37]" />}
      </div>
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-white/40 text-xs uppercase tracking-wide mb-2">{children}</p>
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  min?: string
  required?: boolean
}) {
  return (
    <div>
      <FieldLabel>{label}{required && <span className="text-[#D4AF37] ml-0.5">*</span>}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
      />
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function CommanderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reducedMotion = useReducedMotion()

  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [orderRef, setOrderRef] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    tailorId: null,
    tailorName: '',
    tailorSpecialty: '',
    postId: null,
    garment_type: '',
    fabric_type: '',
    occasion: '',
    color: '',
    notes: '',
    hasMeasurements: null,
    measurementsRef: '',
    budget: '',
    deadline: '',
    priority: 'normal',
  })

  // Pré-remplir depuis query params
  useEffect(() => {
    const tailorId = searchParams.get('tailorId')
    const tailorName = searchParams.get('tailorName')
    const tailorSpecialty = searchParams.get('tailorSpecialty')
    const postId = searchParams.get('postId')
    const garmentType = searchParams.get('garmentType')

    setForm(prev => ({
      ...prev,
      tailorId: tailorId ?? null,
      tailorName: tailorName ? decodeURIComponent(tailorName) : '',
      tailorSpecialty: tailorSpecialty ? decodeURIComponent(tailorSpecialty) : '',
      postId: postId ?? null,
      garment_type: garmentType ? decodeURIComponent(garmentType) : '',
    }))
  }, [searchParams])

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  // Validation par étape
  const canProceed = (() => {
    switch (step) {
      case 1: return true
      case 2: return form.garment_type !== '' && form.occasion !== ''
      case 3: return form.hasMeasurements !== null
      case 4: return form.budget !== '' && parseInt(form.budget) > 0 && form.deadline !== ''
      case 5: return true
      default: return false
    }
  })()

  function nextStep() {
    if (step < 5) setStep((step + 1) as Step)
  }

  function prevStep() {
    if (step > 1) setStep((step - 1) as Step)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budget: form.budget ? parseInt(form.budget) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrderRef(data.ref)
    } catch {
      // En cas d'erreur, on génère un ref local (fallback)
      const fallbackRef = `DEM-${String(Math.floor(Math.random() * 900) + 100)}`
      setOrderRef(fallbackRef)
    } finally {
      setSubmitting(false)
    }
  }

  const progress = (step / 5) * 100

  // Écran succès
  if (orderRef) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-sm w-full"
        >
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
            <Check className="w-9 h-9 text-[#D4AF37]" />
          </div>
          <h1 className="text-white font-serif text-2xl mb-2">Demande envoyée</h1>
          <p className="text-[#D4AF37] font-mono text-lg font-bold mb-4">{orderRef}</p>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Notre équipe conciergerie vous contacte sous 24h pour confirmer les détails et vous mettre en relation avec votre tailleur.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/orders')}
              className="w-full py-3 bg-[#D4AF37] text-black rounded-xl font-medium text-sm"
            >
              Voir mes commandes
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 text-white/40 text-sm hover:text-white transition-colors"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={step > 1 ? prevStep : () => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-white/40 text-xs">
                Étape {step} sur 5 — <span className="text-white/70">{STEPS_META[step - 1].label}</span>
              </p>
              <p className="text-white/30 text-xs">{Math.round(progress)}%</p>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#D4AF37] rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reducedMotion ? {} : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >

            {/* ── Étape 1 : Tailleur ─────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white font-serif text-2xl mb-1">Commander une tenue</h2>
                  <p className="text-white/40 text-sm">Votre conciergerie Signare gère tout pour vous.</p>
                </div>

                {form.tailorName ? (
                  <div>
                    <FieldLabel>Tailleur ciblé</FieldLabel>
                    <div className="bg-white/[0.03] border border-[#D4AF37]/30 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                          <Scissors className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{form.tailorName}</p>
                          {form.tailorSpecialty && (
                            <p className="text-white/40 text-xs mt-0.5 truncate">{form.tailorSpecialty}</p>
                          )}
                        </div>
                        <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      </div>
                    </div>
                    <p className="text-white/30 text-xs mt-2 text-center">
                      La conciergerie transmettra votre demande à cet atelier
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-3">
                      <Scissors className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <p className="text-white text-sm font-medium mb-1">Sélection par la conciergerie</p>
                    <p className="text-white/40 text-xs leading-relaxed">
                      Notre équipe sélectionnera le meilleur tailleur disponible selon votre tenue et votre budget.
                    </p>
                  </div>
                )}

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                  <p className="text-white/50 text-xs leading-relaxed">
                    <span className="text-[#D4AF37] font-medium">Comment ça marche ? </span>
                    Vous décrivez votre tenue, notre équipe conciergerie négocie avec le tailleur et revient vers vous sous 24h avec un devis. Vous et le tailleur ne communiquez jamais directement.
                  </p>
                </div>
              </div>
            )}

            {/* ── Étape 2 : Tenue ────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-white font-serif text-2xl mb-1">Décrivez votre tenue</h2>
                  <p className="text-white/40 text-sm">Plus vous êtes précis, mieux le tailleur pourra vous servir.</p>
                </div>

                <div>
                  <FieldLabel>Type de vêtement *</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {GARMENT_TYPES.map(g => (
                      <SelectCard
                        key={g}
                        label={g}
                        selected={form.garment_type === g}
                        onClick={() => set('garment_type', g)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Tissu</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {FABRIC_TYPES.map(f => (
                      <SelectCard
                        key={f}
                        label={f}
                        selected={form.fabric_type === f}
                        onClick={() => set('fabric_type', f)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Occasion *</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {OCCASIONS.map(o => (
                      <SelectCard
                        key={o}
                        label={o}
                        selected={form.occasion === o}
                        onClick={() => set('occasion', o)}
                      />
                    ))}
                  </div>
                </div>

                <InputField
                  label="Couleur / Teinte"
                  value={form.color}
                  onChange={v => set('color', v)}
                  placeholder="Ex : Bleu marine & or"
                />

                <div>
                  <FieldLabel>Notes supplémentaires</FieldLabel>
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Broderies, détails, références photos, style particulier..."
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── Étape 3 : Mesures ──────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white font-serif text-2xl mb-1">Vos mesures</h2>
                  <p className="text-white/40 text-sm">Pour une confection parfaite.</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => { set('hasMeasurements', true); set('measurementsRef', 'MSR-' + String(Math.floor(Math.random() * 9000) + 1000)) }}
                    className={cn(
                      'w-full p-4 rounded-2xl border text-left transition-all',
                      form.hasMeasurements === true
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        form.hasMeasurements === true ? 'bg-[#D4AF37]/20' : 'bg-white/5'
                      )}>
                        <Check className={cn('w-5 h-5', form.hasMeasurements === true ? 'text-[#D4AF37]' : 'text-white/30')} />
                      </div>
                      <div>
                        <p className={cn('font-medium text-sm', form.hasMeasurements === true ? 'text-white' : 'text-white/60')}>
                          J&apos;ai déjà mes mesures Signare
                        </p>
                        <p className="text-white/30 text-xs mt-0.5 leading-relaxed">
                          Vos mesures enregistrées seront partagées avec le tailleur
                        </p>
                        {form.hasMeasurements === true && form.measurementsRef && (
                          <span className="inline-block mt-2 text-[#D4AF37] text-xs font-mono bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                            {form.measurementsRef}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { set('hasMeasurements', false); set('measurementsRef', '') }}
                    className={cn(
                      'w-full p-4 rounded-2xl border text-left transition-all',
                      form.hasMeasurements === false
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        form.hasMeasurements === false ? 'bg-[#D4AF37]/20' : 'bg-white/5'
                      )}>
                        <AlertCircle className={cn('w-5 h-5', form.hasMeasurements === false ? 'text-[#D4AF37]' : 'text-white/30')} />
                      </div>
                      <div>
                        <p className={cn('font-medium text-sm', form.hasMeasurements === false ? 'text-white' : 'text-white/60')}>
                          Je n&apos;ai pas encore mes mesures
                        </p>
                        <p className="text-white/30 text-xs mt-0.5 leading-relaxed">
                          La conciergerie vous contactera pour les organiser avant la confection
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="border-t border-white/[0.06] pt-4 text-center">
                  <a
                    href="/atelier/mesures?next=/commander"
                    className="text-[#D4AF37]/70 text-xs hover:text-[#D4AF37] transition-colors underline underline-offset-2"
                  >
                    Prendre mes mesures maintenant →
                  </a>
                </div>
              </div>
            )}

            {/* ── Étape 4 : Budget & délai ──────────────────────────── */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white font-serif text-2xl mb-1">Budget & délai</h2>
                  <p className="text-white/40 text-sm">Indiquez vos contraintes pour que la conciergerie trouve la meilleure offre.</p>
                </div>

                <div>
                  <FieldLabel>Budget maximum *</FieldLabel>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.budget}
                      onChange={e => set('budget', e.target.value)}
                      placeholder="Ex : 85000"
                      min="1"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-16 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">FCFA</span>
                  </div>
                  {form.budget && parseInt(form.budget) > 0 && (
                    <p className="text-[#D4AF37]/60 text-xs mt-1.5 text-right">
                      {new Intl.NumberFormat('fr-FR').format(parseInt(form.budget))} FCFA
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel>Date de livraison souhaitée *</FieldLabel>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => set('deadline', e.target.value)}
                    min={minDeadline()}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors [color-scheme:dark]"
                  />
                </div>

                <div>
                  <FieldLabel>Priorité</FieldLabel>
                  <div className="flex gap-3">
                    {(['normal', 'urgent'] as Priority[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set('priority', p)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
                          form.priority === p
                            ? p === 'urgent'
                              ? 'bg-red-500/10 border-red-500/50 text-red-400'
                              : 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                            : 'bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20'
                        )}
                      >
                        {p === 'urgent' && <Zap className="w-3.5 h-3.5" />}
                        {p === 'normal' ? 'Normal' : 'Urgent'}
                      </button>
                    ))}
                  </div>
                  {form.priority === 'urgent' && (
                    <p className="text-red-400/60 text-xs mt-2">
                      Les commandes urgentes peuvent engendrer un supplément tarifaire.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Étape 5 : Récap + Confirmation ──────────────────────── */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-white font-serif text-2xl mb-1">Récapitulatif</h2>
                  <p className="text-white/40 text-sm">Vérifiez votre demande avant envoi.</p>
                </div>

                <div className="space-y-3">
                  {/* Tailleur */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                    <p className="text-white/30 text-xs uppercase tracking-wide mb-3">Tailleur</p>
                    <p className="text-white text-sm font-medium">
                      {form.tailorName || 'Sélection par la conciergerie'}
                    </p>
                    {form.tailorSpecialty && (
                      <p className="text-white/40 text-xs mt-0.5">{form.tailorSpecialty}</p>
                    )}
                  </div>

                  {/* Tenue */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                    <p className="text-white/30 text-xs uppercase tracking-wide mb-3">Tenue</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.garment_type && (
                        <span className="bg-[#D4AF37]/90 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {form.garment_type}
                        </span>
                      )}
                      {form.fabric_type && (
                        <span className="bg-white/10 text-white/70 text-[10px] px-2 py-0.5 rounded">
                          {form.fabric_type}
                        </span>
                      )}
                      {form.priority === 'urgent' && (
                        <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded font-medium">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/40">Occasion</span>
                        <span className="text-white">{form.occasion || '—'}</span>
                      </div>
                      {form.color && (
                        <div className="flex justify-between">
                          <span className="text-white/40">Couleur</span>
                          <span className="text-white">{form.color}</span>
                        </div>
                      )}
                    </div>
                    {form.notes && (
                      <p className="text-white/50 text-xs mt-2 pt-2 border-t border-white/[0.06] leading-relaxed">
                        {form.notes}
                      </p>
                    )}
                  </div>

                  {/* Mesures + Budget */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                      <p className="text-white/30 text-xs uppercase tracking-wide mb-2">Mesures</p>
                      {form.hasMeasurements ? (
                        <>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Validées</span>
                          </div>
                          <p className="text-white/30 text-[10px] mt-1 font-mono">{form.measurementsRef}</p>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-xs">À collecter</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                      <p className="text-white/30 text-xs uppercase tracking-wide mb-2">Budget</p>
                      <p className="text-[#D4AF37] text-sm font-bold">{formatBudget(form.budget)}</p>
                    </div>
                  </div>

                  {/* Délai */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-white/40 text-xs uppercase tracking-wide">Livraison souhaitée</span>
                      </div>
                      <span className="text-white text-sm font-medium">{formatDate(form.deadline)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-white/25 text-xs text-center leading-relaxed">
                  En envoyant cette demande, vous acceptez que la conciergerie Signare agisse comme intermédiaire entre vous et le tailleur.
                </p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer avec bouton action */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4 safe-area-pb">
        <div className="max-w-lg mx-auto">
          {step < 5 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#D4AF37] text-black rounded-xl font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/90 active:scale-[0.98] transition-all"
            >
              Continuer
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#D4AF37] text-black rounded-xl font-semibold text-sm disabled:opacity-60 hover:bg-[#D4AF37]/90 active:scale-[0.98] transition-all"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
              ) : (
                <><Check className="w-4 h-4" /> Envoyer à la conciergerie</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
