/**
 * ADMIN - Table des administrateurs
 * @ai-context Table interactive pour gérer les admins
 */

'use client'

import { useState } from 'react'
import type { AdminUser } from '@/lib/services/adminUsersManagement'
import { Role } from '@/lib/auth/roles'
import { updateAdminUser, deactivateAdminUser, deleteAdminUser } from '@/lib/services/adminUsersManagement'
import { useAuth } from '@/frontend/hooks/useAuth'
import { Shield, ShieldCheck, UserX, Trash2, Edit2, MoreVertical } from 'lucide-react'

interface AdminsTableProps {
  admins: AdminUser[]
}

export function AdminsTable({ admins: initialAdmins }: AdminsTableProps) {
  const { user } = useAuth()
  const [admins, setAdmins] = useState(initialAdmins)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const getRoleBadge = (role: Role) => {
    const roleConfig = {
      [Role.SUPER_ADMIN]: { label: 'Super Admin', color: 'purple' },
      [Role.RESPONSABLE_COMMERCIAL]: { label: 'Responsable Commercial', color: 'blue' },
      [Role.BUSINESS_DEVELOPER]: { label: 'Business Developer', color: 'green' },
      [Role.ADMIN]: { label: 'Admin', color: 'yellow' },
    }

    const config = roleConfig[role]
    const colorClasses = {
      purple: 'bg-purple-500/20 text-purple-400',
      blue: 'bg-blue-500/20 text-blue-400',
      green: 'bg-green-500/20 text-green-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colorClasses[config.color as keyof typeof colorClasses]}`}>
        {role === Role.SUPER_ADMIN && <ShieldCheck className="w-3 h-3" />}
        {config.label}
      </span>
    )
  }

  const handleRoleChange = async (adminId: string, newRole: Role) => {
    if (!user) return

    try {
      await updateAdminUser({ 
        id: adminId, 
        role: newRole,
        updatedBy: user.id 
      })
      setAdmins(admins.map(a => a.id === adminId ? { ...a, role: newRole } : a))
      setEditingId(null)
      setSelectedRole(null)
      alert('Rôle mis à jour avec succès')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rôle')
    }
  }

  const handleDeactivate = async (adminId: string) => {
    if (!user) return

    if (!confirm('Êtes-vous sûr de vouloir désactiver ce compte admin ?')) return

    try {
      await deactivateAdminUser(adminId, user.id)
      setAdmins(admins.map(a => a.id === adminId ? { ...a, isActive: false } : a))
      alert('Compte désactivé avec succès')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la désactivation')
    }
  }

  const handleDelete = async (adminId: string) => {
    if (!user) return

    const admin = admins.find(a => a.id === adminId)
    if (admin?.role === Role.SUPER_ADMIN) {
      alert('Impossible de supprimer un Super Admin')
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce compte admin ? Cette action est irréversible.')) return

    try {
      await deleteAdminUser(adminId, user.id)
      setAdmins(admins.filter(a => a.id !== adminId))
      alert('Compte supprimé avec succès')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#0A0A0A] border-b border-[#D4AF37]/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Dernière activité
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4AF37]/10">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-white/60">
                  Aucun admin trouvé
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div className="text-white font-medium">{admin.name}</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-white/70 text-sm">
                  {admin.phone}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-white/70 text-sm">
                  {admin.email || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {editingId === admin.id ? (
                    <select
                      value={selectedRole || admin.role}
                      onChange={(e) => setSelectedRole(e.target.value as Role)}
                      onBlur={() => {
                        if (selectedRole && selectedRole !== admin.role) {
                          handleRoleChange(admin.id, selectedRole)
                        } else {
                          setEditingId(null)
                          setSelectedRole(null)
                        }
                      }}
                      autoFocus
                      className="px-2 py-1 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    >
                      {Object.values(Role).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      {getRoleBadge(admin.role)}
                      {admin.role !== Role.SUPER_ADMIN && (
                        <button
                          onClick={() => {
                            setEditingId(admin.id)
                            setSelectedRole(admin.role)
                          }}
                          className="text-white/40 hover:text-[#D4AF37] transition-colors"
                          title="Modifier le rôle"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {admin.isActive ? (
                    <span className="inline-flex px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                      Inactif
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-white/60 text-sm">
                  {admin.lastActiveAt 
                    ? new Date(admin.lastActiveAt).toLocaleDateString('fr-FR')
                    : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    {admin.role !== Role.SUPER_ADMIN && (
                      <>
                        <button
                          onClick={() => handleDeactivate(admin.id)}
                          disabled={!admin.isActive}
                          className="p-2 text-white/60 hover:text-yellow-400 transition-colors disabled:opacity-30"
                          title="Désactiver"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 text-white/60 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

