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
    <header className="h-16 bg-[#0A0A0A] border-b border-[#D4AF37]/20 px-6 flex items-center justify-between shrink-0">
      <div className="min-w-0">
        <h2 className="text-white text-lg font-semibold truncate">Dashboard Admin</h2>
        <p className="text-white/60 text-sm truncate">Rôle: {role}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {user.user_metadata?.name || 'Admin'}
          </p>
          <p className="text-white/60 text-xs truncate">{user.phone || 'N/A'}</p>
        </div>
      </div>
    </header>
  )
}
