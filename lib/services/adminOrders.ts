/**
 * ADMIN - Service de gestion des commandes (mocké)
 * @ai-context Gestion des commandes pour SUPER_ADMIN
 */

export interface AdminOrder {
  id: string
  buyerName: string
  sellerName: string
  productTitle: string
  amount: number
  status: 'pending' | 'paid' | 'in_preparation' | 'in_delivery' | 'delivered' | 'cancelled'
  createdAt: string
  deliveredAt?: string
}

/**
 * Récupérer la liste des commandes
 */
export async function getOrders(filters?: {
  status?: AdminOrder['status']
  dateFrom?: string
  dateTo?: string
}): Promise<AdminOrder[]> {
  await new Promise(resolve => setTimeout(resolve, 400))

  const mockOrders: AdminOrder[] = [
    {
      id: 'order-1',
      buyerName: 'Aminata Ndiaye',
      sellerName: 'Tapha Tailleur',
      productTitle: 'Boubou en basin riche',
      amount: 45000,
      status: 'delivered',
      createdAt: '2026-01-10T10:00:00Z',
      deliveredAt: '2026-01-12T14:30:00Z',
    },
    {
      id: 'order-2',
      buyerName: 'Mariama Diallo',
      sellerName: 'Awa Diop',
      productTitle: 'Robe wax couture',
      amount: 35000,
      status: 'in_delivery',
      createdAt: '2026-01-14T09:00:00Z',
    },
    {
      id: 'order-3',
      buyerName: 'Fatou Ba',
      sellerName: 'Tapha Tailleur',
      productTitle: 'Kaftan de soirée',
      amount: 55000,
      status: 'paid',
      createdAt: '2026-01-15T11:00:00Z',
    },
  ]

  let filtered = [...mockOrders]

  if (filters?.status) {
    filtered = filtered.filter(o => o.status === filters.status)
  }

  return filtered
}
