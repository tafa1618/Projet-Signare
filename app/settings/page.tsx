'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Phone,
  User,
  FileText,
  Ruler,
  Camera,
  Check,
  MapPin,
  Navigation,
  Clock,
  Building2,
  Award,
  Scissors,
  Briefcase,
  X
} from 'lucide-react'
import { logMLInteraction } from '@/lib/logger'
import type { Database, Mesure } from '@/shared/types/database.types'
import { useGeolocation } from '@/frontend/hooks/useGeolocation'
import { useAuth } from '@/frontend/hooks/useAuth'

type UserInteractionInsert = Database['public']['Tables']['user_interactions']['Insert']

// Mock data - À remplacer par les vraies données Supabase
const MOCK_CURRENT_PROFILE = {
  id: 'c1',
  name: 'Fatou Dia',
  phone: '+221 77 123 45 67',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
  coverImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=400&fit=crop',
  bio: "Inspirée par l'élégance traditionnelle du Sénégal. J'aime les coupes nettes, le wax premium et les finitions couture.",
  latestMesure: {
    id: 'm-1',
    user_id: 'c1',
    client_name: 'Fatou Dia',
    tour_poitrine: 92,
    tour_taille: 68,
    tour_hanches: 98,
    longueur_bras: 58,
    longueur_jambe: 102,
    tour_cou: 33,
    carrure: 40,
    hauteur_poitrine: null,
    longueur_dos: null,
    tour_cuisse: null,
    body_type: 'Sablier',
    height_cm: 168,
    weight_kg: null,
    pattern_type: 'robe',
    fabric_stretch_index: 2,
    complexity_score: 3,
    fit_preference: 'Ajusté',
    adjustments_notes: null,
    notes: null,
    photo_references: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

// Mapping des numéros de téléphone vers le type d'utilisateur
const PHONE_TO_USER_TYPE: Record<string, 'client' | 'tailleur'> = {
  '+771111111': 'client',
  '771111111': 'client',
  '+772222222': 'tailleur',
  '772222222': 'tailleur',
}

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Détecter le type d'utilisateur
  const currentUserPhone = user?.phone || user?.user_metadata?.phone || null
  const userType = currentUserPhone ? PHONE_TO_USER_TYPE[currentUserPhone] || 'client' : 'client'
  const isTailor = userType === 'tailleur'
  
  // Onglets : seulement "Profil" pour les tailleurs, "Profil" et "Mensurations" pour les clients
  const [activeTab, setActiveTab] = useState<'profile' | 'measurements'>('profile')

  // Geolocation
  const { latitude, longitude, error: geoError, isLoading: geoLoading } = useGeolocation()
  const [isFetchingAddress, setIsFetchingAddress] = useState(false)

  // Profile state
  const [profile, setProfile] = useState({
    name: MOCK_CURRENT_PROFILE.name,
    phone: MOCK_CURRENT_PROFILE.phone,
    bio: MOCK_CURRENT_PROFILE.bio,
    avatar: MOCK_CURRENT_PROFILE.avatar,
    coverImage: MOCK_CURRENT_PROFILE.coverImage,
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    // Champs spécifiques aux tailleurs
    workshopName: '',
    location: '',
    workingHours: '',
    specialties: [] as string[],
    certifications: [] as string[],
    experienceYears: null as number | null,
    about: '',
  })
  
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [certificationInput, setCertificationInput] = useState('')

  // Measurements state
  const [measurements, setMeasurements] = useState<Partial<Mesure>>({
    tour_poitrine: MOCK_CURRENT_PROFILE.latestMesure.tour_poitrine,
    tour_taille: MOCK_CURRENT_PROFILE.latestMesure.tour_taille,
    tour_hanches: MOCK_CURRENT_PROFILE.latestMesure.tour_hanches,
    longueur_bras: MOCK_CURRENT_PROFILE.latestMesure.longueur_bras,
    longueur_jambe: MOCK_CURRENT_PROFILE.latestMesure.longueur_jambe,
    tour_cou: MOCK_CURRENT_PROFILE.latestMesure.tour_cou,
    carrure: MOCK_CURRENT_PROFILE.latestMesure.carrure,
    height_cm: MOCK_CURRENT_PROFILE.latestMesure.height_cm,
    body_type: MOCK_CURRENT_PROFILE.latestMesure.body_type,
    fit_preference: MOCK_CURRENT_PROFILE.latestMesure.fit_preference,
  })

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // TODO: Appel API pour sauvegarder le profil
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      
      logMLInteraction({
        user_id: MOCK_CURRENT_PROFILE.id,
        post_id: null,
        interaction_type: 'click',
        session_id: 'session-demo',
        duration_seconds: null,
        scroll_depth: null,
        came_from: 'settings:save_profile',
        device_type: 'web',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        router.push('/profil')
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveMeasurements = async () => {
    setIsSaving(true)
    try {
      // TODO: Appel API pour sauvegarder les mensurations
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      
      logMLInteraction({
        user_id: MOCK_CURRENT_PROFILE.id,
        post_id: null,
        interaction_type: 'click',
        session_id: 'session-demo',
        duration_seconds: null,
        scroll_depth: null,
        came_from: 'settings:save_measurements',
        device_type: 'web',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        router.push('/profil')
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Récupération automatique de l'adresse via reverse geocoding
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    setIsFetchingAddress(true)
    try {
      // Utilisation de Nominatim (OpenStreetMap) - gratuit, pas de clé API requise
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SIGNARE-App/1.0',
          },
        }
      )
      
      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'adresse')
      
      const data = await response.json()
      
      // Construction de l'adresse à partir des données Nominatim
      const addressParts = []
      if (data.address) {
        if (data.address.road) addressParts.push(data.address.road)
        if (data.address.house_number) addressParts.push(data.address.house_number)
        if (data.address.neighbourhood || data.address.suburb) {
          addressParts.push(data.address.neighbourhood || data.address.suburb)
        }
        if (data.address.city || data.address.town || data.address.village) {
          addressParts.push(data.address.city || data.address.town || data.address.village)
        }
        if (data.address.country) addressParts.push(data.address.country)
      }
      
      const address = addressParts.length > 0 
        ? addressParts.join(', ')
        : data.display_name || ''

      setProfile({
        ...profile,
        address,
        latitude: lat,
        longitude: lng,
      })
      
      logMLInteraction({
        user_id: MOCK_CURRENT_PROFILE.id,
        post_id: null,
        interaction_type: 'click',
        session_id: 'session-demo',
        duration_seconds: null,
        scroll_depth: null,
        came_from: 'settings:auto_fetch_address',
        device_type: 'web',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error)
    } finally {
      setIsFetchingAddress(false)
    }
  }

  // Initialiser les champs tailleur une fois que user est disponible
  useEffect(() => {
    const userPhone = user?.phone || user?.user_metadata?.phone || null
    const detectedUserType = userPhone ? PHONE_TO_USER_TYPE[userPhone] || 'client' : 'client'
    const detectedIsTailor = detectedUserType === 'tailleur'
    
    if (detectedIsTailor && !profile.workshopName) {
      setProfile(prev => ({
        ...prev,
        workshopName: 'Atelier Tapha',
        location: 'Dakar, Plateau',
        workingHours: 'Lun - Sam, 9h - 19h',
        specialties: ['Boubou de cérémonie', 'Broderie perlé'],
        certifications: ['Maître Artisan'],
        experienceYears: 12,
        about: 'Atelier familial depuis 3 générations. Spécialisé dans la haute couture sénégalaise.',
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Récupération automatique de l'adresse quand la géolocalisation est disponible
  useEffect(() => {
    if (latitude && longitude && !profile.address && !geoLoading) {
      fetchAddressFromCoordinates(latitude, longitude)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, geoLoading])

  const handleGetCurrentLocation = () => {
    if (latitude && longitude) {
      fetchAddressFromCoordinates(latitude, longitude)
    } else {
      // Demander à nouveau la position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchAddressFromCoordinates(
              position.coords.latitude,
              position.coords.longitude
            )
          },
          (err) => {
            console.error('Erreur géolocalisation:', err)
          }
        )
      }
    }
  }

  const handleImageUpload = (type: 'avatar' | 'cover') => {
    // TODO: Implémenter l'upload d'image
    logMLInteraction({
      user_id: MOCK_CURRENT_PROFILE.id,
      post_id: null,
      interaction_type: 'click',
      session_id: 'session-demo',
      duration_seconds: null,
      scroll_depth: null,
      came_from: `settings:upload_${type}`,
      device_type: 'web',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  }

  const measurementFields = [
    { key: 'tour_poitrine' as const, label: 'Tour de poitrine', unit: 'cm', icon: '👗' },
    { key: 'tour_taille' as const, label: 'Tour de taille', unit: 'cm', icon: '📏' },
    { key: 'tour_hanches' as const, label: 'Tour de hanches', unit: 'cm', icon: '👗' },
    { key: 'longueur_bras' as const, label: 'Longueur de bras', unit: 'cm', icon: '💪' },
    { key: 'longueur_jambe' as const, label: 'Longueur de jambe', unit: 'cm', icon: '🦵' },
    { key: 'tour_cou' as const, label: 'Tour de cou', unit: 'cm', icon: '👔' },
    { key: 'carrure' as const, label: 'Carrure', unit: 'cm', icon: '👤' },
    { key: 'height_cm' as const, label: 'Taille', unit: 'cm', icon: '📐' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-[0.18em]">Retour</span>
          </button>
          <h1 className="text-lg font-serif text-[#D4AF37] font-bold">Modifier mon profil</h1>
          <div className="w-20" /> {/* Spacer pour centrer le titre */}
        </div>
      </div>

      {/* Tabs - Masquer "Mensurations" pour les tailleurs */}
      {!isTailor && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-6">
          <div className="flex gap-2 border-b border-[#D4AF37]/20">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-sm font-black uppercase tracking-[0.18em] transition-colors ${
                activeTab === 'profile'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setActiveTab('measurements')}
              className={`flex-1 py-3 text-sm font-black uppercase tracking-[0.18em] transition-colors ${
                activeTab === 'measurements'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              Mensurations
            </button>
          </div>
        </div>
      )}

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 mt-6 space-y-6"
      >
        {activeTab === 'profile' || isTailor ? (
          <>
            {/* Cover Image */}
            <section className="relative">
              <div className="relative w-full h-40 sm:h-48 bg-gradient-to-br from-[#D4AF37]/20 to-[#0A0A0A] rounded-xl overflow-hidden">
                {profile.coverImage ? (
                  <Image
                    src={profile.coverImage}
                    alt="Couverture"
                    fill
                    className="object-cover opacity-40"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/10 via-[#0A0A0A] to-[#0A0A0A]" />
                )}
                <button
                  onClick={() => handleImageUpload('cover')}
                  className="absolute top-3 right-3 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#D4AF37]/30 text-[#D4AF37] p-2 rounded-lg hover:bg-[#D4AF37]/10 transition-all"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar */}
              <div className="relative -mt-16 flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#0A0A0A] overflow-hidden bg-neutral-900">
                    <Image
                      src={profile.avatar}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleImageUpload('avatar')}
                    className="absolute bottom-0 right-0 bg-[#D4AF37] text-[#0A0A0A] p-2 rounded-full border-2 border-[#0A0A0A] hover:bg-[#D4AF37]/90 transition-all shadow-lg"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Profile Form */}
            <section className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                  <User className="w-4 h-4" />
                  Nom complet
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                  <Phone className="w-4 h-4" />
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="+221 77 123 45 67"
                />
                <p className="mt-1 text-xs text-white/50">
                  Ce numéro sera utilisé pour l'authentification
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                  <FileText className="w-4 h-4" />
                  {isTailor ? 'Description de l\'atelier' : 'Bio'}
                </label>
                <textarea
                  value={isTailor ? profile.about : profile.bio}
                  onChange={(e) => setProfile({ ...profile, [isTailor ? 'about' : 'bio']: e.target.value })}
                  rows={4}
                  className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                  placeholder={isTailor ? "Décrivez votre atelier, votre histoire, vos valeurs..." : "Parlez-nous de vous..."}
                />
              </div>

              {/* Champs spécifiques aux tailleurs */}
              {isTailor && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                      <Building2 className="w-4 h-4" />
                      Nom de l'atelier
                    </label>
                    <input
                      type="text"
                      value={profile.workshopName}
                      onChange={(e) => setProfile({ ...profile, workshopName: e.target.value })}
                      className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="Ex: Atelier Tapha"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                      <MapPin className="w-4 h-4" />
                      Localisation de l'atelier
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="Ex: Dakar, Plateau"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                      <Clock className="w-4 h-4" />
                      Horaires d'ouverture
                    </label>
                    <input
                      type="text"
                      value={profile.workingHours}
                      onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })}
                      className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="Ex: Lun - Sam, 9h - 19h"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                      <Briefcase className="w-4 h-4" />
                      Années d'expérience
                    </label>
                    <input
                      type="number"
                      value={profile.experienceYears ?? ''}
                      onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="Ex: 12"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                      <Scissors className="w-4 h-4" />
                      Spécialités
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={specialtyInput}
                          onChange={(e) => setSpecialtyInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && specialtyInput.trim()) {
                              e.preventDefault()
                              setProfile({
                                ...profile,
                                specialties: [...profile.specialties, specialtyInput.trim()],
                              })
                              setSpecialtyInput('')
                            }
                          }}
                          className="flex-1 bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                          placeholder="Ajouter une spécialité (Ex: Boubou de cérémonie)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (specialtyInput.trim()) {
                              setProfile({
                                ...profile,
                                specialties: [...profile.specialties, specialtyInput.trim()],
                              })
                              setSpecialtyInput('')
                            }
                          }}
                          className="px-4 bg-[#D4AF37] text-[#0A0A0A] rounded-xl font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/90 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-sm text-[#D4AF37]"
                          >
                            {specialty}
                            <button
                              type="button"
                              onClick={() => {
                                setProfile({
                                  ...profile,
                                  specialties: profile.specialties.filter((_, i) => i !== idx),
                                })
                              }}
                              className="text-[#D4AF37] hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                      <Award className="w-4 h-4" />
                      Certifications
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={certificationInput}
                          onChange={(e) => setCertificationInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && certificationInput.trim()) {
                              e.preventDefault()
                              setProfile({
                                ...profile,
                                certifications: [...profile.certifications, certificationInput.trim()],
                              })
                              setCertificationInput('')
                            }
                          }}
                          className="flex-1 bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                          placeholder="Ajouter une certification (Ex: Maître Artisan)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (certificationInput.trim()) {
                              setProfile({
                                ...profile,
                                certifications: [...profile.certifications, certificationInput.trim()],
                              })
                              setCertificationInput('')
                            }
                          }}
                          className="px-4 bg-[#D4AF37] text-[#0A0A0A] rounded-xl font-black uppercase tracking-[0.18em] hover:bg-[#D4AF37]/90 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-sm text-[#D4AF37]"
                          >
                            {cert}
                            <button
                              type="button"
                              onClick={() => {
                                setProfile({
                                  ...profile,
                                  certifications: profile.certifications.filter((_, i) => i !== idx),
                                })
                              }}
                              className="text-[#D4AF37] hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Adresse de livraison (clients) ou Adresse de l'atelier (tailleurs) */}
              {!isTailor && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#D4AF37] mb-2">
                    <MapPin className="w-4 h-4" />
                    Adresse de livraison
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="Votre adresse de livraison"
                    />
                    <button
                      onClick={handleGetCurrentLocation}
                      disabled={isFetchingAddress || geoLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Récupérer automatiquement mon adresse"
                    >
                      {isFetchingAddress ? (
                        <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-white/50 flex items-center gap-1">
                    {geoLoading ? (
                      <>Récupération de votre position...</>
                    ) : geoError ? (
                      <>Géolocalisation non disponible. Vous pouvez saisir votre adresse manuellement.</>
                    ) : latitude && longitude ? (
                      <>
                        <Check className="w-3 h-3 text-[#D4AF37]" />
                        Position détectée. Cliquez sur l'icône pour récupérer l'adresse.
                      </>
                    ) : (
                      <>Cliquez sur l'icône pour récupérer automatiquement votre adresse.</>
                    )}
                  </p>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Measurements Form */}
            <section className="space-y-4">
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="text-sm font-serif text-[#D4AF37] tracking-[0.18em] uppercase">
                    Mesures corporelles
                  </h2>
                </div>
                <p className="text-xs text-white/60">
                  Ces mesures permettent aux tailleurs de créer des vêtements parfaitement ajustés à votre morphologie.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {measurementFields.map((field) => (
                  <div key={field.key}>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/70 mb-2">
                      <span>{field.icon}</span>
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={measurements[field.key] ?? ''}
                        onChange={(e) =>
                          setMeasurements({
                            ...measurements,
                            [field.key]: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="0"
                        min="0"
                        step="0.5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/50">
                        {field.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Body Type & Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/70 mb-2">
                    Type de morphologie
                  </label>
                  <select
                    value={measurements.body_type ?? ''}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, body_type: e.target.value || null })
                    }
                    className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors [&>option]:bg-[#0A0A0A] [&>option]:text-white"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Sablier">Sablier</option>
                    <option value="Rectangle">Rectangle</option>
                    <option value="Triangle">Triangle</option>
                    <option value="Triangle inversé">Triangle inversé</option>
                    <option value="Ronde">Ronde</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/70 mb-2">
                    Préférence de coupe
                  </label>
                  <select
                    value={measurements.fit_preference ?? ''}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, fit_preference: e.target.value || null })
                    }
                    className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors [&>option]:bg-[#0A0A0A] [&>option]:text-white"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Ajusté">Ajusté</option>
                    <option value="Semi-ajusté">Semi-ajusté</option>
                    <option value="Large">Large</option>
                    <option value="Sur-mesure">Sur-mesure</option>
                  </select>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Save Button */}
        <div className="sticky bottom-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#D4AF37]/10 py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 mt-8">
          <button
            onClick={isTailor || activeTab === 'profile' ? handleSaveProfile : handleSaveMeasurements}
            disabled={isSaving || saveSuccess}
            className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0A] py-4 rounded-xl text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_14px_rgba(212,175,55,0.25)] hover:bg-[#D4AF37]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Enregistré !
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isTailor ? 'Enregistrer les modifications' : 'Enregistrer'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

