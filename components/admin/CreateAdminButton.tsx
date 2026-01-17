/**
 * ADMIN - Bouton et modal pour créer un nouvel admin
 * @ai-context Modal de création d'admin pour SUPER_ADMIN
 */

'use client'

import { useState } from 'react'
import { Role } from '@/lib/auth/roles'
import { createAdminUser } from '@/lib/services/adminUsersManagement'
import { useAuth } from '@/frontend/hooks/useAuth'
import { Plus, X } from 'lucide-react'

export function CreateAdminButton() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    role: Role.ADMIN,
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.phone || !formData.name) {
      setError('Le téléphone et le nom sont requis')
      return
    }

    if (!formData.phone.match(/^\+?[0-9]{9,15}$/)) {
      setError('Numéro de téléphone invalide')
      return
    }

    setIsSubmitting(true)

    if (!user) {
      setError('Vous devez être connecté')
      return
    }

    try {
      await createAdminUser({
        phone: formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`,
        name: formData.name,
        email: formData.email || undefined,
        role: formData.role,
        createdBy: user.id,
      })

      alert('Compte admin créé avec succès !')
      setIsOpen(false)
      setFormData({
        phone: '',
        name: '',
        email: '',
        role: Role.ADMIN,
      })
      // Recharger la page pour voir le nouvel admin
      window.location.reload()
    } catch (err) {
      setError('Erreur lors de la création du compte')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Créer un Admin
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-[#D4AF37]">Créer un Admin</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@signare.sn"
                  className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Rôle *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value={Role.ADMIN}>Admin (Modération Feed)</option>
                  <option value={Role.RESPONSABLE_COMMERCIAL}>Responsable Commercial</option>
                  <option value={Role.BUSINESS_DEVELOPER}>Business Developer</option>
                  <option value={Role.SUPER_ADMIN} disabled>Super Admin (non disponible)</option>
                </select>
                <p className="text-white/50 text-xs mt-1">
                  {formData.role === Role.ADMIN && 'Peut modérer le feed et supprimer des posts'}
                  {formData.role === Role.RESPONSABLE_COMMERCIAL && 'Peut gérer les tailleurs (validation, suspension, stats)'}
                  {formData.role === Role.BUSINESS_DEVELOPER && 'Peut voir les tailleurs et leurs statistiques (lecture seule)'}
                </p>
              </div>

              {/* Erreur */}
              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

