"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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

  // Ne pas afficher la barre sur les pages de bienvenue et d'authentification
  const hideNav = pathname === '/welcome' || pathname === '/login' || pathname === '/register' || pathname === '/onboarding' || pathname === '/publish';
  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-[100] h-20 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-[#D4AF37]/30 pb-safe">
      <div className="flex justify-around items-center h-full px-4 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 relative transition-all duration-300 py-2 rounded-xl h-16",
                isActive && "bg-[#D4AF37]/10"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  "transition-all duration-300 mb-1",
                  isActive 
                    ? "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
                    : "text-[#D4AF37]/40"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-[9px] font-bold tracking-widest uppercase transition-all duration-300",
                isActive 
                  ? "text-[#D4AF37]" 
                  : "text-[#D4AF37]/40"
              )}>
                {item.label}
              </span>
              
              {/* Barre indicatrice luxe en haut si actif */}
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#D4AF37] rounded-b-full shadow-[0_0_12px_rgba(212,175,55,0.8)]" 
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}