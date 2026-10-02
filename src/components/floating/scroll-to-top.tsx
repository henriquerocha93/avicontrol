'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 220) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 flex items-center group animate-in fade-in zoom-in-75 slide-in-from-bottom-4 duration-300">
      
      {/* Floating Tooltip (Opens to the Left) */}
      <div 
        className={`mr-3 px-3 py-1.5 bg-slate-900/95 dark:bg-slate-800/95 text-white text-[11px] sm:text-xs font-bold rounded-xl shadow-xl border border-emerald-500/40 backdrop-blur-md transition-all duration-300 pointer-events-none hidden sm:flex items-center gap-1.5 ${
          isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-3 scale-95'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>Voltar ao topo</span>
      </div>

      {/* Scroll to top Action Button */}
      <button
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Voltar ao topo da página"
        className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#091711]/90 hover:bg-[#0f281d] text-emerald-400 hover:text-white border-2 border-emerald-500/50 hover:border-emerald-400 shadow-2xl shadow-emerald-950/80 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Subtle Ambient Glow */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity pointer-events-none" />

        {/* Arrow Up Icon with slight bobbing animation */}
        <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>

    </div>
  );
}
