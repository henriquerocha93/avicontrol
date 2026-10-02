'use client';

import React from 'react';

// Sophisticated Natural Foliage & Ambient Forest Atmosphere
export function NatureForestBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* Deep Botanical Aurora Glow */}
      <div className="absolute -top-32 left-1/4 w-[800px] h-[600px] bg-gradient-to-br from-[#00c853]/15 via-emerald-700/10 to-transparent rounded-full blur-[120px] animate-nature-aurora pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[700px] h-[700px] bg-gradient-to-bl from-teal-500/12 via-[#00c853]/8 to-transparent rounded-full blur-[140px] animate-nature-aurora animate-plant-delay-1 pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-gradient-to-t from-emerald-900/20 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Bioluminescent Golden Pollen / Forest Fireflies */}
      <div className="absolute top-1/4 left-[12%] w-2 h-2 rounded-full bg-emerald-400/90 shadow-[0_0_12px_#34d399] animate-float-pollen" />
      <div className="absolute top-1/3 right-[18%] w-1.5 h-1.5 rounded-full bg-amber-300/90 shadow-[0_0_10px_#fde68a] animate-float-pollen animate-plant-delay-1" />
      <div className="absolute top-2/3 left-[28%] w-2 h-2 rounded-full bg-[#00c853]/90 shadow-[0_0_14px_#00c853] animate-float-pollen animate-plant-delay-2" />
      <div className="absolute top-1/2 right-[10%] w-1.5 h-1.5 rounded-full bg-teal-300/90 shadow-[0_0_12px_#5eead4] animate-float-pollen" />
      <div className="absolute bottom-1/4 right-[30%] w-2 h-2 rounded-full bg-emerald-300/90 shadow-[0_0_10px_#6ee7b7] animate-float-pollen animate-plant-delay-1" />

      {/* Elegant Drifting Leaves */}
      <div className="absolute top-1/4 left-[8%] animate-float-leaf-1 opacity-40">
        <svg viewBox="0 0 30 45" className="w-6 h-9 drop-shadow-sm fill-emerald-500/60">
          <path d="M15 2 C26 14, 28 34, 15 42 C2 34, 4 14, 15 2 Z" />
          <path d="M15 2 L15 42" stroke="#a7f3d0" strokeWidth="0.8" strokeOpacity="0.6" />
        </svg>
      </div>

      <div className="absolute top-1/2 right-[14%] animate-float-leaf-2 opacity-35">
        <svg viewBox="0 0 24 36" className="w-5 h-8 drop-shadow-sm fill-teal-500/50">
          <path d="M12 2 C22 12, 24 28, 12 34 C0 28, 2 12, 12 2 Z" />
          <path d="M12 2 L12 34" stroke="#5eead4" strokeWidth="0.8" strokeOpacity="0.5" />
        </svg>
      </div>

      <div className="absolute top-2/3 left-[22%] animate-float-leaf-3 opacity-30">
        <svg viewBox="0 0 28 42" className="w-6 h-9 drop-shadow-sm fill-emerald-600/50">
          <path d="M14 2 C25 14, 26 32, 14 40 C2 32, 3 14, 14 2 Z" />
          <path d="M14 2 L14 40" stroke="#a7f3d0" strokeWidth="0.8" strokeOpacity="0.5" />
        </svg>
      </div>

      {/* Subtle Botanical Branch & Silhouette Overlays (Top Left) */}
      <div className="absolute -top-16 -left-16 w-80 h-96 opacity-25 pointer-events-none animate-plant-left">
        <svg viewBox="0 0 200 240" fill="none" className="w-full h-full">
          <path d="M0 40 Q80 80 160 200" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M40 60 Q90 40 130 50 Q75 75 40 60Z" fill="#065f46" fillOpacity="0.7" />
          <path d="M70 85 Q130 70 170 85 Q115 105 70 85Z" fill="#047857" fillOpacity="0.65" />
          <path d="M100 120 Q160 110 190 135 Q135 145 100 120Z" fill="#064e3b" fillOpacity="0.7" />
          <path d="M130 160 Q180 155 200 185 Q155 185 130 160Z" fill="#059669" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Subtle Palm Silhouette (Top Right) */}
      <div className="absolute -top-12 -right-16 w-88 h-96 opacity-25 pointer-events-none animate-plant-right">
        <svg viewBox="0 0 240 260" fill="none" className="w-full h-full">
          <path d="M240 40 Q150 90 40 220" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M190 65 Q130 50 90 55 Q145 80 190 65Z" fill="#047857" fillOpacity="0.65" />
          <path d="M160 95 Q100 80 60 95 Q115 115 160 95Z" fill="#065f46" fillOpacity="0.7" />
          <path d="M130 130 Q75 125 40 145 Q90 155 130 130Z" fill="#064e3b" fillOpacity="0.75" />
        </svg>
      </div>
    </div>
  );
}
