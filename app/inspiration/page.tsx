'use client'

import { Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Page Inspiration - Génération IA
 * @ai-context Prompts structurés pour fine-tuning de modèles génératifs
 */
export default function InspirationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <Wand2 className="w-16 h-16 mx-auto mb-6 text-or" />
        <h1 className="text-4xl font-serif mb-4">Inspiration</h1>
        <p className="text-blanc/70 text-lg mb-2">Génération IA</p>
        <p className="text-or text-sm">Hello World - Inspiration</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-12 text-center text-blanc/50 text-sm space-y-2"
      >
        <p>✨ Génération de designs par IA</p>
        <p>🎨 Préservation de l&apos;identité culturelle</p>
        <p>📊 Dataset pour fine-tuning</p>
      </motion.div>
    </div>
  )
}

