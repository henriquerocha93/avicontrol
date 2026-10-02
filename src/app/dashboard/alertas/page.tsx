'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  BellRing, 
  Plus, 
  Pill, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ExternalLink, 
  RotateCcw,
  Check,
  Calendar,
  Send,
  Egg as EggIcon,
  Info,
  Sliders,
  Settings,
  Flame,
  Search,
  Filter
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { NotificationItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendPushNotification, 
  triggerNotificationAlert, 
  playNotificationChime 
} from '@/lib/push-notifications';

export default function AlertasPage() {
  const { tenant } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'MEDICATION' | 'EGG_HATCH' | 'SEXING' | 'COMPLETED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Push permission state
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushSettingsOpen, setPushSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings Toggles
  const [notifyMeds, setNotifyMeds] = useState(true);
  const [notifyEggs, setNotifyEggs] = useState(true);
  const [notifySexing, setNotifySexing] = useState(true);
  const [dailySummaryTime, setDailySummaryTime] = useState('08:00');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<NotificationItem | null>(null);
  
  // Form State
  const [formCategory, setFormCategory] = useState<'MEDICATION' | 'EGG_HATCH' | 'SEXING' | 'CAGE' | 'CUSTOM'>('MEDICATION');
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formBirdName, setFormBirdName] = useState('');
  const [formCageName, setFormCageName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formDueTime, setFormDueTime] = useState('20:00');
  const [formDueDate, setFormDueDate] = useState('Hoje');
  const [formPriority, setFormPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [formPushEnabled, setFormPushEnabled] = useState(true);
  const [formLink, setFormLink] = useState('/dashboard/aves');
  const [formActionText, setFormActionText] = useState('Confirmar administração →');

  // Load notifications
  const reloadNotifications = () => {
    const list = db.getNotifications(tenant?.id);
    setNotifications([...list]);
  };

  useEffect(() => {
    reloadNotifications();
    setPushPermission(getNotificationPermission());
  }, [tenant?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRequestPushPermission = async () => {
    const perm = await requestNotificationPermission();
    setPushPermission(perm);
    if (perm === 'granted') {
      sendPushNotification('🔔 BIRDPRO • Notificações Ativadas!', {
        body: 'Você receberá avisos em tempo real de remédios, eclosões e manejos do criatório.',
        playSound: soundEnabled
      });
      showToast('✅ Notificações push ativadas com sucesso no seu navegador!');
    } else if (perm === 'denied') {
      showToast('⚠️ Permissão negada no navegador. Permita notificações nas configurações do seu navegador.');
    }
  };

  const handleTestPush = (notif?: NotificationItem) => {
    if (notif) {
      triggerNotificationAlert(notif, soundEnabled);
      showToast(`🔔 Notificação de teste disparada: "${notif.title}"`);
    } else {
      if (soundEnabled) playNotificationChime();
      const sent = sendPushNotification('💊 BIRDPRO • Medicamento Hoje (20:00)', {
        body: 'Nistatina Solução - Esmeralda Verde (Gaiola UTI-01)\nDose: 2 gotas diretamente no bico',
        playSound: soundEnabled,
        data: { link: '/dashboard/alertas' }
      });
      if (sent) {
        showToast('🔔 Notificação Push de teste enviada com sucesso ao seu sistema!');
      } else {
        showToast('🔔 Sinal sonoro e alerta emitido! (Ative a permissão do navegador para push nativo)');
      }
    }
  };

  const handleComplete = (id: string) => {
    db.completeNotification(id);
    reloadNotifications();
    showToast('✅ Alerta marcado como concluído!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este alerta?')) {
      db.deleteNotification(id);
      reloadNotifications();
      showToast('🗑️ Alerta removido com sucesso.');
    }
  };

  const openNewModal = (category: typeof formCategory = 'MEDICATION') => {
    setEditingNotif(null);
    setFormCategory(category);
    if (category === 'MEDICATION') {
      setFormTitle('Nistatina Solução - Esmeralda Verde');
      setFormMessage('Administração diária de antifúngico');
      setFormBirdName('Esmeralda Verde');
      setFormCageName('Gaiola UTI-01');
      setFormDosage('2 gotas diretamente no bico');
      setFormDueDate('Hoje');
      setFormDueTime('20:00');
      setFormPriority('HIGH');
      setFormActionText('Confirmar administração →');
    } else if (category === 'EGG_HATCH') {
      setFormTitle('Postura #1 Curió - Gaiola G-103');
      setFormMessage('3 ovos férteis confirmados na ovoscopia');
      setFormBirdName('Casal Real');
      setFormCageName('Gaiola G-103');
      setFormDosage('');
      setFormDueDate('Em 5 dias');
      setFormDueTime('09:00');
      setFormPriority('MEDIUM');
      setFormActionText('Ver ninhada e ninhos →');
    } else if (category === 'SEXING') {
      setFormTitle('Sexagem Filhotes Junior 01 e 02');
      setFormMessage('Coleta de penas de bulbo recomendada (12 dias de vida)');
      setFormBirdName('Junior 01 & 02');
      setFormCageName('Gaiola G-101');
      setFormDosage('');
      setFormDueDate('Prontos');
      setFormDueTime('10:00');
      setFormPriority('LOW');
      setFormActionText('Registrar envio laboratório →');
    } else {
      setFormTitle('Higienização Semanal dos Bebedouros');
      setFormMessage('Troca e esterilização com cloro orgânico');
      setFormBirdName('Plantel Geral');
      setFormCageName('Todas as Gaiolas');
      setFormDosage('');
      setFormDueDate('Hoje');
      setFormDueTime('08:00');
      setFormPriority('MEDIUM');
      setFormActionText('Marcar como realizado →');
    }
    setFormPushEnabled(true);
    setFormLink('/dashboard/aves');
    setIsModalOpen(true);
  };

  const openEditModal = (notif: NotificationItem) => {
    setEditingNotif(notif);
    setFormCategory((notif.category as any) || 'CUSTOM');
    setFormTitle(notif.title);
    setFormMessage(notif.message);
    setFormBirdName(notif.birdName || '');
    setFormCageName(notif.cageName || '');
    setFormDosage(notif.dosage || '');
    setFormDueDate(notif.dueDate || 'Hoje');
    setFormDueTime(notif.dueTime || '12:00');
    setFormPriority(notif.priority || 'MEDIUM');
    setFormPushEnabled(notif.pushEnabled ?? true);
    setFormLink(notif.link || '/dashboard/aves');
    setFormActionText(notif.actionText || 'Ver detalhes →');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingNotif) {
      db.updateNotification({
        ...editingNotif,
        title: formTitle,
        message: formMessage,
        category: formCategory as any,
        priority: formPriority,
        birdName: formBirdName,
        cageName: formCageName,
        dosage: formDosage,
        dueDate: formDueDate,
        dueTime: formDueTime,
        pushEnabled: formPushEnabled,
        link: formLink,
        actionText: formActionText
      });
      showToast('✏️ Alerta atualizado com sucesso!');
    } else {
      db.addNotification({
        tenantId: tenant?.id || 'tenant-demo-01',
        title: formTitle,
        message: formMessage,
        type: formCategory === 'MEDICATION' ? 'WARNING' : formCategory === 'EGG_HATCH' ? 'ALERT' : 'INFO',
        category: formCategory as any,
        priority: formPriority,
        birdName: formBirdName,
        cageName: formCageName,
        dosage: formDosage,
        dueDate: formDueDate,
        dueTime: formDueTime,
        status: 'PENDING',
        pushEnabled: formPushEnabled,
        link: formLink,
        actionText: formActionText,
        read: false
      });
      showToast('✨ Novo alerta cadastrado com sucesso!');
    }

    setIsModalOpen(false);
    reloadNotifications();
  };

  // Metrics
  const totalAlerts = notifications.length;
  const pendingAlerts = notifications.filter(n => n.status !== 'COMPLETED').length;
  const medAlerts = notifications.filter(n => n.category === 'MEDICATION' && n.status !== 'COMPLETED').length;
  const eggAlerts = notifications.filter(n => n.category === 'EGG_HATCH' && n.status !== 'COMPLETED').length;
  const sexingAlerts = notifications.filter(n => n.category === 'SEXING' && n.status !== 'COMPLETED').length;
  const completedAlerts = notifications.filter(n => n.status === 'COMPLETED').length;

  // Filtered list
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.birdName && n.birdName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.cageName && n.cageName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return n.status !== 'COMPLETED';
    if (activeTab === 'MEDICATION') return n.category === 'MEDICATION';
    if (activeTab === 'EGG_HATCH') return n.category === 'EGG_HATCH';
    if (activeTab === 'SEXING') return n.category === 'SEXING';
    if (activeTab === 'COMPLETED') return n.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e293b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#003d1c] via-[#05512b] to-[#111827] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Bell className="w-80 h-80 -mr-16 text-white" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold">
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span>Central de Manejo & Push Notificações</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Alertas, Avisos & Lembretes Diários
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Configure e receba notificações push instantâneas no seu computador e celular para medicamentos, previsão de eclosão de ovos, sexagem DNA e manejos do criatório.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleTestPush()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 shadow-md backdrop-blur-sm transition-all"
          >
            <Bell className="w-4 h-4 text-emerald-300" />
            <span>Testar Push Agora</span>
          </button>
          
          <Button 
            onClick={() => openNewModal('MEDICATION')}
            className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 px-5 py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Alerta / Lembrete</span>
          </Button>
        </div>
      </div>

      {/* Push Notification Integration Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-slate-900">Sistema de Push Notificação no Navegador</h2>
                {pushPermission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Ativo & Conectado
                  </span>
                ) : pushPermission === 'denied' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Bloqueado no Navegador
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Não Solicitado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Receba alertas sonoros e janelas flutuantes no desktop e celular mesmo com a aba em segundo plano.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pushPermission !== 'granted' && (
              <Button 
                onClick={handleRequestPushPermission}
                size="sm" 
                className="bg-[#00c853] hover:bg-emerald-600 text-white font-bold text-xs"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Permitir Notificações
              </Button>
            )}

            <button
              onClick={() => setPushSettingsOpen(!pushSettingsOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>{pushSettingsOpen ? 'Ocultar Ajustes' : 'Configurar Preferências'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Preferences */}
        {pushSettingsOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600" />
              Preferências de Disparo & Horários de Lembrete
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {/* Sound toggle */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Sinal Sonoro Suave</p>
                  <p className="text-[11px] text-slate-500">Chime acústico ao disparar</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) playNotificationChime();
                  }}
                  className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Meds toggle */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Alerta Medicamentos</p>
                  <p className="text-[11px] text-slate-500">Disparo no horário exato</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyMeds} 
                  onChange={e => setNotifyMeds(e.target.checked)} 
                  className="w-4 h-4 accent-emerald-600 rounded" 
                />
              </div>

              {/* Hatching toggle */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Previsão de Eclosão</p>
                  <p className="text-[11px] text-slate-500">Aviso 24h antes e no dia</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyEggs} 
                  onChange={e => setNotifyEggs(e.target.checked)} 
                  className="w-4 h-4 accent-emerald-600 rounded" 
                />
              </div>

              {/* Sexing toggle */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Sexagem DNA</p>
                  <p className="text-[11px] text-slate-500">Aos 12 dias dos filhotes</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifySexing} 
                  onChange={e => setNotifySexing(e.target.checked)} 
                  className="w-4 h-4 accent-emerald-600 rounded" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span>* As configurações são sincronizadas em tempo real para seu criatório.</span>
              <button 
                onClick={() => showToast('💾 Preferências salvas com sucesso!')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Salvar Preferências
              </button>
            </div>
          </div>
        )}

        {/* Quick KPI Count */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div 
            onClick={() => setActiveTab('ALL')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'ALL' ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Geral</span>
            <p className="text-xl font-black text-slate-900 mt-1">{totalAlerts}</p>
          </div>

          <div 
            onClick={() => setActiveTab('PENDING')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'PENDING' ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pendentes</span>
            <p className="text-xl font-black text-amber-900 mt-1">{pendingAlerts}</p>
          </div>

          <div 
            onClick={() => setActiveTab('MEDICATION')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'MEDICATION' ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Pill className="w-3 h-3 text-amber-600" /> Remédios
            </span>
            <p className="text-xl font-black text-amber-900 mt-1">{medAlerts}</p>
          </div>

          <div 
            onClick={() => setActiveTab('EGG_HATCH')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'EGG_HATCH' ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <EggIcon className="w-3 h-3 text-emerald-600" /> Eclosões
            </span>
            <p className="text-xl font-black text-emerald-900 mt-1">{eggAlerts}</p>
          </div>

          <div 
            onClick={() => setActiveTab('SEXING')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'SEXING' ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-600" /> Sexagem DNA
            </span>
            <p className="text-xl font-black text-sky-900 mt-1">{sexingAlerts}</p>
          </div>

          <div 
            onClick={() => setActiveTab('COMPLETED')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'COMPLETED' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluídos
            </span>
            <p className="text-xl font-black text-slate-700 mt-1">{completedAlerts}</p>
          </div>
        </div>
      </div>

      {/* Action Bar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'ALL' ? 'bg-[#00c853] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Todos ({totalAlerts})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'PENDING' ? 'bg-[#00c853] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Pendentes ({pendingAlerts})
          </button>
          <button
            onClick={() => setActiveTab('MEDICATION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'MEDICATION' ? 'bg-[#00c853] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            💊 Remédios ({notifications.filter(n => n.category === 'MEDICATION').length})
          </button>
          <button
            onClick={() => setActiveTab('EGG_HATCH')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'EGG_HATCH' ? 'bg-[#00c853] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            🥚 Eclosões ({notifications.filter(n => n.category === 'EGG_HATCH').length})
          </button>
          <button
            onClick={() => setActiveTab('SEXING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'SEXING' ? 'bg-[#00c853] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            🧬 Sexagem DNA ({notifications.filter(n => n.category === 'SEXING').length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'COMPLETED' ? 'bg-[#00c853] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            ✅ Concluídos ({completedAlerts})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ave, gaiola ou remédio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Alert Cards Grid (Matching User Screenshot Layout) */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum alerta encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não há notificações nesta categoria ou termo pesquisado. Clique no botão abaixo para adicionar um novo lembrete.
          </p>
          <Button 
            onClick={() => openNewModal()} 
            className="bg-[#00c853] hover:bg-emerald-600 text-white font-bold text-xs mt-2"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Criar Primeiro Lembrete
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotifications.map((notif) => {
            const isDone = notif.status === 'COMPLETED';
            const isMed = notif.category === 'MEDICATION';
            const isHatch = notif.category === 'EGG_HATCH';
            const isSexing = notif.category === 'SEXING';

            // Distinctive aesthetic cards matching user photo
            let cardBg = 'bg-slate-50/70 border-slate-200';
            let headerText = 'text-slate-800';
            let iconColor = 'text-slate-600';
            let badgeBg = 'bg-slate-200 text-slate-900';
            let IconComponent = Clock;
            let categoryTitle = 'Lembrete';

            if (isMed) {
              cardBg = 'bg-amber-50/70 border-amber-200 hover:border-amber-300';
              headerText = 'text-amber-900';
              iconColor = 'text-amber-600';
              badgeBg = 'bg-amber-200 text-amber-900';
              IconComponent = Pill;
              categoryTitle = 'Medicamento Hoje';
            } else if (isHatch) {
              cardBg = 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300';
              headerText = 'text-emerald-900';
              iconColor = 'text-emerald-600';
              badgeBg = 'bg-emerald-200 text-emerald-900';
              IconComponent = EggIcon;
              categoryTitle = 'Previsão de Eclosão';
            } else if (isSexing) {
              cardBg = 'bg-sky-50/70 border-sky-200 hover:border-sky-300';
              headerText = 'text-sky-900';
              iconColor = 'text-sky-600';
              badgeBg = 'bg-sky-200 text-sky-900';
              IconComponent = Sparkles;
              categoryTitle = 'Sexagem DNA Filhotes';
            }

            if (isDone) {
              cardBg = 'bg-slate-50 border-slate-200 opacity-75';
            }

            return (
              <div 
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 ${cardBg}`}
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${headerText}`}>
                      <IconComponent className={`w-4 h-4 ${iconColor}`} />
                      <span>{categoryTitle}</span>
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${badgeBg}`}>
                      {notif.dueTime || notif.dueDate || 'Agendado'}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-sm font-black text-slate-900 ${isDone ? 'line-through text-slate-500' : ''}`}>
                      {notif.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.dosage && (
                      <div className="mt-1.5 inline-block text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        Dose: {notif.dosage} {notif.cageName ? `(${notif.cageName})` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  {/* Action link */}
                  {notif.actionText ? (
                    <Link 
                      href={notif.link || '/dashboard/aves'} 
                      className={`text-xs font-bold hover:underline flex items-center gap-1 ${isMed ? 'text-amber-900' : isHatch ? 'text-emerald-900' : 'text-sky-900'}`}
                    >
                      <span>{notif.actionText}</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">{notif.birdName || ''}</span>
                  )}

                  {/* Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Trigger push now test */}
                    <button
                      onClick={() => handleTestPush(notif)}
                      title="Disparar Notificação Push Agora"
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>

                    {/* Conclude toggle */}
                    {!isDone ? (
                      <button
                        onClick={() => handleComplete(notif.id)}
                        title="Marcar como Concluído"
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors font-bold flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Concluído
                      </span>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(notif)}
                      title="Editar Alerta"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      title="Excluir Alerta"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {editingNotif ? 'Editar Alerta / Lembrete' : 'Cadastrar Novo Alerta'}
                  </h3>
                  <p className="text-xs text-slate-300">Configuração de aviso e disparo de notificação push</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tipo de Alerta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCategory('MEDICATION')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${formCategory === 'MEDICATION' ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    <Pill className="w-3.5 h-3.5 text-amber-600" />
                    <span>Medicamento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory('EGG_HATCH')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${formCategory === 'EGG_HATCH' ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    <EggIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Eclosão Ovos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory('SEXING')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${formCategory === 'SEXING' ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-500/20' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sexagem DNA</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título do Alerta / Nome do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Nistatina Solução - Esmeralda Verde"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Message / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instruções / Descrição
                </label>
                <input
                  type="text"
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Ex: 3 ovos férteis confirmados na ovoscopia"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Grid: Ave & Gaiola */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ave / Casal
                  </label>
                  <input
                    type="text"
                    value={formBirdName}
                    onChange={(e) => setFormBirdName(e.target.value)}
                    placeholder="Ex: Esmeralda Verde / Casal Real"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gaiola / Ninho
                  </label>
                  <input
                    type="text"
                    value={formCageName}
                    onChange={(e) => setFormCageName(e.target.value)}
                    placeholder="Ex: Gaiola UTI-01 ou G-103"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Dosage (if med) */}
              {formCategory === 'MEDICATION' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dosagem / Posologia
                  </label>
                  <input
                    type="text"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    placeholder="Ex: 2 gotas diretamente no bico"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Grid: Data & Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data / Prazo
                  </label>
                  <input
                    type="text"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    placeholder="Ex: Hoje, Em 5 dias"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horário de Disparo
                  </label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="HIGH">Alta (Urgente)</option>
                    <option value="MEDIUM">Média</option>
                    <option value="LOW">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Push enabled checkbox */}
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BellRing className="w-4 h-4 text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Enviar Notificação Push no Horário</p>
                    <p className="text-[11px] text-emerald-700">Dispara pop-up nativo e sinal sonoro</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formPushEnabled}
                  onChange={(e) => setFormPushEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  className="bg-[#00c853] hover:bg-emerald-600 text-white font-bold text-xs px-6 py-2.5"
                >
                  {editingNotif ? 'Salvar Alterações' : 'Criar Lembrete'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
