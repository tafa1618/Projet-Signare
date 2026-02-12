'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&h=1600&fit=crop"
          alt="SIGNARE - Haute Couture Sénégalaise"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Gradient overlay pour meilleure lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-[#0A0A0A]/75 to-[#0A0A0A]/90" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 max-w-md w-full">
        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <div className="relative w-64 h-64 mx-auto mb-8">
            <Image
              src="/logo.png"
              alt="SIGNARE"
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              priority
            />
          </div>

          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-6" />

          <p className="text-white/90 text-base font-light tracking-wide leading-relaxed mb-2">
            L'art de la haute couture sénégalaise à votre portée.
          </p>
          <p className="text-[#D4AF37]/90 text-sm font-serif italic tracking-wide">
            La porte d'entrée mondiale de la mode sénégalaise
          </p>
        </motion.div>

        {/* Boutons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full space-y-8 mt-12"
        >
          {/* Bouton SE CONNECTER */}
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(212,175,55,0.5)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#D4AF37] text-[#0A0A0A] font-bold text-sm tracking-widest uppercase py-4 rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              SE CONNECTER
            </motion.button>
          </Link>

          {/* Bouton CRÉER UN COMPTE */}
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.02, borderColor: '#D4AF37' }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-transparent border-2 border-[#D4AF37]/60 text-white font-semibold text-sm tracking-widest uppercase py-4 rounded-lg transition-all duration-300 hover:bg-[#D4AF37]/10"
            >
              CRÉER UN COMPTE
            </motion.button>
          </Link>
        </motion.div>

        {/* Lien Découvrir sans compte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8"
        >
          <Link href="/feed">
            <span className="text-white/50 text-xs tracking-wide hover:text-[#D4AF37] transition-colors duration-300 cursor-pointer border-b border-white/20 hover:border-[#D4AF37]/50 pb-1">
              Découvrir sans compte
            </span>
          </Link>
        </motion.div>

        {/* Ornement décoratif */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="mt-12 flex items-center gap-3"
        >
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
          <Sparkles className="w-4 h-4 text-[#D4AF37]/40" />
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
        </motion.div>
      </div>

      {/* Badge "Made in Senegal" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex items-center gap-2 text-[#D4AF37]/40 text-xs tracking-widest">
          <span>🇸🇳</span>
          <span>MADE IN SENEGAL</span>
        </div>
      </motion.div>
    </div>
  )
}

