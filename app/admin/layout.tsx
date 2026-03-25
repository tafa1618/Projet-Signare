/**
 * ADMIN - Layout du dashboard admin
 * @ai-context Layout avec sidebar dynamique selon les permissions
 * @security Returns 404 for non-admin users to hide admin panel existence
 */

'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { useAuth } from '@/frontend/hooks/useAuth'
import { getUserRole } from '@/lib/auth/authorization'
import { Role } from '@/lib/auth/roles'
import type { User } from '@supabase/supabase-js'

const DEV_ADMIN_USER = {
  id: 'dev-admin',
  phone: '+221781110455',
  user_metadata: { name: 'Dev Admin' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '',
} as unknown as User
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // Dev bypass : accès direct sans auth (NEXT_PUBLIC_DEV_ADMIN=true dans .env.local)
    if (process.env.NEXT_PUBLIC_DEV_ADMIN === 'true') {
      setIsAuthorized(true)
      return
    }

    if (!isLoading) {
      // User not logged in = 404 (hide admin existence)
      if (!user) {
        setIsAuthorized(false)
        return
      }

      // Check admin role
      const role = getUserRole(user)
      if (!role) {
        // Not an admin = 404 (hide admin existence)
        setIsAuthorized(false)
        return
      }

      // User is authorized
      setIsAuthorized(true)
    }
  }, [user, isLoading])

  // Show loading state while checking
  if (isLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Chargement...</p>
        </div>
      </div>
    )
  }

  // SECURITY: Return 404 for unauthorized users
  // This hides the existence of the admin panel
  const isDev = process.env.NEXT_PUBLIC_DEV_ADMIN === 'true'
  if (!isAuthorized || (!user && !isDev)) {
    notFound()
  }

  const effectiveUser = isDev && !user ? DEV_ADMIN_USER : user!
  const role = isDev && !user ? Role.SUPER_ADMIN : getUserRole(user)
  if (!role) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar user={effectiveUser} role={role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <AdminHeader user={effectiveUser} role={role} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

