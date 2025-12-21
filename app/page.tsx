'use client'

import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Page d'accueil - Flux Social
 * @ai-context Point d'entrée principal de l'application
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <Sparkles className="w-16 h-16 mx-auto mb-6 text-or" />
        <h1 className="text-4xl font-serif mb-4">SIGNARE</h1>
        <p className="text-blanc/70 text-lg mb-2">Flux Social</p>
        <p className="text-or text-sm">Hello World - Page d&apos;accueil</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-12 space-y-2 text-center text-blanc/50 text-sm"
      >
        <p>🇸🇳 Mode Sénégalaise de Luxe</p>
        <p>✨ Architecture Data-Ready pour IA</p>
        <p>🎨 Design Noir Profond & Or Raffiné</p>
      </motion.div>
    </div>
  )
}

