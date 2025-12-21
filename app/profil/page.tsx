'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  User, 
  Settings, 
  Ruler, 
  ShoppingBag, 
  Award, 
  BarChart3, 
  PlusCircle, 
  Star, 
  TrendingUp,
  ChevronRight,
  Sparkles,
  Scissors
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { supabase } from '@/backend/lib/supabase'

// Types simplifiés basés sur database.types.ts
type UserRole = 'client' | 'tailleur'

interface ProfileData {
  id: string
  name: string
  role: UserRole
  avatar: string
  bio?: string
  // Client specific
  measurements?: Record<string, number>
  outfitCount?: number
  // Tailleur specific
  rating?: number
  activeOrders?: number
  monthlyRevenue?: string
  complexityScore?: number
}

// Mock de données pour la démonstration
const MOCK_PROFILES: Record<UserRole, ProfileData> = {
  client: {
    id: 'c1',
    name: 'Fatou Dia',
    role: 'client',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
    outfitCount: 12,
    measurements: {
      'Poitrine': 92,
      'Taille': 68,
      'Hanches': 98,
      'Épaules': 40
    }
  },
  tailleur: {
    id: 't1',
    name: 'Maison Aïda Sow',
    role: 'tailleur',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aida',
    bio: 'Maîtresse Couturière - Spécialiste Boubous de Cérémonie',
    rating: 4.9,
    activeOrders: 8,
    monthlyRevenue: '1.2M FCFA',
    complexityScore: 88
  }
}

export default function ProfilPage() {
  const [role, setRole] = useState<UserRole>('client')
  const [profile, setProfile] = useState<ProfileData>(MOCK_PROFILES['client'])

  // Basculer le rôle pour démo (à remplacer par la logique auth réelle)
  const toggleRole = () => {
    const newRole = role === 'client' ? 'tailleur' : 'client'
    setRole(newRole)
    setProfile(MOCK_PROFILES[newRole])
  }

  /**
   * Tracking des interactions pour le dataset de recommandation
   * @ai-context Capture l'intérêt de l'utilisateur pour certains styles ou artisans
   */
  const trackProfileInteraction = async (type: string, metadata: any) => {
    try {
      await supabase.from('user_interactions').insert({
        interaction_type: type,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          context: 'profile_page'
        }
      })
    } catch (e) {
      console.error('Tracking error:', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      {/* Top Bar / Settings */}
      <div className="flex justify-between items-center px-6 py-6">
        <button 
          onClick={toggleRole}
          className="text-[10px] tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full uppercase font-bold"
        >
          Mode {role}
        </button>
        <Settings className="w-5 h-5 text-[#D4AF37]/60" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="px-6"
        >
          {/* HEADER COMMUN */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full border-2 border-[#D4AF37] p-1 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0A0A0A] px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter">
                {role === 'client' ? 'Membre Signare' : 'Atelier Vérifié'}
              </div>
            </div>
            <h1 className="text-3xl font-serif text-[#D4AF37] mb-1">{profile.name}</h1>
            {role === 'tailleur' && (
              <div className="flex items-center gap-1 text-[#D4AF37]">
                <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                <span className="text-sm font-bold">{profile.rating}</span>
                <span className="text-white/40 text-xs ml-1">(128 avis)</span>
              </div>
            )}
            <p className="text-white/50 text-xs tracking-wide text-center max-w-[250px] mt-2 italic">
              {profile.bio || "Inspirée par l'élégance traditionnelle du Sénégal."}
            </p>
          </div>

          {/* VUE CLIENT */}
          {role === 'client' && (
            <div className="space-y-8">
              {/* Statistique Rapide */}
              <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent p-4 rounded-xl border-l-2 border-[#D4AF37]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] font-bold">Patrimoine Style</p>
                    <p className="text-xl font-serif">{profile.outfitCount} tenues confectionnées</p>
                  </div>
                  <Award className="w-8 h-8 text-[#D4AF37]/40" />
                </div>
              </div>

              {/* Mes Mensurations */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg font-serif text-[#D4AF37]">Mes Mensurations</h2>
                  <button className="text-[10px] uppercase text-[#D4AF37]/60 border-b border-[#D4AF37]/20 pb-0.5">Mettre à jour</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(profile.measurements || {}).map(([key, val]) => (
                    <div key={key} className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs text-white/40">{key}</span>
                      <span className="text-sm font-bold text-[#D4AF37]">{val} cm</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Ma Collection */}
              <section>
                <h2 className="text-lg font-serif text-[#D4AF37] mb-4">Ma Collection Exclusive</h2>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i} 
                      className="aspect-square bg-neutral-900 rounded-md overflow-hidden relative group cursor-pointer"
                      onClick={() => trackProfileInteraction('portfolio_view', { outfit_id: i })}
                    >
                      <Image 
                        src={`https://images.unsplash.com/photo-15${i}5372039744-b8f02a3ae446?w=300&fit=crop`} 
                        alt="Collection" 
                        fill 
                        className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* VUE TAILLEUR */}
          {role === 'tailleur' && (
            <div className="space-y-8">
              {/* Tableau de Bord Business */}
              <section className="grid grid-cols-2 gap-4">
                <div className="bg-[#D4AF37] p-4 rounded-xl text-[#0A0A0A]">
                  <div className="flex justify-between items-start mb-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="bg-white/30 px-2 py-0.5 rounded text-[9px] font-bold">ACTIF</span>
                  </div>
                  <p className="text-2xl font-black">{profile.activeOrders}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Commandes</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-xl font-bold text-white">{profile.monthlyRevenue}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Revenus Déc.</p>
                </div>
              </section>

              {/* Performance IA */}
              <div className="bg-gradient-to-br from-[#0A0A0A] to-[#D4AF37]/10 p-5 rounded-2xl border border-[#D4AF37]/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Expertise Score</h3>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-serif text-white">{profile.complexityScore}</span>
                    <span className="text-xs text-white/40 mb-1.5 font-light">Sur 100 points de complexité</span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-3 leading-relaxed">
                    Basé sur la précision de vos mesures et la complexité des broderies de vos 10 dernières créations.
                  </p>
                </div>
                <Scissors className="absolute -right-4 -bottom-4 w-24 h-24 text-[#D4AF37]/5 rotate-12" />
              </div>

              {/* Catalogue / Portfolio */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-serif text-[#D4AF37]">Mes Créations</h2>
                  <button className="flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    <PlusCircle className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'p1', tag: 'Bazin', time: '40h' },
                    { id: 'p2', tag: 'Wax Royale', time: '12h' }
                  ].map((p) => (
                    <div 
                      key={p.id} 
                      className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 group cursor-pointer"
                      onClick={() => trackProfileInteraction('portfolio_view', { creation_id: p.id })}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden relative">
                        <Image src={`https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&fit=crop`} alt="Post" fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex gap-2 mb-2">
                          <span className="text-[8px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded uppercase font-bold tracking-widest">{p.tag}</span>
                          <span className="text-[8px] bg-white/10 text-white/60 px-2 py-0.5 rounded uppercase font-bold tracking-widest">{p.time} travail</span>
                        </div>
                        <p className="text-xs text-white/70 font-medium">Boubou Signature Or & Noir</p>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
