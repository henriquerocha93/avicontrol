'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Bell, 
  BellRing, 
  Clock, 
  MapPin, 
  Bird as BirdIcon, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert,
  Layers,
  ChevronDown
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { DateManualInput } from '@/components/ui/date-manual-input';
import { CalendarEvent, EventCategory, Bird } from '@/types';
import { Button } from '@/components/ui/button';

type ViewMode = 'dia' | 'semana' | 'mes' | 'lista_semana' | 'lista_mes';

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const WEEK_DAYS = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];

const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; bgLight: string; textDark: string; border: string }> = {
  HOLIDAY: {
    label: 'Feriado / Geral',
    color: '#00c853',
    bgLight: 'bg-emerald-500 text-white',
    textDark: 'text-emerald-700',
    border: 'border-emerald-300'
  },
  VACCINE: {
    label: 'Vacinação',
    color: '#0284c7',
    bgLight: 'bg-sky-500 text-white',
    textDark: 'text-sky-700',
    border: 'border-sky-300'
  },
  MEDICATION: {
    label: 'Medicamento / Tratamento',
    color: '#3b82f6',
    bgLight: 'bg-blue-500 text-white',
    textDark: 'text-blue-700',
    border: 'border-blue-300'
  },
  RINGING: {
    label: 'Anilhamento',
    color: '#ef4444',
    bgLight: 'bg-rose-500 text-white',
    textDark: 'text-rose-700',
    border: 'border-rose-300'
  },
  BREEDING: {
    label: 'Reprodução / Choco / Eclosão',
    color: '#d97706',
    bgLight: 'bg-amber-500 text-white',
    textDark: 'text-amber-700',
    border: 'border-amber-300'
  },
  TOURNAMENT: {
    label: 'Torneio / Canto',
    color: '#f59e0b',
    bgLight: 'bg-yellow-500 text-white',
    textDark: 'text-yellow-700',
    border: 'border-yellow-300'
  },
  VET: {
    label: 'Consulta Veterinária',
    color: '#8b5cf6',
    bgLight: 'bg-purple-500 text-white',
    textDark: 'text-purple-700',
    border: 'border-purple-300'
  },
  CLEANING: {
    label: 'Higienização / Manejo',
    color: '#0d9488',
    bgLight: 'bg-teal-500 text-white',
    textDark: 'text-teal-700',
    border: 'border-teal-300'
  },
  GENERAL: {
    label: 'Lembrete Geral',
    color: '#64748b',
    bgLight: 'bg-slate-500 text-white',
    textDark: 'text-slate-700',
    border: 'border-slate-300'
  }
};

export default function CalendarioPage() {
  const { tenant } = useAuth();
  
  // Date Navigation State - Default to October 2026 as in screenshot
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 2)); // Oct 2, 2026
  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);

  // Push Notifications State
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [activePushBanner, setActivePushBanner] = useState<{ title: string; body: string } | null>(null);

  // Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('GENERAL');
  const [formStartDate, setFormStartDate] = useState('2026-10-02');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formAllDay, setFormAllDay] = useState(false);
  const [formBirdId, setFormBirdId] = useState('');
  const [formCageId, setFormCageId] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEnablePushAlert, setFormEnablePushAlert] = useState(true);
  const [formReminderMinutes, setFormReminderMinutes] = useState(30);
  const [formStatus, setFormStatus] = useState<'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('SCHEDULED');

  const loadData = () => {
    const evts = db.getEvents(tenant?.id);
    setEvents(evts);
    const bds = db.getBirds(tenant?.id);
    setBirds(bds);
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, [tenant?.id]);

  // Play audio chime for alerts
  const playAudioChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  };

  // Request Native Browser Push Permission
  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          playAudioChime();
          new Notification('🔔 BIRDPRO: Notificações Push Ativadas!', {
            body: 'Você receberá alertas em tempo real de vacinas, anilhamentos e compromissos.',
            icon: '/icon-192.png'
          });
          setActivePushBanner({
            title: 'Notificações Push Ativadas com Sucesso!',
            body: 'Seus alertas de manejo e compromissos serão disparados com som e aviso no seu dispositivo.'
          });
          setTimeout(() => setActivePushBanner(null), 5000);
        }
      } catch (err) {
        console.error('Push notification error', err);
      }
    }
  };

  // Test Push Notification Trigger
  const triggerTestPush = () => {
    playAudioChime();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ Lembrete BIRDPRO: Vacinação Newcastle', {
        body: 'Compromisso agendado para hoje às 09:00 no Setor A (Matrizes).',
        icon: '/icon-192.png'
      });
    }
    setActivePushBanner({
      title: '⏰ Alerta Push Disparado: Vacinação Newcastle',
      body: 'Compromisso de hoje às 09:00 no Setor A - Lembrete automático enviado para o criatório.'
    });
    setTimeout(() => setActivePushBanner(null), 6000);
  };

  // Navigation Handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'dia') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'semana' || viewMode === 'lista_semana') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'dia') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'semana' || viewMode === 'lista_semana') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 2)); // Returns to reference today: Oct 2, 2026
  };

  // Open Create Modal with default date
  const handleOpenCreateModal = (targetDateStr?: string, targetHourStr?: string) => {
    setEditingEvent(null);
    const dateToUse = targetDateStr || currentDate.toISOString().split('T')[0];
    setFormTitle('');
    setFormCategory('GENERAL');
    setFormStartDate(dateToUse);
    setFormEndDate(dateToUse);
    setFormStartTime(targetHourStr || '09:00');
    setFormEndTime(targetHourStr ? `${String(parseInt(targetHourStr) + 1).padStart(2, '0')}:00` : '10:00');
    setFormAllDay(false);
    setFormBirdId('');
    setFormCageId('');
    setFormLocation('');
    setFormDescription('');
    setFormEnablePushAlert(true);
    setFormReminderMinutes(30);
    setFormStatus('SCHEDULED');
    setIsEventModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (evt: CalendarEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormCategory(evt.category);
    setFormStartDate(evt.startDate);
    setFormEndDate(evt.endDate || evt.startDate);
    setFormStartTime(evt.startTime || '09:00');
    setFormEndTime(evt.endTime || '10:00');
    setFormAllDay(evt.allDay);
    setFormBirdId(evt.birdId || '');
    setFormCageId(evt.cageId || '');
    setFormLocation(evt.location || '');
    setFormDescription(evt.description || '');
    setFormEnablePushAlert(evt.enablePushAlert);
    setFormReminderMinutes(evt.reminderMinutesBefore || 30);
    setFormStatus(evt.status);
    setIsEventModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartDate) return;

    const selectedBird = birds.find(b => b.id === formBirdId);

    const eventPayload = {
      tenantId: tenant?.id || 'tenant-demo-01',
      title: formTitle.trim(),
      category: formCategory,
      startDate: formStartDate,
      endDate: formEndDate || formStartDate,
      startTime: formAllDay ? undefined : formStartTime,
      endTime: formAllDay ? undefined : formEndTime,
      allDay: formAllDay,
      birdId: formBirdId || undefined,
      birdName: selectedBird ? `${selectedBird.name} (${selectedBird.ringNumber})` : undefined,
      cageId: formCageId || undefined,
      location: formLocation || undefined,
      description: formDescription || undefined,
      color: CATEGORY_CONFIG[formCategory].color,
      enablePushAlert: formEnablePushAlert,
      reminderMinutesBefore: formReminderMinutes,
      status: formStatus
    };

    if (editingEvent) {
      db.updateEvent({
        ...editingEvent,
        ...eventPayload
      });
    } else {
      db.addEvent(eventPayload);
    }

    if (formEnablePushAlert) {
      triggerTestPush();
    }

    setIsEventModalOpen(false);
    loadData();
  };

  // Delete Event
  const handleDeleteEvent = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Deseja realmente excluir este compromisso?')) {
      db.deleteEvent(id);
      setIsEventModalOpen(false);
      loadData();
    }
  };

  // Quick toggle status
  const handleToggleStatus = (evt: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = evt.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED';
    db.updateEvent({ ...evt, status: nextStatus });
    loadData();
  };

  // Month grid generation calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = dom, 1 = seg...
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build 42 grid cells (6 rows x 7 cols)
  interface DayCell {
    date: Date;
    dayNum: number;
    isCurrentMonth: boolean;
    dateStr: string; // YYYY-MM-DD
    isToday: boolean;
  }

  const calendarDays: DayCell[] = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(year, month - 1, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      date: d,
      dayNum: day,
      isCurrentMonth: false,
      dateStr,
      isToday: false
    });
  }

  // Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Today check: Oct 2, 2026 is our standard today in demo
    const isToday = (year === 2026 && month === 9 && day === 2);
    calendarDays.push({
      date: d,
      dayNum: day,
      isCurrentMonth: true,
      dateStr,
      isToday
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const d = new Date(year, month + 1, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      date: d,
      dayNum: day,
      isCurrentMonth: false,
      dateStr,
      isToday: false
    });
  }

  // Filtered Events
  const filteredEvents = events.filter(evt => {
    if (filterCategory !== 'ALL' && evt.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = evt.title.toLowerCase().includes(q);
      const matchDesc = evt.description?.toLowerCase().includes(q);
      const matchBird = evt.birdName?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchBird;
    }
    return true;
  });

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto pb-12 font-sans">
      
      {/* Push Notification Banner Triggered */}
      {activePushBanner && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-emerald-400">{activePushBanner.title}</h4>
            <p className="text-slate-300 mt-1 leading-relaxed">{activePushBanner.body}</p>
          </div>
          <button onClick={() => setActivePushBanner(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb (Matching Screenshot: Home / Calendário) */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link href="/dashboard" className="text-[#0284c7] hover:underline font-bold">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-bold">Calendário</span>
      </div>

      {/* Header Bar (Matching Screenshot Header Bar with Icon & Title) */}
      <div className="bg-[#f8fafc] rounded-t-xl border border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarIcon className="w-4 h-4 text-slate-700" />
          <span className="font-bold text-sm text-slate-800">Calendário</span>
        </div>

        {/* Push Notification Toggle / Button */}
        <div className="flex items-center gap-2">
          {pushPermission !== 'granted' ? (
            <button
              onClick={requestPushPermission}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-md shadow-xs transition cursor-pointer"
              title="Ativar alertas de push no seu navegador"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Ativar Alertas Push</span>
            </button>
          ) : (
            <button
              onClick={triggerTestPush}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs rounded-md shadow-xs transition cursor-pointer"
              title="Testar disparo de push notification e som"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Push Ativo (Testar)</span>
            </button>
          )}

          <Button
            onClick={() => handleOpenCreateModal()}
            className="bg-[#00c853] hover:bg-[#00b84a] text-white font-bold text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Novo Compromisso</span>
          </Button>
        </div>
      </div>

      {/* Control Toolbar (Matching Screenshot: [Dia|Semana|Mês|Lista...] - [outubro de 2026] - [Hoje] [<][>]) */}
      <div className="bg-white border-x border-b border-slate-200 shadow-2xs p-3 -mt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: View Switcher Buttons Group */}
          <div className="inline-flex rounded-md overflow-hidden bg-[#1b2838] p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'dia' ? 'bg-[#0f172a] text-white shadow-inner' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'semana' ? 'bg-[#0f172a] text-white shadow-inner' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('mes')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'mes' ? 'bg-[#0f172a] text-white shadow-inner' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('lista_semana')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'lista_semana' ? 'bg-[#0f172a] text-white shadow-inner' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Lista Semana
            </button>
            <button
              onClick={() => setViewMode('lista_mes')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'lista_mes' ? 'bg-[#0f172a] text-white shadow-inner' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Lista Mês
            </button>
          </div>

          {/* Center: Current Month Title (e.g. "outubro de 2026") */}
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 lowercase">
              {MONTH_NAMES[currentDate.getMonth()]} de {currentDate.getFullYear()}
            </h2>
          </div>

          {/* Right: [Hoje] + Navigation Arrows [<] [>] */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-[#64748b] hover:bg-[#475569] text-white text-xs font-bold rounded shadow-xs transition cursor-pointer"
            >
              Hoje
            </button>
            <div className="inline-flex rounded overflow-hidden bg-[#1b2838] shadow-xs">
              <button
                onClick={handlePrev}
                className="px-2.5 py-1.5 text-white hover:bg-slate-800 transition cursor-pointer"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="px-2.5 py-1.5 text-white hover:bg-slate-800 transition cursor-pointer"
                title="Próximo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MONTH VIEW (Matching Screenshot 7x6 Grid with Days of Week)            */}
      {/* ========================================================================= */}
      {viewMode === 'mes' && (
        <div className="bg-white rounded-b-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Days of Week Header Row: dom. seg. ter. qua. qui. sex. sáb. */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-700">
            {WEEK_DAYS.map((wd) => (
              <div key={wd} className="py-2.5 border-r border-slate-200 last:border-r-0">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid: 7 columns */}
          <div className="grid grid-cols-7 auto-rows-fr divide-y divide-slate-200">
            {calendarDays.map((cell, idx) => {
              const dayEvents = filteredEvents.filter(e => e.startDate === cell.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenCreateModal(cell.dateStr)}
                  className={`min-h-[105px] sm:min-h-[125px] p-1.5 border-r border-slate-200 last:border-r-0 flex flex-col justify-between transition-colors relative cursor-pointer group ${
                    cell.isToday
                      ? 'bg-[#fffbeb] ring-1 ring-amber-300' // Yellow highlight matching screenshot
                      : cell.isCurrentMonth
                      ? 'bg-white hover:bg-slate-50/70'
                      : 'bg-slate-50/40 text-slate-400'
                  }`}
                >
                  {/* Top Day Number */}
                  <div className="flex items-center justify-between w-full">
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 transition-opacity">
                      +
                    </span>
                    <span className={`text-[11px] font-bold ${
                      cell.isToday 
                        ? 'text-amber-900 font-extrabold' 
                        : cell.isCurrentMonth 
                        ? 'text-slate-700' 
                        : 'text-slate-400'
                    }`}>
                      {cell.dayNum}
                    </span>
                  </div>

                  {/* Events Pills inside Day Cell */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[75px] custom-scrollbar">
                    {dayEvents.map((evt) => {
                      const cfg = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.GENERAL;
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => handleOpenEditModal(evt, e)}
                          title={`${evt.title} (${evt.startTime || 'Dia todo'})`}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate flex items-center gap-1 shadow-2xs cursor-pointer transition transform hover:scale-[1.02] ${
                            evt.category === 'HOLIDAY' ? 'bg-[#00c853] text-white' : cfg.bgLight
                          }`}
                        >
                          {evt.startTime && (
                            <span className="opacity-80 text-[9px] font-mono">{evt.startTime}</span>
                          )}
                          <span className="truncate">{evt.title}</span>
                          {evt.enablePushAlert && (
                            <Bell className="w-2.5 h-2.5 shrink-0 opacity-75" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-1" />
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DAY VIEW (Detailed Hourly Agenda)                                      */}
      {/* ========================================================================= */}
      {viewMode === 'dia' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Agenda do Dia: {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-500">Clique em qualquer horário para agendar um novo compromisso</p>
            </div>
            <Button
              onClick={() => handleOpenCreateModal(currentDate.toISOString().split('T')[0])}
              className="bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4 mr-1" /> Agendar Neste Dia
            </Button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {Array.from({ length: 16 }, (_, i) => i + 6).map((hour) => {
              const hourStr = String(hour).padStart(2, '0') + ':00';
              const dateStr = currentDate.toISOString().split('T')[0];
              const slotEvents = events.filter(e => e.startDate === dateStr && e.startTime?.startsWith(String(hour).padStart(2, '0')));

              return (
                <div
                  key={hour}
                  onClick={() => handleOpenCreateModal(dateStr, String(hour).padStart(2, '0') + ':00')}
                  className="py-3 px-4 flex items-start gap-4 hover:bg-slate-50 transition cursor-pointer group"
                >
                  <span className="text-xs font-mono font-bold text-slate-500 w-16 pt-1 group-hover:text-emerald-600">
                    {hourStr}
                  </span>
                  <div className="flex-1 space-y-2">
                    {slotEvents.length === 0 ? (
                      <span className="text-xs text-slate-300 italic opacity-0 group-hover:opacity-100 transition">
                        + Clique para agendar às {hourStr}
                      </span>
                    ) : (
                      slotEvents.map(evt => (
                        <div
                          key={evt.id}
                          onClick={(e) => handleOpenEditModal(evt, e)}
                          className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between shadow-2xs hover:bg-emerald-100/60 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-950">{evt.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                                {CATEGORY_CONFIG[evt.category]?.label}
                              </span>
                            </div>
                            {evt.description && (
                              <p className="text-xs text-slate-600">{evt.description}</p>
                            )}
                            {evt.birdName && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <BirdIcon className="w-3 h-3" /> Ave: {evt.birdName}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {evt.enablePushAlert && (
                              <span className="text-[10px] flex items-center gap-1 font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                                <Bell className="w-3 h-3" /> Push Ativo
                              </span>
                            )}
                            <button
                              onClick={(e) => handleToggleStatus(evt, e)}
                              className={`p-1.5 rounded-lg border text-xs font-bold ${evt.status === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WEEK VIEW                                                              */}
      {/* ========================================================================= */}
      {viewMode === 'semana' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Visão Semanal - {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <span className="text-xs text-slate-500">Clique no dia para agendar</span>
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-200 min-h-[400px]">
            {WEEK_DAYS.map((dayName, dayIdx) => {
              // Calculate date for this day in the active week
              const curr = new Date(currentDate);
              const firstDayOfWeek = curr.getDate() - curr.getDay() + dayIdx;
              const dateObj = new Date(curr.setDate(firstDayOfWeek));
              const dateStr = dateObj.toISOString().split('T')[0];
              const isToday = dateObj.getFullYear() === 2026 && dateObj.getMonth() === 9 && dateObj.getDate() === 2;
              const dayEvents = events.filter(e => e.startDate === dateStr);

              return (
                <div
                  key={dayIdx}
                  onClick={() => handleOpenCreateModal(dateStr)}
                  className={`p-3 flex flex-col justify-between hover:bg-slate-50/80 transition cursor-pointer ${
                    isToday ? 'bg-amber-50/60' : 'bg-white'
                  }`}
                >
                  <div className="border-b border-slate-100 pb-2 text-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">{dayName}</span>
                    <span className={`text-base font-extrabold ${isToday ? 'text-amber-900' : 'text-slate-800'}`}>
                      {dateObj.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-2 flex-1 overflow-y-auto">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={(e) => handleOpenEditModal(evt, e)}
                        className={`p-2 rounded-lg text-xs font-bold shadow-2xs space-y-1 ${CATEGORY_CONFIG[evt.category]?.bgLight}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{evt.title}</span>
                          {evt.enablePushAlert && <Bell className="w-3 h-3 shrink-0" />}
                        </div>
                        {evt.startTime && (
                          <span className="text-[10px] block opacity-80 font-mono">{evt.startTime}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 text-center py-1">
                    + Agendar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LISTA SEMANA & LISTA MÊS                                               */}
      {/* ========================================================================= */}
      {(viewMode === 'lista_semana' || viewMode === 'lista_mes') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {viewMode === 'lista_semana' ? 'Compromissos da Semana' : 'Relação Completa de Compromissos do Mês'}
              </h3>
              <p className="text-xs text-slate-500">
                {filteredEvents.length} compromissos cadastrados com alertas push programados
              </p>
            </div>

            {/* Filter by category & search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Todas Categorias</option>
                  <option value="VACCINE">Vacinação</option>
                  <option value="MEDICATION">Medicamento</option>
                  <option value="RINGING">Anilhamento</option>
                  <option value="BREEDING">Reprodução / Choco</option>
                  <option value="TOURNAMENT">Torneios</option>
                  <option value="VET">Veterinário</option>
                  <option value="CLEANING">Higienização</option>
                  <option value="HOLIDAY">Feriados</option>
                </select>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="text-xs font-bold text-slate-700">Nenhum compromisso encontrado</h4>
                <p className="text-[11px] text-slate-400">Clique em "+ Novo Compromisso" para registrar sua programação.</p>
              </div>
            ) : (
              filteredEvents.map(evt => {
                const cfg = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.GENERAL;
                return (
                  <div
                    key={evt.id}
                    onClick={() => handleOpenEditModal(evt)}
                    className="py-3.5 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${cfg.bgLight} shrink-0 mt-0.5`}>
                        <CalendarIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{evt.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bgLight}`}>
                            {cfg.label}
                          </span>
                          {evt.status === 'COMPLETED' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              ✓ Concluído
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {evt.startDate} {evt.startTime ? `às ${evt.startTime}` : '(Dia Inteiro)'}
                          </span>
                          {evt.birdName && (
                            <span className="flex items-center gap-1">
                              <BirdIcon className="w-3 h-3 text-slate-400" /> {evt.birdName}
                            </span>
                          )}
                          {evt.cageId && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> Gaiola: {evt.cageId}
                            </span>
                          )}
                        </div>
                        {evt.description && (
                          <p className="text-xs text-slate-600">{evt.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {evt.enablePushAlert && (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-md flex items-center gap-1 border border-sky-200">
                          <Bell className="w-3 h-3 text-sky-600" /> Push Ativo
                        </span>
                      )}
                      <button
                        onClick={(e) => handleToggleStatus(evt, e)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          evt.status === 'COMPLETED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{evt.status === 'COMPLETED' ? 'Concluído' : 'Marcar Feito'}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteEvent(evt.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CRIAR / EDITAR COMPROMISSO COM ALERTA PUSH                      */}
      {/* ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1e293b] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-[#00c853] rounded-lg">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">
                    {editingEvent ? 'Editar Compromisso & Alerta' : 'Novo Compromisso no Calendário'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Defina data, horário e notificações push automáticas</p>
                </div>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Título do Compromisso / Tarefa *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Vacinação Newcastle Matrizes, Anilhamento Gaiola G-101..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00c853] text-xs font-semibold"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoria do Evento</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00c853] text-xs font-semibold cursor-pointer"
                >
                  <option value="GENERAL">Lembrete Geral</option>
                  <option value="VACCINE">Vacinação</option>
                  <option value="MEDICATION">Medicamento / Tratamento</option>
                  <option value="RINGING">Anilhamento</option>
                  <option value="BREEDING">Reprodução / Choco / Eclosão</option>
                  <option value="TOURNAMENT">Torneio / Competição / Canto</option>
                  <option value="VET">Consulta Veterinária</option>
                  <option value="CLEANING">Higienização / Manejo</option>
                  <option value="HOLIDAY">Feriado / Comemoração</option>
                </select>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Início *</label>
                  <DateManualInput
                    required
                    value={formStartDate}
                    onChange={(val) => setFormStartDate(val)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00c853] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Término (Opcional)</label>
                  <DateManualInput
                    value={formEndDate}
                    onChange={(val) => setFormEndDate(val)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00c853] text-xs"
                  />
                </div>
              </div>

              {/* All day checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={formAllDay}
                  onChange={(e) => setFormAllDay(e.target.checked)}
                  className="w-4 h-4 accent-[#00c853] rounded"
                />
                <label htmlFor="allDay" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Compromisso para o dia inteiro (sem horário fixo)
                </label>
              </div>

              {/* Hours (if not all day) */}
              {!formAllDay && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hora de Início</label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hora de Término</label>
                    <input
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Bird & Cage Link (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vincular à Ave</label>
                  <select
                    value={formBirdId}
                    onChange={(e) => setFormBirdId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="">Nenhuma ave específica</option>
                    {birds.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.ringNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gaiola / Local</label>
                  <input
                    type="text"
                    value={formCageId}
                    onChange={(e) => setFormCageId(e.target.value)}
                    placeholder="Ex: G-101, Setor A..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações / Detalhes</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Instruções de dosagem, preparação, materiais necessários..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {/* Push Notification & Reminder Box */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-xs text-emerald-950">Alerta via Push Notificação</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formEnablePushAlert}
                    onChange={(e) => setFormEnablePushAlert(e.target.checked)}
                    className="w-4 h-4 accent-[#00c853] rounded cursor-pointer"
                  />
                </div>

                {formEnablePushAlert && (
                  <div className="space-y-2 pt-1 border-t border-emerald-200">
                    <label className="block font-bold text-emerald-900 text-[11px]">
                      Avisar com antecedência de:
                    </label>
                    <select
                      value={formReminderMinutes}
                      onChange={(e) => setFormReminderMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950"
                    >
                      <option value={0}>No exato horário do compromisso</option>
                      <option value={15}>15 minutos antes</option>
                      <option value={30}>30 minutos antes</option>
                      <option value={60}>1 hora antes</option>
                      <option value={1440}>1 dia antes</option>
                      <option value={2880}>2 dias antes</option>
                    </select>
                    <p className="text-[10px] text-emerald-800 leading-tight">
                      ✓ Dispara alerta sonoro e notificação pop-up nativa na tela do seu computador ou celular.
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status do Compromisso</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('SCHEDULED')}
                    className={`p-2 rounded-xl border text-center font-bold transition ${formStatus === 'SCHEDULED' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    Agendado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('IN_PROGRESS')}
                    className={`p-2 rounded-xl border text-center font-bold transition ${formStatus === 'IN_PROGRESS' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    Em Andamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('COMPLETED')}
                    className={`p-2 rounded-xl border text-center font-bold transition ${formStatus === 'COMPLETED' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    Concluído
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {editingEvent ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(editingEvent.id)}
                    className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <Button
                    type="submit"
                    className="bg-[#00c853] hover:bg-[#00b84a] text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                  >
                    {editingEvent ? 'Salvar Alterações' : 'Agendar Compromisso'}
                  </Button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
