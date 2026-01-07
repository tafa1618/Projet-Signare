'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, ShoppingCart, ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'

interface CartDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const router = useRouter()
  const { cartItems, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleViewCart = () => {
    onClose()
    router.push('/cart')
  }

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Ajouter un petit délai pour éviter que le clic qui ouvre le dropdown ne le ferme immédiatement
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
          />
          
          {/* Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed right-2 md:right-4 top-16 md:top-20 w-[calc(100vw-1rem)] max-w-[340px] md:max-w-[380px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-[110] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <button
                onClick={handleViewCart}
                className="text-xs font-semibold text-gray-600 hover:text-[#D4AF37] transition-colors px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Voir le panier
              </button>
              <div className="text-sm font-bold text-gray-800">
                Total: {totalPrice.toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            {/* Cart Items */}
            <div className="max-h-[400px] overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 text-center">
                    Votre panier est vide
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-800 truncate mb-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-xs text-gray-600">
                              {item.price.toLocaleString('fr-FR')} FCFA
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              Qty: {String(item.quantity).padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                        title="Retirer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Checkout Button */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleViewCart}
                  className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-xl text-sm font-black uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all flex items-center justify-center gap-2"
                >
                  Commander
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Utiliser un portail pour rendre le dropdown directement dans le body
  return createPortal(dropdownContent, document.body)
}

