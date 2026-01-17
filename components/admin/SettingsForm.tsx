/**
 * ADMIN - Formulaire des paramètres système
 * @ai-context Formulaire pour modifier les paramètres
 */

'use client'

import { useState } from 'react'
import type { SystemSettings } from '@/lib/services/adminSettings'
import { updateSystemSettings } from '@/lib/services/adminSettings'

interface SettingsFormProps {
  initialSettings: SystemSettings
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateSystemSettings(settings)
      alert('Paramètres mis à jour avec succès')
    } catch (error) {
      alert('Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg p-6 space-y-6">
      {/* Commission Rate */}
      <div>
        <label className="block text-white font-medium mb-2">
          Taux de commission (%)
        </label>
        <input
          type="number"
          value={settings.commissionRate}
          onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
          className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
          min="0"
          max="100"
          step="0.1"
        />
      </div>

      {/* Delivery Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">
            Prix de base livraison (FCFA)
          </label>
          <input
            type="number"
            value={settings.deliveryBasePrice}
            onChange={(e) => setSettings({ ...settings, deliveryBasePrice: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
            min="0"
          />
        </div>
        <div>
          <label className="block text-white font-medium mb-2">
            Prix par km (FCFA)
          </label>
          <input
            type="number"
            value={settings.deliveryPricePerKm}
            onChange={(e) => setSettings({ ...settings, deliveryPricePerKm: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
            min="0"
          />
        </div>
      </div>

      {/* Order Amount Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">
            Montant minimum commande (FCFA)
          </label>
          <input
            type="number"
            value={settings.minOrderAmount}
            onChange={(e) => setSettings({ ...settings, minOrderAmount: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
            min="0"
          />
        </div>
        <div>
          <label className="block text-white font-medium mb-2">
            Montant maximum commande (FCFA)
          </label>
          <input
            type="number"
            value={settings.maxOrderAmount}
            onChange={(e) => setSettings({ ...settings, maxOrderAmount: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
            min="0"
          />
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.maintenanceMode}
          onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
          className="w-5 h-5 rounded border-[#D4AF37]/30 bg-[#0A0A0A] text-[#D4AF37] focus:ring-[#D4AF37]"
        />
        <label htmlFor="maintenanceMode" className="text-white font-medium">
          Mode maintenance
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </form>
  )
}

