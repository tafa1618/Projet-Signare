/**
 * ADMIN - Table des commandes
 * @ai-context Table interactive pour gérer les commandes
 */

'use client'

import type { AdminOrder } from '@/lib/services/adminOrders'

interface OrdersTableProps {
  orders: AdminOrder[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const getStatusBadge = (status: AdminOrder['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'yellow' },
      paid: { label: 'Payé', color: 'blue' },
      in_preparation: { label: 'En préparation', color: 'purple' },
      in_delivery: { label: 'En livraison', color: 'orange' },
      delivered: { label: 'Livré', color: 'green' },
      cancelled: { label: 'Annulé', color: 'red' },
    }

    const config = statusConfig[status]
    const colorClasses = {
      yellow: 'bg-yellow-500/20 text-yellow-400',
      blue: 'bg-blue-500/20 text-blue-400',
      purple: 'bg-purple-500/20 text-purple-400',
      orange: 'bg-orange-500/20 text-orange-400',
      green: 'bg-green-500/20 text-green-400',
      red: 'bg-red-500/20 text-red-400',
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
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Acheteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Vendeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4AF37]/10">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-white/70 text-sm font-mono">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">{order.buyerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-white/70">{order.sellerName}</td>
                <td className="px-6 py-4 text-white/70">{order.productTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-[#D4AF37] font-semibold">
                  {order.amount.toLocaleString()} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-white/60 text-sm">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

