'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    Sparkles,
    Search,
    Bell,
    MessageSquare,
    ShoppingCart,
    CheckCircle2,
    MoreVertical
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export function DesktopSidebar() {
    const pathname = usePathname()

    // Hide sidebar on welcome page
    if (pathname === '/welcome') return null

    return (
        <aside className="hidden lg:flex w-[275px] flex-col sticky top-0 h-screen overflow-y-auto no-scrollbar border-r border-white/5 pr-4 pt-4 pb-8 flex-shrink-0">
            <div className="mb-6 pl-2 flex justify-center lg:justify-start">
                <Link href="/" className="relative w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.3)] bg-white">
                    <Image
                        src="/logo.png"
                        alt="SIGNARE"
                        fill
                        className="object-cover scale-150 object-[center_35%]"
                        priority
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {[
                    { label: 'Accueil', icon: Sparkles, href: '/' },
                    { label: 'Explorer', icon: Search, href: '/explore' },
                    { label: 'Notifications', icon: Bell, href: '/notifications' },
                    { label: 'Messages', icon: MessageSquare, href: '/messages' },
                    { label: 'Panier', icon: ShoppingCart, href: '/cart' },
                    { label: 'Profil', icon: CheckCircle2, href: '/profile' },
                ].map((item, i) => {
                    const isActive = pathname === item.href
                    return (
                        <Link key={i} href={item.href} className={cn("w-full flex items-center gap-5 px-4 py-3.5 rounded-full transition-all group", isActive ? "font-bold text-white bg-white/5" : "text-white/80 hover:bg-white/5 hover:text-white")}>
                            <item.icon size={26} className={cn("group-hover:scale-105 transition-transform", isActive ? "text-[#D4AF37]" : "text-white")} />
                            <span className="text-xl tracking-wide">{item.label}</span>
                        </Link>
                    )
                })}
                <button className="w-full flex items-center gap-5 px-4 py-3.5 rounded-full text-white/80 hover:bg-white/5 hover:text-white transition-all group">
                    <MoreVertical size={26} className="text-white" />
                    <span className="text-xl tracking-wide">Plus</span>
                </button>
            </nav>

            {/* CTA Post */}
            <div className="my-4">
                <Link
                    href="/publish"
                    className="block w-[90%] py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#F4CF57] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] text-center"
                >
                    Poster
                </Link>
            </div>

            {/* User Profile Widget */}
            <div className="mt-auto flex items-center gap-3 p-3 rounded-full hover:bg-white/5 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/10 relative overflow-hidden">
                    <Image src="https://i.pravatar.cc/150?u=me" alt="Me" fill className="object-cover" />
                </div>
                <div className="flex-1 leading-tight">
                    <p className="font-bold text-sm text-white">Moi</p>
                    <p className="text-[#D4AF37] text-xs">@mon_compte</p>
                </div>
                <MoreVertical size={16} className="text-white/50" />
            </div>
        </aside>
    )
}
