'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Bird, 
  CircleDot, 
  Grid3X3, 
  Heart, 
  Activity, 
  Pill, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  UploadCloud, 
  FileText,
  Clock,
  Egg as EggIcon,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Gift
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { SexBadge, StatusBadge, Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { AdminCommercialDashboard } from '@/components/admin/admin-commercial-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  // If logged in as Super Admin, render 100% Commercial Dashboard!
  if (user?.role === 'SUPER_ADMIN') {
    return <AdminCommercialDashboard />;
  }

  return <CriatorioDashboard />;
}

function CriatorioDashboard() {
  const { tenant, user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [dbTick, setDbTick] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    let debounceTimer: any = null;
    const handleDbUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setDbTick(prev => prev + 1);
      }, 150);
    };
    window.addEventListener('birdpro_db_updated', handleDbUpdate);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('birdpro_db_updated', handleDbUpdate);
    };
  }, []);
  
  // Stable data fetches tied to tenant and db updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const birds = useMemo(() => db.getBirds(tenant?.id), [tenant?.id, dbTick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rings = useMemo(() => db.getRings(tenant?.id), [tenant?.id, dbTick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cages = useMemo(() => db.getCages(tenant?.id), [tenant?.id, dbTick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pairs = useMemo(() => db.getPairs(tenant?.id), [tenant?.id, dbTick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const eggs = useMemo(() => db.getEggs(tenant?.id), [tenant?.id, dbTick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clutches = useMemo(() => db.getClutches(tenant?.id), [tenant?.id, dbTick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const treatments = useMemo(() => db.getTreatments(tenant?.id), [tenant?.id, dbTick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notifications = useMemo(() => db.getNotifications(tenant?.id), [tenant?.id, dbTick]);

  // Computed Metrics
  const totalBirds = birds.length;
  const males = birds.filter(b => b.sex === 'MALE').length;
  const females = birds.filter(b => b.sex === 'FEMALE').length;
  const unknownSex = birds.filter(b => b.sex === 'UNKNOWN').length;
  
  const inBreeding = birds.filter(b => b.status === 'BREEDING').length;
  const inTreatment = birds.filter(b => b.status === 'IN_TREATMENT' || b.status === 'QUARANTINE').length;
  const activeFledglings = birds.filter(b => 
    b.name.toLowerCase().includes('filhote') || 
    (b.origin === 'BRED_HERE' && (!b.birthDate || new Date(b.birthDate) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000))) ||
    (b.birthDate && new Date(b.birthDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
  ).length;
  const adults = Math.max(0, totalBirds - activeFledglings);

  const activePairs = pairs.filter(p => p.status === 'ACTIVE').length;
  const incubatingEggs = eggs.filter(e => e.status === 'INCUBATING' || e.status === 'FERTILE').length;

  const ringsAvailable = rings.filter(r => r.status === 'IN_STOCK').length;
  const ringsUsed = rings.filter(r => r.status === 'USED').length;

  const occupiedCages = cages.filter(c => {
    return birds.some(b => b.cageId === c.id);
  }).length;
  const availableCages = cages.length - occupiedCages;

  // Real Evolution & Births calculation (Last 6 Months dynamically computed from real data)
  const evolutionData = useMemo(() => {
    const now = new Date();
    const monthsData: { month: string; nascimentos: number; mortalidade: number; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const rawMonth = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      // Nascimentos no mês: aves com birthDate no período ou ovos eclodidos
      const nascimentos = birds.filter(b => {
        if (b.birthDate) {
          const bd = new Date(b.birthDate);
          return bd >= startOfMonth && bd <= endOfMonth;
        }
        if (b.origin === 'BRED_HERE') {
          const ed = b.entryDate ? new Date(b.entryDate) : (b.createdAt ? new Date(b.createdAt) : null);
          return ed ? (ed >= startOfMonth && ed <= endOfMonth) : false;
        }
        return false;
      }).length;

      // Mortalidade no mês:
      const mortalidade = birds.filter(b => {
        if (b.status === 'DECEASED' && b.exitDate) {
          const ed = new Date(b.exitDate);
          return ed >= startOfMonth && ed <= endOfMonth;
        }
        return false;
      }).length;

      // Total de aves ativas no criatório até o final daquele mês:
      const total = birds.filter(b => {
        const entry = b.entryDate 
          ? new Date(b.entryDate) 
          : (b.birthDate ? new Date(b.birthDate) : (b.createdAt ? new Date(b.createdAt) : null));
        
        if (entry && entry > endOfMonth) return false;

        if (b.exitDate) {
          const exit = new Date(b.exitDate);
          if (exit <= endOfMonth) return false;
        }

        return true;
      }).length;

      monthsData.push({
        month: monthLabel,
        nascimentos,
        mortalidade,
        total
      });
    }

    return monthsData;
  }, [birds]);

  // Max value for Y Axis domain precalculated statically to eliminate infinite Recharts loops
  const yDomainMax = useMemo(() => {
    const vals = evolutionData.map(d => Math.max(d.total || 0, d.nascimentos || 0));
    const highest = Math.max(...vals, 0);
    return Math.max(5, Math.ceil(highest * 1.2));
  }, [evolutionData]);

  // Species distribution data memoized
  const speciesChartData = useMemo(() => {
    const speciesCount: Record<string, number> = {};
    birds.forEach(b => {
      const sp = (b.species || 'Canário').split('(')[0].trim();
      speciesCount[sp] = (speciesCount[sp] || 0) + 1;
    });

    return Object.entries(speciesCount).map(([name, value]) => ({
      name,
      value
    }));
  }, [birds]);

  const COLORS = ['#059669', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  const sexPieData = useMemo(() => [
    { name: 'Machos (♂)', value: males, color: '#3B82F6' },
    { name: 'Fêmeas (♀)', value: females, color: '#EC4899' },
    { name: 'Indefinidos (?)', value: unknownSex, color: '#94A3B8' },
  ], [males, females, unknownSex]);

  return (
    <div className="space-y-8">
      {/* Header Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Bird className="w-80 h-80 -mr-16 text-white" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel de Controle Inteligente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Bem-vindo ao BIRDPRO, {user?.name?.split(' ')[0] || 'Criador'}!
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Visão em tempo real de seu plantel, posturas em incubação, linhagens genéticas e manejo sanitário do <strong className="text-emerald-400">{tenant?.name}</strong>.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link href="/dashboard/indique-e-ganhe">
            <Button size="md" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black shadow-lg border border-amber-400/30 animate-pulse">
              <Gift className="w-4 h-4 mr-1.5" />
              Indique &amp; Ganhe PIX
            </Button>
          </Link>
          <Link href="/dashboard/aves?action=new">
            <Button size="md" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg">
              <Plus className="w-4 h-4 mr-1.5" />
              Cadastrar Ave
            </Button>
          </Link>
          <Link href="/dashboard/importacao">
            <Button variant="outline" size="md" className="border-emerald-400/40 text-white hover:bg-emerald-950/50">
              <UploadCloud className="w-4 h-4 mr-1.5" />
              Importar Anilhas
            </Button>
          </Link>
        </div>
      </div>

      {/* Onboarding Progress Alert (if not 100%) */}
      {(tenant?.setupProgress || 100) < 100 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-emerald-950">Seu criatório está {tenant?.setupProgress}% configurado</span>
              <Badge variant="success" size="sm">Primeiros Passos</Badge>
            </div>
            <p className="text-xs text-emerald-800">
              Conclua o cadastro de suas gaiolas e anilhas para desbloquear toda a automação de reprodução e genealogia.
            </p>
            {/* Progress Bar */}
            <div className="w-full sm:w-80 h-2 bg-emerald-200 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                style={{ width: `${tenant?.setupProgress}%` }}
              />
            </div>
          </div>
          <Link href="/onboarding">
            <Button size="sm" className="shrink-0">
              Continuar Assistente →
            </Button>
          </Link>
        </div>
      )}

      {/* Primary KPI Grid (15 Key Metrics Requested by User) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Aves */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Aves</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Bird className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalBirds}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Plantel Ativo</span>
          </div>
        </div>

        {/* Machos */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Machos (♂)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <span className="font-black text-sm">♂</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-900">{males}</p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">{Math.round((males/totalBirds)*100 || 0)}% do plantel</p>
        </div>

        {/* Fêmeas */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Fêmeas (♀)</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <span className="font-black text-sm">♀</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-900">{females}</p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">{Math.round((females/totalBirds)*100 || 0)}% do plantel</p>
        </div>

        {/* Sexo Indefinido / Filhotes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sexo Indefinido</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <span className="font-bold text-xs">?</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800">{unknownSex}</p>
          <p className="text-[11px] text-amber-600 mt-2 font-semibold">Sexagem pendente</p>
        </div>

        {/* Filhotes Nascidos */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Filhotes / Jovens</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-teal-900">{activeFledglings}</p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">{adults} aves adultas</p>
        </div>

        {/* Em Reprodução */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Em Reprodução</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-900">{inBreeding}</p>
          <p className="text-[11px] text-purple-700 mt-2 font-semibold">{activePairs} casais pareados</p>
        </div>

        {/* Ovos em Incubação */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ovos no Ninho</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <EggIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900">{incubatingEggs}</p>
          <p className="text-[11px] text-amber-700 mt-2 font-semibold">Eclosões próximas</p>
        </div>

        {/* Em Tratamento / Quarentena */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Em Tratamento</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-900">{inTreatment}</p>
          <p className="text-[11px] text-rose-700 mt-2 font-semibold">{treatments.filter(t => t.status === 'ACTIVE').length} remédios ativos</p>
        </div>

        {/* Anilhas Disponíveis */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Anilhas em Estoque</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CircleDot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-900">{ringsAvailable}</p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">{ringsUsed} anilhas em uso</p>
        </div>

        {/* Gaiolas Ocupadas / Disponíveis */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gaiolas</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Grid3X3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{cages.length}</p>
          <p className="text-[11px] text-slate-600 mt-2 font-semibold">{occupiedCages} ocupadas • {availableCages} livres</p>
        </div>
      </div>

      {/* Central de Alertas Inteligente & Ações Imediatas */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Central de Alertas & Manejo Diário</h3>
              <p className="text-xs text-slate-500">Eventos prioritários que requerem atenção nas próximas 48 horas</p>
            </div>
          </div>
          <Link href="/dashboard/alertas" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>Ver todos</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {notifications.filter(n => n.status !== 'COMPLETED').length === 0 ? (
          <div className="py-6 px-4 text-center rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-1.5" />
            <p className="text-xs font-bold text-slate-700">Tudo em dia no criatório!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Nenhum alerta de medicamento, eclosão ou manejo sanitário pendente para as próximas 48 horas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {notifications.filter(n => n.status !== 'COMPLETED').slice(0, 3).map((notif) => {
              const isMed = notif.category === 'MEDICATION';
              const isHatch = notif.category === 'EGG_HATCH';
              const isSexing = notif.category === 'SEXING';

              let cardBg = 'bg-slate-50/60 border-slate-200';
              let headerText = 'text-slate-800';
              let iconColor = 'text-slate-600';
              let badgeBg = 'bg-slate-200 text-slate-900';
              let IconComponent = Clock;
              let categoryTitle = 'Lembrete';
              let linkColor = 'text-slate-800';

              if (isMed) {
                cardBg = 'bg-amber-50/60 border-amber-200';
                headerText = 'text-amber-800';
                iconColor = 'text-amber-600';
                badgeBg = 'bg-amber-200 text-amber-900';
                IconComponent = Pill;
                categoryTitle = 'Medicamento Hoje';
                linkColor = 'text-amber-800';
              } else if (isHatch) {
                cardBg = 'bg-emerald-50/60 border-emerald-200';
                headerText = 'text-emerald-800';
                iconColor = 'text-emerald-600';
                badgeBg = 'bg-emerald-200 text-emerald-900';
                IconComponent = EggIcon;
                categoryTitle = 'Previsão de Eclosão';
                linkColor = 'text-emerald-800';
              } else if (isSexing) {
                cardBg = 'bg-sky-50/60 border-sky-200';
                headerText = 'text-sky-800';
                iconColor = 'text-sky-600';
                badgeBg = 'bg-sky-200 text-sky-900';
                IconComponent = Sparkles;
                categoryTitle = 'Sexagem DNA Filhotes';
                linkColor = 'text-sky-800';
              }

              return (
                <div key={notif.id} className={`p-4 rounded-2xl border space-y-2 flex flex-col justify-between ${cardBg}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${headerText}`}>
                        <IconComponent className={`w-4 h-4 ${iconColor}`} /> {categoryTitle}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeBg}`}>
                        {notif.dueTime || notif.dueDate || 'Pendente'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                    <p className="text-xs text-slate-600">
                      {notif.dosage ? `Dose: ${notif.dosage} ${notif.cageName ? `(${notif.cageName})` : ''}` : notif.message}
                    </p>
                  </div>
                  <Link 
                    href="/dashboard/alertas" 
                    className={`inline-block text-xs font-bold hover:underline pt-1 ${linkColor}`}
                  >
                    {notif.actionText || 'Ver alerta completo →'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Evolução do Plantel & Nascimentos</h3>
              <p className="text-xs text-slate-500">Crescimento de indivíduos e taxa de natalidade no período</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Últimos 6 Meses
            </span>
          </div>

          {totalBirds === 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100/80 text-emerald-700 rounded-xl shrink-0">
                  <Bird className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Nenhuma ave ou filhote cadastrado</p>
                  <p className="text-[11px] text-slate-500">O gráfico reflete os dados reais do seu criatório (0 aves). Conforme cadastrar matrizes ou registrar nascimentos, a curva de crescimento será desenhada aqui em tempo real.</p>
                </div>
              </div>
              <Link href="/dashboard/aves?action=new" className="shrink-0">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Cadastrar Ave
                </Button>
              </Link>
            </div>
          )}

          <div className="h-72 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height={280} debounce={100}>
                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="nascColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis allowDecimals={false} domain={[0, yDomainMax]} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ fontSize: 12, padding: '2px 0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="total" name="Total Plantel" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#totalColor)" />
                  <Area type="monotone" dataKey="nascimentos" name="Nascimentos" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#nascColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl text-slate-400 text-xs">
                Carregando evolução...
              </div>
            )}
          </div>
        </div>

        {/* Species Distribution Donut Chart (1 Col) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 min-w-0 overflow-hidden">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Distribuição por Espécie</h3>
            <p className="text-xs text-slate-500">Proporção de aves cadastradas no plantel</p>
          </div>

          {speciesChartData.length === 0 ? (
            <div className="h-60 w-full flex flex-col items-center justify-center text-center p-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                <Bird className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-600">Nenhuma espécie cadastrada</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">Cadastre suas aves para visualizar a distribuição do plantel.</p>
            </div>
          ) : (
            <>
              <div className="h-60 w-full flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height={240} debounce={100}>
                    <PieChart>
                      <Pie
                        data={speciesChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {speciesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff' }}
                        itemStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl text-slate-400 text-xs">
                    Carregando espécies...
                  </div>
                )}
              </div>

              <div className="space-y-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                {speciesChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-700 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value} aves</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Birds Table with Instant Actions */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Aves Registradas Recentemente</h3>
            <p className="text-xs text-slate-500">Visualização rápida das últimas matrizes e filhotes</p>
          </div>
          <Link href="/dashboard/aves">
            <Button variant="outline" size="sm">
              Ver Todo o Plantel ({totalBirds}) →
            </Button>
          </Link>
        </div>

        {birds.length === 0 ? (
          <div className="py-8 sm:py-10 text-center flex flex-col items-center justify-center text-slate-400 space-y-2 px-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <Bird className="w-8 h-8 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold text-slate-600">Nenhuma ave cadastrada ainda no plantel</p>
            <p className="text-[11px] text-slate-400 max-w-sm">Cadastre suas matrizes ou importe anilhas para começar a povoar seu criatório.</p>
            <Link href="/dashboard/aves?action=new" className="pt-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Cadastrar Primeira Ave
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Telas pequenas: sem rolagem horizontal cortando) */}
            <div className="block md:hidden space-y-2.5">
              {birds.slice(0, 6).map((bird) => (
                <div key={bird.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {bird.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bird.photoUrl} alt={bird.name} className="w-full h-full object-cover" />
                        ) : (
                          <Bird className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-slate-900 truncate">{bird.name}</p>
                        <p className="font-mono text-[10px] text-slate-500">{bird.ringNumber}</p>
                      </div>
                    </div>
                    <SexBadge sex={bird.sex} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/60">
                    <span className="truncate max-w-[150px]">{bird.species.split('(')[0]}</span>
                    <Link href={`/dashboard/aves/${bird.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 px-2 font-bold">
                        Abrir Ficha →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Telas médias e grandes) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 rounded-l-xl">Ave</th>
                    <th className="py-3 px-4">Anilha</th>
                    <th className="py-3 px-4">Espécie</th>
                    <th className="py-3 px-4">Sexo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Gaiola</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {birds.slice(0, 6).map((bird) => (
                    <tr key={bird.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {bird.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={bird.photoUrl} alt={bird.name} className="w-full h-full object-cover" />
                          ) : (
                            <Bird className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{bird.name}</p>
                          {bird.nickname && <p className="text-[10px] text-slate-400">&quot;{bird.nickname}&quot;</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{bird.ringNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{bird.species.split('(')[0]}</td>
                      <td className="py-3 px-4"><SexBadge sex={bird.sex} /></td>
                      <td className="py-3 px-4"><StatusBadge status={bird.status} /></td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{bird.cageId || 'Não alocada'}</td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/dashboard/aves/${bird.id}`}>
                          <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
                            Abrir Ficha →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
