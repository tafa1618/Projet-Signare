'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Clock, AlertTriangle, CheckCircle2, ChevronRight,
  User, Scissors, Ruler, CalendarDays, Banknote,
  FileText, Send, Package, Truck, Star, MessageSquare,
  RefreshCw, X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  getOrderRequests,
  updateRequestStatus,
  updateBriefNotes,
  nextStatus,
  nextStatusLabel,
  STATUS_LABELS,
  type OrderRequest,
  type ConciergeStatus,
  type Priority,
} from '@/lib/services/adminConcierge'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const PIPELINE: ConciergeStatus[] = [
  'received', 'in_negotiation', 'brief_sent', 'accepted', 'in_production', 'ready', 'delivered',
]

const STATUS_COLORS: Record<ConciergeStatus, string> = {
  received: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_negotiation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  brief_sent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  accepted: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  in_production: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  delivered: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30',
}

const STATUS_ICONS: Record<ConciergeStatus, React.ComponentType<{ className?: string; size?: number }>> = {
  received: Clock,
  in_negotiation: MessageSquare,
  brief_sent: Send,
  accepted: CheckCircle2,
  in_production: Package,
  ready: Star,
  delivered: Truck,
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: React.ComponentType<{ className?: string; size?: number }> }> = {
  urgent: { label: 'URGENT', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: AlertTriangle },
  normal: { label: 'Normal', color: 'text-white/50 bg-white/5 border-white/10', icon: Clock },
  low: { label: 'Faible', color: 'text-white/30 bg-white/5 border-white/5', icon: Clock },
}

const STATUS_FILTER_TABS: Array<{ key: ConciergeStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Tout' },
  { key: 'received', label: 'Reçues' },
  { key: 'in_negotiation', label: 'En cours' },
  { key: 'brief_sent', label: 'Brief envoyé' },
  { key: 'in_production', label: 'En prod' },
  { key: 'ready', label: 'Prêtes' },
  { key: 'delivered', label: 'Livrées' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatBudget(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

// ─── COMPOSANT : BADGE STATUT ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: ConciergeStatus }) {
  const Icon = STATUS_ICONS[status]
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide', STATUS_COLORS[status])}>
      <Icon size={10} />
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── COMPOSANT : PIPELINE ────────────────────────────────────────────────────

function StatusPipeline({ current }: { current: ConciergeStatus }) {
  const currentIdx = PIPELINE.indexOf(current)
  return (
    <div className="flex items-center gap-0 overflow-x-auto no-scrollbar py-1">
      {PIPELINE.map((step, i) => {
        const Icon = STATUS_ICONS[step]
        const isDone = i < currentIdx
        const isActive = i === currentIdx
        return (
          <div key={step} className="flex items-center shrink-0">
            <div className={cn(
              'flex flex-col items-center gap-1',
              isDone && 'opacity-60',
              isActive && 'opacity-100',
              !isDone && !isActive && 'opacity-25',
            )}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border',
                isDone ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40' : '',
                isActive ? 'bg-[#D4AF37] border-[#D4AF37]' : '',
                !isDone && !isActive ? 'bg-white/5 border-white/10' : '',
              )}>
                <Icon size={14} className={isActive ? 'text-black' : isDone ? 'text-[#D4AF37]' : 'text-white/40'} />
              </div>
              <span className={cn(
                'text-[9px] text-center leading-tight max-w-[52px]',
                isActive ? 'text-[#D4AF37] font-bold' : 'text-white/40',
              )}>
                {STATUS_LABELS[step]}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div className={cn(
                'w-6 h-[2px] mb-4 mx-0.5',
                i < currentIdx ? 'bg-[#D4AF37]/40' : 'bg-white/10',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── COMPOSANT : CARTE LISTE ─────────────────────────────────────────────────

function RequestCard({ req, isSelected, onClick }: {
  req: OrderRequest
  isSelected: boolean
  onClick: () => void
}) {
  const PriorityIcon = PRIORITY_CONFIG[req.priority].icon
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-white/5 transition-colors',
        isSelected ? 'bg-[#D4AF37]/10 border-l-2 border-l-[#D4AF37]' : 'hover:bg-white/5',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-white/40 text-[10px] font-mono">{req.ref}</span>
          {req.priority === 'urgent' && (
            <span className={cn('inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border', PRIORITY_CONFIG.urgent.color)}>
              <PriorityIcon size={8} />
              URGENT
            </span>
          )}
        </div>
        <StatusBadge status={req.status} />
      </div>
      <p className="text-white text-sm font-medium leading-snug">
        {req.garment_type}
        {req.fabric_type && <span className="text-white/50 font-normal"> · {req.fabric_type}</span>}
      </p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-white/40 text-[11px]">{req.clientRef}</span>
        <span className="text-white/30 text-[10px]">{formatDate(req.createdAt)}</span>
      </div>
    </button>
  )
}

// ─── COMPOSANT : PANNEAU DÉTAIL ───────────────────────────────────────────────

function DetailPanel({ req, onStatusUpdate }: {
  req: OrderRequest
  onStatusUpdate: (id: string, status: ConciergeStatus) => void
}) {
  const [briefText, setBriefText] = useState(req.briefNotes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync briefText lorsque req change
  useEffect(() => {
    setBriefText(req.briefNotes ?? '')
  }, [req.id, req.briefNotes])

  const next = nextStatus(req.status)
  const nextLabel = nextStatusLabel(req.status)

  const handleAdvance = async () => {
    if (!next) return
    setIsAdvancing(true)
    await updateRequestStatus(req.id, next)
    onStatusUpdate(req.id, next)
    setIsAdvancing(false)
  }

  const handleSaveBrief = async () => {
    setIsSaving(true)
    await updateBriefNotes(req.id, briefText)
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* En-tête détail */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/40 text-xs font-mono">{req.ref}</span>
              {req.priority === 'urgent' && (
                <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', PRIORITY_CONFIG.urgent.color)}>
                  <AlertTriangle size={9} />
                  URGENT
                </span>
              )}
            </div>
            <h2 className="text-white text-xl font-serif font-bold">
              {req.garment_type}
              {req.fabric_type && <span className="text-[#D4AF37]"> · {req.fabric_type}</span>}
            </h2>
            <p className="text-white/50 text-sm mt-0.5">{req.occasion} · {req.clientRef}</p>
          </div>
          <StatusBadge status={req.status} />
        </div>

        {/* Pipeline */}
        <StatusPipeline current={req.status} />
      </div>

      {/* Corps */}
      <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">

        {/* Infos tenue */}
        <section>
          <h3 className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-3">Description de la tenue</h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={Scissors} label="Type" value={req.garment_type} />
            {req.fabric_type && <InfoRow icon={Scissors} label="Tissu" value={req.fabric_type} />}
            <InfoRow icon={Star} label="Occasion" value={req.occasion} />
            {req.color && <InfoRow icon={Star} label="Couleur" value={req.color} />}
          </div>
          {req.notes && (
            <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-white/70 text-sm leading-relaxed">{req.notes}</p>
            </div>
          )}
        </section>

        {/* Budget & délai */}
        <section>
          <h3 className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-3">Budget & délai</h3>
          <div className="grid grid-cols-2 gap-3">
            {req.budget && <InfoRow icon={Banknote} label="Budget" value={formatBudget(req.budget)} highlight />}
            {req.deadline && <InfoRow icon={CalendarDays} label="Deadline" value={formatDate(req.deadline)} />}
          </div>
        </section>

        {/* Mesures */}
        <section>
          <h3 className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-3">Mesures</h3>
          {req.hasMeasurements ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <Ruler size={18} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-emerald-400 text-sm font-medium">Mesures disponibles</p>
                {req.measurementsRef && (
                  <p className="text-white/40 text-xs mt-0.5">Réf : {req.measurementsRef}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
              <Ruler size={18} className="text-orange-400 shrink-0" />
              <div>
                <p className="text-orange-400 text-sm font-medium">Pas de mesures</p>
                <p className="text-white/40 text-xs mt-0.5">Demander au client avant d'envoyer le brief</p>
              </div>
            </div>
          )}
        </section>

        {/* Tailleur ciblé */}
        <section>
          <h3 className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest mb-3">Tailleur ciblé</h3>
          {req.targetTailor ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] font-bold text-sm">
                  {req.targetTailor.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{req.targetTailor.name}</p>
                <p className="text-white/40 text-xs truncate">{req.targetTailor.specialty}</p>
              </div>
              <span className="text-white/30 text-xs font-mono shrink-0">{req.targetTailor.phone}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-3">
              <User size={18} className="text-white/30" />
              <p className="text-white/30 text-sm">Aucun tailleur assigné</p>
            </div>
          )}
        </section>

        {/* Brief */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest">Brief conciergerie</h3>
            {req.briefSentAt && (
              <span className="text-white/30 text-[10px]">Envoyé le {formatDate(req.briefSentAt)}</span>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={briefText}
            onChange={e => setBriefText(e.target.value)}
            placeholder="Rédigez le brief à envoyer au tailleur : description détaillée, finitions, références visuelles, contraintes..."
            rows={5}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm placeholder:text-white/20 resize-none focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
          />
          <button
            onClick={handleSaveBrief}
            disabled={isSaving}
            className="mt-2 flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <FileText size={12} />}
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder le brouillon'}
          </button>
        </section>
      </div>

      {/* Footer action */}
      {nextLabel && next && (
        <div className="px-6 py-4 border-t border-white/10 bg-[#0A0A0A]">
          <button
            onClick={handleAdvance}
            disabled={isAdvancing}
            className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#E5C84A] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdvancing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                {nextLabel}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      )}
      {!next && (
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-[#D4AF37]/60 text-sm">
            <CheckCircle2 size={16} />
            Demande terminée
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, highlight }: {
  icon: React.ComponentType<{ className?: string; size?: number }>
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-white/30 mt-0.5 shrink-0" />
      <div>
        <p className="text-white/30 text-[10px] uppercase tracking-wide">{label}</p>
        <p className={cn('text-sm font-medium', highlight ? 'text-[#D4AF37]' : 'text-white/80')}>{value}</p>
      </div>
    </div>
  )
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function ConciergePage() {
  const [requests, setRequests] = useState<OrderRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ConciergeStatus | 'all'>('all')
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

  useEffect(() => {
    getOrderRequests().then(data => {
      setRequests(data)
      if (data.length > 0) setSelectedId(data[0].id)
      setIsLoading(false)
    })
  }, [])

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter)

  const selected = requests.find(r => r.id === selectedId) ?? null

  const handleStatusUpdate = (id: string, status: ConciergeStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const urgentCount = requests.filter(r => r.priority === 'urgent' && r.status !== 'delivered').length
  const activeCount = requests.filter(r => r.status !== 'delivered').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      {/* En-tête page */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-white text-2xl font-serif font-bold">Conciergerie</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {activeCount} demande{activeCount > 1 ? 's' : ''} active{activeCount > 1 ? 's' : ''}
            {urgentCount > 0 && (
              <span className="ml-2 text-red-400 font-medium">· {urgentCount} urgente{urgentCount > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        {/* Filtres statut */}
        <div className="hidden lg:flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {STATUS_FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                statusFilter === tab.key
                  ? 'bg-[#D4AF37] text-black'
                  : 'text-white/50 hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layout 2 colonnes */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">

        {/* Colonne gauche — liste */}
        <div className={cn(
          'w-full lg:w-80 xl:w-96 shrink-0 bg-[#111111] border border-white/10 rounded-2xl overflow-hidden flex flex-col',
          mobileShowDetail && 'hidden lg:flex',
        )}>
          {/* Filtres mobile */}
          <div className="flex gap-1.5 p-3 overflow-x-auto no-scrollbar border-b border-white/5 lg:hidden">
            {STATUS_FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0',
                  statusFilter === tab.key
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/5 text-white/50',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-white/20 text-sm">Aucune demande</div>
            ) : (
              filteredRequests.map(req => (
                <RequestCard
                  key={req.id}
                  req={req}
                  isSelected={req.id === selectedId}
                  onClick={() => {
                    setSelectedId(req.id)
                    setMobileShowDetail(true)
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Colonne droite — détail */}
        <div className={cn(
          'flex-1 bg-[#111111] border border-white/10 rounded-2xl overflow-hidden',
          !mobileShowDetail && 'hidden lg:block',
        )}>
          {/* Bouton retour mobile */}
          {mobileShowDetail && (
            <button
              onClick={() => setMobileShowDetail(false)}
              className="lg:hidden flex items-center gap-1.5 text-white/50 text-sm px-4 pt-4 hover:text-white transition-colors"
            >
              <X size={14} />
              Retour à la liste
            </button>
          )}

          {selected ? (
            <DetailPanel
              key={selected.id}
              req={selected}
              onStatusUpdate={handleStatusUpdate}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-white/20" />
              </div>
              <p className="text-white/30 text-sm">Sélectionnez une demande pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
