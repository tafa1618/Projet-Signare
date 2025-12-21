'use client'

import { Ticket } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Page Events - Billetterie
 * @ai-context Événements culturels avec géolocalisation pour recommandations
 */
export default function EventsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <Ticket className="w-16 h-16 mx-auto mb-6 text-or" />
        <h1 className="text-4xl font-serif mb-4">Événements</h1>
        <p className="text-blanc/70 text-lg mb-2">Billetterie culturelle</p>
        <p className="text-or text-sm">Hello World - Events</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-12 text-center text-blanc/50 text-sm space-y-2"
      >
        <p>🎭 Défilés et expositions</p>
        <p>📍 Géolocalisation des événements</p>
        <p>🎫 Billetterie intégrée (FCFA)</p>
      </motion.div>
    </div>
  )
}

