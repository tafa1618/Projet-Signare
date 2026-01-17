/**
 * ADMIN - Table des paiements
 * @ai-context Table interactive pour gérer les paiements
 */

'use client'

import type { Payment } from '@/shared/types/database.types'

interface PaymentsTableProps {
  payments: Payment[]
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      INITIATED: { label: 'Initié', color: 'yellow' },
      PENDING: { label: 'En attente', color: 'orange' },
      SUCCESS: { label: 'Réussi', color: 'green' },
      FAILED: { label: 'Échoué', color: 'red' },
      CANCELLED: { label: 'Annulé', color: 'gray' },
    }

    const config = statusConfig[status]
    const colorClasses = {
      yellow: 'bg-yellow-500/20 text-yellow-400',
      orange: 'bg-orange-500/20 text-orange-400',
      green: 'bg-green-500/20 text-green-400',
      red: 'bg-red-500/20 text-red-400',
      gray: 'bg-gray-500/20 text-gray-400',
    }

    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${colorClasses[config.color as keyof typeof colorClasses]}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0A0A0A] border-b border-[#D4AF37]/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Référence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4AF37]/10">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-white/70 text-sm font-mono">
                  {payment.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#D4AF37] font-semibold">
                  {payment.amount.toLocaleString()} {payment.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white/70 text-sm">
                  {payment.purpose}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-white/60 text-sm">
                  {payment.provider}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white/60 text-sm">
                  {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

