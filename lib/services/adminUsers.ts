/**
 * ADMIN - Service de gestion des utilisateurs (mocké)
 * @ai-context Gestion des tailleurs pour les admins
 */

export interface Tailor {
  id: string
  name: string
  phone: string
  email?: string
  city: string
  status: 'active' | 'pending' | 'suspended'
  totalOrders: number
  totalRevenue: number
  rating: number
  joinedAt: string
  lastActiveAt: string
}

export interface TailorStats {
  tailorId: string
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  averageRating: number
  responseTime: number // en heures
  satisfactionRate: number // en %
}

/**
 * Récupérer la liste des tailleurs
 */
export async function getTailors(filters?: {
  status?: 'active' | 'pending' | 'suspended'
  city?: string
  search?: string
}): Promise<Tailor[]> {
  await new Promise(resolve => setTimeout(resolve, 400))

  // Données mockées
  const mockTailors: Tailor[] = [
    {
      id: 'tailor-1',
      name: 'Tapha Tailleur',
      phone: '+221772222222',
      city: 'Dakar',
      status: 'active',
      totalOrders: 234,
      totalRevenue: 12_450_000,
      rating: 4.8,
      joinedAt: '2024-01-15',
      lastActiveAt: '2026-01-15T10:30:00Z',
    },
    {
      id: 'tailor-2',
      name: 'Awa Diop',
      phone: '+221773333333',
      city: 'Thiès',
      status: 'active',
      totalOrders: 156,
      totalRevenue: 8_900_000,
      rating: 4.6,
      joinedAt: '2024-03-20',
      lastActiveAt: '2026-01-14T15:20:00Z',
    },
    {
      id: 'tailor-3',
      name: 'Moussa Fall',
      phone: '+221774444444',
      city: 'Saint-Louis',
      status: 'pending',
      totalOrders: 0,
      totalRevenue: 0,
      rating: 0,
      joinedAt: '2026-01-10',
      lastActiveAt: '2026-01-10T09:00:00Z',
    },
    {
      id: 'tailor-4',
      name: 'Fatou Sarr',
      phone: '+221775555555',
      city: 'Dakar',
      status: 'suspended',
      totalOrders: 45,
      totalRevenue: 2_300_000,
      rating: 3.2,
      joinedAt: '2024-06-10',
      lastActiveAt: '2025-12-20T14:00:00Z',
    },
  ]

  // Appliquer les filtres
  let filtered = [...mockTailors]

  if (filters?.status) {
    filtered = filtered.filter(t => t.status === filters.status)
  }

  if (filters?.city) {
    filtered = filtered.filter(t => t.city.toLowerCase().includes(filters.city!.toLowerCase()))
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.phone.includes(searchLower) ||
        t.city.toLowerCase().includes(searchLower)
    )
  }

  return filtered
}

/**
 * Récupérer les statistiques d'un tailleur
 */
export async function getTailorStats(tailorId: string): Promise<TailorStats> {
  await new Promise(resolve => setTimeout(resolve, 300))

  return {
    tailorId,
    totalOrders: 234,
    completedOrders: 228,
    totalRevenue: 12_450_000,
    averageRating: 4.8,
    responseTime: 2.5,
    satisfactionRate: 94,
  }
}

/**
 * Mettre à jour le statut d'un tailleur
 */
export async function updateTailorStatus(
  tailorId: string,
  status: 'active' | 'pending' | 'suspended'
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200))
  // Mock: simuler la mise à jour
  console.log(`Updating tailor ${tailorId} to status: ${status}`)
}
