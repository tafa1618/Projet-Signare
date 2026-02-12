'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const COLLECTIONS = [
    {
        id: 'tabaski-2026',
        title: 'Tabaski Royale',
        subtitle: 'Bazin Riche & Broderies',
        image: 'https://images.unsplash.com/photo-1548142340-97e3cb7d206c?w=800&fit=crop',
        link: '/shop/category/tabaski'
    },
    {
        id: 'wedding-guests',
        title: 'Cérémonies',
        subtitle: 'Élégance pour vos événements',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=800&fit=crop', // Replaced with a more generic refined image or fabric
        link: '/shop/category/ceremonie'
    },
    {
        id: 'casual-chic',
        title: 'Urban Wax',
        subtitle: 'Le style au quotidien',
        image: 'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=800&fit=crop',
        link: '/shop/category/urban'
    }
]

export function SeasonalCollections() {
    return (
        <section className="py-16 bg-[#0A0A0A] relative z-10">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Collections</span>
                        <h2 className="text-2xl font-serif text-white mt-1">L'Art de Signare</h2>
                    </div>
                    <Link href="/shop" className="text-white/60 hover:text-[#D4AF37] text-sm flex items-center gap-1 transition-colors">
                        Voir tout <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Horizontal Scroll Container (Hidden Scrollbar) */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 scroll-smooth">
                    {COLLECTIONS.map((collection, index) => (
                        <Link key={collection.id} href={collection.link} className="flex-shrink-0 w-[280px] group cursor-pointer">
                            <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 border border-white/5 group-hover:border-[#D4AF37]/50 transition-all">
                                <Image
                                    src={collection.image}
                                    alt={collection.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-80" />
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">Découvrir</p>
                                    <h3 className="text-xl font-serif text-white font-bold">{collection.title}</h3>
                                    <p className="text-white/70 text-sm">{collection.subtitle}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
