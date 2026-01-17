/**
 * ADMIN - Page de gestion des utilisateurs admin
 * @ai-context Gestion des comptes admin pour SUPER_ADMIN uniquement
 */

import { getAdminUsers } from '@/lib/services/adminUsersManagement'
import { AdminsTable } from '@/components/admin/AdminsTable'
import { CreateAdminButton } from '@/components/admin/CreateAdminButton'

export default async function AdminsManagementPage() {
  const admins = await getAdminUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[#D4AF37] mb-2">Gestion des Admins</h1>
          <p className="text-white/60">Créer et gérer les comptes administrateurs</p>
        </div>
        <CreateAdminButton />
      </div>

      <AdminsTable admins={admins} />
    </div>
  )
}

