'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Filter, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { mockProducts } from '@/lib/mocks'

// Mock categories mapping for demo titles/images
const CATEGORY_INFO: Record<string, { title: string; image: string; description: string }> = {
    'mode-femme': {
        title: 'Mode Femme',
        image: 'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=1200&h=400&fit=crop',
        description: 'Élégance et tradition revisitées pour la femme moderne.'
    },
    'mode-homme': {
        title: 'Mode Homme (Ndanane)',
        image: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=1200&h=400&fit=crop',
        description: 'Le style Ndanane : charisme et prestance.'
    },
    'electronique': {
        title: 'Électronique & Info',
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&h=400&fit=crop',
        description: 'High-tech et accessoires connectés.'
    },
    'maison': {
        title: 'Maison & Cuisine',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=1200&h=400&fit=crop',
        description: "Décoration d'intérieur inspirée."
    }
}

export default function CategoryPage() {
    const params = useParams()
    const slug = typeof params.slug === 'string' ? params.slug : ''

    // Get info or default
    const info = CATEGORY_INFO[slug] || {
        title: slug.replace('-', ' ').toUpperCase(),
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
        description: `Découvrez notre sélection ${slug.replace('-', ' ')}`
    }

    // Filter mock products (simulated)
    // In a real app, we would fetch from API with ?category=slug
    const products = mockProducts.filter(p => {
        if (slug === 'mode-femme') return p.category === 'Dresses' || p.category === 'Accessoires'
        if (slug === 'mode-homme') return p.category === 'Shirts'
        return true // Show all for generic categories to have content
    })

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10 px-4 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/shop" className="p-2 rounded-full hover:bg-white/5 text-[#D4AF37]">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-serif font-bold text-white capitalize">{info.title}</h1>
                </div>
            </div>

            {/* Hero Category */}
            <div className="relative w-full h-48 md:h-64">
                <Image
                    src={info.image}
                    alt={info.title}
                    fill
                    className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                <div className="absolute bottom-6 left-6 max-w-lg">
                    <h2 className="text-3xl md:text-4xl font-serif text-[#D4AF37] font-bold mb-2">{info.title}</h2>
                    <p className="text-sm text-white/80">{info.description}</p>
                </div>
            </div>

            {/* Products Grid */}
            <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-white/50">{products.length} articles</span>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-lg hover:bg-[#D4AF37]/10">
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <Link key={product.id} href={`/shop/${product.id}`} className="group block">
                            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-[#D4AF37]/50 transition-all">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                    <p className="font-serif text-white truncate">{product.name}</p>
                                    <p className="text-[#D4AF37] text-sm font-bold">{product.price}</p>
                                </div>

                                {/* Add to Cart Shortcut */}
                                <button className="absolute top-3 right-3 bg-[#D4AF37] text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:scale-110">
                                    <ShoppingBag className="w-4 h-4" />
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
