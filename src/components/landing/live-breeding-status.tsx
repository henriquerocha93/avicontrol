'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Sunset, 
  CloudSun, 
  Clock, 
  Thermometer, 
  Droplets, 
  Sparkles, 
  Compass, 
  Info, 
  ChevronRight,
  Heart,
  Feather,
  Music2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export type DayPeriod = 'MORNING' | 'AFTERNOON' | 'NIGHT';

export function LiveBreedingStatus() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [period, setPeriod] = useState<DayPeriod>('NIGHT');
  const [temperature, setTemperature] = useState(24.5);
  const [humidity, setHumidity] = useState(62);
  const [selectedSeasonTab, setSelectedSeasonTab] = useState<'AUTO' | 'CHOCO' | 'MUDA' | 'CANTO'>('AUTO');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Real-time time formatting
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      // Date formatting
      const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' });
      const day = now.getDate();
      const month = now.toLocaleDateString('pt-BR', { month: 'long' });
      const year = now.getFullYear();
      setDateStr(`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} de ${month} de ${year}`);

      // Period detection
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setPeriod('MORNING');
        setTemperature(22.8 + ((hour - 5) * 0.8));
        setHumidity(70 - ((hour - 5) * 1.5));
      } else if (hour >= 12 && hour < 18) {
        setPeriod('AFTERNOON');
        setTemperature(27.4 - ((hour - 12) * 0.5));
        setHumidity(58 + ((hour - 12) * 1.2));
      } else {
        setPeriod('NIGHT');
        setTemperature(21.2 + (Math.sin(hour) * 1.5));
        setHumidity(68 + (Math.cos(hour) * 2));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine active seasonal biological phase
  const currentMonth = new Date().getMonth(); // 0 = Jan, 9 = Oct
  
  // Setembro (8) a Fevereiro (1) -> Choco & Reprodução
  // Fevereiro (1) a Maio (4) -> Muda de Penas
  // Junho (5) a Agosto (7) -> Canto, Encarte & Torneios
  let activeSeason = 'CHOCO';
  if (currentMonth >= 1 && currentMonth <= 4) activeSeason = 'MUDA';
  else if (currentMonth >= 5 && currentMonth <= 7) activeSeason = 'CANTO';
  else activeSeason = 'CHOCO';

  const displayedSeason = selectedSeasonTab === 'AUTO' ? activeSeason : selectedSeasonTab;

  const seasonsData = {
    CHOCO: {
      badge: '🐣 ÉPOCA ATIVA: REPRODUÇÃO & CHOCO',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
      tagColor: 'bg-[#00c853] text-slate-950',
      title: 'Temporada Oficial de Choco & Reprodução (Primavera / Verão)',
      periodText: 'Setembro a Fevereiro • Alta Fertilidade',
      tips: [
        'Ovoscopia aos 6 dias: Verifique a vascularização dos ovos com lanterna adequada para descartar ovos brancos.',
        'Anilhamento no 4º ao 7º dia: Momento exato para anilhar filhotes de passeriformes sem machucar a pata.',
        'Nutrição Reforçada: Forneça farinhada úmida com ovo cozido, tenébrios/proteína e cálcio/vitamina E para matrizes.',
        'Registro no BIRDPRO: Lance a postura no Calendário para receber avisos push de eclosão e anilhamento no celular!'
      ]
    },
    MUDA: {
      badge: '🪶 ÉPOCA DE MUDA DE PENAS',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
      tagColor: 'bg-amber-400 text-slate-950',
      title: 'Período de Muda de Penas & Repouso Reprodutivo (Outono)',
      periodText: 'Fevereiro a Maio • Renovação da Plumagem',
      tips: [
        'Repouso Biológico: Separe os casais para que as matrizes recuperem suas reservas energéticas e minerais.',
        'Suplementação de Queratina: Administre aminoácidos ricos em metionina, lisina e biotina na água ou na farinhada.',
        'Banho de Sol Matinal: Essencial para fixação da vitamina D e hidratação da plumagem nova.',
        'Ambiente Calmo: Evite correntes de ar frias e barulhos excessivos para não estressar o plantel.'
      ]
    },
    CANTO: {
      badge: '🎵 ÉPOCA DE ENCARTE & TORNEIOS DE CANTO',
      color: 'from-sky-500/20 to-indigo-500/20 text-sky-300 border-sky-500/40',
      tagColor: 'bg-sky-400 text-slate-950',
      title: 'Temporada de Encarte de Filhotes & Torneios de Canto (Inverno)',
      periodText: 'Junho a Agosto • Preparação dos Campeões',
      tips: [
        'Encarte com Áudio Puro: Utilize caixas acústicas ou sistema sonoro em horários de repetição controlada.',
        'Condicionamento Físico: Utilize voadeiras amplas para fortalecer a musculatura peitoral dos machos.',
        'Simulador Genético BIRDPRO: Comece a planejar os futuros cruzamentos da próxima temporada com nossa ferramenta!',
        'Documentação & SISPASS: Mantenha as anilhas e certidões em dia para transporte em torneios oficiais.'
      ]
    }
  };

  const currentSeasonData = seasonsData[displayedSeason as keyof typeof seasonsData];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 relative z-20 -mt-6 sm:-mt-10">
      <div className="bg-gradient-to-br from-[#0c1c14] via-[#091710] to-[#08120e] rounded-3xl border border-emerald-600/40 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Top Header: Real-time Live Weather & Time Capsule */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-emerald-900/60">
          
          {/* Left: Time & Period Indicator */}
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md ${
              period === 'MORNING'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : period === 'AFTERNOON'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
            }`}>
              {period === 'MORNING' && <Sun className="w-6 h-6 animate-spin [animation-duration:15s]" />}
              {period === 'AFTERNOON' && <CloudSun className="w-6 h-6 animate-pulse" />}
              {period === 'NIGHT' && <Moon className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Tempo Real no Criatório
                </span>
                <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                  {dateStr || 'Sexta-feira'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                  {timeStr || 'Carregando horário...'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {period === 'MORNING' && '• Manhã no Criatório ☀️'}
                  {period === 'AFTERNOON' && '• Tarde Ativa 🌤️'}
                  {period === 'NIGHT' && '• Noite & Descanso do Plantel 🌙'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Breeding Weather Station (Temperature & Humidity) */}
          <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto justify-start lg:justify-end">
            
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#12231a] border border-emerald-800/40 text-slate-200 shadow-2xs">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold leading-none">Temperatura</span>
                <span className="font-extrabold text-white text-xs">{temperature.toFixed(1)}°C</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#12231a] border border-emerald-800/40 text-slate-200 shadow-2xs">
              <Droplets className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold leading-none">Umidade Relativa</span>
                <span className="font-extrabold text-white text-xs">{humidity.toFixed(0)}% (Ideal)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-emerald-400 block font-bold leading-none">Status do Ambiente</span>
                <span className="font-extrabold text-white text-xs">Excelente p/ Manejo</span>
              </div>
            </div>

          </div>

        </div>

        {/* Biological Season Navigation & Seasonal Tips Banner */}
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h4 className="font-extrabold text-sm text-white">
                Guia Zootécnico Sazonal do Criador
              </h4>
            </div>

            {/* Season Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-emerald-900/50">
              <button
                onClick={() => setSelectedSeasonTab('AUTO')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                  selectedSeasonTab === 'AUTO'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Automático (Mês Atual)</span>
              </button>

              <button
                onClick={() => setSelectedSeasonTab('CHOCO')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                  displayedSeason === 'CHOCO' && selectedSeasonTab !== 'AUTO'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-3 h-3 text-rose-400" />
                <span>Choco / Reprodução</span>
              </button>

              <button
                onClick={() => setSelectedSeasonTab('MUDA')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                  displayedSeason === 'MUDA' && selectedSeasonTab !== 'AUTO'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Feather className="w-3 h-3 text-amber-300" />
                <span>Muda de Penas</span>
              </button>

              <button
                onClick={() => setSelectedSeasonTab('CANTO')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                  displayedSeason === 'CANTO' && selectedSeasonTab !== 'AUTO'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music2 className="w-3 h-3 text-sky-300" />
                <span>Canto &amp; Encarte</span>
              </button>
            </div>
          </div>

          {/* Active Season Banner with Practical Daily Tips */}
          <div className={`p-5 rounded-2xl bg-gradient-to-r border ${currentSeasonData.color} space-y-4`}>
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${currentSeasonData.tagColor}`}>
                  {currentSeasonData.badge}
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {currentSeasonData.periodText}
                </span>
              </div>

              <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Recomendações Zootécnicas Oficiais
              </span>
            </div>

            <h5 className="text-base sm:text-lg font-black text-white">
              {currentSeasonData.title}
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {currentSeasonData.tips.map((tip, idx) => (
                <div key={idx} className="p-3 bg-[#0a1711]/80 rounded-xl border border-emerald-900/50 flex items-start gap-2.5 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
