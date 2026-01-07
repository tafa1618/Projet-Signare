"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Sparkles, Ticket, User } from 'lucide-react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isTouching, setIsTouching] = useState(false);

  // Ne pas afficher la barre sur les pages de bienvenue et d'authentification
  const hideNav = pathname === '/welcome' || pathname === '/login' || pathname === '/register' || pathname === '/onboarding' || pathname === '/publish';
  if (hideNav) return null;

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let touchTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Afficher si on scroll vers le bas (plus de 50px)
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(true);
        clearTimeout(scrollTimeout);
        // Cacher après 2 secondes d'inactivité de scroll
        scrollTimeout = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } else if (currentScrollY < lastScrollY || currentScrollY < 30) {
        // Cacher si on scroll vers le haut ou si on est en haut
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    const handleTouchStart = () => {
      setIsTouching(true);
      setIsVisible(true);
      clearTimeout(touchTimeout);
    };

    const handleTouchEnd = () => {
      setIsTouching(false);
      // Garder visible pendant 3 secondes après le touch
      clearTimeout(touchTimeout);
      touchTimeout = setTimeout(() => {
        if (!isTouching && window.scrollY < 50) {
          setIsVisible(false);
        }
      }, 3000);
    };

    // Afficher au chargement si on est déjà scrollé
    if (window.scrollY > 50) {
      setIsVisible(true);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(scrollTimeout);
      clearTimeout(touchTimeout);
    };
  }, [lastScrollY, isTouching]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 w-full z-[100] h-20 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-[#D4AF37]/30 pb-safe"
        >
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
        </motion.nav>
      )}
    </AnimatePresence>
  );
}