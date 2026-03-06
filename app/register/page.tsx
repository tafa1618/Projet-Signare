'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, User as UserIcon, ArrowRight, Sparkles, Check, Calendar, Scissors, ChevronDown, Loader2 } from 'lucide-react'
import { signInWithPhone, verifyOTP, supabase } from '@/backend/lib/supabase'
import { logError } from '@/lib/logger'

const COUNTRY_CODES = [
  { code: '+221', flag: '🇸🇳', label: 'SN' },
  { code: '+33',  flag: '🇫🇷', label: 'FR' },
  { code: '+39',  flag: '🇮🇹', label: 'IT' },
  { code: '+34',  flag: '🇪🇸', label: 'ES' },
  { code: '+1',   flag: '🇺🇸', label: 'US' },
  { code: '+44',  flag: '🇬🇧', label: 'UK' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [countryCode, setCountryCode] = useState('+221')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<'signare' | 'ndanane' | null>(null)
  const [isTailor, setIsTailor] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocusedPhone, setIsFocusedPhone] = useState(false)
  const [isFocusedName, setIsFocusedName] = useState(false)
  const [isFocusedDate, setIsFocusedDate] = useState(false)

  const fullPhone = `${countryCode}${phone.replace(/^0/, '')}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!phone || !phone.match(/^[0-9]{7,12}$/)) {
      setError('Veuillez entrer un numéro de téléphone valide')
      return
    }

    setIsLoading(true)
    try {
      const { error: signInError } = await signInWithPhone(fullPhone)
      if (signInError) {
        setError("Erreur lors de l'envoi du code. Veuillez réessayer.")
        logError(signInError, 'Register sign-in')
        return
      }
      setStep('otp')
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      logError(err, 'Register')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!otpCode || otpCode.length !== 6) {
      setError('Le code doit contenir 6 chiffres')
      return
    }

    setIsLoading(true)
    try {
      const { data, error: verifyError } = await verifyOTP(fullPhone, otpCode)
      if (verifyError || !data.user) {
        setError('Code invalide ou expiré. Veuillez réessayer.')
        logError(verifyError, 'Register OTP verification')
        return
      }

      // Créer le profil en Supabase
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        phone: fullPhone,
        full_name: fullName,
        gender,
        is_tailor: isTailor,
        tailor_status: isTailor ? 'pending' : 'none',
        is_digital_twin: false,
      })

      if (profileError) {
        // Le profil existe peut-être déjà (re-inscription)
        if (profileError.code !== '23505') {
          logError(profileError, 'Profile creation')
        }
      }

      router.push('/')
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      logError(err, 'Register verify')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-12 pb-24 overflow-hidden">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=1600&fit=crop"
          alt="SIGNARE - Haute Couture Sénégalaise"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Gradient overlay pour meilleure lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-[#0A0A0A]/75 to-[#0A0A0A]/90" />
      </div>

      {/* Retour */}
      <Link href="/" className="absolute top-8 left-6 z-20">
        <motion.div
          whileHover={{ x: -5 }}
          className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          <span className="text-sm tracking-wide">Retour</span>
        </motion.div>
      </Link>

      {/* Contenu principal */}
      <div className="max-w-md w-full relative z-10">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
          
          <h1 className="text-4xl font-serif text-[#D4AF37] tracking-[0.15em] mb-3">
            REJOIGNEZ-NOUS
          </h1>
          
          <p className="text-white/60 text-sm tracking-wide">
            Créez votre compte SIGNARE
          </p>
        </motion.div>

        {/* Étape OTP */}
        {step === 'otp' && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleVerifyOTP}
            className="space-y-8"
          >
            <p className="text-[#D4AF37] text-sm text-center">
              Code envoyé au {fullPhone}
            </p>

            <div className="relative">
              <label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
                Code de vérification (6 chiffres)
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                autoFocus
                className="w-full bg-transparent text-white text-2xl py-3 px-1 border-b-2 border-white/20 focus:border-[#D4AF37] outline-none transition-all duration-300 placeholder:text-white/30 text-center tracking-widest"
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={otpCode.length !== 6 || isLoading}
              className="w-full bg-[#D4AF37] text-[#0A0A0A] font-bold text-sm tracking-widest uppercase py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>CRÉER MON COMPTE <ArrowRight className="w-5 h-5" /></>}
            </motion.button>

            <button type="button" onClick={() => setStep('form')} className="w-full text-white/40 text-sm hover:text-white/60 transition-colors">
              Modifier mon numéro
            </button>
          </motion.form>
        )}

        {/* Formulaire principal */}
        {step === 'form' && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Input Nom Complet */}
          <div className="relative">
            <label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
              Nom Complet
            </label>

            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onFocus={() => setIsFocusedName(true)}
                onBlur={() => setIsFocusedName(false)}
                placeholder="Fatou Diop"
                className="w-full bg-transparent text-white text-lg py-3 px-1 border-b-2 border-white/20 focus:border-[#D4AF37] outline-none transition-all duration-300 placeholder:text-white/30"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <UserIcon className="w-5 h-5 text-[#D4AF37]/50" />
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isFocusedName ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 origin-center"
            />
          </div>

          {/* Input Téléphone avec code pays */}
          <div className="relative">
            <label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
              Téléphone
            </label>

            <div className="flex items-end gap-3">
              <div className="relative flex-shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="appearance-none bg-transparent text-white text-lg py-3 pr-6 border-b-2 border-white/20 outline-none transition-all duration-300 cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#0A0A0A] text-white">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-[#D4AF37]/50 pointer-events-none" />
              </div>

              <div className="relative flex-1">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setIsFocusedPhone(true)}
                  onBlur={() => setIsFocusedPhone(false)}
                  placeholder="77 123 45 67"
                  className="w-full bg-transparent text-white text-lg py-3 px-1 border-b-2 border-white/20 focus:border-[#D4AF37] outline-none transition-all duration-300 placeholder:text-white/30"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <Phone className="w-5 h-5 text-[#D4AF37]/50" />
                </div>
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isFocusedPhone ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 origin-center"
            />
          </div>

          {/* Input Date de Naissance */}
          <div className="relative">
            <label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
              Date de Naissance
            </label>
            
            <div className="relative">
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                onFocus={() => setIsFocusedDate(true)}
                onBlur={() => setIsFocusedDate(false)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-transparent text-white text-lg py-3 px-1 border-b-2 border-white/20 focus:border-[#D4AF37] outline-none transition-all duration-300 placeholder:text-white/30 [color-scheme:dark]"
              />
              
              {/* Icône */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <Calendar className="w-5 h-5 text-[#D4AF37]/50" />
              </div>
            </div>

            {/* Ligne animée */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isFocusedDate ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 origin-center"
            />
          </div>

          {/* Sélection Genre */}
          <div className="relative">
            <label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
              Genre
            </label>
            
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => setGender('signare')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-4 px-4 rounded-lg border-2 transition-all duration-300 ${
                  gender === 'signare'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                    : 'border-white/20 text-white/60 hover:border-[#D4AF37]/50 hover:text-white/80'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg font-serif tracking-wide">SIGNARE</span>
                  <span className="text-xs text-white/50">Femme</span>
                </div>
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => setGender('ndanane')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-4 px-4 rounded-lg border-2 transition-all duration-300 ${
                  gender === 'ndanane'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                    : 'border-white/20 text-white/60 hover:border-[#D4AF37]/50 hover:text-white/80'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg font-serif tracking-wide">NDANANE</span>
                  <span className="text-xs text-white/50">Homme</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Checkbox Tailleur */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setIsTailor(!isTailor)}
              className="mt-1 flex-shrink-0"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                isTailor 
                  ? 'bg-[#D4AF37] border-[#D4AF37]' 
                  : 'border-white/30 hover:border-[#D4AF37]/50'
              }`}>
                {isTailor && (
                  <Check className="w-3 h-3 text-[#0A0A0A]" strokeWidth={3} />
                )}
              </div>
            </button>
            <div className="flex items-center gap-2 flex-1">
              <Scissors className="w-4 h-4 text-[#D4AF37]/60" />
              <p className="text-white/60 text-xs leading-relaxed">
                Je suis tailleur
              </p>
            </div>
          </div>

          {/* Checkbox Conditions */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setAcceptTerms(!acceptTerms)}
              className="mt-1 flex-shrink-0"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                acceptTerms 
                  ? 'bg-[#D4AF37] border-[#D4AF37]' 
                  : 'border-white/30 hover:border-[#D4AF37]/50'
              }`}>
                {acceptTerms && (
                  <Check className="w-3 h-3 text-[#0A0A0A]" strokeWidth={3} />
                )}
              </div>
            </button>
            <p className="text-white/60 text-xs leading-relaxed">
              J'accepte les{' '}
              <Link href="/terms" className="text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors border-b border-[#D4AF37]/30">
                Conditions d'utilisation
              </Link>
              {' '}et la{' '}
              <Link href="/privacy" className="text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors border-b border-[#D4AF37]/30">
                Politique de confidentialité
              </Link>
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
              {error}
            </motion.p>
          )}

          {/* Bouton Continuer */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(212,175,55,0.6)' }}
            whileTap={{ scale: 0.98 }}
            disabled={!phone || !fullName || !dateOfBirth || !gender || !acceptTerms || isLoading}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] font-bold text-sm tracking-widest uppercase py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>CONTINUER <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" /></>
              )}
            </span>
            {!isLoading && (
              <motion.div
                animate={{ x: ['0%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            )}
          </motion.button>
        </motion.form>
        )}

        {/* Séparateur */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-white/40 text-xs tracking-widest">OU</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Lien vers connexion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-white/60 text-sm mb-2">
            Vous avez déjà un compte ?
          </p>
          <Link href="/login">
            <span className="text-[#D4AF37] text-sm tracking-wide hover:text-[#D4AF37]/80 transition-colors duration-300 border-b border-[#D4AF37]/30 hover:border-[#D4AF37] pb-1 cursor-pointer">
              Se connecter
            </span>
          </Link>
        </motion.div>

        {/* Avantages SIGNARE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 space-y-3"
        >
          <p className="text-white/40 text-xs tracking-wide mb-4 text-center">
            En rejoignant SIGNARE, vous accédez à :
          </p>
          <div className="space-y-2">
            {[
              'Collections exclusives de haute couture',
              'Création de vêtements personnalisés',
              'Suivi de vos commandes en temps réel',
              'Accès aux événements mode',
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-2 text-white/50 text-xs"
              >
                <div className="w-1 h-1 rounded-full bg-[#D4AF37]/60" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Ornement décoratif bas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
      >
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/20" />
        <Sparkles className="w-3 h-3 text-[#D4AF37]/30" />
        <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/20" />
      </motion.div>
    </div>
  )
}

