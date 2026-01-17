/**
 * ADMIN - Page de gestion des paiements
 * @ai-context Gestion des paiements pour SUPER_ADMIN
 */

import { getPayments } from '@/lib/services/adminPayments'
import { PaymentsTable } from '@/components/admin/PaymentsTable'

export default async function PaymentsPage() {
  const payments = await getPayments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[#D4AF37] mb-2">Paiements</h1>
        <p className="text-white/60">Gestion de tous les paiements de la plateforme</p>
      </div>

      <PaymentsTable payments={payments} />
    </div>
  )
}

