/**
 * ADMIN - Layout du dashboard admin
 * @ai-context Layout avec sidebar dynamique selon les permissions
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/frontend/hooks/useAuth'
import { getUserRole } from '@/lib/auth/authorization'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?redirect=/admin')
        return
      }

      const role = getUserRole(user)
      if (!role) {
        router.push('/403')
        return
      }

      setIsChecking(false)
    }
  }, [user, isLoading, router])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const role = getUserRole(user)
  if (!role) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar user={user} role={role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <AdminHeader user={user} role={role} />

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
