/**
 * FRONTEND - Formulaire de Mesures avec Calculs Automatiques ML
 * @ai-context Formulaire qui calcule automatiquement complexity_score et fabric_stretch_index
 * Enregistre des données structurées pour prédiction de tailles future
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ruler, Save, TrendingUp, Zap } from 'lucide-react'
import { supabase } from '@/backend/lib/supabase'
import type { Mesure } from '@/shared/types/database.types'

interface MesureFormData {
  client_name: string
  tour_poitrine: string
  tour_taille: string
  tour_hanches: string
  longueur_bras: string
  longueur_jambe: string
  tour_cou: string
  carrure: string
  hauteur_poitrine: string
  longueur_dos: string
  tour_cuisse: string
  body_type: string
  height_cm: string
  weight_kg: string
  pattern_type: Mesure['pattern_type']
  fit_preference: string
  notes: string
}

/**
 * Calculer le complexity_score basé sur les mesures
 * @ai-context Score de 1-10 basé sur la variance et le nombre de mesures spéciales
 * Plus les mesures sont atypiques, plus le score est élevé
 */
function calculateComplexityScore(data: MesureFormData): number {
  let score = 1

  // Mesures de base = +1
  const baseMeasures = [
    data.tour_poitrine,
    data.tour_taille,
    data.tour_hanches,
  ].filter((m) => m && parseFloat(m) > 0)

  if (baseMeasures.length === 3) score += 1

  // Mesures additionnelles = +1 chacune
  const additionalMeasures = [
    data.tour_cou,
    data.carrure,
    data.hauteur_poitrine,
    data.longueur_dos,
    data.tour_cuisse,
  ].filter((m) => m && parseFloat(m) > 0)

  score += additionalMeasures.length

  // Type de pattern influence
  const patternComplexity: Record<string, number> = {
    boubou: 2,
    kaftan: 2,
    robe: 3,
    tailleur: 4,
    pantalon: 3,
    autre: 2,
  }

  score += patternComplexity[data.pattern_type] || 2

  // Ajustement selon body_type (morphologie atypique = +1)
  if (data.body_type && data.body_type !== 'rectangle') {
    score += 1
  }

  return Math.min(10, Math.max(1, score))
}

/**
 * Estimer le fabric_stretch_index basé sur le pattern et le fit
 * @ai-context Index 0-100 estimé selon le type de vêtement
 * Sera affiné plus tard avec des données réelles
 */
function estimateFabricStretchIndex(data: MesureFormData): number {
  // Valeurs par défaut selon le pattern
  const defaultStretch: Record<string, number> = {
    boubou: 30, // Généralement tissus rigides (basin)
    kaftan: 35,
    robe: 50, // Peut varier beaucoup
    tailleur: 20, // Tissus structurés
    pantalon: 40,
    autre: 50,
  }

  let stretch = defaultStretch[data.pattern_type] || 50

  // Ajustement selon fit_preference
  if (data.fit_preference === 'ajusté') {
    stretch += 10 // Nécessite plus d'élasticité
  } else if (data.fit_preference === 'ample') {
    stretch -= 10 // Moins critique
  }

  return Math.min(100, Math.max(0, stretch))
}

/**
 * Détecter le body_type basé sur les mesures
 * @ai-context Classification automatique de la morphologie
 */
function detectBodyType(
  poitrine: number,
  taille: number,
  hanches: number
): string {
  if (!poitrine || !taille || !hanches) return ''

  const shoulderHipRatio = poitrine / hanches
  const waistHipRatio = taille / hanches

  if (Math.abs(shoulderHipRatio - 1) < 0.05 && waistHipRatio < 0.75) {
    return 'sablier' // Shoulders ≈ Hips, taille marquée
  } else if (shoulderHipRatio > 1.05) {
    return 'pomme' // Shoulders > Hips
  } else if (shoulderHipRatio < 0.95) {
    return 'poire' // Hips > Shoulders
  } else {
    return 'rectangle' // Proportions équilibrées
  }
}

export function MesureForm({ userId }: { userId: string }) {
  const [formData, setFormData] = useState<MesureFormData>({
    client_name: '',
    tour_poitrine: '',
    tour_taille: '',
    tour_hanches: '',
    longueur_bras: '',
    longueur_jambe: '',
    tour_cou: '',
    carrure: '',
    hauteur_poitrine: '',
    longueur_dos: '',
    tour_cuisse: '',
    body_type: '',
    height_cm: '',
    weight_kg: '',
    pattern_type: 'boubou',
    fit_preference: 'confortable',
    notes: '',
  })

  const [calculatedScores, setCalculatedScores] = useState({
    complexity_score: 1,
    fabric_stretch_index: 50,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  // Recalculer les scores automatiquement
  const recalculateScores = (data: MesureFormData) => {
    const complexity = calculateComplexityScore(data)
    const stretch = estimateFabricStretchIndex(data)

    setCalculatedScores({
      complexity_score: complexity,
      fabric_stretch_index: stretch,
    })

    // Auto-détecter body_type
    if (data.tour_poitrine && data.tour_taille && data.tour_hanches) {
      const bodyType = detectBodyType(
        parseFloat(data.tour_poitrine),
        parseFloat(data.tour_taille),
        parseFloat(data.tour_hanches)
      )
      setFormData((prev) => ({ ...prev, body_type: bodyType }))
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    const newData = { ...formData, [name]: value }
    setFormData(newData)
    recalculateScores(newData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSavedMessage('')

    try {
      const { error } = await supabase.from('mesures').insert({
        user_id: userId,
        client_name: formData.client_name,
        tour_poitrine: parseFloat(formData.tour_poitrine),
        tour_taille: parseFloat(formData.tour_taille),
        tour_hanches: parseFloat(formData.tour_hanches),
        longueur_bras: parseFloat(formData.longueur_bras),
        longueur_jambe: parseFloat(formData.longueur_jambe),
        tour_cou: formData.tour_cou ? parseFloat(formData.tour_cou) : null,
        carrure: formData.carrure ? parseFloat(formData.carrure) : null,
        hauteur_poitrine: formData.hauteur_poitrine
          ? parseFloat(formData.hauteur_poitrine)
          : null,
        longueur_dos: formData.longueur_dos
          ? parseFloat(formData.longueur_dos)
          : null,
        tour_cuisse: formData.tour_cuisse
          ? parseFloat(formData.tour_cuisse)
          : null,
        body_type: formData.body_type || null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        pattern_type: formData.pattern_type,
        fabric_stretch_index: calculatedScores.fabric_stretch_index,
        complexity_score: calculatedScores.complexity_score,
        fit_preference: formData.fit_preference || null,
        notes: formData.notes || null,
      })

      if (error) throw error

      setSavedMessage('✅ Mesures enregistrées avec succès !')

      // Reset form
      setFormData({
        client_name: '',
        tour_poitrine: '',
        tour_taille: '',
        tour_hanches: '',
        longueur_bras: '',
        longueur_jambe: '',
        tour_cou: '',
        carrure: '',
        hauteur_poitrine: '',
        longueur_dos: '',
        tour_cuisse: '',
        body_type: '',
        height_cm: '',
        weight_kg: '',
        pattern_type: 'boubou',
        fit_preference: 'confortable',
        notes: '',
      })

      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      console.error('Erreur sauvegarde mesures:', error)
      setSavedMessage('❌ Erreur lors de l\'enregistrement')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom du client */}
      <div>
        <label className="block text-or text-sm font-medium mb-2">
          Nom du client *
        </label>
        <input
          type="text"
          name="client_name"
          value={formData.client_name}
          onChange={handleChange}
          required
          className="w-full bg-noir border border-or/30 rounded-lg px-4 py-3 text-blanc placeholder-blanc/30 focus:outline-none focus:border-or transition-colors"
          placeholder="Ex: Aminata Diallo"
        />
      </div>

      {/* Type de pattern */}
      <div>
        <label className="block text-or text-sm font-medium mb-2">
          Type de vêtement *
        </label>
        <select
          name="pattern_type"
          value={formData.pattern_type}
          onChange={handleChange}
          required
          className="w-full bg-noir border border-or/30 rounded-lg px-4 py-3 text-blanc focus:outline-none focus:border-or transition-colors"
        >
          <option value="boubou">Boubou</option>
          <option value="robe">Robe</option>
          <option value="tailleur">Tailleur</option>
          <option value="pantalon">Pantalon</option>
          <option value="kaftan">Kaftan</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {/* Mesures principales */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-blanc/70 text-sm mb-2">
            Tour de poitrine (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            name="tour_poitrine"
            value={formData.tour_poitrine}
            onChange={handleChange}
            required
            className="w-full bg-noir border border-or/30 rounded-lg px-4 py-2 text-blanc focus:outline-none focus:border-or"
          />
        </div>

        <div>
          <label className="block text-blanc/70 text-sm mb-2">
            Tour de taille (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            name="tour_taille"
            value={formData.tour_taille}
            onChange={handleChange}
            required
            className="w-full bg-noir border border-or/30 rounded-lg px-4 py-2 text-blanc focus:outline-none focus:border-or"
          />
        </div>

        <div>
          <label className="block text-blanc/70 text-sm mb-2">
            Tour de hanches (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            name="tour_hanches"
            value={formData.tour_hanches}
            onChange={handleChange}
            required
            className="w-full bg-noir border border-or/30 rounded-lg px-4 py-2 text-blanc focus:outline-none focus:border-or"
          />
        </div>

        <div>
          <label className="block text-blanc/70 text-sm mb-2">
            Longueur bras (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            name="longueur_bras"
            value={formData.longueur_bras}
            onChange={handleChange}
            required
            className="w-full bg-noir border border-or/30 rounded-lg px-4 py-2 text-blanc focus:outline-none focus:border-or"
          />
        </div>

        <div>
          <label className="block text-blanc/70 text-sm mb-2">
            Longueur jambe (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            name="longueur_jambe"
            value={formData.longueur_jambe}
            onChange={handleChange}
            required
            className="w-full bg-noir border border-or/30 rounded-lg px-4 py-2 text-blanc focus:outline-none focus:border-or"
          />
        </div>

        {/* Mesures optionnelles */}
        <div>
          <label className="block text-blanc/70 text-sm mb-2">
            Tour de cou (cm)
          </label>
          <input
            type="number"
            step="0.1"
            name="tour_cou"
            value={formData.tour_cou}
            onChange={handleChange}
            className="w-full bg-noir border border-or/30 rounded-lg px-4 py-2 text-blanc focus:outline-none focus:border-or"
          />
        </div>
      </div>

      {/* Morphologie détectée */}
      {formData.body_type && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-or/10 border border-or/30 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-or" />
            <span className="text-or text-sm font-medium">
              Morphologie détectée
            </span>
          </div>
          <p className="text-blanc/70 text-sm capitalize">{formData.body_type}</p>
        </motion.div>
      )}

      {/* Préférences de coupe */}
      <div>
        <label className="block text-or text-sm font-medium mb-2">
          Préférence de coupe
        </label>
        <select
          name="fit_preference"
          value={formData.fit_preference}
          onChange={handleChange}
          className="w-full bg-noir border border-or/30 rounded-lg px-4 py-3 text-blanc focus:outline-none focus:border-or"
        >
          <option value="ajusté">Ajusté</option>
          <option value="confortable">Confortable</option>
          <option value="ample">Ample</option>
        </select>
      </div>

      {/* Scores calculés automatiquement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-noir border border-or/20 rounded-lg space-y-3"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-or" />
          <span className="text-or font-medium">Scores ML (auto-calculés)</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blanc/50 text-xs mb-1">Complexity Score</p>
            <p className="text-or text-2xl font-serif">
              {calculatedScores.complexity_score}/10
            </p>
          </div>

          <div>
            <p className="text-blanc/50 text-xs mb-1">Fabric Stretch Index</p>
            <p className="text-or text-2xl font-serif">
              {calculatedScores.fabric_stretch_index}/100
            </p>
          </div>
        </div>

        <p className="text-xs text-blanc/40 mt-2">
          Ces scores sont calculés automatiquement pour l'entraînement IA
        </p>
      </motion.div>

      {/* Notes */}
      <div>
        <label className="block text-blanc/70 text-sm mb-2">
          Notes additionnelles
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full bg-noir border border-or/30 rounded-lg px-4 py-3 text-blanc placeholder-blanc/30 focus:outline-none focus:border-or resize-none"
          placeholder="Ajustements spéciaux, préférences..."
        />
      </div>

      {/* Message de succès */}
      {savedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            savedMessage.includes('✅')
              ? 'bg-or/20 text-or'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {savedMessage}
        </motion.div>
      )}

      {/* Bouton submit */}
      <motion.button
        type="submit"
        disabled={isSaving}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-or text-noir py-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <div className="w-5 h-5 border-2 border-noir/20 border-t-noir rounded-full animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Enregistrer les mesures
          </>
        )}
      </motion.button>
    </form>
  )
}

