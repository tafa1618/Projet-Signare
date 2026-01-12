'use client'

import { motion } from 'framer-motion'
import { Heart, Scissors, Trophy, Award, Medal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
  onLike: (id: string) => void
  isLiked?: boolean
}

export default function ParticipantCard({ participant, onLike, isLiked = false }: ParticipantCardProps) {
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
        <div className="absolute top-3 left-3 z-20">
          <div className={`w-10 h-10 rounded-full ${positionColors[participant.position]} flex items-center justify-center shadow-lg`}>
            {(() => {
              const Icon = positionIcons[participant.position]
              return <Icon className="w-5 h-5 text-[#0A0A0A]" />
            })()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0A0A0A] border-2 border-[#D4AF37] flex items-center justify-center">
            <span className="text-[#D4AF37] text-xs font-black">{participant.position}</span>
          </div>
        </div>
      )}

      {/* Media */}
      <Link href={`/events/competition/${participant.id}`}>
        <div className="relative aspect-[9/16] w-full bg-black">
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
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-sm">{participant.name}</h3>
          <Link
            href={`/profil?tailor=${participant.tailorId}`}
            className="flex items-center gap-2 mt-1 text-white/60 text-xs hover:text-[#D4AF37] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Scissors className="w-3 h-3" />
            {participant.tailorName}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onLike(participant.id)
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              isLiked
                ? 'bg-[#D4AF37]/20 border border-[#D4AF37]'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'text-[#D4AF37] fill-current' : 'text-white/60'}`} />
            <span className={`text-xs font-semibold ${isLiked ? 'text-[#D4AF37]' : 'text-white/70'}`}>
              {participant.likes}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

