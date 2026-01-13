'use client'

import { motion } from 'framer-motion'
import { Heart, Scissors, Trophy, Award, Medal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useVote } from '@/frontend/hooks/useVote'

export interface Participant {
  id: string
  name: string
  media: string[]
  format: 'photos' | 'video'
  likes: number
  tailorId: string
  tailorName: string
  position?: 1 | 2 | 3
  category: 'homme' | 'femme' | 'tailleur'
}

interface ParticipantCardProps {
  participant: Participant
  onLike?: (id: string) => void // Optionnel maintenant (utilise useVote en interne)
  isLiked?: boolean
}

export default function ParticipantCard({ participant, onLike, isLiked: externalIsLiked }: ParticipantCardProps) {
  // Utiliser le hook useVote pour gérer les votes (mode mock)
  const { hasVoted, likesCount, toggleVote } = useVote(participant.id, participant.likes)
  
  // Utiliser l'état externe si fourni, sinon utiliser le hook
  const isLiked = externalIsLiked !== undefined ? externalIsLiked : hasVoted
  const displayLikesCount = externalIsLiked !== undefined ? participant.likes : likesCount
  
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Utiliser le hook interne
    await toggleVote()
    
    // Appeler le callback externe si fourni (pour tracking)
    if (onLike) {
      onLike(participant.id)
    }
  }
  const positionColors = {
    1: 'bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#D4AF37]',
    2: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-300',
    3: 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-600',
  }

  const positionIcons = {
    1: Trophy,
    2: Medal,
    3: Award,
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="relative bg-white/5 border border-[#D4AF37]/20 rounded-xl overflow-hidden"
    >
      {/* Position Badge */}
      {participant.position && (
        <div className="absolute top-2 left-2 z-20">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${positionColors[participant.position]} flex items-center justify-center shadow-lg`}>
            {(() => {
              const Icon = positionIcons[participant.position]
              return <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A0A0A]" />
            })()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0A0A0A] border-2 border-[#D4AF37] flex items-center justify-center">
            <span className="text-[#D4AF37] text-[10px] sm:text-xs font-black">{participant.position}</span>
          </div>
        </div>
      )}

      {/* Media */}
      <Link href={`/events/competition/${participant.id}`}>
        <div className="relative aspect-[3/4] w-full bg-black">
          {participant.format === 'video' ? (
            <video
              src={participant.media[0]}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={participant.media[0]}
              alt={participant.name}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-2 sm:p-3 space-y-2">
        <div>
          <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-1">{participant.name}</h3>
          <Link
            href={`/profil?tailor=${participant.tailorId}`}
            className="flex items-center gap-1.5 mt-0.5 text-white/60 text-[10px] sm:text-xs hover:text-[#D4AF37] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Scissors className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="line-clamp-1">{participant.tailorName}</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors ${
              isLiked
                ? 'bg-[#D4AF37]/20 border border-[#D4AF37]'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'text-[#D4AF37] fill-current' : 'text-white/60'}`} />
            <span className={`text-[10px] sm:text-xs font-semibold ${isLiked ? 'text-[#D4AF37]' : 'text-white/70'}`}>
              {displayLikesCount}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

