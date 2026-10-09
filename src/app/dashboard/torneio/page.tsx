'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Share2, 
  Trash2, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Bird as BirdIcon, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Flame, 
  ArrowRight, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Sliders, 
  Calendar, 
  MapPin, 
  FileText,
  Search,
  Filter,
  Eye,
  Info
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { 
  Bird, 
  TournamentSession, 
  TournamentMode, 
  TournamentSessionType, 
  MinuteCount, 
  MexidaEvaluation 
} from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

// --- SISTEMA DE ÁUDIO WEB SYNTHESIZER (100% OFFLINE, ZERO LATÊNCIA) ---
class SoundEffects {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Som suave de clique seco ao marcar o canto
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime); // Lá 880Hz
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  // Som de aviso de virada de minuto
  playMinuteTick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, this.ctx.currentTime); // Dó6
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  // Fanfarra suave de finalização de sessão (10 ou 15 min)
  playFinish() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // Dó, Mi, Sol, Dó
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {}
  }
}

const sfx = new SoundEffects();

export default function TorneioPage() {
  const { tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'MARKER' | 'HISTORY'>('MARKER');

  // Dados do criatório
  const [birds, setBirds] = useState<Bird[]>([]);
  const [sessions, setSessions] = useState<TournamentSession[]>([]);

  // Configuração da Sessão
  const [selectedBirdId, setSelectedBirdId] = useState<string>('');
  const [customBirdName, setCustomBirdName] = useState<string>('');
  const [sessionType, setSessionType] = useState<TournamentSessionType>('RODA');
  const [targetMode, setTargetMode] = useState<TournamentMode>('10_MIN');
  const [locationName, setLocationName] = useState<string>('');

  // Preferências do Usuário (som & vibração para a roda ao vivo)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);

  // Estado da Sessão Ao Vivo
  const [sessionState, setSessionState] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED'>('IDLE');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalSongs, setTotalSongs] = useState<number>(0);
  // Array de cantos por minuto (índice 0 = 1º minuto, etc.)
  const [minuteSongs, setMinuteSongs] = useState<number[]>([]);
  // Histórico de timestamps de toques para permitir desfazer (-1 canto)
  const [tapsLog, setTapsLog] = useState<{ second: number; minuteIdx: number }[]>([]);

  // Animação visual no botão touch
  const [touchPulse, setTouchPulse] = useState(false);

  // Sessão Finalizada Ativa (para exibir na tela de relatório igual às fotos)
  const [completedSession, setCompletedSession] = useState<TournamentSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [sessionPlacement, setSessionPlacement] = useState<string>('');
  const [sessionTrophy, setSessionTrophy] = useState<boolean>(false);
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Filtros da Aba Histórico
  const [historyBirdFilter, setHistoryBirdFilter] = useState<string>('ALL');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('ALL');
  const [inspectModalSession, setInspectModalSession] = useState<TournamentSession | null>(null);

  // Carrega dados iniciais do banco local
  const loadData = useCallback(() => {
    const tid = tenant?.id || 'tenant-demo-01';
    setBirds(db.getBirds(tid));
    setSessions(db.getTournaments(tid));
  }, [tenant?.id]);

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const bId = params.get('birdId');
      if (bId) {
        setSelectedBirdId(bId);
      }
    }
    const handleDbUpdate = () => loadData();
    window.addEventListener('birdpro_db_updated', handleDbUpdate);
    return () => window.removeEventListener('birdpro_db_updated', handleDbUpdate);
  }, [loadData]);

  // Ave selecionada objeto completo
  const activeBird = useMemo(() => {
    if (!selectedBirdId) return null;
    return birds.find(b => b.id === selectedBirdId) || null;
  }, [selectedBirdId, birds]);

  const birdDisplayName = useMemo(() => {
    if (activeBird) return activeBird.name;
    return customBirdName.trim() || 'Ave em Marcação';
  }, [activeBird, customBirdName]);

  // Limite em segundos da modalidade
  const maxSessionSeconds = targetMode === '10_MIN' ? 600 : 900;

  // Wake Lock: Impede que a tela do celular apague/bloqueie durante a roda ao vivo
  const wakeLockRef = useRef<any>(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      if (sessionState === 'RUNNING' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch {}
      } else if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch {}
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [sessionState]);

  // Cronômetro de precisão alta
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    if (sessionState === 'RUNNING') {
      lastTickRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prevSec => {
          const nextSec = prevSec + 1;

          // Virada de minuto: emite som se estiver no início de um novo minuto
          if (nextSec > 0 && nextSec % 60 === 0 && soundEnabled && nextSec < maxSessionSeconds) {
            sfx.playMinuteTick();
          }

          // Chegou ao tempo final estipulado (10 min ou 15 min)
          if (nextSec >= maxSessionSeconds) {
            if (soundEnabled) sfx.playFinish();
            if (vibrateEnabled && 'vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
            handleFinalizeSession(nextSec);
            return maxSessionSeconds;
          }

          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState, maxSessionSeconds, soundEnabled, vibrateEnabled]);

  // Minuto atual decorrido (1º minuto, 2º minuto...)
  const currentMinuteIndex = Math.min(
    Math.floor(elapsedSeconds / 60),
    (targetMode === '10_MIN' ? 10 : 15) - 1
  );

  // Cantos no minuto atual
  const currentMinuteCount = minuteSongs[currentMinuteIndex] || 0;

  // Função central: TOQUE PARA CONTAR CANTO
  const handleCountSong = () => {
    if (sessionState !== 'RUNNING') return;

    // Feedback sonoro e tátil instantâneo
    if (soundEnabled) sfx.playClick();
    if (vibrateEnabled && 'vibrate' in navigator) navigator.vibrate(35);

    // Efeito visual
    setTouchPulse(true);
    setTimeout(() => setTouchPulse(false), 120);

    const minIdx = currentMinuteIndex;

    setTotalSongs(prev => prev + 1);
    setMinuteSongs(prev => {
      const copy = [...prev];
      while (copy.length <= minIdx) copy.push(0);
      copy[minIdx] = (copy[minIdx] || 0) + 1;
      return copy;
    });

    setTapsLog(prev => [...prev, { second: elapsedSeconds, minuteIdx: minIdx }]);
  };

  // Função para Desfazer Último Canto (-1)
  const handleUndoSong = () => {
    if (sessionState !== 'RUNNING' || tapsLog.length === 0 || totalSongs <= 0) return;

    const lastTap = tapsLog[tapsLog.length - 1];
    setTapsLog(prev => prev.slice(0, -1));
    setTotalSongs(prev => Math.max(0, prev - 1));

    setMinuteSongs(prev => {
      const copy = [...prev];
      if (copy[lastTap.minuteIdx] !== undefined && copy[lastTap.minuteIdx] > 0) {
        copy[lastTap.minuteIdx] -= 1;
      }
      return copy;
    });

    if (vibrateEnabled && 'vibrate' in navigator) navigator.vibrate(20);
  };

  // Iniciar Nova Sessão
  const handleStartSession = () => {
    setElapsedSeconds(0);
    setTotalSongs(0);
    setMinuteSongs([0]);
    setTapsLog([]);
    setCompletedSession(null);
    setSessionNotes('');
    setSessionPlacement('');
    setSessionTrophy(false);
    setSessionState('RUNNING');
    if (soundEnabled) sfx.playClick();
  };

  // Pausar / Retomar
  const handleTogglePause = () => {
    if (sessionState === 'RUNNING') {
      setSessionState('PAUSED');
    } else if (sessionState === 'PAUSED') {
      setSessionState('RUNNING');
    }
  };

  // Avaliação Inteligente da Mexida (Diagnóstico Técnico)
  const calculateMexidaEvaluation = (
    total: number,
    minuteCounts: MinuteCount[],
    mode: TournamentMode
  ): MexidaEvaluation => {
    const totalMinutes = minuteCounts.length || 1;
    if (totalMinutes < 3) {
      return {
        status: 'REGULAR',
        title: 'Sessão em andamento',
        description: 'Dados preliminares insuficientes para calcular consistência de mexida.'
      };
    }

    const half = Math.floor(totalMinutes / 2);
    const firstHalfSongs = minuteCounts.slice(0, half).reduce((acc, m) => acc + m.count, 0);
    const secondHalfSongs = minuteCounts.slice(half).reduce((acc, m) => acc + m.count, 0);

    const firstHalfAvg = firstHalfSongs / Math.max(1, half);
    const secondHalfAvg = secondHalfSongs / Math.max(1, totalMinutes - half);

    // Se manteve ou aumentou no final
    if (secondHalfAvg >= firstHalfAvg * 0.95) {
      return {
        status: 'VALIDATED',
        title: 'Mexida validada!',
        description: mode === '15_MIN'
          ? 'Cantada de 15 min maior que 10 min — manejo no caminho certo.'
          : 'Cantada consistente da metade pro final — ave com ótima estabilidade na roda.'
      };
    } else if (secondHalfAvg < firstHalfAvg * 0.70) {
      return {
        status: 'ATTENTION',
        title: 'Queda de rendimento na reta final',
        description: 'A ave perdeu ritmo nos últimos minutos. Mexida pode estar sobrecarregada ou faltou descanso.'
      };
    } else {
      return {
        status: 'REGULAR',
        title: 'Manejo estável',
        description: 'Ave manteve cantadas regulares, com leve oscilação natural de final de roda.'
      };
    }
  };

  // Finalizar e gerar Relatório Exato dos Prints
  const handleFinalizeSession = (finalSecs?: number) => {
    const actualSeconds = finalSecs !== undefined ? finalSecs : elapsedSeconds;
    setSessionState('FINISHED');

    const totalMinutesRecorded = Math.max(1, Math.ceil(actualSeconds / 60));
    
    // Normaliza array de minutos
    const minuteCountsList: MinuteCount[] = [];
    let runningTotal = 0;

    for (let m = 0; m < totalMinutesRecorded; m++) {
      const c = minuteSongs[m] || 0;
      runningTotal += c;
      const paceSoFar = Number((runningTotal / (m + 1)).toFixed(1));
      minuteCountsList.push({
        minute: m + 1,
        count: c,
        pace: paceSoFar
      });
    }

    // Identifica Melhor e Pior Minuto
    let best = { minute: 1, count: minuteCountsList[0]?.count || 0 };
    let worst = { minute: 1, count: minuteCountsList[0]?.count || 0 };

    minuteCountsList.forEach(m => {
      if (m.count > best.count) {
        best = { minute: m.minute, count: m.count };
      }
      if (m.count < worst.count) {
        worst = { minute: m.minute, count: m.count };
      }
    });

    const averagePerMinute = actualSeconds > 0 
      ? Number(((totalSongs / actualSeconds) * 60).toFixed(1)) 
      : 0;

    // Projeções 10 min e 15 min
    let proj10 = totalSongs;
    let proj15 = totalSongs;

    if (actualSeconds <= 600) {
      proj10 = actualSeconds >= 600 ? totalSongs : Math.round((totalSongs / actualSeconds) * 600);
      proj15 = Math.round(proj10 * 1.5);
    } else {
      proj10 = Math.round((totalSongs / actualSeconds) * 600);
      proj15 = actualSeconds >= 900 ? totalSongs : Math.round((totalSongs / actualSeconds) * 900);
    }

    const evaluation = calculateMexidaEvaluation(totalSongs, minuteCountsList, targetMode);

    const sessionObj: TournamentSession = {
      id: `tourn-${Date.now()}`,
      tenantId: tenant?.id || 'tenant-demo-01',
      birdId: activeBird?.id || undefined,
      birdName: birdDisplayName,
      birdRing: activeBird?.ringNumber || undefined,
      birdSpecies: activeBird?.species || undefined,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: sessionType,
      mode: targetMode,
      totalSeconds: actualSeconds,
      totalSongs,
      songsPerMinute: averagePerMinute,
      bestMinute: best,
      worstMinute: worst,
      minuteCounts: minuteCountsList,
      projection10Min: proj10,
      projection15Min: proj15,
      mexidaEvaluation: evaluation,
      notes: '',
      location: locationName.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    setCompletedSession(sessionObj);
  };

  // Botão crucial: Se estava em 10 min e quer continuar para os 15 min (Final)
  const handleExtendTo15Minutes = () => {
    setTargetMode('15_MIN');
    setSessionState('RUNNING');
    if (soundEnabled) sfx.playClick();
  };

  // Salvar sessão finalizada no banco de dados local & nuvem
  const handleSaveToDatabase = () => {
    if (!completedSession) return;

    const toSave: TournamentSession = {
      ...completedSession,
      notes: sessionNotes.trim() || undefined,
      placement: sessionPlacement.trim() || undefined,
      trophy: sessionTrophy || Boolean(sessionPlacement.includes('1º') || sessionPlacement.includes('2º') || sessionPlacement.includes('3º')),
      tenantId: tenant?.id || 'tenant-demo-01'
    };

    db.addTournamentSession(toSave);
    setCompletedSession(toSave);
    loadData();
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3500);
  };

  // Compartilhar no WhatsApp com formatação elegante
  const handleShareWhatsapp = () => {
    if (!completedSession) return;

    const activePlacement = sessionPlacement.trim() || completedSession.placement;
    const hasTrophy = sessionTrophy || completedSession.trophy || (activePlacement && (activePlacement.includes('1º') || activePlacement.includes('2º') || activePlacement.includes('3º')));

    const text = `🏆 *RELATÓRIO DE CANTO - BIRDPRO* 🏆\n` +
      `🐦 *Ave:* ${completedSession.birdName}${completedSession.birdRing ? ` (${completedSession.birdRing})` : ''}\n` +
      `📅 *Data:* ${formatDate(completedSession.date)} às ${completedSession.time || ''}\n` +
      `🎯 *Modalidade:* ${completedSession.type} (${completedSession.mode === '10_MIN' ? '10 Minutos' : '15 Minutos'})\n` +
      (activePlacement ? `🏅 *Classificação:* *${activePlacement}*${hasTrophy ? ' 🏆' : ''}\n` : '') +
      `───────────────────\n` +
      `🔥 *TOTAL DE CANTOS:* *${completedSession.totalSongs}*\n` +
      `⚡ *Média:* ${completedSession.songsPerMinute} cantos/min\n` +
      `↗️ *Melhor Minuto:* ${completedSession.bestMinute.count} cantos (${completedSession.bestMinute.minute}º min)\n` +
      `↘️ *Pior Minuto:* ${completedSession.worstMinute.count} cantos (${completedSession.worstMinute.minute}º min)\n` +
      `📊 *Projeção 10 min:* ${completedSession.projection10Min} cantos\n` +
      `📊 *Projeção 15 min:* ${completedSession.projection15Min} cantos\n` +
      `───────────────────\n` +
      `💡 *Mexida:* ${completedSession.mexidaEvaluation.title} — ${completedSession.mexidaEvaluation.description}\n` +
      (completedSession.notes || sessionNotes ? `📝 *Manejo:* ${completedSession.notes || sessionNotes}\n` : '') +
      `\n_Registrado ao vivo no app BirdPro_`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Excluir sessão do histórico
  const handleDeleteSession = (id: string) => {
    if (confirm('Deseja excluir esta marcação de canto do histórico?')) {
      db.deleteTournamentSession(id);
      loadData();
      if (inspectModalSession?.id === id) setInspectModalSession(null);
    }
  };

  // Formatação MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sessões filtradas no Histórico
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchBird = historyBirdFilter === 'ALL' || s.birdId === historyBirdFilter || s.birdName === historyBirdFilter;
      const matchType = historyTypeFilter === 'ALL' || s.type === historyTypeFilter;
      return matchBird && matchType;
    });
  }, [sessions, historyBirdFilter, historyTypeFilter]);

  // Estatísticas acumuladas da ave selecionada
  const birdStats = useMemo(() => {
    if (historyBirdFilter === 'ALL') return null;
    const birdSessions = sessions.filter(s => s.birdId === historyBirdFilter || s.birdName === historyBirdFilter);
    if (birdSessions.length === 0) return null;

    const max10 = Math.max(...birdSessions.map(s => s.projection10Min), 0);
    const max15 = Math.max(...birdSessions.map(s => s.projection15Min), 0);
    const totalSongsAll = birdSessions.reduce((acc, s) => acc + s.totalSongs, 0);
    const avgSongs = Math.round(totalSongsAll / birdSessions.length);

    return {
      count: birdSessions.length,
      max10,
      max15,
      avgSongs
    };
  }, [sessions, historyBirdFilter]);

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 font-sans">
      
      {/* Toast de Salvo com Sucesso */}
      {isSavedToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#00c853] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-emerald-400 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <div>
            <div className="font-black text-xs">Sessão Salva com Sucesso!</div>
            <div className="text-[11px] text-white/90">
              Cantadas e minutos gravados no histórico da ave.
            </div>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL IDÊNTICO AO PRINT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎵</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marcador de Cantos</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Marque os cantos em tempo real — roda, treino ou competição
          </p>
        </div>

        {/* Abas Alternadoras (Marcação / Histórico) */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('MARKER')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MARKER'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🎵</span>
            <span>Marcação</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🕒</span>
            <span>Histórico</span>
            {sessions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
                {sessions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ABA 1: MARCADOR DE CANTO AO VIVO                                     */}
      {/* ==================================================================== */}
      {activeTab === 'MARKER' && (
        <div className="space-y-5">
          
          {/* ESTADO 1: CONFIGURAÇÃO ANTES DE INICIAR */}
          {sessionState === 'IDLE' && !completedSession && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00c853] flex items-center justify-center font-black">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800">Preparar Marcação de Roda</h2>
                    <p className="text-xs text-slate-500">Selecione a ave do seu plantel e a modalidade de disputa</p>
                  </div>
                </div>

                {/* Toggles de Som e Vibração */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? 'Som Ativado' : 'Som Desativado'}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      soundEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVibrateEnabled(!vibrateEnabled)}
                    title={vibrateEnabled ? 'Vibração Ativada' : 'Vibração Desativada'}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      vibrateEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <Vibrate className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Seletor de Ave do Plantel */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Ave em Disputa (Plantel) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={selectedBirdId}
                      onChange={(e) => {
                        setSelectedBirdId(e.target.value);
                        if (e.target.value) setCustomBirdName('');
                      }}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00c853]"
                    >
                      <option value="">Selecione ave do seu plantel...</option>
                      {birds.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.ringNumber ? `• Anilha: ${b.ringNumber}` : ''} {b.species ? `(${b.species.split('(')[0].trim()})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Ou digite o nome de ave externa / convidada..."
                      value={customBirdName}
                      disabled={!!selectedBirdId}
                      onChange={(e) => setCustomBirdName(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00c853] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Modalidade de Tempo (10 Min ou 15 Min) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Modalidade do Canto
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetMode('10_MIN')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      targetMode === '10_MIN'
                        ? 'border-[#00c853] bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900">10 Minutos</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        Classificação
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Padrão de 10 min com opção de estender +5 min na final.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMode('15_MIN')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      targetMode === '15_MIN'
                        ? 'border-[#00c853] bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900">15 Minutos (10 + 5)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                        Final Oficial
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Disputa final completa com todas as parciais e projeções.
                    </p>
                  </button>
                </div>
              </div>

              {/* Tipo de Evento & Local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1 block">
                    Tipo de Evento
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00c853]"
                  >
                    <option value="RODA">Roda Oficial</option>
                    <option value="TREINO">Treino / Mexida</option>
                    <option value="TORNEIO">Torneio Regional / Nacional</option>
                    <option value="BADERNA">Baderna / Esquenta</option>
                    <option value="EM_CASA">Avaliação em Casa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1 block">
                    Local / Clube (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Clube dos Criadores, Galpão..."
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>

              {/* Botão de Ação: Iniciar Marcação */}
              <button
                type="button"
                onClick={handleStartSession}
                className="w-full py-4 bg-[#00c853] hover:bg-[#00b84a] text-white text-base font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Iniciar Marcação Ao Vivo</span>
              </button>
            </div>
          )}

          {/* ESTADO 2: SESSÃO AO VIVO EM ANDAMENTO (CRONÔMETRO + TOUCH PAD GIGANTE) */}
          {(sessionState === 'RUNNING' || sessionState === 'PAUSED') && (
            <div className="space-y-4">
              
              {/* Header da Marcação Ao Vivo */}
              <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800 space-y-4">
                
                {/* Info Ave & Modalidade */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                      <BirdIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white leading-tight">
                        {birdDisplayName}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {sessionType} • Modalidade {targetMode === '10_MIN' ? '10 Minutos' : '15 Minutos'}
                      </p>
                    </div>
                  </div>

                  {/* Badge de Status */}
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    sessionState === 'RUNNING'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {sessionState === 'RUNNING' ? 'AO VIVO' : 'PAUSADO'}
                  </span>
                </div>

                {/* Mostrador de Tempo e Minuto Atual */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div className="bg-slate-800/80 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tempo Decorrido
                    </span>
                    <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-0.5">
                      {formatTime(elapsedSeconds)} <span className="text-xs text-slate-500">/ {formatTime(maxSessionSeconds)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Minuto Atual
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5 flex items-baseline gap-2">
                      <span>{currentMinuteIndex + 1}º min</span>
                      <span className="text-xs font-bold text-slate-300 font-mono">({currentMinuteCount} cantos)</span>
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso do Tempo Total */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (elapsedSeconds / maxSessionSeconds) * 100)}%` }}
                  />
                </div>
              </div>

              {/* ÁREA DE TOQUE GIGANTE PARA O MARCADOR */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg text-center space-y-6">
                
                {/* NÚMERO TOTAL DE CANTOS GIGANTE */}
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                    Total de Cantos Marcados
                  </span>
                  <div className="text-7xl sm:text-8xl font-black text-slate-900 tracking-tight font-mono select-none">
                    {totalSongs}
                  </div>
                  <p className="text-xs font-bold text-emerald-600">
                    Média: {elapsedSeconds > 0 ? ((totalSongs / elapsedSeconds) * 60).toFixed(1) : '0.0'} cantos/min
                  </p>
                </div>

                {/* BOTÃO DE TOQUE GIGANTE (Touch Pad com Feedback) */}
                <button
                  type="button"
                  onClick={handleCountSong}
                  disabled={sessionState !== 'RUNNING'}
                  className={`w-full py-16 sm:py-20 rounded-3xl font-black text-white text-2xl sm:text-3xl shadow-xl transition-all select-none touch-manipulation transform active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    touchPulse 
                      ? 'bg-emerald-400 scale-98 shadow-emerald-500/50' 
                      : 'bg-gradient-to-b from-[#00c853] to-[#00a844] shadow-emerald-600/30 hover:brightness-105'
                  }`}
                  style={{ minHeight: '220px' }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white mb-1 shadow-inner">
                    <Plus className="w-10 h-10 stroke-[3]" />
                  </div>
                  <span className="tracking-wider uppercase">TOQUE PARA CONTAR CANTO</span>
                  <span className="text-xs font-medium text-emerald-100 opacity-90">
                    +1 canto registrado com vibração e som
                  </span>
                </button>

                {/* AÇÕES SECUNDÁRIAS: DESFAZER (-1), PAUSAR E FINALIZAR */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleUndoSong}
                    disabled={totalSongs <= 0 || sessionState !== 'RUNNING'}
                    className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-2xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Minus className="w-4 h-4 text-rose-500" />
                    <span>Desfazer (-1)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {sessionState === 'RUNNING' ? (
                      <>
                        <Pause className="w-4 h-4 text-amber-600" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-emerald-600" />
                        <span>Retomar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalizeSession()}
                    className="py-3 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-2xl border border-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                    <span>Concluir</span>
                  </button>
                </div>

                {/* Opção se estiver no modo 10 min e já passou dos 5 min: pode estender para 15 min */}
                {targetMode === '10_MIN' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Vai continuar para a final?</span>
                    <button
                      type="button"
                      onClick={handleExtendTo15Minutes}
                      className="text-emerald-700 hover:text-emerald-800 font-black flex items-center gap-1 cursor-pointer"
                    >
                      <span>+5 Minutos (Final 15 min) →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ESTADO 3: SESSÃO FINALIZADA (LAYOUT EXATAMENTE IGUAL AOS PRINTS DO USUÁRIO) */}
          {completedSession && sessionState === 'FINISHED' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Card de Sessão Finalizada */}
              <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00c853] flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Sessão Finalizada</h2>
                <p className="text-xs font-bold text-slate-500">
                  {completedSession.birdName} • {completedSession.type}
                </p>
              </div>

              {/* Cards de Métricas Principais (134 Total de Cantos / 13.4 por minuto) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 text-center shadow-xs">
                  <div className="text-3xl sm:text-4xl font-black text-[#00c853] font-mono">
                    {completedSession.totalSongs}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 block">Total de Cantos</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 text-center shadow-xs">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                    {completedSession.songsPerMinute.toFixed(1)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 block">por minuto</span>
                </div>
              </div>

              {/* Linha com Melhor Minuto e Pior Minuto */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-emerald-800">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Melhor minuto</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                    {completedSession.bestMinute.count}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 block">
                    {completedSession.bestMinute.minute}º minuto
                  </span>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-amber-800">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Pior minuto</span>
                  </div>
                  <div className="text-2xl font-black text-amber-700 font-mono mt-1">
                    {completedSession.worstMinute.count}
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 block">
                    {completedSession.worstMinute.minute}º minuto
                  </span>
                </div>
              </div>

              {/* RELATÓRIO POR MINUTO (BARRAS HORIZONTAIS IDÊNTICAS AO PRINT) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  RELATÓRIO POR MINUTO
                </span>

                <div className="space-y-2.5">
                  {completedSession.minuteCounts.map((m) => {
                    const isBest = m.minute === completedSession.bestMinute.minute && m.count > 0;
                    const isWorst = m.minute === completedSession.worstMinute.minute && m.count > 0 && !isBest;

                    // Cor da barra de acordo com o print
                    let barColor = 'bg-[#407a68] text-white'; // verde escuro elegante padrão
                    if (isBest) barColor = 'bg-[#00c853] text-white font-black shadow-xs'; // verde vivo destaque
                    if (isWorst) barColor = 'bg-[#f59e0b] text-white font-black shadow-xs'; // amarelo/laranja destaque

                    const maxInBar = Math.max(completedSession.bestMinute.count, 15);
                    const widthPercent = Math.max(18, Math.min(100, Math.round((m.count / maxInBar) * 100)));

                    return (
                      <div key={m.minute} className="flex items-center gap-3 text-xs">
                        <span className="w-14 text-slate-600 font-bold shrink-0 text-left">
                          {m.minute}º min
                        </span>

                        {/* Barra horizontal com valor no canto direito */}
                        <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden relative flex items-center p-0.5">
                          <div 
                            className={`h-full rounded-full transition-all flex items-center justify-end pr-2.5 font-bold font-mono text-[11px] ${barColor}`}
                            style={{ width: `${widthPercent}%` }}
                          >
                            <span>{m.count}</span>
                          </div>
                        </div>

                        {/* Ritmo por minuto à direita */}
                        <span className="w-16 text-slate-400 font-medium text-right text-[11px] shrink-0 font-mono">
                          {m.pace ? `${m.pace}/min` : `${m.count}/min`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PROJEÇÕES (134 Projeção 10 min / 201 Projeção 15 min + Mexida Validada) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  PROJEÇÕES
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-200/60">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      {completedSession.projection10Min}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                      Projeção 10 min
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-2xl text-center border-2 border-[#00c853]">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      {completedSession.projection15Min}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 mt-0.5 block">
                      Projeção 15 min
                    </span>
                  </div>
                </div>

                {/* Card de Diagnóstico da Mexida */}
                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#00c853] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-emerald-950">
                      {completedSession.mexidaEvaluation.title}
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                      {completedSession.mexidaEvaluation.description}
                    </p>
                  </div>
                </div>

                {/* Tempo Total */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-bold">Tempo total</span>
                  <span className="font-mono font-black text-slate-900">
                    {formatTime(completedSession.totalSeconds)}
                  </span>
                </div>
              </div>

              {/* BLOCO DE SALVAR SESSÃO & ANOTAÇÕES DE MANEJO */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <span className="text-sm font-black text-slate-800 block">
                  Salvar sessão?
                </span>

                {/* Badge Vinculado a: Ave */}
                <div className="w-full py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-[#00c853]" />
                  <span>Vinculado a: <strong>{completedSession.birdName}</strong></span>
                </div>

                {/* Classificação / Colocação no Torneio no dia */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Classificação / Colocação no Torneio:</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sessionTrophy}
                        onChange={(e) => setSessionTrophy(e.target.checked)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                      />
                      <span>Ganhou Troféu 🏆</span>
                    </label>
                  </div>

                  {/* Sugestões Rápidas de Classificação */}
                  <div className="flex flex-wrap gap-1.5">
                    {['1º Lugar 🥇', '2º Lugar 🥈', '3º Lugar 🥉', '4º Lugar', '5º Lugar', 'Finalista', 'Classificado'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setSessionPlacement(preset);
                          if (preset.includes('🥇') || preset.includes('🥈') || preset.includes('🥉') || preset.includes('Lugar')) {
                            setSessionTrophy(true);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          sessionPlacement === preset
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Digite a colocação (ex: 1º Lugar, 7º Colocado, Campeão Geral...)"
                    value={sessionPlacement}
                    onChange={(e) => setSessionPlacement(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00c853]"
                  />
                </div>

                {/* Observações da Mexida */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                    Observações de manejo / Mexida realizada:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: 2 horas com a fêmea no voador, capa semi-aberta, sementeira de braquiária..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00c853]"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveToDatabase}
                    className="w-full py-3.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Gravar no Histórico da Ave</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleShareWhatsapp}
                      className="py-3 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Compartilhar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCompletedSession(null);
                        setSessionState('IDLE');
                        setSessionPlacement('');
                        setSessionTrophy(false);
                        setSessionNotes('');
                      }}
                      className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Nova Marcação</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 2: HISTÓRICO DE TORNEIOS & ANÁLISE DE MEXIDAS                    */}
      {/* ==================================================================== */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-5">
          
          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Filtrar por Ave
              </label>
              <select
                value={historyBirdFilter}
                onChange={(e) => setHistoryBirdFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00c853]"
              >
                <option value="ALL">Todas as Aves ({sessions.length} marcações)</option>
                {birds.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.ringNumber ? `(${b.ringNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:w-48">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Modalidade
              </label>
              <select
                value={historyTypeFilter}
                onChange={(e) => setHistoryTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00c853]"
              >
                <option value="ALL">Todos os Tipos</option>
                <option value="RODA">Roda Oficial</option>
                <option value="TREINO">Treino</option>
                <option value="TORNEIO">Torneio</option>
                <option value="BADERNA">Baderna</option>
                <option value="EM_CASA">Em Casa</option>
              </select>
            </div>
          </div>

          {/* Cards de Resumo da Ave (quando filtrada) */}
          {birdStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-lg border border-slate-700">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Rodas</span>
                <span className="text-2xl font-black text-white">{birdStats.count}</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recorde (10 min)</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{birdStats.max10}</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recorde (15 min)</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{birdStats.max15}</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Média Geral</span>
                <span className="text-2xl font-black text-sky-400 font-mono">{birdStats.avgSongs} cantos</span>
              </div>
            </div>
          )}

          {/* Lista de Sessões Anteriores */}
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-700">Nenhuma marcação gravada ainda</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Inicie uma marcação ao vivo na aba &quot;Marcação&quot; para registrar cantadas e minutos das suas aves.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('MARKER')}
                className="mt-2 px-5 py-2.5 bg-[#00c853] text-white text-xs font-black rounded-xl hover:bg-[#00b84a] cursor-pointer"
              >
                Ir para o Marcador Ao Vivo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-slate-900">{session.birdName}</span>
                      {session.birdRing && (
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {session.birdRing}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {session.type}
                      </span>
                      {session.placement && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-2xs">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          <span>{session.placement}</span>
                          {session.trophy && <span>🏆</span>}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>📅 {formatDate(session.date)} {session.time || ''}</span>
                      <span>⏱️ {formatTime(session.totalSeconds)}</span>
                      {session.location && <span>📍 {session.location}</span>}
                    </div>

                    {session.notes && (
                      <p className="text-[11px] text-slate-600 italic line-clamp-1 pt-0.5">
                        &quot;{session.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Números & Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xl font-black text-[#00c853] font-mono leading-none">
                        {session.totalSongs}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {session.songsPerMinute} cantos/min
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectModalSession(session)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Ver Relatório</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL DE DETALHES DE UMA SESSÃO DO HISTÓRICO                         */}
      {/* ==================================================================== */}
      {inspectModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Relatório Completo</span>
                <h3 className="text-base font-black text-slate-900">{inspectModalSession.birdName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalSession(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Classificação no Torneio */}
            {inspectModalSession.placement && (
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-2xl border border-amber-200/80 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider block">
                      Classificação Oficial no Torneio
                    </span>
                    <span className="text-sm font-black text-amber-950">
                      {inspectModalSession.placement}
                    </span>
                  </div>
                </div>
                {inspectModalSession.trophy && (
                  <span className="text-2xl drop-shadow-xs">🏆</span>
                )}
              </div>
            )}

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-200/60">
                <div className="text-3xl font-black text-[#00c853] font-mono">
                  {inspectModalSession.totalSongs}
                </div>
                <span className="text-[11px] font-bold text-slate-500 block">Total de Cantos</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-200/60">
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {inspectModalSession.songsPerMinute}
                </div>
                <span className="text-[11px] font-bold text-slate-500 block">Média por Minuto</span>
              </div>
            </div>

            {/* Minuto a Minuto */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase text-slate-400 block">Relatório Minuto a Minuto</span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {inspectModalSession.minuteCounts.map((m) => {
                  const isBest = m.minute === inspectModalSession.bestMinute.minute;
                  const isWorst = m.minute === inspectModalSession.worstMinute.minute;
                  let barColor = 'bg-[#407a68] text-white';
                  if (isBest) barColor = 'bg-[#00c853] text-white font-black';
                  if (isWorst) barColor = 'bg-[#f59e0b] text-white font-black';

                  const maxInBar = Math.max(inspectModalSession.bestMinute.count, 15);
                  const widthPercent = Math.max(18, Math.min(100, Math.round((m.count / maxInBar) * 100)));

                  return (
                    <div key={m.minute} className="flex items-center gap-2.5 text-xs">
                      <span className="w-12 text-slate-600 font-bold shrink-0">{m.minute}º min</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden flex items-center p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all flex items-center justify-end pr-2 font-bold font-mono text-[10px] ${barColor}`}
                          style={{ width: `${widthPercent}%` }}
                        >
                          <span>{m.count}</span>
                        </div>
                      </div>
                      <span className="w-14 text-slate-400 text-right text-[10px] font-mono shrink-0">
                        {m.pace || m.count}/min
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Projeções */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl text-center border">
                <span className="text-[10px] font-bold text-slate-400 block">Projeção 10 min</span>
                <span className="text-xl font-black text-slate-800 font-mono">{inspectModalSession.projection10Min}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-300">
                <span className="text-[10px] font-bold text-emerald-800 block">Projeção 15 min</span>
                <span className="text-xl font-black text-emerald-900 font-mono">{inspectModalSession.projection15Min}</span>
              </div>
            </div>

            {/* Diagnóstico da Mexida */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <p className="font-bold text-emerald-950">{inspectModalSession.mexidaEvaluation.title}</p>
              <p className="text-[11px] text-emerald-800">{inspectModalSession.mexidaEvaluation.description}</p>
            </div>

            {inspectModalSession.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Observações do Manejo:</span>
                <p className="text-slate-700">{inspectModalSession.notes}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setInspectModalSession(null)}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
