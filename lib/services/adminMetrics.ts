/**
 * ADMIN - Service de métriques (mocké)
 * @ai-context Métriques pour le dashboard admin
 */

export interface AdminMetrics {
  totalTailors: number
  totalClients: number
  ordersToday: number
  ordersThisMonth: number
  totalGMV: number
  commissionSignare: number
  activeTailors: number
  pendingOrders: number
}

/**
 * Récupérer les métriques du dashboard
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  // Simuler un délai API
  await new Promise(resolve => setTimeout(resolve, 300))

  return {
    totalTailors: 1247,
    totalClients: 8934,
    ordersToday: 23,
    ordersThisMonth: 687,
    totalGMV: 45_230_000, // En FCFA
    commissionSignare: 6_784_500, // 15% du GMV
    activeTailors: 892,
    pendingOrders: 156,
  }
}

/**
 * Récupérer les données pour graphique (mocké)
 */
export interface ChartData {
  labels: string[]
  values: number[]
}

export async function getOrdersChartData(days: number = 30): Promise<ChartData> {
  await new Promise(resolve => setTimeout(resolve, 200))

  const labels: string[] = []
  const values: number[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }))
    // Générer des valeurs aléatoires entre 10 et 50
    values.push(Math.floor(Math.random() * 40) + 10)
  }

  return { labels, values }
}
