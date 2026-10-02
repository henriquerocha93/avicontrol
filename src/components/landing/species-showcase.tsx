'use client';

import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Heart, 
  Activity, 
  ChevronRight, 
  QrCode, 
  CheckCircle2,
  TrendingUp,
  Music,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SpecieItem {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  ringSize: string;
  songType: string;
  badge: string;
  badgeColor: string;
  photoUrl: string;
  accentColor: string;
  accentBg: string;
  borderGlow: string;
  description: string;
  stats: {
    fibra: number;
    velocidade: number;
    purezaGenetica: number;
  };
}

const SPECIES_DATA: SpecieItem[] = [
  {
    id: 'canario-terra',
    name: 'Canário da Terra',
    scientificName: 'Sicalis flaveola',
    category: 'Passeriformes • Fringillidae',
    ringSize: 'Anilha 2.8mm FOB / SISPASS',
    songType: 'Canto Metralha & Fibra Contínua',
    badge: 'Ouro & Timbre Puro',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    photoUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=900&auto=format&fit=crop&q=85',
    accentColor: '#F59E0B',
    accentBg: 'from-amber-950/40 via-amber-900/20 to-transparent',
    borderGlow: 'hover:border-amber-400/60 shadow-amber-950/40',
    description: 'Espécie nobre de alta valorização no Brasil. Controle completo de linhagens de canto clássico, mutações amarelo ouro, genealogia tripla e pareamentos com alta taxa de eclosão.',
    stats: {
      fibra: 98,
      velocidade: 94,
      purezaGenetica: 99
    }
  },
  {
    id: 'coleiro',
    name: 'Coleiro & Papa-Capim',
    scientificName: 'Sporophila caerulescens',
    category: 'Passeriformes • Thraupidae',
    ringSize: 'Anilha 2.2mm SISPASS / IBAMA',
    songType: 'Canto Tui-Tui Zero & Velocidade',
    badge: 'Linhagem de Torneio',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    photoUrl: 'https://images.unsplash.com/photo-1549608276-5786777e6587?w=900&auto=format&fit=crop&q=85',
    accentColor: '#00c853',
    accentBg: 'from-emerald-950/40 via-emerald-900/20 to-transparent',
    borderGlow: 'hover:border-emerald-400/60 shadow-emerald-950/40',
    description: 'A paixão nacional dos torneios de fibra. Gestão precisa de cronogramas de fêmeas, voador, pré-torneio, anotações de cantadas por minuto e pedigree rastreável.',
    stats: {
      fibra: 99,
      velocidade: 97,
      purezaGenetica: 96
    }
  },
  {
    id: 'trinca-ferro',
    name: 'Trinca-Ferro',
    scientificName: 'Saltator similis',
    category: 'Passeriformes • Thraupidae',
    ringSize: 'Anilha 3.5mm SISPASS / IBAMA',
    songType: 'Bom-Dia-Seu-Chico & Currucutil com Boi',
    badge: 'Fibra Pesada & Prestígio',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    photoUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=900&auto=format&fit=crop&q=85',
    accentColor: '#14b8a6',
    accentBg: 'from-teal-950/40 via-teal-900/20 to-transparent',
    borderGlow: 'hover:border-teal-400/60 shadow-teal-950/40',
    description: 'Porte imponente e potência vocal inigualável. Sistema com prontuário veterinário completo, manejo sanitário para muda de bico e emissão de pedigree homologado.',
    stats: {
      fibra: 100,
      velocidade: 92,
      purezaGenetica: 98
    }
  },
  {
    id: 'azulao',
    name: 'Azulão Verdadeiro',
    scientificName: 'Cyanoloxia brissonii',
    category: 'Passeriformes • Cardinalidae',
    ringSize: 'Anilha 2.8mm SISPASS / IBAMA',
    songType: 'Canto Flautado Paraná & Alvorada',
    badge: 'Azul Safira Imperial',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    photoUrl: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?w=900&auto=format&fit=crop&q=85',
    accentColor: '#38bdf8',
    accentBg: 'from-sky-950/40 via-sky-900/20 to-transparent',
    borderGlow: 'hover:border-sky-400/60 shadow-sky-950/40',
    description: 'Plumagem azul metálica exuberante e canto melódico fascinante. Mapeamento de matrizes férteis, laudos de sexagem DNA e controle de ninhadas com fotos em alta definição.',
    stats: {
      fibra: 96,
      velocidade: 91,
      purezaGenetica: 100
    }
  }
];

export function SpeciesShowcase() {
  const [selectedSpecie, setSelectedSpecie] = useState<SpecieItem>(SPECIES_DATA[0]);

  return (
    <div className="space-y-10">
      {/* Species Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {SPECIES_DATA.map((sp) => {
          const isSelected = selectedSpecie.id === sp.id;
          return (
            <button
              key={sp.id}
              onClick={() => setSelectedSpecie(sp)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3.5 relative overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/60 border-[#00c853] shadow-lg shadow-emerald-950/60 ring-1 ring-[#00c853]/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              {/* Mini Thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sp.photoUrl}
                  alt={sp.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {sp.name}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400/90 italic block truncate">
                  {sp.scientificName}
                </span>
              </div>

              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-[#00c853] shadow-[0_0_8px_#00c853] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Specie Hero Showcase Glass Card */}
      <div className="rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-[#0c1813] via-[#091510] to-[#060c09] p-6 sm:p-10 shadow-2xl overflow-hidden relative">
        {/* Background Ambient Glow */}
        <div 
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: selectedSpecie.accentColor }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Specie Photo Preview with Ring Badge & Glass Badge */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl aspect-4/3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedSpecie.photoUrl}
                alt={selectedSpecie.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Floating Top Badge */}
              <div className="absolute top-3 left-3">
                <span className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-md backdrop-blur-md ${selectedSpecie.badgeColor}`}>
                  ★ {selectedSpecie.badge}
                </span>
              </div>

              {/* Floating Bottom Info */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedSpecie.ringSize}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold bg-amber-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-amber-600/40">
                  <Sparkles className="w-3 h-3" />
                  <span>Matriz Top 1%</span>
                </div>
              </div>
            </div>

            {/* Audio & Song Wave Simulation Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block">Dialeto &amp; Canto</span>
                  <span className="text-[10px] text-slate-400">{selectedSpecie.songType}</span>
                </div>
              </div>

              {/* Animated audio bars */}
              <div className="flex items-end gap-1 h-5 px-2">
                <span className="w-1 bg-[#00c853] rounded-full h-3 animate-pulse" />
                <span className="w-1 bg-emerald-400 rounded-full h-5 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 bg-teal-400 rounded-full h-2 animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="w-1 bg-emerald-300 rounded-full h-4 animate-pulse" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-[#00c853] rounded-full h-5 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>

          {/* Specie Info & Pedigree Metrics */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
                <span>{selectedSpecie.category}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {selectedSpecie.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 italic mt-0.5">
                {selectedSpecie.scientificName}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedSpecie.description}
            </p>

            {/* Zootecnic Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Índice de Fibra</span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">{selectedSpecie.stats.fibra}%</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedSpecie.stats.fibra}%` }} />
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Velocidade &amp; Repetição</span>
                <p className="text-lg font-black text-teal-400 mt-0.5">{selectedSpecie.stats.velocidade}%</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${selectedSpecie.stats.velocidade}%` }} />
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Rastreio Genealógico</span>
                <p className="text-lg font-black text-amber-400 mt-0.5">{selectedSpecie.stats.purezaGenetica}%</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedSpecie.stats.purezaGenetica}%` }} />
                </div>
              </div>
            </div>

            {/* Automated Software Capabilities for This Specie */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                <span>Pedigree A4 Oficial com QR Code</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                <span>Controle de Ninhos &amp; Eclosão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                <span>Compatível SISPASS / FOB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
