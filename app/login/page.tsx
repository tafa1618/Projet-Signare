'use client'

import { Phone } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Page de connexion - Authentification OTP
 * @ai-context Auth uniquement par numéro de téléphone (pas de Google)
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <Phone className="w-16 h-16 mx-auto mb-6 text-or" />
        <h1 className="text-4xl font-serif mb-4">Connexion</h1>
        <p className="text-blanc/70 text-lg mb-2">Authentification par téléphone</p>
        <p className="text-or text-sm">Hello World - Login</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-12 text-center text-blanc/50 text-sm"
      >
        <p>📱 Connexion sécurisée par OTP</p>
        <p className="mt-2">🚫 Pas de Google Login</p>
      </motion.div>
    </div>
  )
}

