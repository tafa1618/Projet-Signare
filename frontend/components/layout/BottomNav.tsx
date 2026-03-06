"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Ruler, ShoppingBag, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Fonction utilitaire pour Tailwind
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: 'ACCUEIL', icon: Home, href: '/', center: false },
  { label: 'EXPLORER', icon: Search, href: '/explore', center: false },
  { label: 'MESURES', icon: Ruler, href: '/atelier/mesures', center: true },
  { label: 'COMMANDES', icon: ShoppingBag, href: '/orders', center: false },
  { label: 'PROFIL', icon: User, href: '/profile', center: false },
];

export default function BottomNav() {
  const pathname = usePathname();

  const hideNav = pathname === '/welcome' || pathname === '/login' || pathname === '/register' || pathname === '/onboarding' || pathname === '/publish' || pathname === '/messages';

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-[200] h-16 bg-[#0A0A0A]/95 backdrop-blur-lg pb-safe overflow-x-hidden">
      <div className="flex justify-around items-center h-full px-2 max-w-2xl mx-auto w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 relative"
                style={{ pointerEvents: 'auto' }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 -mt-5 shadow-lg",
                  isActive
                    ? "bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                    : "bg-[#D4AF37]/90 shadow-[0_0_12px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                )}>
                  <Icon size={22} className="text-[#0A0A0A]" strokeWidth={2.5} />
                </div>
                <span className="text-[8px] font-bold tracking-widest uppercase mt-1 text-[#D4AF37]/70">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 relative transition-all duration-300 py-1.5 rounded-xl h-14 cursor-pointer",
                isActive && "bg-[#D4AF37]/10"
              )}
              style={{ pointerEvents: 'auto' }}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#D4AF37] rounded-b-full shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
              )}
              <Icon
                size={20}
                className={cn(
                  "transition-all duration-300",
                  isActive
                    ? "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                    : "text-[#D4AF37]/40"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {isActive && (
                <span className="text-[8px] font-bold tracking-widest uppercase mt-0.5 text-[#D4AF37]">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
