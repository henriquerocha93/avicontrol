'use client';

import React, { useState, useEffect } from 'react';

export type DayPeriodType = 'MORNING' | 'AFTERNOON' | 'NIGHT';

interface DynamicDaytimeAmbienceProps {
  overridePeriod?: DayPeriodType | null;
  onPeriodChange?: (period: DayPeriodType) => void;
}

// =========================================================================
// 1. COMPONENT: REALISTIC FLYING BIRD WITH ARTICULATED FLAPPING WINGS
// =========================================================================
function RealisticFlyingBird({
  flightClass = 'animate-bird-flight-1',
  scale = 1,
  color = '#34d399'
}: {
  flightClass?: string;
  scale?: number;
  color?: string;
}) {
  return (
    <div className={`absolute pointer-events-none ${flightClass}`}>
      <svg
        width={54 * scale}
        height={36 * scale}
        viewBox="0 0 70 50"
        className="overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        {/* Bird Body & Head */}
        <path
          d="M25 25 Q35 22 48 24 Q55 25 60 22 Q58 27 52 29 Q42 32 30 32 Q24 38 18 42 Q21 34 22 30 Q16 30 12 32 Q18 27 25 25 Z"
          fill={color}
          opacity="0.95"
        />

        {/* Beak */}
        <polygon points="60,22 66,24 59,25" fill="#fbbf24" />

        {/* Eye */}
        <circle cx="54" cy="24" r="1.2" fill="#0f172a" />

        {/* Left Wing (Feathered Wingtip with flap animation) */}
        <g className="animate-bird-wing-left">
          <path
            d="M32 25 C26 12, 18 2, 4 0 C10 8, 16 16, 22 25 C20 22, 14 14, 8 8 C14 16, 20 22, 26 27 Z"
            fill={color}
            opacity="0.9"
          />
        </g>

        {/* Right Wing (Feathered Wingtip with flap animation) */}
        <g className="animate-bird-wing-right">
          <path
            d="M38 25 C42 12, 50 2, 64 0 C58 8, 52 16, 46 25 C48 22, 54 14, 60 8 C54 16, 48 22, 42 27 Z"
            fill={color}
            opacity="0.85"
          />
        </g>
      </svg>
    </div>
  );
}

// =========================================================================
// 2. COMPONENT: REALISTIC FLUFFY CUMULUS CLOUD WITH MULTI-LAYERED PUFFS
// =========================================================================
function FluffyCloud({
  className,
  driftClass = 'animate-cloud-drift-1',
  width = 280,
  opacity = 0.35,
  tint = '#d1fae5'
}: {
  className?: string;
  driftClass?: string;
  width?: number;
  opacity?: number;
  tint?: string;
}) {
  return (
    <div className={`absolute ${className} ${driftClass} pointer-events-none`}>
      <svg
        width={width}
        height={width * 0.48}
        viewBox="0 0 260 125"
        className="overflow-visible"
        style={{ opacity }}
      >
        <defs>
          <linearGradient id={`cloudGrad-${width}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor={tint} stopOpacity="0.75" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="0.15" />
          </linearGradient>
          <filter id={`cloudBlur-${width}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Organic Fluffy Puffs */}
        <g filter={`url(#cloudBlur-${width})`} fill={`url(#cloudGrad-${width})`}>
          <circle cx="65" cy="80" r="42" />
          <circle cx="110" cy="55" r="48" />
          <circle cx="160" cy="50" r="44" />
          <circle cx="205" cy="75" r="38" />
          <circle cx="140" cy="85" r="38" />
          <rect x="50" y="65" width="165" height="42" rx="20" />
        </g>
      </svg>
    </div>
  );
}

// =========================================================================
// 3. COMPONENT: STAR SPARKLES (✦ 4-POINT STARS)
// =========================================================================
function StarSparkle({ 
  className, 
  size = 18, 
  twinkleClass = 'animate-twinkle-1',
  color = '#ffffff'
}: { 
  className?: string; 
  size?: number; 
  twinkleClass?: string;
  color?: string;
}) {
  return (
    <div className={`absolute ${className} ${twinkleClass} pointer-events-none`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
      >
        <path
          d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
          fill={color}
        />
        <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
      </svg>
    </div>
  );
}

// =========================================================================
// 4. COMPONENT: AUTHENTIC BIOLUMINESCENT FIREFLY INSECT
// =========================================================================
function FireflyInsect({
  className,
  wanderClass = 'animate-firefly-1',
  size = 32
}: {
  className?: string;
  wanderClass?: string;
  size?: number;
}) {
  return (
    <div className={`absolute ${className} ${wanderClass} pointer-events-none`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        className="overflow-visible"
      >
        <path
          d="M20 18 Q10 8 4 14 Q10 22 20 19 Z"
          fill="rgba(167, 243, 208, 0.45)"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="0.6"
          className="animate-wing-left"
        />

        <path
          d="M20 18 Q30 8 36 14 Q30 22 20 19 Z"
          fill="rgba(167, 243, 208, 0.45)"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="0.6"
          className="animate-wing-right"
        />

        <path d="M18 10 Q14 4 10 6" stroke="#94a3b8" strokeWidth="0.8" fill="none" />
        <path d="M22 10 Q26 4 30 6" stroke="#94a3b8" strokeWidth="0.8" fill="none" />

        <circle cx="20" cy="11" r="2.2" fill="#0f172a" />
        <ellipse cx="20" cy="17" rx="3" ry="3.5" fill="#1e293b" />

        <ellipse
          cx="20"
          cy="24"
          rx="3.5"
          ry="5"
          fill="#4ade80"
          className="animate-lantern"
        />
        <ellipse cx="20" cy="24" rx="2" ry="3" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
}

export function DynamicDaytimeAmbience({ overridePeriod, onPeriodChange }: DynamicDaytimeAmbienceProps) {
  const [currentPeriod, setCurrentPeriod] = useState<DayPeriodType>('NIGHT');
  const [userSelectedPeriod, setUserSelectedPeriod] = useState<DayPeriodType | 'AUTO'>('AUTO');

  useEffect(() => {
    const calculatePeriod = (): DayPeriodType => {
      const h = new Date().getHours();
      if (h >= 5 && h < 12) return 'MORNING';
      if (h >= 12 && h < 18) return 'AFTERNOON';
      return 'NIGHT';
    };

    const active = userSelectedPeriod === 'AUTO' ? calculatePeriod() : userSelectedPeriod;
    setCurrentPeriod(active);
    onPeriodChange?.(active);

    const interval = setInterval(() => {
      if (userSelectedPeriod === 'AUTO') {
        const newPeriod = calculatePeriod();
        setCurrentPeriod(newPeriod);
        onPeriodChange?.(newPeriod);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userSelectedPeriod, onPeriodChange]);

  const activePeriod = overridePeriod || currentPeriod;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none transition-all duration-1000">
      
      {/* ========================================================================= */}
      {/* 1. MANHÃ (05:00 - 11:59): Sol Dourado com Raios, Nuvens e Pássaros Reais   */}
      {/* ========================================================================= */}
      {activePeriod === 'MORNING' && (
        <div className="absolute inset-0 animate-in fade-in duration-1000">
          
          {/* Golden Dawn Atmosphere Glow */}
          <div className="absolute top-16 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/35 via-yellow-500/20 to-transparent blur-3xl animate-sun-pulsate" />

          {/* Sun Disc with Corona and Rotating Light Rays */}
          <div className="absolute top-24 sm:top-28 right-12 sm:right-28 z-10">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              
              {/* Rotating Solar Flare Sunbeams */}
              <div className="absolute inset-0 animate-sun-rays flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 160 160" className="w-48 h-48 sm:w-56 sm:h-56 opacity-65">
                  <g stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
                    <line x1="80" y1="10" x2="80" y2="30" />
                    <line x1="80" y1="130" x2="80" y2="150" />
                    <line x1="10" y1="80" x2="30" y2="80" />
                    <line x1="130" y1="80" x2="150" y2="80" />
                    <line x1="30" y1="30" x2="45" y2="45" />
                    <line x1="115" y1="115" x2="130" y2="130" />
                    <line x1="30" y1="130" x2="45" y2="115" />
                    <line x1="115" y1="45" x2="130" y2="30" />
                  </g>
                </svg>
              </div>

              {/* Sun Core Disc */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-white shadow-[0_0_90px_rgba(251,191,36,0.95)] border-2 border-yellow-100/80 animate-sun-pulsate flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/40 blur-xs" />
              </div>

            </div>
          </div>

          {/* Fluffy Layered Clouds Drifting in Front of and Around the Sun */}
          <FluffyCloud className="top-20 right-4 sm:right-16 z-20" driftClass="animate-cloud-drift-1" width={320} opacity={0.42} tint="#fef08a" />
          <FluffyCloud className="top-36 right-36 sm:right-64 z-10" driftClass="animate-cloud-drift-2" width={260} opacity={0.35} tint="#a7f3d0" />
          <FluffyCloud className="top-16 left-8 sm:left-24 z-10" driftClass="animate-cloud-drift-3" width={340} opacity={0.32} tint="#ecfdf5" />
          <FluffyCloud className="top-44 left-1/3 z-10" driftClass="animate-cloud-drift-1" width={280} opacity={0.28} tint="#d1fae5" />

          {/* Flock of Realistic Birds with Articulated Flapping Wings Across the Morning Sky */}
          <RealisticFlyingBird flightClass="animate-bird-flight-1 top-28 left-0" scale={1.15} color="#34d399" />
          <RealisticFlyingBird flightClass="animate-bird-flight-2 top-40 left-0" scale={0.9} color="#10b981" />
          <RealisticFlyingBird flightClass="animate-bird-flight-3 top-20 left-0" scale={0.75} color="#6ee7b7" />
          <RealisticFlyingBird flightClass="animate-bird-flight-1 top-48 left-0" scale={0.8} color="#059669" />

          {/* Morning Golden Emerald Aurora Glow */}
          <div className="absolute -top-32 left-1/4 w-[850px] h-[650px] bg-gradient-to-br from-amber-500/22 via-emerald-600/18 to-transparent rounded-full blur-[130px] animate-nature-aurora pointer-events-none" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TARDE (12:00 - 17:59): Sol Solar da Tarde com Nuvens Tropicais & Pássaros */}
      {/* ========================================================================= */}
      {activePeriod === 'AFTERNOON' && (
        <div className="absolute inset-0 animate-in fade-in duration-1000">
          
          {/* Intense Solar Corona in Top Right */}
          <div className="absolute top-16 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-400/35 via-teal-300/25 to-transparent blur-3xl animate-sun-pulsate" />

          {/* Afternoon Sun Sphere */}
          <div className="absolute top-24 sm:top-28 right-1/4 z-10">
            <div className="relative w-30 h-30 sm:w-34 sm:h-34 flex items-center justify-center">
              
              {/* Rotating Solar Corona */}
              <div className="absolute inset-0 animate-sun-rays flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 160 160" className="w-48 h-48 opacity-60">
                  <g stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" opacity="0.65">
                    <line x1="80" y1="8" x2="80" y2="28" />
                    <line x1="80" y1="132" x2="80" y2="152" />
                    <line x1="8" y1="80" x2="28" y2="80" />
                    <line x1="132" y1="80" x2="152" y2="80" />
                  </g>
                </svg>
              </div>

              {/* Core Sun */}
              <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-gradient-to-tr from-yellow-300 via-emerald-300 to-white shadow-[0_0_95px_rgba(52,211,153,0.95)] border-2 border-emerald-200/60 animate-sun-pulsate" />
            </div>
          </div>

          {/* Fluffy Clouds Across Afternoon Sky */}
          <FluffyCloud className="top-24 right-12 sm:right-28 z-20" driftClass="animate-cloud-drift-1" width={340} opacity={0.4} tint="#d1fae5" />
          <FluffyCloud className="top-40 right-1/3 z-10" driftClass="animate-cloud-drift-2" width={290} opacity={0.32} tint="#ccfbf1" />
          <FluffyCloud className="top-16 left-12 z-10" driftClass="animate-cloud-drift-3" width={360} opacity={0.35} tint="#e6fffa" />

          {/* High Soaring Birds in Afternoon Sky */}
          <RealisticFlyingBird flightClass="animate-bird-flight-1 top-32 left-0" scale={1.1} color="#10b981" />
          <RealisticFlyingBird flightClass="animate-bird-flight-2 top-44 left-0" scale={0.85} color="#34d399" />
          <RealisticFlyingBird flightClass="animate-bird-flight-3 top-24 left-0" scale={0.7} color="#059669" />

          {/* Vibrant Emerald & Teal Canopy Glow */}
          <div className="absolute -top-32 left-1/4 w-[900px] h-[700px] bg-gradient-to-br from-[#00c853]/25 via-teal-600/18 to-transparent rounded-full blur-[120px] animate-nature-aurora pointer-events-none" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. NOITE (18:00 - 04:59): Lua Mais Abaixo, Estrelas ✦, Estrelas Cadentes & Vagalumes */}
      {/* ========================================================================= */}
      {activePeriod === 'NIGHT' && (
        <div className="absolute inset-0 animate-in fade-in duration-1000">
          
          {/* Luminous Moon Positioned Lower in Hero Viewport */}
          <div className="absolute top-32 sm:top-40 right-8 sm:right-24 z-10 animate-moon-glow">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Moon Glow Halo */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-2xl animate-pulse" />
              
              {/* Realistic Detailed Crescent Moon SVG with craters and soft silver glow */}
              <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-[0_0_35px_rgba(52,211,153,0.95)]">
                <path
                  d="M65,12 A42,42 0 1,0 88,80 A46,46 0 1,1 65,12 Z"
                  fill="url(#moonGradient)"
                  stroke="#a7f3d0"
                  strokeWidth="1.5"
                />
                <circle cx="45" cy="45" r="4.5" fill="#a7f3d0" opacity="0.3" />
                <circle cx="38" cy="62" r="3.5" fill="#a7f3d0" opacity="0.25" />
                <circle cx="56" cy="30" r="3" fill="#a7f3d0" opacity="0.25" />
                <circle cx="48" cy="74" r="2.5" fill="#a7f3d0" opacity="0.2" />

                <defs>
                  <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ecfdf5" />
                    <stop offset="70%" stopColor="#d1fae5" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Periodic Shooting Stars */}
          <div className="absolute top-28 left-[18%] w-56 h-[3px] bg-gradient-to-r from-transparent via-emerald-300 via-white to-transparent rotate-[-35deg] animate-shooting-star-1 pointer-events-none opacity-0 drop-shadow-[0_0_10px_#a7f3d0]" />
          <div className="absolute top-48 right-[28%] w-64 h-[3px] bg-gradient-to-r from-transparent via-teal-200 via-white to-transparent rotate-[-38deg] animate-shooting-star-2 pointer-events-none opacity-0 drop-shadow-[0_0_12px_#5eead4]" />

          {/* Genuine 4-Point Star Sparkles */}
          <StarSparkle className="top-24 left-[8%]" size={22} twinkleClass="animate-twinkle-1" color="#ffffff" />
          <StarSparkle className="top-36 left-[22%]" size={16} twinkleClass="animate-twinkle-2" color="#a7f3d0" />
          <StarSparkle className="top-28 left-[42%]" size={26} twinkleClass="animate-twinkle-3" color="#ffffff" />
          <StarSparkle className="top-44 left-[58%]" size={18} twinkleClass="animate-twinkle-1" color="#6ee7b7" />
          <StarSparkle className="top-20 right-[40%]" size={24} twinkleClass="animate-twinkle-2" color="#ffffff" />
          <StarSparkle className="top-48 right-[14%]" size={16} twinkleClass="animate-twinkle-3" color="#a7f3d0" />
          <StarSparkle className="top-64 left-[14%]" size={20} twinkleClass="animate-twinkle-2" color="#ffffff" />
          <StarSparkle className="top-72 right-[36%]" size={28} twinkleClass="animate-twinkle-1" color="#6ee7b7" />
          <StarSparkle className="top-80 left-[32%]" size={16} twinkleClass="animate-twinkle-3" color="#a7f3d0" />
          <StarSparkle className="top-60 right-[8%]" size={18} twinkleClass="animate-twinkle-2" color="#ffffff" />
          <StarSparkle className="top-96 left-[48%]" size={22} twinkleClass="animate-twinkle-1" color="#ffffff" />

          {/* Authentic Fireflies with Bodies, Flapping Wings & Glowing Lanterns */}
          <FireflyInsect className="top-1/4 left-[12%]" wanderClass="animate-firefly-1" size={34} />
          <FireflyInsect className="top-1/3 right-[18%]" wanderClass="animate-firefly-2" size={30} />
          <FireflyInsect className="top-2/3 left-[20%]" wanderClass="animate-firefly-3" size={36} />
          <FireflyInsect className="bottom-1/3 right-[28%]" wanderClass="animate-firefly-1" size={32} />
          <FireflyInsect className="top-1/2 left-[35%]" wanderClass="animate-firefly-2" size={28} />

          {/* Bioluminescent Midnight Aurora Glow */}
          <div className="absolute -top-32 left-1/4 w-[850px] h-[650px] bg-gradient-to-br from-indigo-950/40 via-emerald-900/20 to-transparent rounded-full blur-[140px] animate-nature-aurora pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-[750px] h-[750px] bg-gradient-to-bl from-teal-950/35 via-[#00c853]/10 to-transparent rounded-full blur-[150px] animate-nature-aurora animate-plant-delay-1 pointer-events-none" />
        </div>
      )}

      {/* Botanical Foliage Overlays (Consistent Across All Periods) */}
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

      {/* Subtle Botanical Branch (Top Left) */}
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
