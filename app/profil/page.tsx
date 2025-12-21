'use client'

import { User } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Page Profil - Paramètres utilisateur
 * @ai-context Profil avec métadonnées ML (role_score, style_preferences)
 */
export default function ProfilPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <User className="w-16 h-16 mx-auto mb-6 text-or" />
        <h1 className="text-4xl font-serif mb-4">Profil</h1>
        <p className="text-blanc/70 text-lg mb-2">Paramètres utilisateur</p>
        <p className="text-or text-sm">Hello World - Profil</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-12 text-center text-blanc/50 text-sm space-y-2"
      >
        <p>👤 Profil personnalisé</p>
        <p>📊 Score comportemental (ML)</p>
        <p>🎨 Préférences stylistiques</p>
      </motion.div>
    </div>
  )
}

