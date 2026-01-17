/**
 * ADMIN - Service de gestion des paiements (mocké)
 * @ai-context Gestion des paiements pour SUPER_ADMIN
 */

import type { Payment } from '@/shared/types/database.types'

/**
 * Récupérer la liste des paiements
 */
export async function getPayments(filters?: {
  status?: Payment['status']
  purpose?: Payment['purpose']
  dateFrom?: string
  dateTo?: string
}): Promise<Payment[]> {
  await new Promise(resolve => setTimeout(resolve, 400))

  // Mock data - en production, récupérer depuis PaymentService
  const mockPayments: Payment[] = [
    {
      id: 'payment-1',
      user_id: 'user-1',
      reference: 'PAY-20260115120000-ABC12345',
      amount: 45000,
      currency: 'XOF',
      purpose: 'ORDER',
      status: 'SUCCESS',
      provider: 'MOCK',
      provider_reference: 'MOCK-123',
      metadata: { orderId: 'order-1' },
      created_at: '2026-01-15T12:00:00Z',
      updated_at: '2026-01-15T12:01:00Z',
    },
    {
      id: 'payment-2',
      user_id: 'user-2',
      reference: 'PAY-20260115130000-DEF67890',
      amount: 35000,
      currency: 'XOF',
      purpose: 'ORDER',
      status: 'PENDING',
      provider: 'MOCK',
      provider_reference: 'MOCK-456',
      metadata: { orderId: 'order-2' },
      created_at: '2026-01-15T13:00:00Z',
      updated_at: '2026-01-15T13:00:00Z',
    },
  ]

  let filtered = [...mockPayments]

  if (filters?.status) {
    filtered = filtered.filter(p => p.status === filters.status)
  }

  if (filters?.purpose) {
    filtered = filtered.filter(p => p.purpose === filters.purpose)
  }

  return filtered
}
