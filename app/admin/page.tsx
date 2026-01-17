/**
 * ADMIN - Dashboard principal
 * @ai-context Dashboard avec KPIs et graphiques pour SUPER_ADMIN
 */

import { getAdminMetrics, getOrdersChartData } from '@/lib/services/adminMetrics'
import { KPICard } from '@/components/admin/KPICard'
import { OrdersChart } from '@/components/admin/OrdersChart'

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics()
  const chartData = await getOrdersChartData(30)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-[#D4AF37] mb-2">Dashboard</h1>
        <p className="text-white/60">Vue d'ensemble de la plateforme SIGNARE</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Tailleurs totaux"
          value={metrics.totalTailors.toLocaleString()}
          subtitle={`${metrics.activeTailors} actifs`}
          icon="👔"
        />
        <KPICard
          title="Clients totaux"
          value={metrics.totalClients.toLocaleString()}
          subtitle="Utilisateurs inscrits"
          icon="👥"
        />
        <KPICard
          title="Commandes aujourd'hui"
          value={metrics.ordersToday.toString()}
          subtitle={`${metrics.ordersThisMonth} ce mois`}
          icon="🛒"
        />
        <KPICard
          title="GMV Total"
          value={`${(metrics.totalGMV / 1_000_000).toFixed(1)}M`}
          subtitle="FCFA"
          icon="💰"
        />
        <KPICard
          title="Commission Signare"
          value={`${(metrics.commissionSignare / 1_000_000).toFixed(1)}M`}
          subtitle="FCFA (15%)"
          icon="💳"
        />
        <KPICard
          title="Commandes en attente"
          value={metrics.pendingOrders.toString()}
          subtitle="À traiter"
          icon="⏳"
        />
      </div>

      {/* Chart */}
      <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Commandes (30 derniers jours)
        </h2>
        <OrdersChart data={chartData} />
      </div>
    </div>
  )
}

