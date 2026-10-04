'use client';

import React, { useState } from 'react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({
  phoneNumber = '555182251103',
  defaultMessage = 'Olá! Gostaria de saber mais sobre a plataforma BIRDPRO e tirar algumas dúvidas.'
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center group">
      {/* Floating Tooltip Pill */}
      <div 
        className={`mr-3 px-3.5 py-2 bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs font-bold rounded-2xl shadow-xl border border-emerald-500/40 backdrop-blur-md transition-all duration-300 pointer-events-none hidden sm:flex items-center gap-2 ${
          isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-3 scale-95'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
        <span>Fale no WhatsApp • Atendimento Rápido</span>
      </div>

      {/* Floating WhatsApp Action Button with Ripple/Ping Pulse */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Falar no WhatsApp com o BIRDPRO"
        className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl shadow-[#25D366]/50 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Animated Pulse Waves */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#25D366] to-emerald-400 opacity-30 blur-sm group-hover:opacity-75 transition-opacity pointer-events-none" />

        {/* Official WhatsApp Logo SVG (Vector Handset & Speech Bubble) */}
        <div className="relative z-10 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 sm:w-7 sm:h-7 fill-white drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>

        {/* Online Status Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-300 rounded-full border-2 border-slate-950 flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-emerald-800 rounded-full" />
        </span>
      </a>
    </div>
  );
}
