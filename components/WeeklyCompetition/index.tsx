'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trophy, Calendar, Clock, PlayCircle } from 'lucide-react'
import CompetitionParticipantModal, { ParticipantSubmission } from './CompetitionParticipantModal'
import ParticipantCard, { Participant } from './ParticipantCard'

interface WeeklyCompetitionProps {
  hasParticipated: boolean
  daysRemaining: number
  topParticipants: {
    homme: Participant[]
    femme: Participant[]
    tailleur: Participant[]
  }
  winners?: {
    homme?: Participant
    femme?: Participant
    tailleur?: Participant
  }
  onParticipate: (data: ParticipantSubmission) => void
  onLike: (participantId: string) => void
  externalModalOpen?: boolean
  onModalOpenChange?: (open: boolean) => void
}

export default function WeeklyCompetition({
  hasParticipated,
  daysRemaining,
  topParticipants,
  winners,
  onParticipate,
  onLike,
  externalModalOpen,
  onModalOpenChange,
}: WeeklyCompetitionProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false)
  
  // Utiliser le contrôle externe si fourni, sinon utiliser l'état interne
  const modalOpen = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen
  
  const setModalOpen = (open: boolean) => {
    if (externalModalOpen !== undefined && onModalOpenChange) {
      onModalOpenChange(open)
    } else {
      setInternalModalOpen(open)
    }
  }
  
  // Synchroniser le state externe avec l'interne si nécessaire
  useEffect(() => {
    if (externalModalOpen !== undefined) {
      // Le modal est contrôlé depuis l'extérieur, pas besoin de synchroniser
    }
  }, [externalModalOpen])

  return (
    <>
      {/* Section Principale */}
      <section className="mb-8">
        <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/10 via-[#0A0A0A] to-[#0A0A0A]">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
          <div className="relative px-4 py-8 sm:px-6 sm:py-10 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37]" />
                <h2 className="font-serif text-2xl sm:text-3xl text-[#D4AF37] tracking-[0.15em]">
                  Sagnsé & Ndanane de la semaine
                </h2>
              </div>
              <p className="text-white/70 text-sm sm:text-base font-serif italic">
                Une tenue. Une scène. Une victoire.
              </p>
              <div className="flex items-center justify-center gap-2 text-white/50 text-xs sm:text-sm">
                <Clock className="w-4 h-4" />
                <span>Clôture dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalOpen(true)}
                disabled={hasParticipated}
                className={`px-6 py-3 rounded-xl font-black uppercase tracking-[0.18em] text-sm transition-all shadow-lg ${
                  hasParticipated
                    ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#D4AF37]/90 shadow-[0_0_30px_rgba(212,175,55,0.5)]'
                } flex items-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                {hasParticipated ? 'Déjà participé' : 'Participer'}
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Compétition en Cours */}
      <section className="mb-8">
        <h3 className="text-lg font-serif text-[#D4AF37] tracking-[0.15em] mb-4">
          Top 3 en Compétition
        </h3>

        <div className="space-y-6">
          {/* SIGNARE (Femme) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-[0.18em]">
                SIGNARE de la semaine
              </h4>
              <span className="text-xs text-white/50">{topParticipants.femme.length} participants</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {topParticipants.femme.slice(0, 3).map((participant, index) => (
                <ParticipantCard
                  key={participant.id}
                  participant={{ ...participant, position: (index + 1) as 1 | 2 | 3 }}
                  onLike={onLike}
                />
              ))}
            </div>
          </div>

          {/* Ndanane (Homme) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-[0.18em]">
                Ndanane de la semaine
              </h4>
              <span className="text-xs text-white/50">{topParticipants.homme.length} participants</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {topParticipants.homme.slice(0, 3).map((participant, index) => (
                <ParticipantCard
                  key={participant.id}
                  participant={{ ...participant, position: (index + 1) as 1 | 2 | 3 }}
                  onLike={onLike}
                />
              ))}
            </div>
          </div>

          {/* Tailleur */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-[0.18em]">
                Tailleur de la semaine
              </h4>
              <span className="text-xs text-white/50">{topParticipants.tailleur.length} participants</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {topParticipants.tailleur.slice(0, 3).map((participant, index) => (
                <ParticipantCard
                  key={participant.id}
                  participant={{ ...participant, position: (index + 1) as 1 | 2 | 3 }}
                  onLike={onLike}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Gagnants (si disponibles) */}
      {winners && (winners.homme || winners.femme || winners.tailleur) && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-lg font-serif text-[#D4AF37] tracking-[0.15em]">
              Gagnants de la semaine précédente
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {winners.femme && (
              <div className="relative rounded-xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 to-[#0A0A0A]">
                <div className="absolute top-3 left-3 z-20 bg-[#D4AF37] text-[#0A0A0A] px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                  SIGNARE
                </div>
                <ParticipantCard participant={winners.femme} onLike={onLike} />
                <div className="p-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2 rounded-lg text-xs font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Voir le mini-film
                  </motion.button>
                </div>
              </div>
            )}

            {winners.homme && (
              <div className="relative rounded-xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 to-[#0A0A0A]">
                <div className="absolute top-3 left-3 z-20 bg-[#D4AF37] text-[#0A0A0A] px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                  NDANANE
                </div>
                <ParticipantCard participant={winners.homme} onLike={onLike} />
                <div className="p-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2 rounded-lg text-xs font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Voir le mini-film
                  </motion.button>
                </div>
              </div>
            )}

            {winners.tailleur && (
              <div className="relative rounded-xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 to-[#0A0A0A]">
                <div className="absolute top-3 left-3 z-20 bg-[#D4AF37] text-[#0A0A0A] px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                  TAILLEUR
                </div>
                <ParticipantCard participant={winners.tailleur} onLike={onLike} />
                <div className="p-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2 rounded-lg text-xs font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Voir le mini-film
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Modal */}
      <CompetitionParticipantModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={onParticipate}
        hasParticipated={hasParticipated}
      />
    </>
  )
}

