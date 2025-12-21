"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Sparkles, Ticket, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Fonction utilitaire pour Tailwind
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: 'ACCUEIL', icon: Home, href: '/' },
  { label: 'MESSAGES', icon: MessageCircle, href: '/messages' },
  { label: 'IA', icon: Sparkles, href: '/inspiration' },
  { label: 'EVENTS', icon: Ticket, href: '/events' },
  { label: 'PROFIL', icon: User, href: '/profil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50">
      {/* Effet de flou et bordure dorée supérieure */}
      <div className="flex justify-around items-center bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-[#D4AF37]/30 h-20 px-4 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 relative transition-all duration-300 py-2 rounded-lg",
                isActive && "bg-[#D4AF37]/10"
              )}
            >
              <Icon 
                size={26} 
                className={cn(
                  "transition-all duration-300 mb-1",
                  isActive 
                    ? "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
                    : "text-[#D4AF37]/50"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-[10px] font-semibold tracking-wider uppercase transition-all duration-300",
                isActive 
                  ? "text-[#D4AF37]" 
                  : "text-[#D4AF37]/50"
              )}>
                {item.label}
              </span>
              
              {/* Barre indicatrice en haut si actif */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#D4AF37] rounded-b-full shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}