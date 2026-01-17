/**
 * ADMIN - Page des paramètres système
 * @ai-context Paramètres système pour SUPER_ADMIN
 */

import { getSystemSettings } from '@/lib/services/adminSettings'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const settings = await getSystemSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[#D4AF37] mb-2">Paramètres Système</h1>
        <p className="text-white/60">Configuration de la plateforme SIGNARE</p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}

