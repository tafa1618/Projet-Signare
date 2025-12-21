'use client'

import { Ruler } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Page Atelier - Gestion des mesures
 * @ai-context Mesures structurées avec métadonnées ML (pattern_type, fabric_stretch_index)
 */
export default function AtelierPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <Ruler className="w-16 h-16 mx-auto mb-6 text-or" />
        <h1 className="text-4xl font-serif mb-4">Atelier</h1>
        <p className="text-blanc/70 text-lg mb-2">Gestion des mesures</p>
        <p className="text-or text-sm">Hello World - Atelier</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-12 text-center text-blanc/50 text-sm space-y-2"
      >
        <p>📏 Mesures corporelles précises</p>
        <p>🧵 Types de patrons structurés</p>
        <p>🤖 Données ML-ready</p>
      </motion.div>
    </div>
  )
}

