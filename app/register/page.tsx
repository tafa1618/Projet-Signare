'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, User as UserIcon, ArrowRight, Sparkles, Check } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isFocusedPhone, setIsFocusedPhone] = useState(false)
  const [isFocusedName, setIsFocusedName] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implémenter la logique d'inscription avec Supabase
    console.log('Inscription:', { phoneOrEmail, fullName })
    
    // Redirection vers le feed
    router.push('/')
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

        {/* Formulaire */}
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
              
              {/* Icône */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <UserIcon className="w-5 h-5 text-[#D4AF37]/50" />
              </div>
            </div>

            {/* Ligne animée */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isFocusedName ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 origin-center"
            />
          </div>

          {/* Input Téléphone/Email */}
          <div className="relative">
            <label className="block text-white/70 text-xs tracking-widest uppercase mb-3">
              Téléphone ou Email
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                onFocus={() => setIsFocusedPhone(true)}
                onBlur={() => setIsFocusedPhone(false)}
                placeholder="+221 77 123 45 67"
                className="w-full bg-transparent text-white text-lg py-3 px-1 border-b-2 border-white/20 focus:border-[#D4AF37] outline-none transition-all duration-300 placeholder:text-white/30"
              />
              
              {/* Icône dynamique */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                {phoneOrEmail.includes('@') ? (
                  <Mail className="w-5 h-5 text-[#D4AF37]/50" />
                ) : (
                  <Phone className="w-5 h-5 text-[#D4AF37]/50" />
                )}
              </div>
            </div>

            {/* Ligne animée */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isFocusedPhone ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 origin-center"
            />
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

          {/* Bouton Créer le compte */}
          <motion.button
            type="submit"
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 0 40px rgba(212,175,55,0.6)',
            }}
            whileTap={{ scale: 0.98 }}
            disabled={!phoneOrEmail || !fullName || !acceptTerms}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] font-bold text-sm tracking-widest uppercase py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {/* Effet de brillance */}
            <span className="relative z-10 flex items-center justify-center gap-3">
              CRÉER MON COMPTE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            
            {/* Effet glow animé */}
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
          </motion.button>
        </motion.form>

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

