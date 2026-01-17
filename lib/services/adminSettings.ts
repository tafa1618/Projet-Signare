/**
 * ADMIN - Service de gestion des paramètres (mocké)
 * @ai-context Paramètres système pour SUPER_ADMIN
 */

export interface SystemSettings {
  platformName: string
  commissionRate: number
  deliveryBasePrice: number
  deliveryPricePerKm: number
  minOrderAmount: number
  maxOrderAmount: number
  maintenanceMode: boolean
}

/**
 * Récupérer les paramètres système
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  await new Promise(resolve => setTimeout(resolve, 300))

  return {
    platformName: 'SIGNARE',
    commissionRate: 15, // 15%
    deliveryBasePrice: 1500, // FCFA
    deliveryPricePerKm: 100, // FCFA
    minOrderAmount: 5000, // FCFA
    maxOrderAmount: 1_000_000, // FCFA
    maintenanceMode: false,
  }
}

/**
 * Mettre à jour les paramètres système
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<SystemSettings> {
  await new Promise(resolve => setTimeout(resolve, 300))
  console.log('Updating system settings:', settings)
  
  // Retourner les settings mis à jour (mock)
  const current = await getSystemSettings()
  return { ...current, ...settings }
}
