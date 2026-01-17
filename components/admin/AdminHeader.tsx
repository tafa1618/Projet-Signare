/**
 * ADMIN - Header du dashboard admin
 * @ai-context Header avec informations utilisateur
 */

import type { User } from '@supabase/supabase-js'
import { Role } from '@/lib/auth/roles'

interface AdminHeaderProps {
  user: User
  role: Role
}

export default function AdminHeader({ user, role }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-[#0A0A0A] border-b border-[#D4AF37]/20 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-white text-lg font-semibold">Dashboard Admin</h2>
        <p className="text-white/60 text-sm">Rôle: {role}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white text-sm font-medium">
            {user.user_metadata?.name || 'Admin'}
          </p>
          <p className="text-white/60 text-xs">{user.phone || 'N/A'}</p>
        </div>
      </div>
    </header>
  )
}
