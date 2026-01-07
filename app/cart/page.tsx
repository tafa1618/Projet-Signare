'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  ShoppingCart, 
  ChevronLeft, 
  Plus, 
  Minus, 
  X, 
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const { cartItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    
    setIsProcessing(true)
    // Simuler le processus de commande
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Rediriger vers la page de commande
    router.push('/order/new')
  }

  const subtotal = totalPrice
  const shippingFee = 1500 // Frais de base
  const serviceFee = Math.round(subtotal * 0.15) // 15% de frais de service
  const finalTotal = subtotal + shippingFee + serviceFee

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg sm:text-xl font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em]">
                Mon Panier
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {cartItems.length === 0 ? (
          // Panier vide
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
          >
            <div className="bg-[#D4AF37]/10 p-6 rounded-full mb-6">
              <ShoppingCart className="w-16 h-16 text-[#D4AF37]/50" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-[#D4AF37] mb-3 text-center">
              Votre panier est vide
            </h2>
            <p className="text-sm text-white/60 mb-8 text-center max-w-sm">
              Découvrez nos créations et ajoutez-les à votre panier pour commencer vos achats.
            </p>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#D4AF37] text-[#0A0A0A] px-6 py-3 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                Découvrir la boutique
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Liste des produits */}
            <div className="space-y-3">
              {cartItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-[#D4AF37]/20 rounded-xl p-3 sm:p-4 hover:border-[#D4AF37]/30 transition-all"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Image produit */}
                    <Link href={`/shop/${item.productId}`}>
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 cursor-pointer group">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>

                    {/* Infos produit */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.productId}`}>
                        <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 hover:text-[#D4AF37] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      
                      {item.seller && (
                        <p className="text-xs text-white/60 mb-2">
                          Par {item.seller.name}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        {/* Prix */}
                        <div>
                          <p className="text-base sm:text-lg font-serif font-bold text-[#D4AF37]">
                            {item.price.toLocaleString('fr-FR')} FCFA
                          </p>
                          <p className="text-xs text-white/50">
                            {item.price.toLocaleString('fr-FR')} × {item.quantity}
                          </p>
                        </div>

                        {/* Contrôles quantité */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-white/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors flex items-center justify-center"
                          >
                            <Minus size={14} />
                          </motion.button>
                          
                          <span className="text-sm font-bold text-white w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-white/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors flex items-center justify-center"
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Bouton supprimer */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="text-white/40 hover:text-red-400 transition-colors p-1.5 flex-shrink-0 self-start"
                      title="Retirer du panier"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bouton vider le panier */}
            {cartItems.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={clearCart}
                className="w-full py-2.5 text-xs text-white/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Vider le panier
              </motion.button>
            )}

            {/* Récapitulatif */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-[#D4AF37]/20 rounded-xl p-4 sm:p-5 space-y-3"
            >
              <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.15em] mb-4">
                Récapitulatif
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Sous-total</span>
                  <span className="text-white font-semibold">
                    {subtotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Livraison (base)</span>
                  <span className="text-white font-semibold">
                    {shippingFee.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Frais de service (15%)</span>
                  <span className="text-white font-semibold">
                    {serviceFee.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="border-t border-[#D4AF37]/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-[#D4AF37] uppercase tracking-[0.1em]">
                      Total
                    </span>
                    <span className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37]">
                      {finalTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Badge de sécurité */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 text-xs text-white/50 bg-white/5 rounded-lg p-3"
            >
              <CheckCircle2 size={14} className="text-[#D4AF37] flex-shrink-0" />
              <span>Paiement sécurisé • Livraison rapide • Retours faciles</span>
            </motion.div>

            {/* Bouton Commander */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={isProcessing || cartItems.length === 0}
              className="w-full bg-[#D4AF37] text-[#0A0A0A] py-4 sm:py-5 rounded-xl text-sm sm:text-base font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Traitement...
                </>
              ) : (
                <>
                  Commander • {finalTotal.toLocaleString('fr-FR')} FCFA
                  <ChevronLeft size={20} className="rotate-180" />
                </>
              )}
            </motion.button>

            {/* Suggestion de produits */}
            <div className="pt-6">
              <p className="text-xs text-white/50 text-center mb-4">
                Continuez vos achats
              </p>
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 border border-[#D4AF37]/30 rounded-xl text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                >
                  Découvrir plus de produits
                </motion.button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

