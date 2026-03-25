/**
 * ADMIN - Page Brief de commande
 * @ai-context Visualisation du brief + canvas de signatures (client + tailleur)
 * Téléchargement PDF via /api/brief/[id]/pdf
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Check,
  AlertCircle,
  Pencil,
  Eraser,
  RotateCcw,
  FileText,
  User,
  Scissors,
  Calendar,
  Package,
  Ruler,
  MessageSquare,
} from 'lucide-react'
import {
  getOrderRequest,
  saveSignature,
  type OrderRequest,
} from '@/lib/services/adminConcierge'

// ── Canvas de signature ──────────────────────────────────────────────────────

interface SignatureCanvasProps {
  label: string
  icon: React.ReactNode
  existingSignature?: string
  existingDate?: string
  onSave: (dataUrl: string) => Promise<void>
  disabled?: boolean
}

function SignatureCanvas({
  label,
  icon,
  existingSignature,
  existingDate,
  onSave,
  disabled = false,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(!existingSignature)

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#0A0A0A'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [isEditing])

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    if (disabled) return
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getPos(e)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current || disabled) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
    setIsEmpty(false)
  }

  function stopDrawing() {
    isDrawing.current = false
    lastPos.current = null
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    setSaved(false)
  }

  async function handleSave() {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return
    setSaving(true)
    try {
      const dataUrl = canvas.toDataURL('image/png')
      await onSave(dataUrl)
      setSaved(true)
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function formatDate(iso?: string) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Vue : signature existante
  if (!isEditing && existingSignature) {
    return (
      <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white/40">{icon}</span>
            <span className="text-white/60 text-sm">{label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Check className="w-4 h-4" />
            <span className="text-xs font-medium">Signé</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingSignature}
            alt={`Signature ${label}`}
            className="h-16 w-full object-contain"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-xs">{formatDate(existingDate)}</p>
          {!disabled && (
            <button
              onClick={() => { setIsEditing(true); setSaved(false) }}
              className="text-xs text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors"
            >
              Modifier
            </button>
          )}
        </div>
      </div>
    )
  }

  // Vue : canvas de dessin
  return (
    <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white/40">{icon}</span>
          <span className="text-white/60 text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-white/30 text-xs">
          <Pencil className="w-3 h-3" />
          <span>Dessinez votre signature</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg overflow-hidden touch-none mb-3 border border-white/10">
        <canvas
          ref={canvasRef}
          width={560}
          height={120}
          className="w-full h-[100px] cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={clearCanvas}
          disabled={isEmpty}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/40 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Effacer
        </button>
        <div className="flex-1" />
        {existingSignature && (
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Annuler
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isEmpty || saving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#D4AF37] text-black rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#D4AF37]/90 transition-colors"
        >
          {saving ? (
            <div className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          {saving ? 'Enregistrement...' : 'Valider la signature'}
        </button>
      </div>
    </div>
  )
}

// ── Ligne d'info ──────────────────────────────────────────────────────────────

function InfoRow({ label, value, highlight = false }: { label: string; value?: string | number; highlight?: boolean }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-white/[0.06] last:border-0">
      <span className="text-white/40 text-sm">{label}</span>
      <span className={`text-sm font-medium text-right max-w-[60%] ${highlight ? 'text-[#D4AF37]' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function BriefPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const [request, setRequest] = useState<OrderRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getOrderRequest(requestId).then(req => {
      setRequest(req)
      setLoading(false)
    })
  }, [requestId])

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSignature(party: 'client' | 'tailor', dataUrl: string) {
    if (!request) return
    await saveSignature(request.id, party, dataUrl)
    // Reload local state
    const updated = await getOrderRequest(request.id)
    if (updated) setRequest(updated)
    showToast(
      party === 'client' ? 'Signature client enregistrée' : 'Signature tailleur enregistrée'
    )
  }

  async function handleDownloadPDF() {
    if (!request) return
    setDownloadLoading(true)
    try {
      const res = await fetch(`/api/brief/${request.id}/pdf`)
      if (!res.ok) throw new Error('Erreur génération PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `brief-${request.ref}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      showToast('PDF téléchargé')
    } catch {
      showToast('Erreur lors du téléchargement', 'error')
    } finally {
      setDownloadLoading(false)
    }
  }

  function formatDate(iso?: string) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  function formatCurrency(amount?: number) {
    if (!amount) return '—'
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-white/60">Demande introuvable</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-[#D4AF37] text-sm hover:underline"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const bothSigned = !!(request.clientSignature && request.tailorSignature)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-white font-serif text-xl">Brief — {request.ref}</h1>
              <p className="text-white/40 text-sm mt-0.5">{request.clientRef} · {formatDate(request.createdAt)}</p>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloadLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-xl text-sm font-medium hover:bg-[#D4AF37]/90 disabled:opacity-50 transition-all"
          >
            {downloadLoading ? (
              <div className="w-4 h-4 border border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Télécharger PDF
          </button>
        </div>

        <div className="space-y-5">
          {/* ── Tenue ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-white font-medium text-sm uppercase tracking-wide">Tenue commandée</h2>
            </div>
            <InfoRow label="Type" value={request.garment_type} highlight />
            <InfoRow label="Tissu" value={request.fabric_type} />
            <InfoRow label="Occasion" value={request.occasion} />
            <InfoRow label="Couleur" value={request.color} />
            <InfoRow label="Budget" value={formatCurrency(request.budget)} />
            <InfoRow label="Délai souhaité" value={formatDate(request.deadline)} />
            {request.notes && (
              <div className="mt-3 p-3 bg-white/[0.04] rounded-lg">
                <p className="text-white/40 text-xs mb-1">Notes client</p>
                <p className="text-white/80 text-sm leading-relaxed">{request.notes}</p>
              </div>
            )}
          </motion.div>

          {/* ── Instructions conciergerie ── */}
          {request.briefNotes && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-white font-medium text-sm uppercase tracking-wide">Instructions conciergerie</h2>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{request.briefNotes}</p>
              {request.briefSentAt && (
                <p className="text-white/30 text-xs mt-3">Brief émis le {formatDate(request.briefSentAt)}</p>
              )}
            </motion.div>
          )}

          {/* ── Mesures ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-white font-medium text-sm uppercase tracking-wide">Mesures</h2>
            </div>
            {request.hasMeasurements ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-emerald-300 text-sm">
                  Mesures validées — Ref. {request.measurementsRef ?? 'N/A'}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-amber-300 text-sm">
                  Mesures non disponibles — à collecter avant le démarrage de la production
                </p>
              </div>
            )}
          </motion.div>

          {/* ── Tailleur ── */}
          {request.targetTailor && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-white font-medium text-sm uppercase tracking-wide">Tailleur assigné</h2>
              </div>
              <div className="border-l-2 border-[#D4AF37] pl-4">
                <p className="text-white font-medium">{request.targetTailor.name}</p>
                <p className="text-white/40 text-sm mt-0.5">{request.targetTailor.specialty}</p>
                <p className="text-white/30 text-xs mt-2">Tél. interne : {request.targetTailor.phone}</p>
              </div>
            </motion.div>
          )}

          {/* ── Signatures ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-white font-medium text-sm uppercase tracking-wide">Signatures</h2>
              </div>
              {bothSigned && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Brief entièrement signé
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SignatureCanvas
                label="Conciergerie (pour le client)"
                icon={<User className="w-4 h-4" />}
                existingSignature={request.clientSignature}
                existingDate={request.clientSignedAt}
                onSave={(dataUrl) => handleSignature('client', dataUrl)}
              />
              <SignatureCanvas
                label="Tailleur"
                icon={<Scissors className="w-4 h-4" />}
                existingSignature={request.tailorSignature}
                existingDate={request.tailorSignedAt}
                onSave={(dataUrl) => handleSignature('tailor', dataUrl)}
              />
            </div>

            {!bothSigned && (
              <p className="text-white/30 text-xs mt-4 text-center">
                Les deux signatures sont requises pour valider le brief
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
