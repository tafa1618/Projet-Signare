/**
 * ADMIN - Service conciergerie (mocké)
 * @ai-context Gestion des demandes client → tailleur via conciergerie humaine
 * Statuts : received → in_negotiation → brief_sent → accepted → in_production → ready → delivered
 */

export type ConciergeStatus =
  | 'received'
  | 'in_negotiation'
  | 'brief_sent'
  | 'accepted'
  | 'in_production'
  | 'ready'
  | 'delivered'

export type ConciergeStatusFr = {
  [K in ConciergeStatus]: string
}

export const STATUS_LABELS: ConciergeStatusFr = {
  received: 'Reçue',
  in_negotiation: 'En négociation',
  brief_sent: 'Brief envoyé',
  accepted: 'Acceptée',
  in_production: 'En production',
  ready: 'Prête',
  delivered: 'Livrée',
}

export type Priority = 'urgent' | 'normal' | 'low'

export interface ConciergeTargetTailor {
  id: string
  name: string
  specialty: string
  phone: string
}

export interface OrderRequest {
  id: string
  ref: string
  clientRef: string
  createdAt: string
  status: ConciergeStatus
  priority: Priority
  // Tenue
  garment_type: string
  fabric_type?: string
  occasion: string
  color?: string
  notes?: string
  // Tailleur ciblé
  targetTailor?: ConciergeTargetTailor
  // Mesures
  hasMeasurements: boolean
  measurementsRef?: string
  // Budget & délai
  budget?: number
  deadline?: string
  // Brief
  briefNotes?: string
  briefSentAt?: string
  // Signatures (base64 PNG)
  clientSignature?: string
  tailorSignature?: string
  clientSignedAt?: string
  tailorSignedAt?: string
}

const MOCK_REQUESTS: OrderRequest[] = [
  {
    id: 'req-1',
    ref: 'DEM-001',
    clientRef: 'Client #142',
    createdAt: '2026-03-25T08:12:00Z',
    status: 'received',
    priority: 'urgent',
    garment_type: 'Boubou',
    fabric_type: 'Basin Riche',
    occasion: 'Baptême',
    color: 'Bleu marine & or',
    notes: 'Souhaite une broderie sur le col et les manches. Mariage le 29 mars, urgent.',
    hasMeasurements: true,
    measurementsRef: 'MSR-0088',
    budget: 95000,
    deadline: '2026-03-28',
  },
  {
    id: 'req-2',
    ref: 'DEM-002',
    clientRef: 'Client #138',
    createdAt: '2026-03-24T14:30:00Z',
    status: 'in_negotiation',
    priority: 'normal',
    garment_type: 'Kaftan',
    fabric_type: 'Soie',
    occasion: 'Soirée de gala',
    color: 'Bordeaux',
    notes: 'Coupe sirène, fermeture dos.',
    targetTailor: {
      id: 'tailor-teranga',
      name: 'Atelier Téranga',
      specialty: 'Kaftans premium & Soie',
      phone: '+221771234567',
    },
    hasMeasurements: true,
    measurementsRef: 'MSR-0071',
    budget: 120000,
    deadline: '2026-04-10',
  },
  {
    id: 'req-3',
    ref: 'DEM-003',
    clientRef: 'Client #135',
    createdAt: '2026-03-23T09:00:00Z',
    status: 'brief_sent',
    priority: 'normal',
    garment_type: 'Robe Wax',
    fabric_type: 'Wax Hollandais',
    occasion: 'Mariage',
    color: 'Jaune & vert',
    targetTailor: {
      id: 'tailor-ndeye',
      name: 'Maison Ndèye',
      specialty: 'Wax Premium & Coupe Ajustée',
      phone: '+221779876543',
    },
    hasMeasurements: false,
    budget: 70000,
    deadline: '2026-04-05',
    briefNotes: 'Robe wax 2 pièces. Jupe évasée, haut ajusté. Photos de référence envoyées.',
    briefSentAt: '2026-03-24T11:00:00Z',
  },
  {
    id: 'req-4',
    ref: 'DEM-004',
    clientRef: 'Client #129',
    createdAt: '2026-03-22T16:45:00Z',
    status: 'accepted',
    priority: 'normal',
    garment_type: 'Ensemble Tailleur',
    fabric_type: 'Lin',
    occasion: 'Professionnel',
    color: 'Beige & blanc cassé',
    targetTailor: {
      id: 'tailor-studio',
      name: 'Studio Dakar Luxe',
      specialty: 'Prêt-à-porter luxe & Lin',
      phone: '+221776543210',
    },
    hasMeasurements: true,
    measurementsRef: 'MSR-0055',
    budget: 60000,
    deadline: '2026-04-15',
    briefNotes: 'Veste croisée + pantalon droit. Doublure blanche. Boutons dorés.',
    briefSentAt: '2026-03-23T10:00:00Z',
  },
  {
    id: 'req-5',
    ref: 'DEM-005',
    clientRef: 'Client #120',
    createdAt: '2026-03-20T10:00:00Z',
    status: 'in_production',
    priority: 'low',
    garment_type: 'Robe de Mariée',
    fabric_type: 'Dentelle & Soie',
    occasion: 'Mariage',
    color: 'Blanc ivoire',
    targetTailor: {
      id: 'tailor-elegant',
      name: 'Elegant Coutures',
      specialty: 'Robes de Mariée & Soirée',
      phone: '+221775432109',
    },
    hasMeasurements: true,
    measurementsRef: 'MSR-0041',
    budget: 350000,
    deadline: '2026-05-01',
    briefNotes: 'Robe bustier, traîne 1m50. Perles brodées à la main. Voile assorti.',
    briefSentAt: '2026-03-21T09:00:00Z',
  },
  {
    id: 'req-6',
    ref: 'DEM-006',
    clientRef: 'Client #118',
    createdAt: '2026-03-18T11:30:00Z',
    status: 'ready',
    priority: 'normal',
    garment_type: 'Boubou',
    fabric_type: 'Bazin Riche',
    occasion: 'Tabaski',
    color: 'Vert émeraude',
    targetTailor: {
      id: 'tailor-fatou',
      name: 'Atelier Fatou',
      specialty: 'Spécialiste Basin Riche & Broderie Royale',
      phone: '+221778901234',
    },
    hasMeasurements: true,
    measurementsRef: 'MSR-0033',
    budget: 80000,
    deadline: '2026-03-25',
    briefNotes: 'Boubou grand modèle, broderie col et poignets. Fait.',
    briefSentAt: '2026-03-19T08:00:00Z',
  },
  {
    id: 'req-7',
    ref: 'DEM-007',
    clientRef: 'Client #112',
    createdAt: '2026-03-10T14:00:00Z',
    status: 'delivered',
    priority: 'normal',
    garment_type: 'Kaftan',
    fabric_type: 'Brocart',
    occasion: 'Cérémonie',
    color: 'Or & noir',
    targetTailor: {
      id: 'tailor-aminata',
      name: 'Couture Aminata',
      specialty: 'Prêt-à-porter de luxe & Wax contemporain',
      phone: '+221772109876',
    },
    hasMeasurements: true,
    measurementsRef: 'MSR-0019',
    budget: 110000,
    deadline: '2026-03-20',
    briefNotes: 'Livré le 19 mars. Client très satisfait.',
    briefSentAt: '2026-03-11T10:00:00Z',
  },
  {
    id: 'req-8',
    ref: 'DEM-008',
    clientRef: 'Client #145',
    createdAt: '2026-03-25T10:55:00Z',
    status: 'received',
    priority: 'urgent',
    garment_type: 'Ensemble 2 pièces',
    fabric_type: 'Wax Africain',
    occasion: 'Anniversaire',
    color: 'Orange vif & noir',
    notes: 'Haut col rond manches 3/4 + pantalon palazzo. Besoin sous 5 jours.',
    hasMeasurements: false,
    budget: 45000,
    deadline: '2026-03-30',
  },
]

export async function getOrderRequests(): Promise<OrderRequest[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return [...MOCK_REQUESTS].sort((a, b) => {
    const priorityOrder = { urgent: 0, normal: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export async function updateRequestStatus(
  id: string,
  status: ConciergeStatus
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const req = MOCK_REQUESTS.find(r => r.id === id)
  if (req) req.status = status
}

export async function updateBriefNotes(
  id: string,
  notes: string,
  tailorId?: string
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const req = MOCK_REQUESTS.find(r => r.id === id)
  if (req) {
    req.briefNotes = notes
    if (tailorId) {
      // En prod, on ferait un lookup Supabase ici
    }
  }
}

export async function saveSignature(
  id: string,
  party: 'client' | 'tailor',
  signatureDataUrl: string
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const req = MOCK_REQUESTS.find(r => r.id === id)
  if (req) {
    if (party === 'client') {
      req.clientSignature = signatureDataUrl
      req.clientSignedAt = new Date().toISOString()
    } else {
      req.tailorSignature = signatureDataUrl
      req.tailorSignedAt = new Date().toISOString()
    }
  }
}

export async function getOrderRequest(id: string): Promise<OrderRequest | null> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return MOCK_REQUESTS.find(r => r.id === id) ?? null
}

export interface CreateOrderPayload {
  tailorId?: string | null
  tailorName?: string
  tailorSpecialty?: string
  postId?: string | null
  garment_type: string
  fabric_type?: string
  occasion: string
  color?: string
  notes?: string
  hasMeasurements: boolean
  measurementsRef?: string
  budget?: number
  deadline?: string
  priority: Priority
}

export async function createOrderRequest(payload: CreateOrderPayload): Promise<OrderRequest> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const nextNum = MOCK_REQUESTS.length + 1
  const ref = `DEM-${String(nextNum).padStart(3, '0')}`

  const newRequest: OrderRequest = {
    id: `req-${nextNum}`,
    ref,
    clientRef: `Client #${Math.floor(Math.random() * 50) + 150}`,
    createdAt: new Date().toISOString(),
    status: 'received',
    priority: payload.priority,
    garment_type: payload.garment_type,
    fabric_type: payload.fabric_type,
    occasion: payload.occasion,
    color: payload.color,
    notes: payload.notes,
    targetTailor: payload.tailorId
      ? {
          id: payload.tailorId,
          name: payload.tailorName ?? 'Tailleur inconnu',
          specialty: payload.tailorSpecialty ?? '',
          phone: '',
        }
      : undefined,
    hasMeasurements: payload.hasMeasurements,
    measurementsRef: payload.measurementsRef,
    budget: payload.budget,
    deadline: payload.deadline,
  }

  MOCK_REQUESTS.unshift(newRequest)
  return newRequest
}

/** Prochain statut dans le pipeline */
export function nextStatus(current: ConciergeStatus): ConciergeStatus | null {
  const pipeline: ConciergeStatus[] = [
    'received', 'in_negotiation', 'brief_sent', 'accepted', 'in_production', 'ready', 'delivered',
  ]
  const idx = pipeline.indexOf(current)
  return idx < pipeline.length - 1 ? pipeline[idx + 1] : null
}

export function nextStatusLabel(current: ConciergeStatus): string | null {
  const labels: Partial<Record<ConciergeStatus, string>> = {
    received: 'Prendre en charge',
    in_negotiation: 'Envoyer le brief',
    brief_sent: 'Marquer comme accepté',
    accepted: 'Démarrer la production',
    in_production: 'Marquer comme prêt',
    ready: 'Confirmer la livraison',
  }
  return labels[current] ?? null
}
