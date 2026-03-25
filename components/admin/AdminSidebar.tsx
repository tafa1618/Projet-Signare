/**
 * ADMIN - Sidebar avec menus dynamiques selon permissions
 * @ai-context Sidebar qui génère les menus selon les rôles
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Role } from '@/lib/auth/roles'
import { hasPermission } from '@/lib/auth/authorization'
import { Permission } from '@/lib/auth/roles'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  ConciergeBell,
} from 'lucide-react'
import { useAuth } from '@/frontend/hooks/useAuth'

interface MenuItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission: Permission
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: Permission.VIEW_DASHBOARD,
  },
  {
    label: 'Tailleurs',
    href: '/admin/users/tailors',
    icon: Users,
    permission: Permission.VIEW_TAILORS,
  },
  {
    label: 'Gestion Admins',
    href: '/admin/users/admins',
    icon: Shield,
    permission: Permission.CREATE_ACCOUNTS,
  },
  {
    label: 'Conciergerie',
    href: '/admin/concierge',
    icon: ConciergeBell,
    permission: Permission.MANAGE_CONCIERGE,
  },
  {
    label: 'Commandes',
    href: '/admin/orders',
    icon: ShoppingCart,
    permission: Permission.VIEW_ORDERS,
  },
  {
    label: 'Paiements',
    href: '/admin/payments',
    icon: CreditCard,
    permission: Permission.VIEW_PAYMENTS,
  },
  {
    label: 'Modération',
    href: '/admin/feed',
    icon: FileText,
    permission: Permission.MODERATE_FEED,
  },
  {
    label: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    permission: Permission.MANAGE_SETTINGS,
  },
]

interface AdminSidebarProps {
  user: User
  role: Role
}

export default function AdminSidebar({ user, role }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  // Filtrer les menus selon les permissions
  const visibleMenus = MENU_ITEMS.filter(item =>
    hasPermission(user, item.permission)
  )

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#D4AF37] text-[#0A0A0A] rounded-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0
          h-full w-64
          bg-[#0A0A0A] border-r border-[#D4AF37]/20
          z-40
          transform transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#D4AF37]/20">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0A0A] font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-[#D4AF37] font-serif text-xl tracking-wide">
                  SIGNARE
                </h1>
                <p className="text-white/60 text-xs">Admin Dashboard</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                <span className="text-[#D4AF37] font-bold">
                  {user.user_metadata?.name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user.user_metadata?.name || 'Admin'}
                </p>
                <p className="text-white/60 text-xs truncate">{role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {visibleMenus.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors
                    ${
                      isActive
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-[#D4AF37]/20">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
