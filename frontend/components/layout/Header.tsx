'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Sparkles, 
  Search, 
  Store, 
  ShoppingCart, 
  Bell, 
  MessageCircle, 
  Plus, 
  Menu,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/frontend/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import SearchModal from '@/components/SearchModal'
import CartDropdown from '@/components/CartDropdown'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isTouching, setIsTouching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, signOut } = useAuth()

  // Ne pas afficher le header sur certaines pages
  const hideHeader = pathname === '/welcome' || pathname === '/login' || pathname === '/register' || pathname === '/onboarding'
  
  if (hideHeader) return null

  // Logique de scroll pour le header (comme le footer)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let scrollTimeout: NodeJS.Timeout
    let touchTimeout: NodeJS.Timeout

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Cacher si on scroll vers le bas (plus de 50px)
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHeaderVisible(false)
        clearTimeout(scrollTimeout)
        // Réafficher après 2 secondes d'inactivité de scroll
        scrollTimeout = setTimeout(() => {
          setHeaderVisible(true)
        }, 2000)
      } else if (currentScrollY < lastScrollY || currentScrollY < 30) {
        // Afficher si on scroll vers le haut ou si on est en haut
        setHeaderVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    const handleTouchStart = () => {
      setIsTouching(true)
      setHeaderVisible(true)
      clearTimeout(touchTimeout)
    }

    const handleTouchEnd = () => {
      setIsTouching(false)
      // Garder visible pendant 3 secondes après le touch
      clearTimeout(touchTimeout)
      touchTimeout = setTimeout(() => {
        if (!isTouching && window.scrollY < 50) {
          setHeaderVisible(false)
        }
      }, 3000)
    }

    // Afficher au chargement si on est déjà scrollé
    if (window.scrollY > 50) {
      setHeaderVisible(false)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
      clearTimeout(scrollTimeout)
      clearTimeout(touchTimeout)
    }
  }, [lastScrollY, isTouching])

  const handleLogout = async () => {
    await signOut()
    router.push('/welcome')
  }

  // Récupérer l'initiale de l'utilisateur pour l'avatar
  const userInitial = user?.user_metadata?.name?.[0]?.toUpperCase() || 'U'

  return (
    <>
      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Header Luxe Signare */}
      <AnimatePresence>
        {headerVisible && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0A0A0A]/95 backdrop-blur-xl"
          >
            <div className="max-w-2xl mx-auto">
              {/* Top Bar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="bg-[#D4AF37] p-1 sm:p-1.5 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)] flex-shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A]" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em] truncate">SIGNARE</h1>
                </div>
                
                {/* Desktop: Tous les boutons visibles */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Search Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchOpen(true)}
                    className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                    title="Rechercher"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>
                  
                  {/* Shop */}
                  <Link href="/shop">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                      title="Boutique"
                    >
                      <Store className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  
                  {/* Panier */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCartOpen(!cartOpen)
                      }}
                      className="relative text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                      title="Panier"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {totalItems > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                      )}
                    </motion.button>
                    {cartOpen && <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />}
                  </div>
                  
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                  </motion.button>
                  
                  {/* Messages */}
                  <Link href="/messages">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-2"
                      title="Messages"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                    </motion.button>
                  </Link>
                  
                  {/* Avatar Profil */}
                  <Link href="/profil">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden flex-shrink-0"
                      title="Profil"
                    >
                      <span className="text-sm text-[#D4AF37] font-bold">
                        {userInitial}
                      </span>
                    </motion.button>
                  </Link>
                  
                  {/* Publish */}
                  <Link href="/publish">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-[#D4AF37] p-2 rounded-full shadow-lg flex-shrink-0"
                      title="Publier"
                    >
                      <Plus className="w-5 h-5 text-[#0A0A0A]" strokeWidth={3} />
                    </motion.button>
                  </Link>
                </div>
                
                {/* Mobile: Boutons essentiels + Menu Hamburger */}
                <div className="flex md:hidden items-center gap-1.5">
                  {/* Publish - Toujours visible */}
                  <Link href="/publish">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-[#D4AF37] p-1.5 rounded-full shadow-lg flex-shrink-0"
                      title="Publier"
                    >
                      <Plus className="w-4 h-4 text-[#0A0A0A]" strokeWidth={3} />
                    </motion.button>
                  </Link>
                  
                  {/* Search Button - Visible à côté du + */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchOpen(true)}
                    className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors p-1.5"
                    title="Rechercher"
                    aria-label="Rechercher"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>
                  
                  {/* Avatar Profil - Toujours visible */}
                  <Link href="/profil">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden flex-shrink-0"
                      title="Profil"
                    >
                      <span className="text-xs text-[#D4AF37] font-bold">
                        {userInitial}
                      </span>
                    </motion.button>
                  </Link>
                  
                  {/* Menu Hamburger */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-1.5"
                    title="Menu"
                    aria-label="Menu"
                  >
                    <Menu className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              
              {/* Menu Hamburger Mobile */}
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="md:hidden border-t border-[#D4AF37]/20 bg-[#0A0A0A] px-4 py-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/shop"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors"
                    >
                      <Store className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-sm font-semibold text-white">Boutique</span>
                    </Link>
                    
                    <motion.button
                      onClick={() => {
                        setCartOpen(true)
                        setMenuOpen(false)
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors relative"
                    >
                      <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-sm font-semibold text-white">Panier</span>
                      {totalItems > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen)
                        setMenuOpen(false)
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors relative"
                    >
                      <Bell className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                    </motion.button>
                    
                    <Link
                      href="/messages"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors relative"
                    >
                      <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-sm font-semibold text-white">Messages</span>
                      <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full border border-[#0A0A0A]" />
                    </Link>
                    
                    {user && (
                      <motion.button
                        onClick={() => {
                          handleLogout()
                          setMenuOpen(false)
                        }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors col-span-2"
                      >
                        <LogOut className="w-5 h-5 text-red-400" />
                        <span className="text-sm font-semibold text-red-400">Déconnexion</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  )
}

