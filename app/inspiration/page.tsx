'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Wand2,
  Camera,
  Shirt,
  Sparkles,
  ImageIcon,
  Sparkle,
  SlidersHorizontal,
  Palette,
} from 'lucide-react'

type TryOnResult = {
  id: string
  userImage: string
  modelImage: string
  outputImage: string
  prompt: string
}

type InspirationResult = {
  id: string
  image: string
  title: string
  style: string
}

const PLACEHOLDER_USER =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop'
const PLACEHOLDER_MODEL =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop'

const MOCK_INSPI: InspirationResult[] = [
  {
    id: 'i1',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
    title: 'Kaftan Soie • Drapé fluide',
    style: 'soie, dorures fines, soirée',
  },
  {
    id: 'i2',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop',
    title: 'Robe Wax • Coupe sirène',
    style: 'wax premium, broderies, mariage',
  },
  {
    id: 'i3',
    image: 'https://images.unsplash.com/photo-1520975958225-12b1f1f1d9a7?w=800&h=1000&fit=crop',
    title: 'Boubou Royal • Broderie',
    style: 'basin riche, motifs géométriques, cérémonial',
  },
]

/**
 * Tracking IA - simulation & inspiration
 * @ai-context Capture l'intention (try-on, inspiration) pour prioriser les fine-tunes.
 */
function trackIAInteraction(event: string, data: Record<string, unknown>) {
  console.log('[ML] ia_interaction', { event, ...data, timestamp: new Date().toISOString() })
}

export default function InspirationPage() {
  const [mode, setMode] = useState<'client' | 'tailleur'>('client')
  const [userImage, setUserImage] = useState('')
  const [modelImage, setModelImage] = useState('')
  const [prompt, setPrompt] = useState('kaftan soie dorée, broderies fines, coupe fluide')
  const [styleTags, setStyleTags] = useState<string[]>(['soie', 'luxe', 'soirée'])
  const [tryOnResults, setTryOnResults] = useState<TryOnResult[]>([])
  const [inspiResults, setInspiResults] = useState<InspirationResult[]>(MOCK_INSPI)
  const [tailorImages, setTailorImages] = useState<string[]>([])

  const canGenerate = useMemo(() => {
    return (userImage || modelImage) && prompt.length >= 8
  }, [userImage, modelImage, prompt])

  const readFileAsDataUrl = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader()
    reader.onload = () => cb(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, setter: (v: string) => void) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) readFileAsDataUrl(file, setter)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0]
    if (file) readFileAsDataUrl(file, setter)
  }

  const handleDropMulti = (e: React.DragEvent<HTMLLabelElement>, setter: (vals: string[]) => void) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files || []).slice(0, 4)
    files.forEach((file) => {
      readFileAsDataUrl(file, (url) => {
        setter((prev) => [url, ...prev].slice(0, 4))
      })
    })
  }

  const handleFileInputMulti = (e: React.ChangeEvent<HTMLInputElement>, setter: (vals: string[]) => void) => {
    const files = Array.from(e.target.files || []).slice(0, 4)
    files.forEach((file) => {
      readFileAsDataUrl(file, (url) => {
        setter((prev) => [url, ...prev].slice(0, 4))
      })
    })
  }

  const toggleTag = (tag: string) => {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleGenerateTryOn = () => {
    if (!canGenerate) return
    const output = {
      id: `try-${Date.now()}`,
      userImage: userImage || PLACEHOLDER_USER,
      modelImage: modelImage || PLACEHOLDER_MODEL,
      outputImage: modelImage || PLACEHOLDER_MODEL,
      prompt,
    }
    setTryOnResults([output, ...tryOnResults].slice(0, 3))
    trackIAInteraction('try_on_generate', {
      style_tags: styleTags,
      prompt_length: prompt.length,
      has_user_image: Boolean(userImage),
      has_model_image: Boolean(modelImage),
    })
  }

  const handleGenerateInspiration = () => {
    const newInspi: InspirationResult = {
      id: `inspi-${Date.now()}`,
      image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=1000&fit=crop',
      title: 'Inspiration IA • Fusion',
      style: styleTags.join(', '),
    }
    setInspiResults([newInspi, ...inspiResults].slice(0, 6))
    trackIAInteraction('inspiration_generate', {
      style_tags: styleTags,
      prompt_length: prompt.length,
    })
  }

  const presetTags = ['soie', 'wax', 'lin', 'soirée', 'mariage', 'quotidien', 'minimal']

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-[#D4AF37] p-1.5 sm:p-2 rounded-lg shadow-[0_0_16px_rgba(212,175,55,0.35)]">
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.2em] uppercase">Inspiration IA</h1>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/40 font-black">Essayage + Moodboard</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Toggle mode client / tailleur */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <p className="text-[10px] sm:text-[11px] text-white/60">
            Mode : {mode === 'client' ? 'Essayage client' : 'Inspiration tailleur'}
          </p>
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setMode('client')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] border transition-all ${
                mode === 'client'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]'
                  : 'bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30'
              }`}
            >
              Client
            </button>
            <button
              onClick={() => setMode('tailleur')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] border transition-all ${
                mode === 'tailleur'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]'
                  : 'bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/30'
              }`}
            >
              Tailleur
            </button>
          </div>
        </div>

        {/* Bloc Try-On (client only) */}
        {mode === 'client' && (
        <section className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Camera size={14} className="sm:w-4 sm:h-4 text-[#D4AF37]" />
            <h2 className="text-xs sm:text-sm font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.18em] uppercase">Essayage IA</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, setUserImage)}
              className="block cursor-pointer"
            >
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/40 font-black">Photo utilisateur (drag & drop)</span>
              <div className="mt-1.5 sm:mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-4 sm:py-6 text-center flex flex-col items-center justify-center gap-1.5 sm:gap-2 hover:border-[#D4AF37]/40 transition-colors min-h-[180px] sm:min-h-[220px]">
                {userImage ? (
                  <div className="relative w-full aspect-[3/4] max-w-[180px] sm:max-w-[220px] mx-auto overflow-hidden rounded-lg border border-[#D4AF37]/25">
                    <Image src={userImage} alt="Utilisateur" fill className="object-cover" sizes="(max-width: 640px) 180px, 220px" />
                  </div>
                ) : (
                  <>
                    <Camera size={16} className="sm:w-[18px] sm:h-[18px] text-[#D4AF37]" />
                    <p className="text-xs sm:text-sm text-white/60 text-center px-2">Glissez votre portrait ou cliquez pour choisir</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileInput(e, setUserImage)}
              />
              <p className="mt-1 text-[10px] sm:text-[11px] text-white/35">Portrait clair, frontal.</p>
            </label>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, setModelImage)}
              className="block cursor-pointer"
            >
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/40 font-black">Photo du modèle (drag & drop)</span>
              <div className="mt-1.5 sm:mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-4 sm:py-6 text-center flex flex-col items-center justify-center gap-1.5 sm:gap-2 hover:border-[#D4AF37]/40 transition-colors min-h-[180px] sm:min-h-[220px]">
                {modelImage ? (
                  <div className="relative w-full aspect-[3/4] max-w-[180px] sm:max-w-[220px] mx-auto overflow-hidden rounded-lg border border-[#D4AF37]/25">
                    <Image src={modelImage} alt="Modèle" fill className="object-cover" sizes="(max-width: 640px) 180px, 220px" />
                  </div>
                ) : (
                  <>
                    <Shirt size={16} className="sm:w-[18px] sm:h-[18px] text-[#D4AF37]" />
                    <p className="text-xs sm:text-sm text-white/60 text-center px-2">Glissez la tenue de référence ou cliquez</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileInput(e, setModelImage)}
              />
              <p className="mt-1 text-[10px] sm:text-[11px] text-white/35">Tenue à tester sur vous.</p>
            </label>
          </div>

          <label className="block">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/40 font-black">Prompt (style, matière, occasion)</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="mt-1.5 sm:mt-2 w-full bg-white/[0.03] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none focus:border-[#D4AF37]/40 text-xs sm:text-sm leading-relaxed placeholder:text-white/25"
              placeholder="Ex: robe wax premium, broderies or, coupe sirène, mariage"
            />
          </label>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {presetTags.map((tag) => {
              const active = styleTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] border transition-all ${
                    active
                      ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                      : 'bg-white/5 text-white/70 border-white/10 hover:border-[#D4AF37]/25'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-white/40">
            <SlidersHorizontal size={12} className="sm:w-3.5 sm:h-3.5 text-[#D4AF37] flex-shrink-0" />
            <span>ML-ready : nous loggons style_tags, prompt_length, présence photo.</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!canGenerate}
            onClick={handleGenerateTryOn}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] shadow-[0_0_18px_rgba(212,175,55,0.35)] disabled:opacity-40 disabled:grayscale"
          >
            Simuler sur moi
          </motion.button>

          {tryOnResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              {tryOnResults.map((r) => (
                <div key={r.id} className="bg-[#0A0A0A] border border-white/10 rounded-lg sm:rounded-xl overflow-hidden">
                  <div className="relative aspect-[3/4] bg-neutral-900">
                    <Image src={r.outputImage} alt="Résultat IA" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent" />
                    <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#D4AF37] font-black flex items-center gap-1">
                      <Sparkle size={10} className="sm:w-3 sm:h-3" />
                      IA
                    </div>
                  </div>
                  <div className="px-2.5 sm:px-3 py-2 sm:py-3 space-y-1">
                    <p className="text-xs sm:text-sm text-white/80 line-clamp-2">{r.prompt}</p>
                    <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-[0.18em] sm:tracking-[0.2em]">Simulation</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        )}

        {/* Bloc Inspiration Tailleur (tailleur only) */}
        {mode === 'tailleur' && (
        <section className="bg-white/[0.03] border border-[#D4AF37]/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Palette size={14} className="sm:w-4 sm:h-4 text-[#D4AF37]" />
            <h2 className="text-xs sm:text-sm font-serif text-[#D4AF37] tracking-[0.15em] sm:tracking-[0.18em] uppercase">Inspiration Tailleur</h2>
          </div>

          <p className="text-[10px] sm:text-[11px] text-white/50">
            Génère des silhouettes ou motifs pour nourrir tes moodboards et briefs clients.
          </p>

          {/* Upload multi images (moodboard) */}
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropMulti(e, setTailorImages)}
            className="block cursor-pointer"
          >
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/40 font-black">Moodboard (jusqu'à 4 photos)</span>
            <div className="mt-1.5 sm:mt-2 w-full bg-white/[0.02] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 text-center flex flex-col items-center justify-center gap-1.5 sm:gap-2 hover:border-[#D4AF37]/30 transition-colors min-h-[120px] sm:min-h-[150px]">
              {tailorImages.length === 0 ? (
                <>
                  <ImageIcon size={16} className="sm:w-[18px] sm:h-[18px] text-[#D4AF37]" />
                  <p className="text-xs sm:text-sm text-white/60 text-center px-2">Glissez vos références ou cliquez pour choisir</p>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full">
                  {tailorImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#D4AF37]/20 bg-neutral-900">
                      <Image src={img} alt={`ref-${idx}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileInputMulti(e, setTailorImages)}
            />
          </label>

          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {['silhouette', 'motif', 'palette'].map((tag) => (
              <span
                key={tag}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] bg-white/5 border border-white/10 text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerateInspiration}
            className="w-full bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] hover:bg-[#D4AF37]/10 transition-all"
          >
            Générer une inspiration
          </motion.button>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {inspiResults.map((ins) => (
              <article key={ins.id} className="bg-white/[0.03] border border-white/10 rounded-lg sm:rounded-xl overflow-hidden">
                <div className="relative aspect-[3/4] bg-neutral-900">
                  <Image src={ins.image} alt={ins.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/55 to-transparent" />
                  <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#D4AF37] font-black">
                    <ImageIcon size={10} className="sm:w-3 sm:h-3" />
                    IA
                  </div>
                </div>
                <div className="px-2.5 sm:px-3 py-2 sm:py-3 space-y-1">
                  <p className="text-xs sm:text-sm font-serif text-[#D4AF37] leading-tight line-clamp-2">{ins.title}</p>
                  <p className="text-[10px] sm:text-[11px] text-white/60 line-clamp-2">{ins.style}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}
      </main>
    </div>
  )
}
