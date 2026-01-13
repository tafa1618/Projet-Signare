"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Ticket } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Fonction utilitaire pour Tailwind
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: 'ACCUEIL', icon: Home, href: '/' },
  { label: 'IA', icon: Sparkles, href: '/inspiration' },
  { label: 'EVENTS', icon: Ticket, href: '/events' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Ne pas afficher la barre sur les pages de bienvenue et d'authentification
  const hideNav = pathname === '/welcome' || pathname === '/login' || pathname === '/register' || pathname === '/onboarding' || pathname === '/publish';

  // Retourner null après tous les hooks
  if (hideNav) return null;

  // Toujours afficher le footer (toujours visible pour la navigation)
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-[200] h-16 bg-[#0A0A0A]/95 backdrop-blur-lg pb-safe overflow-x-hidden">
      <div className="flex justify-around items-center h-full px-4 max-w-2xl mx-auto w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const handleLinkClick = (e: React.MouseEvent) => {
            console.log('🔗 Link clicked:', item.href, 'Current path:', pathname);
            // Ne pas empêcher la navigation par défaut
          };

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex flex-col items-center justify-center flex-1 relative transition-all duration-300 py-1.5 rounded-xl h-14 cursor-pointer",
                isActive && "bg-[#D4AF37]/10"
              )}
              style={{ pointerEvents: 'auto' }}
            >
              <Icon 
                size={20} 
                className={cn(
                  "transition-all duration-300",
                  isActive 
                    ? "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] mb-1" 
                    : "text-[#D4AF37]/40"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {/* Afficher le texte seulement si la page est active */}
              {isActive && (
                <span className={cn(
                  "text-[8px] font-bold tracking-widest uppercase transition-all duration-300",
                  "text-[#D4AF37]"
                )}>
                  {item.label}
                </span>
              )}
              
              {/* Barre indicatrice luxe en haut si actif */}
              {isActive && (
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#D4AF37] rounded-b-full shadow-[0_0_12px_rgba(212,175,55,0.8)] transition-all duration-300" 
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
