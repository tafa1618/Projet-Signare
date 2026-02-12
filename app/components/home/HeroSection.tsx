'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HeroSection() {
    return (
        <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1600&h=900&fit=crop&q=80"
                    alt="Signare Haute Couture"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                <div className="absolute inset-0 bg-[#0A0A0A]/20" /> {/* Overall dim */}
            </div>

            {/* Content */}
            <div className="relative h-full max-w-2xl mx-auto px-4 flex flex-col justify-end pb-24 sm:justify-center sm:pb-0">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center sm:text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 backdrop-blur-md mb-6 mx-auto sm:mx-0">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Nouvelle Collection 2026</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                        L'Élégance <br />
                        <span className="text-[#D4AF37]">Sur-Mesure</span>
                    </h1>

                    <p className="text-base sm:text-lg text-white/80 max-w-lg mb-8 leading-relaxed mx-auto sm:mx-0">
                        Alliez la tradition de la haute couture sénégalaise à la précision de l'intelligence artificielle. Votre tenue parfaite, conçue pour vous.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                        <Link href="/atelier">
                            <button className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] text-[#0A0A0A] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#F4CF57] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2">
                                Créer ma tenue
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                        <Link href="/shop">
                            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-md text-white border border-white/20 font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
                                Explorer la boutique
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
