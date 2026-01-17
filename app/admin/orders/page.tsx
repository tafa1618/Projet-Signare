/**
 * ADMIN - Page de gestion des commandes
 * @ai-context Gestion des commandes pour SUPER_ADMIN
 */

import { getOrders } from '@/lib/services/adminOrders'
import { OrdersTable } from '@/components/admin/OrdersTable'

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[#D4AF37] mb-2">Commandes</h1>
        <p className="text-white/60">Gestion de toutes les commandes de la plateforme</p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  )
}

