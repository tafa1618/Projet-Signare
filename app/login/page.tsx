'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { signInWithPhone } from '@/backend/lib/supabase'
import { logError } from '@/lib/logger'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation : uniquement téléphone (selon .cursorrules section 2)
    if (!phoneNumber || !phoneNumber.match(/^\+?[0-9]{9,15}$/)) {
      setError('Veuillez entrer un numéro de téléphone valide')
      return
    }

    setIsLoading(true)

    try {
      // En mode développement, simuler l'envoi d'OTP pour les numéros mockés
      const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
      const mockPhones = ['+771111111', '771111111', '+772222222', '772222222']
      
      if (mockPhones.includes(normalizedPhone) || mockPhones.includes(phoneNumber)) {
        // Simuler l'envoi d'OTP (pas besoin d'appeler Supabase)
        setOtpSent(true)
        setIsLoading(false)
        return
      }

      // ✅ Authentification via Supabase OTP (sécurisé) pour les autres numéros
      const { data, error: signInError } = await signInWithPhone(phoneNumber)

      if (signInError) {
        setError('Erreur lors de l\'envoi du code. Veuillez réessayer.')
        logError(signInError, 'Phone sign-in')
        return
      }

      // Code OTP envoyé avec succès
      setOtpSent(true)
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      logError(err, 'Login')
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
      // En mode développement, simuler l'authentification pour les numéros mockés
      const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
      const mockPhones = ['+771111111', '771111111', '+772222222', '772222222']
      
      if (mockPhones.includes(normalizedPhone) || mockPhones.includes(phoneNumber)) {
        // Stocker le numéro dans localStorage pour le mock auth
        localStorage.setItem('mock_auth_phone', normalizedPhone.startsWith('+') ? normalizedPhone : `+${normalizedPhone}`)
        
        // Recharger la page pour que useAuth détecte le changement
        const next = searchParams.get('next')
        if (next) {
          window.location.href = next
          return
        }
        window.location.href = '/'
        return
      }

      // TODO: Implémenter verifyOTP depuis backend/lib/supabase pour la production
      // const { data, error } = await verifyOTP(phoneNumber, otpCode)
      
      // Intention sauvegardée (ex: repost) + redirection
      const next = searchParams.get('next')
      if (next) {
        router.push(next)
        return
      }
      router.push('/')
    } catch (err) {
      setError('Code invalide. Veuillez réessayer.')
      logError(err, 'OTP verification')
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
            BIENVENUE
          </h1>
          
          <p className="text-white/60 text-sm tracking-wide">
            Connectez-vous pour continuer
          </p>
        </motion.div>

        {/* Formulaire */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={otpSent ? handleVerifyOTP : handleSubmit}
          className="space-y-8"
        >
          {/* Input Téléphone (uniquement selon .cursorrules) */}
          <div className="relative">
            <label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
              Numéro de Téléphone
            </label>
            
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="+221 77 123 45 67"
                disabled={otpSent || isLoading}
                className="w-full bg-transparent text-white text-lg py-3 px-1 border-b-2 border-white/20 focus:border-[#D4AF37] outline-none transition-all duration-300 placeholder:text-white/30 disabled:opacity-50"
              />
              
              {/* Icône téléphone */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <Phone className="w-5 h-5 text-[#D4AF37]/50" />
              </div>
            </div>

            {/* Ligne animée */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isFocused ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 origin-center"
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Message de succès OTP */}
          {otpSent && !error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#D4AF37] text-sm text-center"
            >
              Code OTP envoyé ! Vérifiez vos SMS.
            </motion.div>
          )}

          {/* Input Code OTP (si code envoyé) */}
          {otpSent && (
            <div className="relative">
              <label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
                Code de Vérification (6 chiffres)
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  disabled={isLoading}
                  className="w-full bg-transparent text-white text-lg py-3 px-1 border-b-2 border-white/20 focus:border-[#D4AF37] outline-none transition-all duration-300 placeholder:text-white/30 text-center tracking-widest text-2xl disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Bouton Continuer / Vérifier */}
          <motion.button
            type="submit"
            whileHover={{ 
              scale: otpSent || isLoading ? 1 : 1.02,
              boxShadow: otpSent || isLoading ? 'none' : '0 0 40px rgba(212,175,55,0.6)',
            }}
            whileTap={{ scale: 0.98 }}
            disabled={!phoneNumber || isLoading || (otpSent && !otpCode)}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] font-bold text-sm tracking-widest uppercase py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {/* Effet de brillance */}
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {otpSent ? 'Vérification...' : 'Envoi...'}
                </>
              ) : (
                <>
                  {otpSent ? 'VÉRIFIER' : 'CONTINUER'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </span>
            
            {/* Effet glow animé */}
            {!isLoading && (
              <motion.div
                animate={{
                  x: ['0%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            )}
          </motion.button>
        </motion.form>

        {/* Séparateur */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-white/40 text-xs tracking-widest">OU</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Lien vers création de compte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-white/60 text-sm mb-2">
            Vous n'avez pas de compte ?
          </p>
          <Link href="/register">
            <span className="text-[#D4AF37] text-sm tracking-wide hover:text-[#D4AF37]/80 transition-colors duration-300 border-b border-[#D4AF37]/30 hover:border-[#D4AF37] pb-1 cursor-pointer">
              Créer un compte SIGNARE
            </span>
          </Link>
        </motion.div>

        {/* Politique de confidentialité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-white/30 text-xs leading-relaxed">
            En continuant, vous acceptez nos{' '}
            <Link href="/terms" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              Conditions d'utilisation
            </Link>
            {' '}et notre{' '}
            <Link href="/privacy" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
              Politique de confidentialité
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Ornement décoratif bas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
      >
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/20" />
        <Sparkles className="w-3 h-3 text-[#D4AF37]/30" />
        <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/20" />
      </motion.div>
    </div>
  )
}
