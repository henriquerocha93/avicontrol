import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  variant?: 'dark' | 'light' | 'emerald' | 'admin';
}

export function Logo({
  className,
  showText = true,
  size = 'md',
  href = '/',
  variant = 'light'
}: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl'
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl'
  };

  const isAdmin = variant === 'admin';

  const logoGraphic = (
    <div className={cn('group flex items-center gap-3 select-none', className)}>
      {/* Modern High-End Icon Container */}
      <div className={cn(
        'relative flex items-center justify-center p-1.5 shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden shrink-0 border',
        iconSizes[size],
        isAdmin 
          ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-900 border-amber-400/40 shadow-amber-500/25 group-hover:shadow-amber-500/40 ring-1 ring-white/20'
          : 'bg-gradient-to-br from-[#00c853] via-emerald-600 to-[#022c1b] border-emerald-400/40 shadow-emerald-500/30 group-hover:shadow-emerald-500/50 ring-1 ring-white/20'
      )}>
        {/* Subtle glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20 pointer-events-none" />

        {/* Vector Bird + Ring Modern Graphic */}
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-md">
          {/* Bird wing / silhouette sleek geometry */}
          <path
            d="M7 26C11 19 20 15 33 11C37 9.5 41 7 41 7C40 11 38 18 34 22C29.5 26.5 23 29.5 15.5 30.5C11 31 8.5 28.5 7 26Z"
            fill="white"
            fillOpacity="0.98"
          />
          <path
            d="M19 23C25 21 34 16 39 9.5C35 15 30.5 24.5 23.5 28.5C17.5 32 11.5 32.5 9 32.5C12 30.5 16 26.5 19 23Z"
            fill={isAdmin ? '#fde68a' : '#a7f3d0'}
            fillOpacity="0.9"
          />
          {/* Golden Ring circle accent */}
          <circle cx="35" cy="35" r="7" stroke="#F59E0B" strokeWidth="2.8" fill="none" className="drop-shadow-xs" />
          <circle cx="35" cy="35" r="3.2" fill="#F59E0B" />
        </svg>
      </div>

      {/* Prominent & Modern Typography */}
      {showText && (
        <div className="flex items-center tracking-tight font-black">
          <span className={cn(
            'font-black tracking-tight flex items-center leading-none',
            variant === 'dark' ? 'text-slate-900' : 'text-white',
            textSizes[size]
          )}>
            BIRD
            <span className={cn(
              'font-black ml-0.5 bg-clip-text text-transparent',
              isAdmin 
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-r from-[#00c853] via-emerald-400 to-[#00e676] drop-shadow-[0_2px_14px_rgba(0,200,83,0.45)]'
            )}>
              PRO
            </span>
            {/* Glowing Accent Dot */}
            <span className={cn(
              'inline-block w-2 h-2 rounded-full ml-1 animate-pulse shadow-md',
              isAdmin ? 'bg-amber-400 shadow-amber-400/80' : 'bg-[#00c853] shadow-[#00c853]/80'
            )} />
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-95 transition-opacity">
        {logoGraphic}
      </Link>
    );
  }

  return logoGraphic;
}
