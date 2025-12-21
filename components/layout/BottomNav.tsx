'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Phone, Ruler, Wand2, Ticket, User } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Navigation Bottom Mobile-First
 * @ai-context Barre de navigation fixe avec animation soie et retour haptique visuel
 */

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/atelier', label: 'Atelier', icon: Ruler },
  { href: '/inspiration', label: 'IA', icon: Wand2 },
  { href: '/events', label: 'Events', icon: Ticket },
  { href: '/profil', label: 'Profil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  
  // Ne pas afficher la nav sur la page de login
  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-noir border-t border-or/20 z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full relative',
                'transition-colors duration-200',
                isActive ? 'text-or' : 'text-blanc/50 hover:text-blanc/80'
              )}
            >
              {/* Indicateur actif */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-or rounded-b-full"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
              
              {/* Icône avec animation */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 17,
                }}
              >
                <Icon className={cn('w-6 h-6', isActive && 'drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]')} />
              </motion.div>
              
              {/* Label */}
              <span
                className={cn(
                  'text-xs mt-1 font-medium',
                  isActive ? 'text-or' : 'text-blanc/60'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

